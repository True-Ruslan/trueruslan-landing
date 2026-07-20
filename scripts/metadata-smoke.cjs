const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const TOOLS_DIR = path.join(ROOT, '.quality-tools', 'node_modules');
const PORT = Number(process.env.METADATA_SMOKE_PORT || 4175);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function requireTool(name) {
  return require(path.join(TOOLS_DIR, ...name.split('/')));
}

const {chromium} = requireTool('playwright');

const pages = [
  {path: '/index.html', title: 'Руслан Немыкин — Backend Engineer', card: 'home'},
  {path: '/landing/projects.html', title: 'Проекты — Руслан Немыкин', card: 'projects'},
  {path: '/landing/resume.html', title: 'Резюме — Руслан Немыкин', card: 'resume'},
  {path: '/landing/projects/livingworld.html', title: 'LivingWorld — Server-Authoritative AI NPCs', card: 'livingworld'},
  {path: '/landing/projects/node-zero.html', title: 'NODE ZERO — Narrative Systems Case Study', card: 'node-zero'},
  {path: '/landing/notes.html', title: 'Engineering Notes — Руслан Немыкин', card: 'notes'},
];

function startServer() {
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

async function assertMetadata(page, context, expected) {
  const response = await page.goto(`${BASE_URL}${expected.path}`, {waitUntil: 'networkidle'});
  if (!response?.ok()) throw new Error(`${expected.path} returned HTTP ${response?.status() ?? 'no response'}`);

  const actualTitle = await page.title();
  if (actualTitle !== expected.title) {
    throw new Error(`${expected.path}: unexpected title "${actualTitle}"`);
  }

  const read = async (selector, attribute = 'content') => page.locator(selector).getAttribute(attribute);
  const description = await read('meta[name="description"]');
  const ogTitle = await read('meta[property="og:title"]');
  const ogDescription = await read('meta[property="og:description"]');
  const ogImage = await read('meta[property="og:image"]');
  const ogWidth = await read('meta[property="og:image:width"]');
  const ogHeight = await read('meta[property="og:image:height"]');
  const twitterCard = await read('meta[name="twitter:card"]');
  const canonical = await read('link[rel="canonical"]', 'href');

  if (!description || description.length < 30) throw new Error(`${expected.path}: missing/short description`);
  if (ogTitle !== expected.title) throw new Error(`${expected.path}: og:title mismatch`);
  if (ogDescription !== description) throw new Error(`${expected.path}: og:description mismatch`);
  if (!ogImage?.endsWith(`/assets/og/${expected.card}.png`)) throw new Error(`${expected.path}: wrong og:image ${ogImage}`);
  if (ogWidth !== '1200' || ogHeight !== '630') throw new Error(`${expected.path}: wrong OG dimensions metadata`);
  if (twitterCard !== 'summary_large_image') throw new Error(`${expected.path}: wrong twitter:card`);
  if (!canonical?.startsWith('http')) throw new Error(`${expected.path}: canonical must be absolute`);

  const imageResponse = await context.request.get(ogImage);
  if (!imageResponse.ok()) throw new Error(`${expected.path}: OG image HTTP ${imageResponse.status()}`);
  const body = Buffer.from(await imageResponse.body());
  if (!body.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error(`${expected.path}: OG image is not PNG`);

  return {path: expected.path, title: actualTitle, ogImage, canonical};
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) throw new Error('docs-html does not exist. Run npm run build:docs first.');
  const server = await startServer();
  let browser;

  try {
    browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox']});
    const context = await browser.newContext();
    const page = await context.newPage();
    const summary = [];
    for (const expected of pages) {
      console.log(`Metadata smoke: ${expected.path}`);
      summary.push(await assertMetadata(page, context, expected));
    }
    fs.mkdirSync(path.join(ROOT, 'quality-artifacts'), {recursive: true});
    fs.writeFileSync(
      path.join(ROOT, 'quality-artifacts', 'metadata-summary.json'),
      JSON.stringify(summary, null, 2),
    );
    await context.close();
    console.log(`Metadata smoke passed for ${summary.length} page(s).`);
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
