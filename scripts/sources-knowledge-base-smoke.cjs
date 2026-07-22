const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const TOOLS_DIR = path.join(ROOT, '.quality-tools', 'node_modules');
const ARTIFACTS_DIR = path.join(ROOT, 'quality-artifacts');
const PORT = Number(process.env.SOURCES_KB_SMOKE_PORT || 4182);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ROUTE = '/landing/bibliography.html';
const EXPECTED_SOURCE_COUNT = 31;
const FIRST_SOURCE_ID = 'source-kak-my-sokratili-obem-dannyh-v-10-raz-ne-povrediv-polzovatelskom-988510';

function requireTool(name) {
  try {
    return require(path.join(TOOLS_DIR, ...name.split('/')));
  } catch (error) {
    throw new Error(`Sources Knowledge Base smoke tool ${name} is not installed in .quality-tools: ${error.message}`);
  }
}

const {chromium} = requireTool('playwright');
const {default: AxeBuilder} = requireTool('@axe-core/playwright');

function startServer() {
  if (!fs.existsSync(OUTPUT_DIR)) throw new Error('docs-html does not exist. Run npm run build:docs first.');
  const app = express();
  app.disable('x-powered-by');
  app.use(express.static(OUTPUT_DIR, {extensions: ['html'], fallthrough: false}));
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

function stopServer(server) {
  return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

async function assertNoOverflow(page, name) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 2) throw new Error(`${name}: horizontal overflow ${overflow}px`);
  return overflow;
}

async function visibleSourceCount(page) {
  return page.locator('[data-tr-source]:visible').count();
}

async function runEnhancedScenario(browser) {
  const context = await browser.newContext({
    viewport: {width: 390, height: 844},
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    const response = await page.goto(`${BASE_URL}${ROUTE}`, {waitUntil: 'networkidle'});
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
    await page.goto(`${BASE_URL}${ROUTE}#${FIRST_SOURCE_ID}`, {waitUntil: 'networkidle'});
    await page.waitForSelector('[data-tr-sources-root][data-tr-sources-enhanced="true"]', {timeout: 5000});
    const hashTarget = page.locator(`#${FIRST_SOURCE_ID}`);
    if (!(await hashTarget.isVisible())) throw new Error('enhanced: deep-link target is not visible');

    const overflow = await assertNoOverflow(page, 'enhanced-mobile');
    const axe = await new AxeBuilder({page}).include('[data-tr-sources-root]').analyze();
    const serious = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
    if (serious.length) throw new Error(`enhanced: Axe serious/critical violations: ${serious.map((v) => v.id).join(', ')}`);
    if (pageErrors.length) throw new Error(`enhanced: page errors: ${pageErrors.join('; ')}`);

    fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'sources-knowledge-base-mobile.png'),
      fullPage: true,
      animations: 'disabled',
    });

    return {sources: await cards.count(), queryCount, topicCount, blogCount, overflow, seriousAxeViolations: serious.length};
  } finally {
    await context.close();
  }
}

async function runNoJavaScriptScenario(browser) {
  const context = await browser.newContext({
    viewport: {width: 1280, height: 800},
    colorScheme: 'dark',
    javaScriptEnabled: false,
  });
  const page = await context.newPage();

  try {
    const response = await page.goto(`${BASE_URL}${ROUTE}`, {waitUntil: 'load'});
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
      await details.locator('summary').click();
      if (!(await details.locator('li').first().isVisible())) throw new Error('no-js: native summary details cannot reveal content');
    } else if (!(await first.locator('.tr-source-card__summary').isVisible())) {
      throw new Error('no-js: source summary is not readable');
    }

    const overflow = await assertNoOverflow(page, 'no-js-desktop');
    return {sources: await cards.count(), overflow};
  } finally {
    await context.close();
  }
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  const server = await startServer();
  let browser;

  try {
    try {
      browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox']});
    } catch {
      browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
    }

    const summary = {
      enhanced: await runEnhancedScenario(browser),
      noJavaScript: await runNoJavaScriptScenario(browser),
    };
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'sources-knowledge-base-summary.json'), JSON.stringify(summary, null, 2));
    console.log(`Sources Knowledge Base browser smoke passed: ${JSON.stringify(summary)}`);
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
