const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const TOOLS_DIR = path.join(ROOT, '.quality-tools', 'node_modules');
const ARTIFACTS_DIR = path.join(ROOT, 'quality-artifacts');
const PORT = Number(process.env.ENGINEERING_GRAPH_PORT || 4176);
const BASE_URL = `http://127.0.0.1:${PORT}`;

function requireTool(name) {
  return require(path.join(TOOLS_DIR, ...name.split('/')));
}

const {chromium} = requireTool('playwright');
const {default: AxeBuilder} = requireTool('@axe-core/playwright');

function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.static(OUTPUT_DIR, {extensions:['html'], fallthrough:false}));
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

function stopServer(server) {
  return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

async function runScenario(browser, name, viewport) {
  const context = await browser.newContext({viewport, colorScheme:'dark'});
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  try {
    const response = await page.goto(`${BASE_URL}/landing/engineering-map.html`, {waitUntil:'networkidle'});
    if (!response?.ok()) throw new Error(`${name}: navigation HTTP ${response?.status() ?? 'none'}`);
    await page.waitForSelector('[data-tr-engineering-graph-enhanced="true"]', {timeout:5000});

    const nodes = page.locator('.tr-engineering-graph__node');
    if (await nodes.count() < 16) throw new Error(`${name}: expected at least 16 graph nodes`);
    const filters = page.locator('.tr-engineering-graph__filter');
    if (await filters.count() !== 5) throw new Error(`${name}: expected five filters including All`);

    await page.getByRole('button', {name:'AI', exact:true}).click();
    const livingWorld = page.locator('[data-node-id="livingworld"]');
    const java = page.locator('[data-node-id="java"]');
    if (await livingWorld.evaluate((node) => node.classList.contains('is-filtered-out'))) {
      throw new Error(`${name}: LivingWorld incorrectly filtered out by AI filter`);
    }
    if (!(await java.evaluate((node) => node.classList.contains('is-filtered-out')))) {
      throw new Error(`${name}: Java should be dimmed by AI filter`);
    }

    await page.getByRole('button', {name:'Все', exact:true}).click();
    await livingWorld.focus();
    await page.waitForTimeout(50);
    const detailText = await page.locator('.tr-engineering-graph__detail').innerText();
    if (!detailText.includes('LivingWorld') || !detailText.includes('Server-authoritative')) {
      throw new Error(`${name}: selected node detail did not update`);
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 2) throw new Error(`${name}: horizontal overflow ${overflow}px`);

    const axe = await new AxeBuilder({page}).include('.tr-engineering-graph').analyze();
    const serious = axe.violations.filter((violation) => ['serious','critical'].includes(violation.impact));
    if (serious.length) throw new Error(`${name}: Axe serious/critical violations: ${serious.map((v) => v.id).join(', ')}`);
    if (pageErrors.length) throw new Error(`${name}: page errors: ${pageErrors.join('; ')}`);

    fs.mkdirSync(ARTIFACTS_DIR, {recursive:true});
    await page.screenshot({
      path:path.join(ARTIFACTS_DIR, `engineering-map-${name}.png`),
      fullPage:true,
      animations:'disabled',
    });

    return {name, nodes:await nodes.count(), filters:await filters.count(), seriousAxeViolations:serious.length, overflow};
  } finally {
    await context.close();
  }
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) throw new Error('docs-html does not exist. Run npm run build:docs first.');
  const server = await startServer();
  let browser;
  try {
    browser = await chromium.launch({channel:'chrome', headless:true, args:['--no-sandbox']});
    const results = [];
    results.push(await runScenario(browser, 'desktop', {width:1440,height:1000}));
    results.push(await runScenario(browser, 'mobile', {width:390,height:844}));
    fs.mkdirSync(ARTIFACTS_DIR, {recursive:true});
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'engineering-graph-summary.json'), JSON.stringify(results, null, 2));
    console.log(`Engineering Map browser smoke passed for ${results.length} scenario(s).`);
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
