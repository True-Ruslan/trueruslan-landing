const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');

const {ROOT, TOOLS_DIR, ARTIFACTS_DIR} = require('./quality-harness/paths.cjs');
const {requireQualityTool, findChrome, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, assertNoBlockingAxe} = require('./quality-harness/assertions.cjs');
const {ensureArtifactsDir, artifactPath, captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS, CORE_SCENARIOS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.QUALITY_PORT || 4173);
const {chromium} = requireQualityTool('playwright');
const AxeBuilder = requireQualityTool('@axe-core/playwright').default;

function runCommand(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      env: {...process.env, ...env},
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function assertResumePdf(page, context) {
  const iframe = page.locator('[data-tr-resume-pdf]');
  await iframe.waitFor({state: 'attached'});
  await page.waitForFunction(() => {
    const node = document.querySelector('[data-tr-resume-pdf]');
    return node && node.getAttribute('src') && node.getAttribute('src') !== 'about:blank';
  });

  const src = await iframe.getAttribute('src');
  if (!src) throw new Error('Resume iframe did not receive a PDF src.');

  const pdfUrl = new URL(src, page.url()).href;
  const response = await context.request.get(pdfUrl);
  if (!response.ok()) {
    throw new Error(`Resume PDF returned HTTP ${response.status()}: ${pdfUrl}`);
  }

  const contentType = response.headers()['content-type'] || '';
  if (!contentType.includes('application/pdf')) {
    throw new Error(`Resume URL is not served as PDF (${contentType || 'missing content-type'}): ${pdfUrl}`);
  }
}

async function assertHydratedLinkPolicy(page, label) {
  const report = await page.evaluate(() => {
    const exemptScheme = /^(?:mailto|tel|javascript|data):/i;

    function containsLegacyLandingPath(rawHref) {
      const value = String(rawHref || '').trim();
      if (!value) return false;
      if (/^(?:\.\.\/|\.\/)*landing\//.test(value) || value.startsWith('/landing/')) return true;
      try {
        return new URL(value, document.baseURI).pathname.includes('/landing/');
      } catch {
        return false;
      }
    }

    const violations = [];
    let navigationalLinks = 0;
    let samePageFragments = 0;

    for (const anchor of document.querySelectorAll('a[href]')) {
      const href = String(anchor.getAttribute('href') || '').trim();
      if (!href) continue;

      if (containsLegacyLandingPath(href)) {
        violations.push(`legacy /landing href: ${href}`);
      }

      if (href.startsWith('#')) {
        samePageFragments += 1;
        if (anchor.getAttribute('target') === '_blank') {
          violations.push(`same-page fragment forced into new tab: ${href}`);
        }
        continue;
      }

      if (exemptScheme.test(href)) continue;
      navigationalLinks += 1;

      const rel = new Set(String(anchor.getAttribute('rel') || '').toLowerCase().split(/\s+/).filter(Boolean));
      if (anchor.getAttribute('target') !== '_blank') {
        violations.push(`missing target=_blank: ${href}`);
      }
      if (!rel.has('noopener') || !rel.has('noreferrer')) {
        violations.push(`missing noopener/noreferrer: ${href}`);
      }
    }

    return {violations, navigationalLinks, samePageFragments};
  });

  if (report.navigationalLinks === 0) {
    throw new Error(`${label}: no navigational anchors found for hydrated link-policy verification.`);
  }
  if (report.violations.length) {
    throw new Error(`${label}: hydrated link-policy violations (${report.violations.length}):\n${report.violations.join('\n')}`);
  }
  return report;
}

async function checkScenario(browser, baseUrl, scenario, summary) {
  const runtime = await createScenarioPage(browser, {
    viewport: scenario.viewport,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const {context, page} = runtime;
  const diagnostics = installPageDiagnostics(page, {
    baseUrl,
    ignoredRequestFailureReasons: ['ERR_ABORTED'],
  });

  try {
    const response = await page.goto(`${baseUrl}${scenario.path}`, {waitUntil: 'networkidle'});
    if (!response || !response.ok()) {
      throw new Error(`Navigation failed for ${scenario.path}: HTTP ${response?.status() ?? 'no response'}`);
    }

    const heading = (await page.locator('h1').first().innerText()).trim();
    if (!heading.includes(scenario.heading)) {
      throw new Error(`Unexpected h1 on ${scenario.path}: expected "${scenario.heading}", got "${heading}"`);
    }

    if (scenario.requiredText?.length) {
      const bodyText = await page.locator('body').innerText();
      const normalizedBodyText = bodyText.toLocaleLowerCase('ru-RU');
      for (const token of scenario.requiredText) {
        if (!normalizedBodyText.includes(token.toLocaleLowerCase('ru-RU'))) {
          throw new Error(`${scenario.slug}: required page truth is missing: ${token}`);
        }
      }
    }

    const visualReady = await page.evaluate(() => document.documentElement.classList.contains('tr-visual-ready'));
    if (!visualReady) {
      throw new Error(`Custom visual layer did not initialize on ${scenario.path}`);
    }

    const linkPolicy = await assertHydratedLinkPolicy(page, `Browser quality ${scenario.slug}`);
    await assertNoHorizontalOverflow(page, `Browser quality ${scenario.slug}`);

    if (scenario.path.includes('/resume')) {
      await assertResumePdf(page, context);
    }

    if (scenario.accessibility) {
      await assertNoBlockingAxe({
        page,
        label: `Browser quality ${scenario.slug}`,
        AxeBuilder,
        exclude: scenario.path.includes('/resume') ? '[data-tr-resume-pdf]' : undefined,
        artifactName: `axe-${scenario.slug}.json`,
      });
    }

    await captureScreenshot(page, `${scenario.slug}.png`);
    diagnostics.assertClean(`Browser quality ${scenario.slug}`);

    summary.push({
      slug: scenario.slug,
      path: scenario.path,
      heading,
      viewport: scenario.viewport,
      requiredText: scenario.requiredText || [],
      accessibilityChecked: Boolean(scenario.accessibility),
      navigationalLinksChecked: linkPolicy.navigationalLinks,
      samePageFragmentsChecked: linkPolicy.samePageFragments,
    });
  } finally {
    await runtime.close();
  }
}

async function runLighthouse(chromePath, baseUrl) {
  const lighthouseBin = path.join(TOOLS_DIR, '.bin', process.platform === 'win32' ? 'lighthouse.cmd' : 'lighthouse');
  const reportPath = artifactPath('lighthouse-home.json');

  if (!fs.existsSync(lighthouseBin)) {
    throw new Error('Lighthouse binary is not installed in .quality-tools.');
  }

  await runCommand(lighthouseBin, [
    `${baseUrl}/`,
    '--quiet',
    '--output=json',
    `--output-path=${reportPath}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--chrome-flags=--headless --no-sandbox --disable-gpu',
  ], {CHROME_PATH: chromePath});

  await runCommand(process.execPath, ['scripts/lighthouse-budget.js', reportPath]);
}

async function main() {
  fs.rmSync(ARTIFACTS_DIR, {recursive: true, force: true});
  ensureArtifactsDir();

  const scenarios = [
    {...CORE_SCENARIOS.home, slug: 'home-desktop', viewport: VIEWPORTS.desktop, accessibility: true},
    {...CORE_SCENARIOS.projects, slug: 'projects-desktop', viewport: VIEWPORTS.desktop, accessibility: true},
    {...CORE_SCENARIOS.vlezet, slug: 'vlezet-desktop', viewport: VIEWPORTS.desktop, accessibility: true},
    {...CORE_SCENARIOS.villaigence, slug: 'villaigence-desktop', viewport: VIEWPORTS.desktop, accessibility: true},
    {...CORE_SCENARIOS.publications, slug: 'publications-desktop', viewport: VIEWPORTS.desktop, accessibility: true},
    {...CORE_SCENARIOS.resume, slug: 'resume-desktop', viewport: VIEWPORTS.desktop, accessibility: true},
    {...CORE_SCENARIOS.home, slug: 'home-mobile', viewport: VIEWPORTS.mobile, accessibility: false},
    {...CORE_SCENARIOS.projects, slug: 'projects-mobile', viewport: VIEWPORTS.mobile, accessibility: false},
    {...CORE_SCENARIOS.vlezet, slug: 'vlezet-mobile', viewport: VIEWPORTS.mobile, accessibility: false},
    {...CORE_SCENARIOS.villaigence, slug: 'villaigence-mobile', viewport: VIEWPORTS.mobile, accessibility: false},
    {...CORE_SCENARIOS.publications, slug: 'publications-mobile', viewport: VIEWPORTS.mobile, accessibility: false},
    {...CORE_SCENARIOS.resume, slug: 'resume-mobile', viewport: VIEWPORTS.mobile, accessibility: false},
  ];

  const serverRuntime = await startStaticServer({port: PORT, gzip: true});
  const chromePath = findChrome();
  let browser;

  try {
    browser = await launchChromium(chromium, {executablePath: chromePath});

    const summary = [];
    for (const scenario of scenarios) {
      console.log(`Browser quality: ${scenario.slug}`);
      await checkScenario(browser, serverRuntime.baseUrl, scenario, summary);
    }

    writeJsonArtifact('browser-summary.json', summary);
    await browser.close();
    browser = null;

    console.log('Running Lighthouse quality budget...');
    await runLighthouse(chromePath, serverRuntime.baseUrl);
    console.log('Browser, accessibility, screenshot and Lighthouse quality checks passed.');
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});