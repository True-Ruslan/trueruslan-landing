const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.SOURCES_KB_SMOKE_PORT || 4182);
const ROUTE = '/landing/bibliography/';
const EXPECTED_SOURCE_COUNT = 31;
const FIRST_SOURCE_ID = 'source-kak-my-sokratili-obem-dannyh-v-10-raz-ne-povrediv-polzovatelskom-988510';

const {chromium} = requireQualityTool('playwright', 'Sources Knowledge Base smoke tool');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright', 'Sources Knowledge Base smoke tool');

async function visibleSourceCount(page) {
  return page.locator('[data-tr-source]:visible').count();
}

async function runEnhancedScenario(browser, baseUrl) {
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
    if (!response?.ok()) throw new Error(`enhanced: navigation HTTP ${response?.status() ?? 'none'}`);

    await page.waitForSelector('[data-tr-sources-root][data-tr-sources-enhanced="true"]', {timeout: 5000});
    const cards = page.locator('[data-tr-source]');
    if (await cards.count() !== EXPECTED_SOURCE_COUNT) {
      throw new Error(`enhanced: expected ${EXPECTED_SOURCE_COUNT} sources, got ${await cards.count()}`);
    }
    if (await page.locator('main table').count() !== 0) throw new Error('enhanced: legacy bibliography table is still rendered');

    const query = page.locator('[data-tr-sources-query]');
    const topic = page.locator('[data-tr-sources-topic]');
    const type = page.locator('[data-tr-sources-type]');
    const clear = page.locator('[data-tr-sources-clear]');
    const first = page.locator(`#${FIRST_SOURCE_ID}`);

    await query.fill('ClickHouse');
    const queryCount = await visibleSourceCount(page);
    if (queryCount < 1 || queryCount >= EXPECTED_SOURCE_COUNT || !(await first.isVisible())) {
      throw new Error(`enhanced: query filter returned invalid state: visible=${queryCount}, firstVisible=${await first.isVisible()}`);
    }

    await clear.click();
    if (await visibleSourceCount(page) !== EXPECTED_SOURCE_COUNT) throw new Error('enhanced: clear did not restore all sources');

    await topic.selectOption('JPA');
    const topicCount = await visibleSourceCount(page);
    if (topicCount < 1 || topicCount >= EXPECTED_SOURCE_COUNT) throw new Error(`enhanced: JPA topic filter returned ${topicCount} sources`);
    const visibleTopicMismatch = await page.locator('[data-tr-source]:visible').evaluateAll((nodes) =>
      nodes.some((node) => !(node.dataset.trSourceTopics || '').split('|').includes('JPA')),
    );
    if (visibleTopicMismatch) throw new Error('enhanced: topic filter left a non-JPA source visible');

    await clear.click();
    await type.selectOption('blog');
    const blogCount = await visibleSourceCount(page);
    if (blogCount !== 1) throw new Error(`enhanced: expected one migrated blog source, got ${blogCount}`);

    await clear.click();
    await page.goto(`${baseUrl}${ROUTE}#${FIRST_SOURCE_ID}`, {waitUntil: 'networkidle'});
    await page.waitForSelector('[data-tr-sources-root][data-tr-sources-enhanced="true"]', {timeout: 5000});
    const hashTarget = page.locator(`#${FIRST_SOURCE_ID}`);
    if (!(await hashTarget.isVisible())) throw new Error('enhanced: deep-link target is not visible');

    const overflow = (await assertNoHorizontalOverflow(page, 'enhanced-mobile')).overflow;
    const axe = await new AxeBuilder({page}).include('[data-tr-sources-root]').analyze();
    const serious = blockingAxeViolations(axe);
    if (serious.length) throw new Error(`enhanced: Axe serious/critical violations: ${serious.map((v) => v.id).join(', ')}`);
    if (pageErrors.length) throw new Error(`enhanced: page errors: ${pageErrors.join('; ')}`);

    await captureScreenshot(page, 'sources-knowledge-base-mobile.png');

    return {sources: await cards.count(), queryCount, topicCount, blogCount, overflow, seriousAxeViolations: serious.length};
  } finally {
    await runtime.close();
  }
}

async function runNoJavaScriptScenario(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {
    viewport: {width: 1280, height: 800},
    colorScheme: 'dark',
    javaScriptEnabled: false,
  });
  const {page} = runtime;

  try {
    const response = await page.goto(`${baseUrl}${ROUTE}`, {waitUntil: 'load'});
    if (!response?.ok()) throw new Error(`no-js: navigation HTTP ${response?.status() ?? 'none'}`);

    const root = page.locator('[data-tr-sources-root]');
    if (await root.count() !== 1) throw new Error('no-js: semantic Sources Knowledge Base root is missing');
    const cards = page.locator('[data-tr-source]');
    if (await cards.count() !== EXPECTED_SOURCE_COUNT) {
      throw new Error(`no-js: expected ${EXPECTED_SOURCE_COUNT} static source records, got ${await cards.count()}`);
    }

    const first = page.locator(`#${FIRST_SOURCE_ID}`);
    if (!(await first.isVisible())) throw new Error('no-js: first source card is not visible');
    if (!(await first.getByRole('link', {name: /Как мы сократили объем данных/i}).isVisible())) {
      throw new Error('no-js: source title/link is not readable');
    }

    const details = first.locator('details');
    if (await details.count()) {
      const summary = details.locator('summary');
      if (!(await summary.isVisible())) throw new Error('no-js: native summary control is not visible');
      const staticText = await details.textContent();
      if (!staticText?.includes('2 ТБ') || !staticText.includes('ClickHouse')) {
        throw new Error('no-js: full summary content is not present in the static DOM');
      }
    } else {
      const summary = first.locator('.tr-source-card__summary');
      if (!(await summary.isVisible())) throw new Error('no-js: source summary is not readable');
      const staticText = await summary.textContent();
      if (!staticText?.includes('2 ТБ') || !staticText.includes('ClickHouse')) {
        throw new Error('no-js: representative summary content is missing');
      }
    }

    const overflow = (await assertNoHorizontalOverflow(page, 'no-js-desktop')).overflow;
    return {sources: await cards.count(), overflow};
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
      enhanced: await runEnhancedScenario(browser, serverRuntime.baseUrl),
      noJavaScript: await runNoJavaScriptScenario(browser, serverRuntime.baseUrl),
    };
    writeJsonArtifact('sources-knowledge-base-summary.json', summary);
    console.log(`Sources Knowledge Base browser smoke passed: ${JSON.stringify(summary)}`);
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
