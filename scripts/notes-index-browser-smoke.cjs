const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.NOTES_INDEX_SMOKE_PORT || 4194);
const ROUTE = '/notes/';
const NOTES = JSON.parse(fs.readFileSync(path.resolve('data/notes.json'), 'utf8'));
const EXPECTED_COUNT = NOTES.length;
const EXPECTED_ORDER = [...NOTES]
  .sort((a, b) => b.updated.localeCompare(a.updated) || b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug))
  .map(({slug}) => slug);

const {chromium} = requireQualityTool('playwright', 'Engineering Notes index smoke tool');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright', 'Engineering Notes index smoke tool');

async function assertIndex(page, label) {
  const root = page.locator('[data-tr-notes-index]');
  if (await root.count() !== 1) throw new Error(`${label}: expected one Notes index root`);
  const cards = page.locator('[data-tr-note-index-card]');
  if (await cards.count() !== EXPECTED_COUNT) {
    throw new Error(`${label}: expected ${EXPECTED_COUNT} registry-derived cards, got ${await cards.count()}`);
  }

  const slugs = await cards.evaluateAll((nodes) => nodes.map((node) => node.dataset.trNoteIndexCard));
  if (JSON.stringify(slugs) !== JSON.stringify(EXPECTED_ORDER)) {
    throw new Error(`${label}: registry-derived order drifted: ${JSON.stringify(slugs)}`);
  }

  for (const note of NOTES) {
    const card = page.locator(`[data-tr-note-index-card="${note.slug}"]`);
    if (await card.count() !== 1) throw new Error(`${label}: missing card ${note.slug}`);
    const text = await card.innerText();
    if (!text.includes(note.title) || !text.includes(note.description) || !text.includes(`${note.readingMinutes} мин`)) {
      throw new Error(`${label}: card ${note.slug} is missing canonical title/summary/read time`);
    }
    const link = card.locator('a[href]').first();
    const pathname = new URL(await link.getAttribute('href'), page.url()).pathname;
    if (!pathname.endsWith(`/notes/${note.slug}/`) && !pathname.endsWith(`/landing/notes/${note.slug}.html`)) {
      throw new Error(`${label}: card ${note.slug} has unexpected href ${pathname}`);
    }
  }

  return cards.count();
}

async function runEnhanced(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {
    viewport: VIEWPORTS.mobile,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const {page} = runtime;
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    const response = await page.goto(`${baseUrl}${ROUTE}`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`enhanced: Notes index HTTP ${response?.status() ?? 'none'}`);
    const cards = await assertIndex(page, 'enhanced');
    const overflow = (await assertNoHorizontalOverflow(page, 'notes-index-mobile')).overflow;
    const axe = await new AxeBuilder({page}).include('[data-tr-notes-index]').analyze();
    const serious = blockingAxeViolations(axe);
    if (serious.length) throw new Error(`enhanced: Axe serious/critical violations: ${serious.map((item) => item.id).join(', ')}`);
    if (pageErrors.length) throw new Error(`enhanced: page errors: ${pageErrors.join(' | ')}`);
    await captureScreenshot(page, 'notes-index-mobile.png');
    return {cards, overflow, seriousAxeViolations: serious.length};
  } finally {
    await runtime.close();
  }
}

async function runNoJavaScript(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {
    viewport: {width: 1280, height: 900},
    colorScheme: 'dark',
    javaScriptEnabled: false,
  });
  const {page} = runtime;

  try {
    const response = await page.goto(`${baseUrl}${ROUTE}`, {waitUntil: 'load'});
    if (!response?.ok()) throw new Error(`no-js: Notes index HTTP ${response?.status() ?? 'none'}`);
    const cards = await assertIndex(page, 'no-js');
    const overflow = (await assertNoHorizontalOverflow(page, 'notes-index-no-js')).overflow;
    await captureScreenshot(page, 'notes-index-no-js-desktop.png');
    return {cards, overflow};
  } finally {
    await runtime.close();
  }
}

async function main() {
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;

  try {
    browser = await launchChromium(chromium);
    const summary = {
      enhanced: await runEnhanced(browser, serverRuntime.baseUrl),
      noJavaScript: await runNoJavaScript(browser, serverRuntime.baseUrl),
    };
    writeJsonArtifact('notes-index-summary.json', summary);
    console.log(`Engineering Notes index browser smoke passed: ${JSON.stringify(summary)}`);
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
