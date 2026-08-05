const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool} = require('./quality-harness/tools.cjs');
const {
  VILLAIGENCE_URL,
  VLEZET_URL,
  VILLAIGENCE_EN_URL,
} = require('./production-live-routes.cjs');

const {chromium} = requireQualityTool('playwright', 'Flagship normalization production smoke');
const PROJECTS = JSON.parse(fs.readFileSync(path.resolve('data/projects.json'), 'utf8'));

const EXPECTED_DEPLOYED_SHA = process.env.EXPECTED_DEPLOYED_SHA || 'unknown';
const LEGACY_ORIGIN = 'true-ruslan.github.io/trueruslan-landing';
const ARTIFACTS_DIR = path.resolve('production-artifacts');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function expectedStatus(slug) {
  const project = PROJECTS.find((candidate) => candidate.slug === slug);
  assert(project, `Project Registry is missing ${slug}`);
  return project.statusLabel;
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

async function assertOrderedHeadings(documentContent, slug, expectedHeadings) {
  const headings = (await documentContent.locator('h2').allInnerTexts()).map((value) => value.trim());
  let previous = -1;
  for (const expected of expectedHeadings) {
    const index = headings.findIndex((heading, candidate) => candidate > previous && heading.includes(expected));
    assert(index !== -1, `${slug} misses ordered section ${expected}; found ${headings.join(' | ')}`);
    previous = index;
  }
  return headings;
}

async function verifyCaseStudy(page, {
  slug,
  locale,
  url,
  headingMarker,
  expectedHeadings,
  requiredText,
  relatedHrefFragments,
  alternateUrl,
  requireEvidence,
}) {
  const response = await page.goto(url, {waitUntil: 'networkidle', timeout: 45000});
  assert(response?.ok(), `${locale} ${slug} returned HTTP ${response?.status() ?? 'none'}`);

  const heading = (await page.locator('h1').first().innerText()).trim();
  assert(heading.includes(headingMarker), `unexpected ${locale} ${slug} heading: ${heading}`);

  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  assert(canonical && normalizeUrl(canonical) === normalizeUrl(url), `wrong ${locale} ${slug} canonical: ${canonical || 'missing'}`);

  let alternate = null;
  if (alternateUrl) {
    const alternateLocale = locale === 'ru' ? 'en' : 'ru';
    alternate = await page.locator(`link[rel="alternate"][hreflang="${alternateLocale}"]`).getAttribute('href');
    assert(
      alternate && normalizeUrl(alternate) === normalizeUrl(alternateUrl),
      `wrong ${locale} ${slug} alternate: ${alternate || 'missing'}`,
    );
  }

  const documentContent = page.locator('main.dc-doc-page__content');
  await documentContent.waitFor({state: 'visible', timeout: 10000});

  const status = page.locator(`[data-project-status="${slug}"]`).first();
  await status.waitFor({state: 'visible', timeout: 10000});
  const statusText = (await status.innerText()).trim();
  assert(statusText === expectedStatus(slug), `${locale} ${slug} status drifted: ${statusText}`);

  const headings = await assertOrderedHeadings(documentContent, `${locale} ${slug}`, expectedHeadings);
  const mainText = await documentContent.innerText();
  for (const marker of requiredText) {
    assert(mainText.includes(marker), `${locale} ${slug} misses ${marker}`);
  }

  const related = {};
  for (const fragment of relatedHrefFragments) {
    const link = documentContent.locator(`a[href*="${fragment}"]`).first();
    await link.waitFor({state: 'visible', timeout: 10000});
    const href = await link.getAttribute('href');
    assert(href, `${locale} ${slug} related link ${fragment} has no href`);
    related[fragment] = new URL(href, page.url()).href;
  }

  if (requireEvidence) {
    const evidence = page.locator(`[data-project-evidence="${slug}"]`);
    await evidence.waitFor({state: 'visible', timeout: 10000});
    const evidenceText = await evidence.innerText();
    for (const marker of requiredText.filter((value) => ['PR #110', 'M7.8C'].includes(value))) {
      assert(evidenceText.includes(marker), `${locale} ${slug} evidence misses ${marker}`);
    }

    const timeline = page.locator('.tr-project-timeline');
    await timeline.waitFor({state: 'visible', timeout: 10000});
    assert(
      await timeline.locator('.tr-project-timeline__item--current').count() === 1,
      `${locale} ${slug} timeline must expose exactly one current milestone`,
    );
    assert(
      await timeline.locator('.tr-project-timeline__item--next').count() >= 1,
      `${locale} ${slug} timeline must expose a next milestone`,
    );
  }

  const html = await page.content();
  assert(!html.includes(LEGACY_ORIGIN), `${locale} ${slug} leaks legacy Pages origin`);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, `flagship-normalization-${slug}-${locale}.png`),
    fullPage: true,
  });

  return {
    requested: url,
    finalUrl: page.url(),
    status: response.status(),
    heading,
    canonical,
    alternate,
    statusText,
    headings,
    related,
    legacyOriginAbsent: true,
  };
}

