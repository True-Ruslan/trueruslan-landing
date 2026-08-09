const fs = require('fs');
const path = require('path');
const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {APEX, RESUME_URL} = require('./production-live-routes.cjs');

const {chromium} = requireQualityTool('playwright', 'Production favicon smoke');

const FAVICON_URL = new URL('favicon.svg', APEX).href;
const EXPECTED_DEPLOYED_SHA = process.env.EXPECTED_DEPLOYED_SHA || 'unknown';
const ARTIFACTS_DIR = path.resolve('production-artifacts');

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

async function inspectPage(page, url) {
  const response = await page.goto(url, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `${url} returned HTTP ${response?.status() ?? 'none'}`);

  const favicon = page.locator('link[rel="icon"]').first();
  assert(await favicon.count() === 1, `${url} does not expose a favicon link`);
  const href = await favicon.getAttribute('href');
  assert(href, `${url} favicon link has no href`);
  const resolved = new URL(href, page.url()).href;
  assert(normalizeUrl(resolved) === normalizeUrl(FAVICON_URL), `${url} resolves favicon to ${resolved}`);

  return {
    requested: url,
    finalUrl: page.url(),
    status: response.status(),
    href,
    resolved,
  };
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  let browser;
  const summary = {
    expectedDeployedSha: EXPECTED_DEPLOYED_SHA,
    checkedAt: new Date().toISOString(),
    favicon: {},
    pages: [],
  };

  try {
    browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
    const context = await browser.newContext({
      viewport: {width: 1440, height: 1000},
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });

    const response = await context.request.get(FAVICON_URL, {timeout: 30000});
    assert(response.ok(), `root favicon returned HTTP ${response.status()}`);
    const contentType = response.headers()['content-type'] || '';
    const svg = await response.text();
    assert(/image\/svg\+xml/i.test(contentType), `unexpected favicon content type: ${contentType}`);
    assert(/<svg\b/i.test(svg), 'root favicon response does not contain SVG markup');
    assert(svg.length > 100, `root favicon response is unexpectedly small: ${svg.length} bytes`);
    summary.favicon = {
      url: FAVICON_URL,
      status: response.status(),
      contentType,
      bytes: Buffer.byteLength(svg),
    };

    const page = await context.newPage();
    summary.pages.push(await inspectPage(page, APEX));
    summary.pages.push(await inspectPage(page, RESUME_URL));

    writeJson('production-favicon-summary.json', summary);
    console.log(`Production favicon smoke passed for deployed SHA ${EXPECTED_DEPLOYED_SHA}.`);
  } catch (error) {
    summary.failure = error.stack || error.message;
    writeJson('production-favicon-summary.json', summary);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
