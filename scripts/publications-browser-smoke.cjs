const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, assertNoBlockingAxe} = require('./quality-harness/assertions.cjs');
const {ensureArtifactsDir, captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.PUBLICATIONS_SMOKE_PORT || 4184);
const {chromium} = requireQualityTool('playwright');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright');
const EXPECTED_PUBLICATION_IDS = Object.freeze([
  'diplodoc-github-pages',
  'java-algorithmic-problems',
  'automated-conveyor-drive',
]);
const LOCALES = Object.freeze({
  ru: Object.freeze({
    route: '/landing/publications/',
    heading: 'Публикации и выступления',
    featured: 'Избранное',
    emptyGroups: Object.freeze(['Научные публикации', 'Доклады и конференции', 'Интервью и приглашённые материалы', 'Публикации в сборниках']),
  }),
  en: Object.freeze({
    route: '/en/publications/',
    heading: 'Publications and talks',
    featured: 'Featured',
    emptyGroups: Object.freeze(['Scientific publications', 'Talks and conferences', 'Interviews and invited material', 'Proceedings publications']),
  }),
});

async function assertEnglishPresentation(page, label, expectedCardCount) {
  const publicationRoot = page.locator('[data-tr-publications-root]').first();
  await publicationRoot.waitFor({state: 'visible', timeout: 5000});
  const rootText = (await publicationRoot.textContent()) || '';
  if (!rootText.includes('Technical articles')) {
    throw new Error(`${label}: English catalogue section heading is missing.`);
  }
  if (/Технические статьи|Техническая статья|Автор|Темы|Читать на/i.test(rootText)) {
    throw new Error(`${label}: English catalogue leaks Russian UI labels.`);
  }

  const cards = page.locator('[data-tr-publication-id]');
  const metaKinds = cards.locator('.tr-publication-card__meta span:first-child');
  const metaRoles = cards.locator('.tr-publication-card__meta span:last-child');
  const topicLists = cards.locator('.tr-publication-card__topics[aria-label="Topics"]');
  const actions = cards.locator('.tr-publication-card__primary');
  const originalTitles = cards.locator('h3 a[lang="ru"]');

  for (const [name, locator] of [
    ['publication kind metadata', metaKinds],
    ['publication role metadata', metaRoles],
    ['Topics semantic labels', topicLists],
    ['primary publication actions', actions],
    ['original Russian publication titles', originalTitles],
  ]) {
    const count = await locator.count();
    if (count !== expectedCardCount) {
      throw new Error(`${label}: expected ${expectedCardCount} ${name}, got ${count}.`);
    }
  }

  for (const text of await metaKinds.allTextContents()) {
    if (!text.includes('Technical article')) {
      throw new Error(`${label}: publication kind source text is not localized: ${text}`);
    }
  }
  for (const text of await metaRoles.allTextContents()) {
    if (text.trim() !== 'Author') {
      throw new Error(`${label}: publication role source text is not Author: ${text}`);
    }
  }
  for (const text of await actions.allTextContents()) {
    if (!text.includes('Read on Habr')) {
      throw new Error(`${label}: publication action source text is not localized: ${text}`);
    }
  }

  const augustDates = page.locator('[data-tr-publication-id] time[datetime="2025-08-23"]');
  const expectedAugustCopies = expectedCardCount / EXPECTED_PUBLICATION_IDS.length;
  if (await augustDates.count() !== expectedAugustCopies) {
    throw new Error(`${label}: expected ${expectedAugustCopies} August 23 publication date(s).`);
  }
  for (const text of await augustDates.allTextContents()) {
    if (text.trim() !== 'August 23, 2025') {
      throw new Error(`${label}: publication date source text is not localized: ${text}`);
    }
  }
}

