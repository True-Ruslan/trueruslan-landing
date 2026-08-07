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

async function assertEnglishCardSet(root, label) {
  const expected = EXPECTED_PUBLICATION_IDS.length;
  const cards = root.locator('[data-tr-publication-id]');
  const count = await cards.count();
  if (count !== expected) throw new Error(`${label}: expected ${expected} publication cards, got ${count}.`);

  const metaKinds = cards.locator('.tr-publication-card__meta span:first-child');
  const metaRoles = cards.locator('.tr-publication-card__meta span:last-child');
  const topicLists = cards.locator('.tr-publication-card__topics');
  const actions = cards.locator('.tr-publication-card__primary');
  const originalTitles = cards.locator('h3 a[lang="ru"]');

  for (const [name, locator] of [
    ['publication kind metadata', metaKinds],
    ['publication role metadata', metaRoles],
    ['topic lists', topicLists],
    ['primary publication actions', actions],
    ['original Russian publication titles', originalTitles],
  ]) {
    const actual = await locator.count();
    if (actual !== expected) throw new Error(`${label}: expected ${expected} ${name}, got ${actual}.`);
  }

  for (const text of await metaKinds.allTextContents()) {
    if (!text.includes('Technical article') || text.includes('Техническая статья')) {
      throw new Error(`${label}: publication kind source text is not localized: ${text}`);
    }
  }
  for (const text of await metaRoles.allTextContents()) {
    if (text.trim() !== 'Author') {
      throw new Error(`${label}: publication role source text is not Author: ${text}`);
    }
  }
  for (const labelValue of await topicLists.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label')))) {
    if (labelValue !== 'Topics') {
      throw new Error(`${label}: publication topics aria-label is not localized: ${labelValue}`);
    }
  }
  for (const text of await actions.allTextContents()) {
    if (!text.includes('Read on Habr') || text.includes('Читать на')) {
      throw new Error(`${label}: publication action source text is not localized: ${text}`);
    }
  }

  const augustDate = root.locator('time[datetime="2025-08-23"]');
  if (await augustDate.count() !== 1) throw new Error(`${label}: expected one August 23 publication date.`);
  const dateText = (await augustDate.textContent())?.trim();
  if (dateText !== 'August 23, 2025') throw new Error(`${label}: publication date source text is not localized: ${dateText}`);
}

async function assertEnglishPresentation(page, label, {javaScriptEnabled}) {
  const catalogue = javaScriptEnabled
    ? page.locator('[data-tr-publications-root]').first()
    : page.locator('[data-tr-publications-noscript="en"] [data-tr-publications-root]').first();
  await catalogue.waitFor({state: 'visible', timeout: 5000});

  const catalogueText = (await catalogue.textContent()) || '';
  if (!catalogueText.includes('Technical articles')) {
    throw new Error(`${label}: English catalogue section heading is missing.`);
  }
  for (const text of await catalogue.locator('.tr-publications__group-head h2').allTextContents()) {
    if (text.trim() === 'Технические статьи') throw new Error(`${label}: catalogue section heading leaked Russian UI copy.`);
  }
  await assertEnglishCardSet(catalogue, `${label} catalogue`);

  if (javaScriptEnabled) {
    const featured = page.locator('.tr-publications-featured--page').first();
    await featured.waitFor({state: 'visible', timeout: 5000});
    const featuredHeading = (await featured.locator('h2').first().textContent())?.trim();
    if (featuredHeading !== 'Featured') throw new Error(`${label}: featured heading is not localized: ${featuredHeading}`);
    await assertEnglishCardSet(featured, `${label} featured`);
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
    await assertEnglishPresentation(page, label, {javaScriptEnabled});
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
