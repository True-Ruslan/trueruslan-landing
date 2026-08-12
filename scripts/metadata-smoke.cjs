const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {writeJsonArtifact} = require('./quality-harness/evidence.cjs');

const PORT = Number(process.env.METADATA_SMOKE_PORT || 4175);
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ROOT = path.resolve(__dirname, '..');
const CANONICAL_SITE_URL = 'https://trueruslan.ru/';
const {chromium} = requireQualityTool('playwright');

const supplementalTargets = [
  {sourcePath: 'en/index.html', path: '/en/', title: 'Ruslan Nemykin — Backend Engineer', card: 'home-en'},
  {sourcePath: 'en/resume.html', path: '/en/resume/', title: 'Resume — Ruslan Nemykin', card: 'resume-en'},
  {sourcePath: 'landing/engineering-map.html', path: '/engineering-map/', title: 'Engineering Map — Руслан Немыкин', card: 'engineering-map'},
  {sourcePath: 'landing/projects/node-zero.html', path: '/projects/node-zero/', title: 'NODE ZERO — Narrative Systems Case Study', card: 'node-zero'},
  {sourcePath: 'en/projects/notchhub.html', path: '/en/projects/notchhub/', title: 'NotchHub — Native macOS Productivity Hub', card: 'notchhub-en'},
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function localeForSourcePath(sourcePath) {
  return sourcePath === 'en/index.html' || sourcePath.startsWith('en/') ? 'en_US' : 'ru_RU';
}

async function loadPages() {
  const {toPublicRoute} = await import('./clean-urls.js');
  const metadata = readJson('data/page-meta.json');
  const metadataByPath = new Map(metadata.map((entry) => [entry.path, entry]));
  const targets = readJson('data/distribution-targets.json');

  const fromSourcePath = (sourcePath, source = 'supplemental') => {
    const entry = metadataByPath.get(sourcePath);
    if (!entry) throw new Error(`Metadata smoke source is missing page metadata: ${sourcePath}`);
    const publicUrl = new URL(toPublicRoute(sourcePath, CANONICAL_SITE_URL), CANONICAL_SITE_URL);
    return {
      path: publicUrl.pathname,
      sourcePath,
      source,
      title: entry.title,
      description: entry.description,
      card: entry.card,
      imageAlt: `${entry.displayTitle} — ${entry.kicker}`,
      locale: localeForSourcePath(sourcePath),
    };
  };

  const launchPages = targets.map((target) => fromSourcePath(target.pagePath, `launch:${target.id}`));
  const supplementalPages = supplementalTargets.map((target) => {
    const page = fromSourcePath(target.sourcePath);
    if (page.path !== target.path || page.title !== target.title || page.card !== target.card) {
      throw new Error(`Supplemental metadata smoke target drifted from canonical metadata: ${target.sourcePath}`);
    }
    return page;
  });

  const byPath = new Map();
  for (const page of [...launchPages, ...supplementalPages]) {
    const previous = byPath.get(page.path);
    if (previous && previous.sourcePath !== page.sourcePath) {
      throw new Error(`Metadata smoke public route collision: ${page.path}`);
    }
    byPath.set(page.path, previous?.source?.startsWith('launch:') ? previous : page);
  }

  return [...byPath.values()];
}

function assertCleanCanonicalPath(canonical, expectedPath) {
  const pathname = new URL(canonical).pathname;
  if (pathname.includes('.html') || pathname.includes('/landing/')) {
    throw new Error(`${expectedPath}: canonical leaked a legacy source path: ${canonical}`);
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
  const canonical = await read('link[rel="canonical"]', 'href');
  const ogTitle = await read('meta[property="og:title"]');
  const ogDescription = await read('meta[property="og:description"]');
  const ogType = await read('meta[property="og:type"]');
  const ogUrl = await read('meta[property="og:url"]');
  const ogSiteName = await read('meta[property="og:site_name"]');
  const ogLocale = await read('meta[property="og:locale"]');
  const ogImage = await read('meta[property="og:image"]');
  const ogLocalPath = await read('meta[property="og:image"]', 'data-tr-local-path');
  const ogImageType = await read('meta[property="og:image:type"]');
  const ogWidth = await read('meta[property="og:image:width"]');
  const ogHeight = await read('meta[property="og:image:height"]');
  const ogImageAlt = await read('meta[property="og:image:alt"]');
  const twitterCard = await read('meta[name="twitter:card"]');
  const twitterTitle = await read('meta[name="twitter:title"]');
  const twitterDescription = await read('meta[name="twitter:description"]');
  const twitterImage = await read('meta[name="twitter:image"]');
  const twitterImageAlt = await read('meta[name="twitter:image:alt"]');

  if (description !== expected.description || description.length < 30) {
    throw new Error(`${expected.path}: missing, short or non-canonical description`);
  }
  if (!canonical?.startsWith('http')) throw new Error(`${expected.path}: canonical must be absolute`);
  assertCleanCanonicalPath(canonical, expected.path);
  if (ogTitle !== expected.title) throw new Error(`${expected.path}: og:title mismatch`);
  if (ogDescription !== description) throw new Error(`${expected.path}: og:description mismatch`);
  if (ogType !== 'website') throw new Error(`${expected.path}: wrong og:type ${ogType}`);
  if (ogUrl !== canonical) throw new Error(`${expected.path}: og:url must equal canonical`);
  if (ogSiteName !== 'TrueRuslan') throw new Error(`${expected.path}: wrong og:site_name ${ogSiteName}`);
  if (ogLocale !== expected.locale) throw new Error(`${expected.path}: wrong og:locale ${ogLocale}`);
  if (!ogImage?.endsWith(`/assets/og/${expected.card}.png`)) throw new Error(`${expected.path}: wrong og:image ${ogImage}`);
  if (ogLocalPath !== `/assets/og/${expected.card}.png`) throw new Error(`${expected.path}: wrong local OG target ${ogLocalPath}`);
  if (ogImageType !== 'image/png') throw new Error(`${expected.path}: wrong og:image:type ${ogImageType}`);
  if (ogWidth !== '1200' || ogHeight !== '630') throw new Error(`${expected.path}: wrong OG dimensions metadata`);
  if (ogImageAlt !== expected.imageAlt) throw new Error(`${expected.path}: wrong og:image:alt`);
  if (twitterCard !== 'summary_large_image') throw new Error(`${expected.path}: wrong twitter:card`);
  if (twitterTitle !== expected.title) throw new Error(`${expected.path}: twitter:title mismatch`);
  if (twitterDescription !== description) throw new Error(`${expected.path}: twitter:description mismatch`);
  if (twitterImage !== ogImage) throw new Error(`${expected.path}: twitter:image must match og:image`);
  if (twitterImageAlt !== expected.imageAlt) throw new Error(`${expected.path}: twitter:image:alt mismatch`);

  const imageResponse = await context.request.get(`${baseUrl}${ogLocalPath}`);
  if (!imageResponse.ok()) throw new Error(`${expected.path}: OG image HTTP ${imageResponse.status()}`);
  const body = Buffer.from(await imageResponse.body());
  if (!body.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error(`${expected.path}: OG image is not PNG`);

  return {
    path: expected.path,
    source: expected.source,
    title: actualTitle,
    ogImage,
    canonical,
    locale: ogLocale,
  };
}

async function main() {
  const pages = await loadPages();
  const launchCount = pages.filter((page) => page.source.startsWith('launch:')).length;
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;
  let runtime;

  try {
    browser = await launchChromium(chromium);
    runtime = await createScenarioPage(browser, {colorScheme: 'light'});
    const summary = [];
    for (const expected of pages) {
      console.log(`Metadata smoke: ${expected.path} (${expected.source})`);
      summary.push(await assertMetadata(runtime.page, runtime.context, serverRuntime.baseUrl, expected));
    }
    writeJsonArtifact('metadata-summary.json', {
      launchCount,
      supplementalCount: pages.length - launchCount,
      pages: summary,
    });
    console.log(`Metadata smoke passed for ${summary.length} page(s): ${launchCount} launch + ${summary.length - launchCount} supplemental.`);
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