async function assertPublicationContent(page, label, {javaScriptEnabled, locale}) {
  const copy = LOCALES[locale];
  const heading = (await page.locator('h1').first().innerText()).trim();
  if (!heading.includes(copy.heading)) {
    throw new Error(`${label}: unexpected h1: ${heading}`);
  }

  const expectedCopies = javaScriptEnabled ? 2 : 1;
  const expectedCardCount = EXPECTED_PUBLICATION_IDS.length * expectedCopies;
  const cards = page.locator('[data-tr-publication-id]');
  const actualCardCount = await cards.count();
  if (actualCardCount !== expectedCardCount) {
    throw new Error(`${label}: expected ${expectedCardCount} publication cards, got ${actualCardCount}.`);
  }

  for (const id of EXPECTED_PUBLICATION_IDS) {
    const actualCopies = await page.locator(`[data-tr-publication-id="${id}"]`).count();
    if (actualCopies !== expectedCopies) {
      throw new Error(`${label}: publication ${id} expected ${expectedCopies} visible representation(s), got ${actualCopies}.`);
    }
  }

  const pageText = await page.locator('body').innerText();
  if (javaScriptEnabled && !pageText.includes(copy.featured)) {
    throw new Error(`${label}: enhanced page must expose the curated Featured section.`);
  }
  if (!javaScriptEnabled && pageText.includes(copy.featured)) {
    throw new Error(`${label}: no-JS fallback must expose the complete catalogue without duplicate Featured cards.`);
  }

  for (const headingText of copy.emptyGroups) {
    if (pageText.includes(headingText)) {
      throw new Error(`${label}: empty group must not render: ${headingText}`);
    }
  }

  if (locale === 'en') {
    await assertEnglishPresentation(page, label, expectedCardCount);
  }

  const unsafeExternal = page.locator('[data-tr-publication-id] a[target="_blank"]:not([rel="noopener noreferrer"])');
  if (await unsafeExternal.count()) {
    throw new Error(`${label}: external publication links must use noopener noreferrer.`);
  }

  return actualCardCount;
}

async function runScenario(browser, baseUrl, {
  label,
  viewport,
  javaScriptEnabled,
  screenshot,
  locale,
}) {
  const runtime = await createScenarioPage(browser, {
    viewport,
    javaScriptEnabled,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {
    baseUrl,
    ignoredRequestFailureReasons: ['ERR_ABORTED'],
  });

  try {
    const response = await page.goto(`${baseUrl}${LOCALES[locale].route}`, {waitUntil: javaScriptEnabled ? 'networkidle' : 'load'});
    if (!response?.ok()) {
      throw new Error(`${label}: publications page returned HTTP ${response?.status() ?? 'no response'}`);
    }

    if (await page.locator('html').getAttribute('lang') !== locale) {
      throw new Error(`${label}: html lang does not match ${locale}.`);
    }

    const publicationCards = await assertPublicationContent(page, label, {javaScriptEnabled, locale});
    await assertNoHorizontalOverflow(page, label);

    let axeChecked = false;
    if (javaScriptEnabled) {
      await assertNoBlockingAxe({
        page,
        label,
        AxeBuilder,
        artifactName: `axe-${screenshot.replace('.png', '')}.json`,
      });
      axeChecked = true;
    }

    const fallback = page.locator(`[data-tr-publications-noscript="${locale}"]`);
    const fallbackCount = await fallback.count();
    const fallbackVisible = fallbackCount === 1 ? await fallback.isVisible() : false;
    if (fallbackCount !== 1) {
      throw new Error(`${label}: expected exactly one semantic no-JS fallback node.`);
    }
    if (javaScriptEnabled && fallbackVisible) {
      throw new Error(`${label}: no-JS fallback must remain hidden when JavaScript is enabled.`);
    }
    if (!javaScriptEnabled && !fallbackVisible) {
      throw new Error(`${label}: semantic no-JS fallback must be visible without JavaScript.`);
    }

    await captureScreenshot(page, screenshot);
    diagnostics.assertClean(label);

    return {
      label,
      locale,
      javaScriptEnabled,
      viewport,
      publicationCards,
      fallbackCount,
      fallbackVisible,
      axeChecked,
    };
  } finally {
    await runtime.close();
  }
}

async function main() {
  ensureArtifactsDir();
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;

  try {
    browser = await launchChromium(chromium);
    const results = [];
    for (const locale of ['ru', 'en']) {
      results.push(await runScenario(browser, serverRuntime.baseUrl, {
        label: `${locale.toUpperCase()} Publications enhanced desktop`,
        locale,
        viewport: VIEWPORTS.desktop,
        javaScriptEnabled: true,
        screenshot: `publications-${locale}-enhanced-desktop.png`,
      }));
      results.push(await runScenario(browser, serverRuntime.baseUrl, {
        label: `${locale.toUpperCase()} Publications no-JS mobile`,
        locale,
        viewport: VIEWPORTS.mobile,
        javaScriptEnabled: false,
        screenshot: `publications-${locale}-no-js-mobile.png`,
      }));
    }

    writeJsonArtifact('publications-summary.json', {
      checkedAt: new Date().toISOString(),
      expectedPublicationIds: EXPECTED_PUBLICATION_IDS,
      results,
    });
    console.log('RU and EN Publications enhanced/no-JS browser smoke passed.');
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