async function main() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  let browser;
  const summary = {
    expectedDeployedSha: EXPECTED_DEPLOYED_SHA,
    checkedAt: new Date().toISOString(),
    livingworldRu: {},
    vlezetRu: {},
    livingworldEn: {},
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

    summary.livingworldRu = await verifyCaseStudy(page, {
      slug: 'livingworld',
      locale: 'ru',
      url: VILLAIGENCE_URL,
      headingMarker: 'VillAIgence',
      expectedHeadings: [
        'Проблема',
        'Ограничения',
        'Текущая lifecycle',
        'Архитектура',
        'альтернативы',
        'Что подтверждено',
        'Известные ограничения',
        'Следующий принятый шаг',
        'Связанные материалы',
        'Что бы я сделал иначе',
      ],
      requiredText: ['0.1.23+1.21.1', 'PR #110', 'Draft', 'cumulative acceptance'],
      relatedHrefFragments: [
        'server-authoritative-ai-npcs',
        'source-tests-to-installed-acceptance',
        'restart-persistence-is-a-product-contract',
      ],
      alternateUrl: VILLAIGENCE_EN_URL,
      requireEvidence: true,
    });

    summary.vlezetRu = await verifyCaseStudy(page, {
      slug: 'vlezet',
      locale: 'ru',
      url: VLEZET_URL,
      headingMarker: 'Vlezet',
      expectedHeadings: [
        'Проблема',
        'Ограничения',
        'Текущая lifecycle',
        'Архитектура',
        'альтернативы',
        'Что подтверждено',
        'Известные ограничения',
        'Следующий принятый шаг',
        'Связанные материалы',
        'Что бы я сделал иначе',
      ],
      requiredText: ['M7.8B', 'M7.8C', 'product-owner retest', 'ACTIVE DEVELOPMENT'],
      relatedHrefFragments: [
        'probabilistic-proposals-deterministic-authority',
        'green-ci-is-not-product-verification',
      ],
      alternateUrl: null,
      requireEvidence: true,
    });

    summary.livingworldEn = await verifyCaseStudy(page, {
      slug: 'livingworld',
      locale: 'en',
      url: VILLAIGENCE_EN_URL,
      headingMarker: 'VillAIgence',
      expectedHeadings: [
        'Problem',
        'Constraints',
        'Current lifecycle',
        'Architecture',
        'Alternatives',
        'Evidence boundary',
        'Known limitations',
        'Next accepted milestone',
        'Related material',
        'What I would change',
      ],
      requiredText: ['0.1.23+1.21.1', 'PR #110', 'Draft', 'cumulative acceptance'],
      relatedHrefFragments: [
        'server-authoritative-ai-npcs',
        'llm-output-is-a-protocol-boundary',
        'landing/projects/livingworld',
      ],
      alternateUrl: VILLAIGENCE_URL,
      requireEvidence: false,
    });

    assert(summary.diagnostics.pageErrors.length === 0, `page errors: ${summary.diagnostics.pageErrors.join(' | ')}`);
    assert(
      summary.diagnostics.firstPartyRequestFailures.length === 0,
      `first-party request failures: ${JSON.stringify(summary.diagnostics.firstPartyRequestFailures)}`,
    );

    writeJson('flagship-normalization-production-summary.json', summary);
    console.log(`Flagship normalization production smoke passed for deployed SHA ${EXPECTED_DEPLOYED_SHA}.`);
  } catch (error) {
    summary.failure = error.stack || error.message;
    writeJson('flagship-normalization-production-summary.json', summary);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
