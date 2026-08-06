const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {
  APEX,
  SEARCH_URL,
  PASSIVE_PDF_COMPLETENESS_NOTE_URL,
  RESUME_URL,
  RESUME_PDF_URL,
} = require('./production-live-routes.cjs');

const {chromium} = requireQualityTool('playwright', 'P3.4E passive PDF completeness Note smoke');

const EXPECTED_DEPLOYED_SHA = process.env.EXPECTED_DEPLOYED_SHA || 'unknown';
const FEED_URL = new URL('feed.xml', APEX).href;
const DOCUMENT_CONTENT_SELECTOR = 'main.dc-doc-page__content';
const ARTIFACTS_DIR = path.resolve('production-artifacts');
const NOTE_TITLE = 'Почему валидный PDF ещё не доказывает полноту и актуальность резюме';
const SEARCH_QUERY = 'валидный PDF полнота актуальность резюме';
const LEGACY_ORIGIN = 'true-ruslan.github.io/trueruslan-landing';
const REPOSITORY_PDF_PATH = 'docs/assets/documents/cv.pdf';
const REPOSITORY_PDF_BLOB_SHA = 'a6d9871aed7f52992032fb04e5d6f12eeae72808';
const REPOSITORY_PDF_SIZE = 277792;
const REQUIRED_RESUME_MARKERS = [
  'Java Backend Engineer',
  'Руслан Немыкин',
  'QWEP',
  'Java 21–25',
  'Spring Boot 3.5–4',
];

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

