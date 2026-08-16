const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {
  VILLAIGENCE_URL,
  VLEZET_URL,
  VILLAIGENCE_EN_URL,
  VLEZET_EN_URL,
} = require('./production-live-routes.cjs');

const {chromium} = requireQualityTool('playwright', 'Flagship normalization production smoke');
const PROJECTS = JSON.parse(fs.readFileSync(path.resolve('data/projects.json'), 'utf8'));
const PROJECT_EVIDENCE = JSON.parse(
  fs.readFileSync(path.resolve('data/project-evidence.json'), 'utf8'),
);

const EXPECTED_DEPLOYED_SHA = process.env.EXPECTED_DEPLOYED_SHA || 'unknown';
const LEGACY_ORIGIN = 'true-ruslan.github.io/trueruslan-landing';
const ARTIFACTS_DIR = path.resolve('production-artifacts');
const VILLAIGENCE_032_SHA = 'b51cfcf3f46718fac9620586cf8b5aae53356c600d5ac375ca3280050befe015';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function expectedStatus(slug) {
  const project = PROJECTS.find((candidate) => candidate.slug === slug);
  assert(project, `Project Registry is missing ${slug}`);
  return project.statusLabel;
}

function evidenceVersion(project, label) {
  const snapshot = PROJECT_EVIDENCE.find((candidate) => candidate.project === project);
  assert(snapshot, `Project Evidence is missing ${project}`);
  const version = snapshot.versions.find((candidate) => candidate.label === label);
  assert(version, `Project Evidence ${project} is missing version ${label}`);
  return version.value;
}

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = '';
  return url.href;
}

