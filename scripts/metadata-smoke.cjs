const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {writeJsonArtifact} = require('./quality-harness/evidence.cjs');

const PORT = Number(process.env.METADATA_SMOKE_PORT || 4175);
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const {chromium} = requireQualityTool('playwright');

const pages = [
  {path: '/', title: 'Руслан Немыкин — Backend Engineer', card: 'home'},
  {path: '/en/', title: 'Ruslan Nemykin — Java Backend Engineer', card: 'home-en'},
  {path: '/en/resume/', title: 'Experience — Ruslan Nemykin', card: 'resume-en'},
  {path: '/projects/', title: 'Проекты — Руслан Немыкин', card: 'projects'},
  {path: '/engineering-map/', title: 'Engineering Map — Руслан Немыкин', card: 'engineering-map'},
  {path: '/resume/', title: 'Резюме — Руслан Немыкин', card: 'resume'},
  {path: '/projects/livingworld/', title: 'VillAIgence — Server-Authoritative AI Society', card: 'livingworld'},
  {path: '/projects/notchhub/', title: 'NotchHub — Native macOS Productivity Hub', card: 'notchhub'},
  {path: '/en/projects/notchhub/', title: 'NotchHub — Native macOS Productivity Hub', card: 'notchhub-en'},
  {path: '/projects/node-zero/', title: 'NODE ZERO — Narrative Systems Case Study', card: 'node-zero'},
  {path: '/notes/', title: 'Engineering Notes — Руслан Немыкин', card: 'notes'},
];

function assertCleanCanonicalPath(canonical, expectedPath) {
  const pathname = new URL(canonical).pathname;
  if (pathname.includes('.html')) {
    throw new Error(`${expectedPath}: canonical still contains .html: ${canonical}`);
  }
  if (!pathname.endsWith('/')) {
    throw new Error(`${expectedPath}: canonical must end with a directory slash: ${canonical}`);
  }
  if (expectedPath !== '/' && !pathname.endsWith(expectedPath)) {
    throw new Error(`${expectedPath}: canonical path mismatch ${canonical}`);
  }
}

async function assertMetadata(page, context, baseUrl, expected) {
  const response = await page.goto(`${baseUrl}${expected.path}`, {waitUntil: 'networkidle'});
  if (!response?.ok()) throw new Error(`${expected.path} returned HTTP ${response?.status() ?? 'no response'}`);

  const actualTitle = await page.title();
  if (actualTitle !== expected.title) throw new Error(`${expected.path}: unexpected title "${actualTitle}"`);

  const read = async (selector, attribute = 'content') => page.locator(selector).getAttribute(attribute);
  const description = await read('meta[name="description"]');
  const ogTitle = await read('meta[property="og:title"]');
  const ogDescription = await read('meta[property="og:description"]');
  const ogImage = await read('meta[property="og:image"]');
  const ogLocalPath = await read('meta[property="og:image"]', 'data-tr-local-path');
  const ogWidth = await read('meta[property="og:image:width"]');
  const ogHeight = await read('meta[property="og:image:height"]');
  const twitterCard = await read('meta[name="twitter:card"]');
  const canonical = await read('link[rel="canonical"]', 'href');

  if (!description || description.length < 30) throw new Error(`${expected.path}: missing/short description`);
  if (ogTitle !== expected.title) throw new Error(`${expected.path}: og:title mismatch`);
  if (ogDescription !== description) throw new Error(`${expected.path}: og:description mismatch`);
  if (!ogImage?.endsWith(`/assets/og/${expected.card}.png`)) throw new Error(`${expected.path}: wrong og:image ${ogImage}`);
  if (ogLocalPath !== `/assets/og/${expected.card}.png`) throw new Error(`${expected.path}: wrong local OG target ${ogLocalPath}`);
  if (ogWidth !== '1200' || ogHeight !== '630') throw new Error(`${expected.path}: wrong OG dimensions metadata`);
  if (twitterCard !== 'summary_large_image') throw new Error(`${expected.path}: wrong twitter:card`);
  if (!canonical?.startsWith('http')) throw new Error(`${expected.path}: canonical must be absolute`);
  assertCleanCanonicalPath(canonical, expected.path);

  const imageResponse = await context.request.get(`${baseUrl}${ogLocalPath}`);
  if (!imageResponse.ok()) throw new Error(`${expected.path}: OG image HTTP ${imageResponse.status()}`);
  const body = Buffer.from(await imageResponse.body());
  if (!body.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error(`${expected.path}: OG image is not PNG`);

  return {path: expected.path, title: actualTitle, ogImage, canonical};
}

async function main() {
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;
  let runtime;

  try {
    browser = await launchChromium(chromium);
    runtime = await createScenarioPage(browser, {colorScheme: 'light'});
    const summary = [];
    for (const expected of pages) {
      console.log(`Metadata smoke: ${expected.path}`);
      summary.push(await assertMetadata(runtime.page, runtime.context, serverRuntime.baseUrl, expected));
    }
    writeJsonArtifact('metadata-summary.json', summary);
    console.log(`Metadata smoke passed for ${summary.length} page(s).`);
  } finally {
    if (runtime) await runtime.close();
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