function writeText(name, value) {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  fs.writeFileSync(path.join(ARTIFACTS_DIR, name), value, 'utf8');
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  let browser;
  const summary = {
    expectedDeployedSha: EXPECTED_DEPLOYED_SHA,
    checkedAt: new Date().toISOString(),
    repositoryPdf: {
      path: REPOSITORY_PDF_PATH,
      blobSha: REPOSITORY_PDF_BLOB_SHA,
      recordedSize: REPOSITORY_PDF_SIZE,
    },
    note: {},
    resume: {},
    pdf: {},
    feed: {},
    generatedSearch: {},
    diagnostics: {
      pageErrors: [],
      firstPartyRequestFailures: [],
    },
  };

  try {
    browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
    const context = await browser.newContext({
      viewport: {width: 1440, height: 1000},
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    page.on('pageerror', (error) => summary.diagnostics.pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText || 'unknown';
      if (failure.includes('ERR_ABORTED')) return;
      const hostname = new URL(request.url()).hostname;
      if (hostname === 'trueruslan.ru' || hostname === 'www.trueruslan.ru') {
        summary.diagnostics.firstPartyRequestFailures.push({url: request.url(), failure});
      }
    });

    const noteResponse = await page.goto(PASSIVE_PDF_COMPLETENESS_NOTE_URL, {
      waitUntil: 'networkidle',
      timeout: 45000,
    });
    assert(noteResponse?.ok(), `P3.4E Note returned HTTP ${noteResponse?.status() ?? 'none'}`);

    const heading = (await page.locator('h1').first().innerText()).trim();
    assert(heading.includes(NOTE_TITLE), `unexpected P3.4E Note heading: ${heading}`);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    assert(
      canonical && normalizeUrl(canonical) === normalizeUrl(PASSIVE_PDF_COMPLETENESS_NOTE_URL),
      `wrong P3.4E canonical: ${canonical || 'missing'}`,
    );
    assert(
      ogUrl && normalizeUrl(ogUrl) === normalizeUrl(PASSIVE_PDF_COMPLETENESS_NOTE_URL),
      `wrong P3.4E OpenGraph URL: ${ogUrl || 'missing'}`,
    );

    const documentContent = page.locator(DOCUMENT_CONTENT_SELECTOR).first();
    await documentContent.waitFor({state: 'visible', timeout: 10000});
    const noteText = await documentContent.innerText();
    for (const marker of [
      'File existence',
      'stable route',
      '%PDF-',
      'parseability',
      'MIME',
      'Content-Disposition',
      'downloadable bytes',
      'passive',
      'no-JavaScript',
      'page count',
      'text extraction',
      'required sections',
      'web-CV',
      'semantic equivalence',
      'current professional-profile truth',
      'accessibility',
      'human-readable layout',
      'exact deployed PDF',
    ]) {
      assert(noteText.includes(marker), `deployed P3.4E Note misses ${marker}`);
    }
    assert(!noteText.includes('parseable PDF guarantees completeness'), 'P3.4E Note overclaims parseability');
    const noteHtml = await page.content();
    assert(!noteHtml.includes(LEGACY_ORIGIN), 'P3.4E Note leaks the legacy Pages origin');
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'passive-pdf-semantic-completeness-note.png'),
      fullPage: true,
    });
    writeText('passive-pdf-semantic-completeness-note.html', noteHtml);
    summary.note = {
      requested: PASSIVE_PDF_COMPLETENESS_NOTE_URL,
      finalUrl: page.url(),
      status: noteResponse.status(),
      heading,
      canonical,
      ogUrl,
      documentSelector: DOCUMENT_CONTENT_SELECTOR,
      legacyOriginAbsent: true,
    };

    const resumeResponse = await page.goto(RESUME_URL, {waitUntil: 'networkidle', timeout: 45000});
    assert(resumeResponse?.ok(), `resume returned HTTP ${resumeResponse?.status() ?? 'none'}`);
    const resumeHero = page.locator('.tr-resume-hero').first();
    await resumeHero.waitFor({state: 'visible', timeout: 10000});
    const resumeDocument = page.locator(DOCUMENT_CONTENT_SELECTOR).first();
    await resumeDocument.waitFor({state: 'visible', timeout: 10000});
    const resumeHeroText = (await resumeHero.textContent()) || '';
    const resumeDocumentText = (await resumeDocument.textContent()) || '';
    const resumeText = `${resumeHeroText}\n${resumeDocumentText}`;
    for (const marker of REQUIRED_RESUME_MARKERS) {
      assert(resumeText.includes(marker), `deployed web-CV misses ${marker}`);
    }
    const resumeHtml = await page.content();
    assert(resumeHtml.includes('data-tr-resume-pdf'), 'deployed web-CV misses passive PDF iframe marker');

    const rawResumeResponse = await context.request.get(RESUME_URL, {timeout: 30000});
    assert(rawResumeResponse.ok(), `raw resume returned HTTP ${rawResumeResponse.status()}`);
    const rawResumeHtml = await rawResumeResponse.text();
    assert(rawResumeHtml.includes('<noscript>'), 'raw deployed web-CV misses noscript PDF fallback');
    assert(rawResumeHtml.includes('assets/documents/cv.pdf'), 'raw deployed web-CV misses PDF asset route');

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'passive-pdf-resume.png'),
      fullPage: true,
    });
    writeText('passive-pdf-resume.html', resumeHtml);
    writeText('passive-pdf-resume-raw.html', rawResumeHtml);
    summary.resume = {
      requested: RESUME_URL,
      finalUrl: page.url(),
      status: resumeResponse.status(),
      rawStatus: rawResumeResponse.status(),
      semanticScopes: ['.tr-resume-hero', DOCUMENT_CONTENT_SELECTOR],
      heroVisible: true,
      requiredMarkers: REQUIRED_RESUME_MARKERS,
      passiveIframePresent: true,
      noscriptFallbackPresent: true,
      rawPdfRoutePresent: true,
    };

    const pdfResponse = await context.request.get(RESUME_PDF_URL, {timeout: 30000});
    assert(pdfResponse.ok(), `exact deployed PDF returned HTTP ${pdfResponse.status()}`);
    const pdfHeaders = pdfResponse.headers();
    const contentType = pdfHeaders['content-type'] || '';
    const contentDisposition = pdfHeaders['content-disposition'] || '';
    assert(contentType.toLowerCase().includes('application/pdf'), `wrong PDF MIME: ${contentType || 'missing'}`);
    const pdfBytes = Buffer.from(await pdfResponse.body());
    const signature = pdfBytes.subarray(0, 5).toString('ascii');
    assert(signature === '%PDF-', `wrong PDF signature: ${JSON.stringify(signature)}`);
    assert(pdfBytes.length > 100000, `deployed PDF is unexpectedly small: ${pdfBytes.length}`);
    const sha256 = crypto.createHash('sha256').update(pdfBytes).digest('hex');
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'cv-production.pdf'), pdfBytes);
    summary.pdf = {
      requested: RESUME_PDF_URL,
      status: pdfResponse.status(),
      contentType,
      contentDisposition,
      signature,
      size: pdfBytes.length,
      sha256,
      applicationPdf: true,
    };

    const feedResponse = await context.request.get(FEED_URL, {timeout: 30000});
    assert(feedResponse.ok(), `Atom feed returned HTTP ${feedResponse.status()}`);
    const feedText = await feedResponse.text();
    assert(feedText.includes(NOTE_TITLE), 'Atom feed misses the P3.4E Note title');
    assert(feedText.includes(PASSIVE_PDF_COMPLETENESS_NOTE_URL), 'Atom feed misses the P3.4E canonical URL');
    writeText('passive-pdf-semantic-completeness-feed.xml', feedText);
    summary.feed = {
      url: FEED_URL,
      status: feedResponse.status(),
      containsNoteTitle: true,
      containsCanonicalUrl: true,
    };

    const searchResponse = await page.goto(SEARCH_URL, {waitUntil: 'networkidle', timeout: 45000});
    assert(searchResponse?.ok(), `generated search returned HTTP ${searchResponse?.status() ?? 'none'}`);
    const input = page.locator('.tr-search-input').first();
    const button = page.locator('.tr-search-button').first();
    await input.waitFor({state: 'visible', timeout: 10000});
    await button.waitFor({state: 'visible', timeout: 10000});
    await input.fill(SEARCH_QUERY);
    await button.click();
    const result = page.locator('a[href*="landing/notes/passive-pdf-validation-vs-semantic-completeness"]').first();
    await result.waitFor({state: 'visible', timeout: 15000});
    const resultText = (await result.innerText()).trim();
    const resultHref = await result.getAttribute('href');
    const cleanUrl = new URL(PASSIVE_PDF_COMPLETENESS_NOTE_URL);
    assert(resultText.toLowerCase().includes('pdf'), `unexpected P3.4E search result: ${resultText}`);
    assert(
      resultHref && new URL(resultHref, page.url()).pathname === cleanUrl.pathname,
      `generated search returned wrong P3.4E route: ${resultHref || 'missing'}`,
    );
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'passive-pdf-semantic-completeness-search.png'),
      fullPage: true,
    });
    summary.generatedSearch = {
      url: page.url(),
      status: searchResponse.status(),
      query: SEARCH_QUERY,
      resultText,
      resultHref: new URL(resultHref, page.url()).href,
    };

    assert(summary.diagnostics.pageErrors.length === 0, `page errors: ${summary.diagnostics.pageErrors.join(' | ')}`);
    assert(
      summary.diagnostics.firstPartyRequestFailures.length === 0,
      `first-party request failures: ${JSON.stringify(summary.diagnostics.firstPartyRequestFailures)}`,
    );

    writeJson('passive-pdf-semantic-completeness-note-production-summary.json', summary);
    console.log(`P3.4E passive PDF completeness Note smoke passed for deployed SHA ${EXPECTED_DEPLOYED_SHA}.`);
  } catch (error) {
    summary.failure = error.stack || error.message;
    writeJson('passive-pdf-semantic-completeness-note-production-summary.json', summary);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