function writeJson(name, value) {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  fs.writeFileSync(path.join(ARTIFACTS_DIR, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function assertOrderedHeadings(documentContent, slug, expectedHeadings) {
  const headings = (await documentContent.locator('h2').allInnerTexts()).map((value) => value.trim());
  let previous = -1;
  for (const expected of expectedHeadings) {
    const index = headings.findIndex((heading, candidate) => candidate > previous && heading.includes(expected));
    assert(index !== -1, `${slug} misses ordered section ${expected}; found ${headings.join(' | ')}`);
    previous = index;
  }
  return headings;
}

async function verifyCaseStudy(page, {
  slug,
  locale,
  url,
  headingMarker,
  expectedHeadings,
  requiredText,
  evidenceMarkers = [],
  relatedHrefFragments,
  alternateUrl,
  requireEvidence,
  requireTimeline = requireEvidence,
  expectNextMilestone = true,
  timelineCurrentMarkers = [],
}) {
  const response = await page.goto(url, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `${locale} ${slug} returned HTTP ${response?.status() ?? 'none'}`);

  const heading = (await page.locator('h1').first().innerText()).trim();
  assert(heading.includes(headingMarker), `unexpected ${locale} ${slug} heading: ${heading}`);

  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  assert(canonical && normalizeUrl(canonical) === normalizeUrl(url), `wrong ${locale} ${slug} canonical: ${canonical || 'missing'}`);

  let alternate = null;
  if (alternateUrl) {
    const alternateLocale = locale === 'ru' ? 'en' : 'ru';
    alternate = await page.locator(`link[rel="alternate"][hreflang="${alternateLocale}"]`).getAttribute('href');
    assert(
      alternate && normalizeUrl(alternate) === normalizeUrl(alternateUrl),
      `wrong ${locale} ${slug} alternate: ${alternate || 'missing'}`,
    );
  }

  const documentContent = page.locator('main.dc-doc-page__content');
  await documentContent.waitFor({state: 'visible', timeout: 10000});

  const status = page.locator(`[data-project-status="${slug}"]`).first();
  await status.waitFor({state: 'visible', timeout: 10000});
  const statusText = (await status.innerText()).trim();
  assert(statusText === expectedStatus(slug), `${locale} ${slug} status drifted: ${statusText}`);

  const headings = await assertOrderedHeadings(documentContent, `${locale} ${slug}`, expectedHeadings);
  const mainText = await documentContent.innerText();
  for (const marker of requiredText) {
    assert(mainText.includes(marker), `${locale} ${slug} misses ${marker}`);
  }

  const related = {};
  for (const fragment of relatedHrefFragments) {
    const link = documentContent.locator(`a[href*="${fragment}"]:visible`).first();
    await link.waitFor({state: 'visible', timeout: 10000});
    const href = await link.getAttribute('href');
    assert(href, `${locale} ${slug} related link ${fragment} has no href`);
    related[fragment] = new URL(href, page.url()).href;
  }

  if (requireEvidence) {
    const evidence = page.locator(`[data-project-evidence="${slug}"]`);
    await evidence.waitFor({state: 'visible', timeout: 10000});
    const evidenceText = await evidence.innerText();
    for (const marker of evidenceMarkers) {
      assert(evidenceText.includes(marker), `${locale} ${slug} evidence misses ${marker}`);
    }
  }

  if (requireTimeline) {
    const timeline = page.locator('.tr-project-timeline');
    await timeline.waitFor({state: 'visible', timeout: 10000});
    const current = timeline.locator('.tr-project-timeline__item--current');
    assert(
      await current.count() === 1,
      `${locale} ${slug} timeline must expose exactly one current milestone`,
    );
    const currentText = await current.innerText();
    for (const marker of timelineCurrentMarkers) {
      assert(
        currentText.toLowerCase().includes(marker.toLowerCase()),
        `${locale} ${slug} current timeline milestone misses ${marker}: ${currentText}`,
      );
    }
    const nextCount = await timeline.locator('.tr-project-timeline__item--next').count();
    if (expectNextMilestone) {
      assert(nextCount >= 1, `${locale} ${slug} timeline must expose a next milestone`);
    } else {
      assert(
        nextCount === 0,
        `${locale} ${slug} timeline must not invent a next milestone while the current acceptance boundary is active`,
      );
    }
  }

  const html = await page.content();
  assert(!html.includes(LEGACY_ORIGIN), `${locale} ${slug} leaks legacy Pages origin`);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, `flagship-normalization-${slug}-${locale}.png`),
    fullPage: true,
  });

  return {
    requested: url,
    finalUrl: page.url(),
    status: response.status(),
    heading,
    canonical,
    alternate,
    statusText,
    headings,
    related,
    evidenceChecked: requireEvidence,
    timelineChecked: requireTimeline,
    legacyOriginAbsent: true,
  };
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  let browser;
  const currentVillAIgenceRelease = evidenceVersion('livingworld', 'Current official release');
  const installedVillAIgenceResult = evidenceVersion('livingworld', 'Installed 0.2.0 result');
  const automaticVlezetResult = evidenceVersion('vlezet', 'Automatic M7.8C result');
  const nextVlezetBoundary = evidenceVersion('vlezet', 'Next acceptance boundary');
  const summary = {
    expectedDeployedSha: EXPECTED_DEPLOYED_SHA,
    currentVillAIgenceRelease,
    installedVillAIgenceResult,
    automaticVlezetResult,
    nextVlezetBoundary,
    checkedAt: new Date().toISOString(),
    livingworldRu: {},
    vlezetRu: {},
    livingworldEn: {},
    vlezetEn: {},
    diagnostics: {
      pageErrors: [],
      firstPartyRequestFailures: [],
    },
  };

  try {
    browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
    const context = await browser.newContext({
      viewport: {width: 1440, height: 1000},
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    page.on('pageerror', (error) => summary.diagnostics.pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText || 'unknown';
      if (failure.includes('ERR_ABORTED')) return;
      const hostname = new URL(request.url()).hostname;
      if (hostname === 'trueruslan.ru' || hostname === 'www.trueruslan.ru') {
        summary.diagnostics.firstPartyRequestFailures.push({url: request.url(), failure});
      }
    });

    summary.livingworldRu = await verifyCaseStudy(page, {
      slug: 'livingworld',
      locale: 'ru',
      url: VILLAIGENCE_URL,
      headingMarker: 'VillAIgence',
      expectedHeadings: [
        'Проблема',
        'Ограничения',
        'Текущая lifecycle',
        'Архитектура',
        'альтернативы',
        'Что подтверждено',
        'Известные ограничения',
        'Следующий принятый шаг',
        'Связанные материалы',
        'Что бы я сделал иначе',
      ],
      requiredText: [
        currentVillAIgenceRelease,
        installedVillAIgenceResult,
        '0.3.1+1.21.1',
        'PR #169',
        'PR #171',
        'VAI-PCM-MULTI-001',
        'FAIL',
        'PENDING',
        VILLAIGENCE_032_SHA,
        '0.4 remains blocked',
        'VAI-M2-INST-005',
        'VAI-CONCUR-004',
      ],
      evidenceMarkers: [
        currentVillAIgenceRelease,
        installedVillAIgenceResult,
        '0.3.1+1.21.1',
        'PR #169',
        'PR #171',
        'VAI-PCM-MULTI-001',
        'FAIL',
        'PENDING',
      ],
      relatedHrefFragments: [
        'server-authoritative-ai-npcs',
        'source-tests-to-installed-acceptance',
        'restart-persistence-is-a-product-contract',
      ],
      alternateUrl: VILLAIGENCE_EN_URL,
      requireEvidence: true,
    });

    summary.vlezetRu = await verifyCaseStudy(page, {
      slug: 'vlezet',
      locale: 'ru',
      url: VLEZET_URL,
      headingMarker: 'Vlezet',
      expectedHeadings: [
        'Проблема',
        'Ограничения',
        'Текущая lifecycle',
        'Архитектура',
        'альтернативы',
        'Что подтверждено',
        'Известные ограничения',
        'Следующий принятый шаг',
        'Связанные материалы',
        'Что бы я сделал иначе',
      ],
      requiredText: [
        'M7.8B',
        automaticVlezetResult,
        nextVlezetBoundary,
        'PR #42',
        'PR #44',
        'PR #45',
        'PR #52',
        'Assisted Tracing',
        'ACTIVE DEVELOPMENT',
      ],
      evidenceMarkers: [
        'M7.8B',
        automaticVlezetResult,
        nextVlezetBoundary,
        'PR #42',
        'PR #52',
      ],
      relatedHrefFragments: [
        'probabilistic-proposals-deterministic-authority',
        'green-ci-is-not-product-verification',
      ],
      alternateUrl: VLEZET_EN_URL,
      requireEvidence: true,
      expectNextMilestone: false,
      timelineCurrentMarkers: [
        'M8.3 Precision Reference Calibration',
        'Draft',
        'RED',
        'not product-owner accepted, merged or released',
      ],
    });

    summary.livingworldEn = await verifyCaseStudy(page, {
      slug: 'livingworld',
      locale: 'en',
      url: VILLAIGENCE_EN_URL,
      headingMarker: 'VillAIgence',
      expectedHeadings: [
        'Problem',
        'Constraints',
        'Current lifecycle',
        'Architecture',
        'Alternatives',
        'Evidence boundary',
        'Known limitations',
        'Next accepted milestone',
        'Related material',
        'What I would change',
      ],
      requiredText: [
        currentVillAIgenceRelease,
        installedVillAIgenceResult,
        '0.3.1+1.21.1',
        'PR #169',
        'PR #171',
        'VAI-PCM-MULTI-001',
        'FAIL',
        'PENDING',
        VILLAIGENCE_032_SHA,
        '0.4 remains blocked',
        'VAI-M2-INST-005',
        'VAI-CONCUR-004',
      ],
      relatedHrefFragments: [
        'server-authoritative-ai-npcs',
        'llm-output-is-a-protocol-boundary',
        '/projects/livingworld/',
      ],
      alternateUrl: VILLAIGENCE_URL,
      requireEvidence: false,
    });

    summary.vlezetEn = await verifyCaseStudy(page, {
      slug: 'vlezet',
      locale: 'en',
      url: VLEZET_EN_URL,
      headingMarker: 'Vlezet',
      expectedHeadings: [
        'Problem',
        'Constraints',
        'Current lifecycle',
        'Architecture',
        'Alternatives',
        'Evidence boundary',
        'Known limitations',
        'Next accepted step',
        'Related material',
        'Retrospective',
      ],
      requiredText: [
        'M7.8B',
        automaticVlezetResult,
        nextVlezetBoundary,
        'PR #42',
        'PR #44',
        'PR #45',
        'PR #52',
        'Assisted Tracing',
        'ACTIVE DEVELOPMENT',
      ],
      evidenceMarkers: [
        'M7.8B',
        automaticVlezetResult,
        nextVlezetBoundary,
        'PR #42',
        'PR #52',
      ],
      relatedHrefFragments: [
        'probabilistic-proposals-deterministic-authority',
        'green-ci-is-not-product-verification',
      ],
      alternateUrl: VLEZET_URL,
      requireEvidence: true,
      requireTimeline: false,
    });

    assert(summary.diagnostics.pageErrors.length === 0, `page errors: ${summary.diagnostics.pageErrors.join(' | ')}`);
    assert(
      summary.diagnostics.firstPartyRequestFailures.length === 0,
      `first-party request failures: ${JSON.stringify(summary.diagnostics.firstPartyRequestFailures)}`,
    );

    writeJson('flagship-normalization-production-summary.json', summary);
    console.log(`Flagship normalization production smoke passed for deployed SHA ${EXPECTED_DEPLOYED_SHA}.`);
  } catch (error) {
    summary.failure = error.stack || error.message;
    writeJson('flagship-normalization-production-summary.json', summary);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});