import fs from 'node:fs';

function replaceOnce(path, from, to, label) {
  const text = fs.readFileSync(path, 'utf8');
  const first = text.indexOf(from);
  if (first < 0) throw new Error(`missing anchor ${label} in ${path}`);
  if (text.indexOf(from, first + from.length) >= 0) throw new Error(`ambiguous anchor ${label} in ${path}`);
  fs.writeFileSync(path, text.slice(0, first) + to + text.slice(first + from.length), 'utf8');
}

replaceOnce(
  'scripts/copy-assets.js',
  '  const nowPageTarget = applyNowPage(outputDir, nowData, projects);',
  `  const nowPageTarget = applyNowPage(outputDir, nowData, projects);\n  const nowPageEnTarget = i18nPairs\n    ? applyNowPage(outputDir, nowData, projects, {\n      target: 'en/now.html',\n      locale: 'en',\n      hrefTransform: englishProjectHref,\n      ctaTransform: englishProjectCta,\n    })\n    : null;`,
  'copy-assets now injection',
);
replaceOnce(
  'scripts/copy-assets.js',
  '    nowPageTarget,\n    timelineTargets,',
  '    nowPageTarget,\n    nowPageEnTarget,\n    timelineTargets,',
  'copy-assets result',
);
replaceOnce(
  'scripts/copy-assets.js',
  '    console.log(`Now page injected: ${result.nowPageTarget}`);',
  '    console.log(`Now page injected: ${result.nowPageTarget}`);\n    if (result.nowPageEnTarget) console.log(`English Now page injected: ${result.nowPageEnTarget}`);',
  'copy-assets log',
);

const ruNowMeta = `  {\n    "path": "landing/now.html",\n    "card": "now",\n    "title": "Сейчас — Руслан Немыкин",\n    "description": "Текущий инженерный фокус Руслана Немыкина: активные проекты, темы изучения и технические заметки в работе.",\n    "displayTitle": "NOW",\n    "kicker": "CURRENT FOCUS",\n    "tags": ["BUILDING", "LEARNING", "WRITING"],\n    "accent": "cyan"\n  },`;
replaceOnce(
  'data/page-meta.json',
  ruNowMeta,
  `${ruNowMeta}\n  {\n    "path": "en/now.html",\n    "card": "now-en",\n    "title": "Now — Ruslan Nemykin",\n    "description": "Current engineering focus of Ruslan Nemykin: active projects, what I am learning and technical writing in progress.",\n    "displayTitle": "NOW",\n    "kicker": "CURRENT FOCUS",\n    "tags": ["BUILDING", "LEARNING", "WRITING"],\n    "accent": "cyan"\n  },`,
  'page metadata now',
);

replaceOnce(
  'docs/toc.yaml',
  '      - name: Resume\n        href: ./en/resume.md\n      - name: VillAIgence',
  '      - name: Resume\n        href: ./en/resume.md\n      - name: Now\n        href: ./en/now.md\n      - name: VillAIgence',
  'English toc now',
);

replaceOnce(
  'scripts/i18n-browser-smoke.cjs',
  "  {id: 'projects', ru: '/landing/projects/', en: '/en/projects/'},\n  {id: 'livingworld'",
  "  {id: 'projects', ru: '/landing/projects/', en: '/en/projects/'},\n  {id: 'now', ru: '/landing/now/', en: '/en/now/'},\n  {id: 'livingworld'",
  'i18n pair now',
);
const noJsHelper = `async function assertEnglishNowNoJs(page) {\n  const fallback = page.locator('[data-tr-now-noscript="en"] [data-tr-now][lang="en"]');\n  await fallback.waitFor({state: 'visible', timeout: 5000});\n  const text = (await fallback.innerText()).trim();\n  for (const marker of ['Current work', "What I'm learning", "What I'm writing", 'VillAIgence', 'M7.8B']) {\n    if (!text.includes(marker)) throw new Error(\`now: English no-JS fallback misses \${marker}\`);\n  }\n  if (/Сейчас в работе|Что изучаю|Что пишу/.test(text)) {\n    throw new Error('now: English no-JS fallback contains Russian presentation copy');\n  }\n  return {localizedNow: true, markerCount: 5};\n}\n\n`;
replaceOnce(
  'scripts/i18n-browser-smoke.cjs',
  'async function assertNoJsMetadata(browser, baseUrl) {',
  `${noJsHelper}async function assertNoJsMetadata(browser, baseUrl) {`,
  'i18n no-js helper',
);
replaceOnce(
  'scripts/i18n-browser-smoke.cjs',
  "        if (pair.id === 'vlezet' && locale === 'en') {\n          localizedEvidence = await assertEnglishVlezetNoJsEvidence(page);\n        }",
  "        if (pair.id === 'vlezet' && locale === 'en') {\n          localizedEvidence = await assertEnglishVlezetNoJsEvidence(page);\n        }\n        if (pair.id === 'now' && locale === 'en') {\n          localizedEvidence = await assertEnglishNowNoJs(page);\n        }",
  'i18n no-js now call',
);
replaceOnce(
  'scripts/i18n-browser-smoke.cjs',
  "    {name: 'vlezet-mobile', route: '/en/projects/vlezet/', viewport: VIEWPORTS.mobile},",
  "    {name: 'vlezet-mobile', route: '/en/projects/vlezet/', viewport: VIEWPORTS.mobile},\n    {name: 'now-mobile', route: '/en/now/', viewport: VIEWPORTS.mobile},",
  'i18n quality now',
);

const searchHelper = `async function assertEnglishNowSearchCoverage(page) {\n  const input = page.locator('.tr-search-input').first();\n  const button = page.locator('.tr-search-button').first();\n  const query = 'deliberately bounded snapshot of current engineering focus';\n\n  await input.fill(query);\n  await button.click();\n  await page.waitForFunction(() => {\n    const body = document.body.innerText.toLocaleLowerCase('en');\n    const hasPhrase = body.includes('deliberately bounded snapshot of current engineering focus');\n    const hasEnglishNowRoute = [...document.querySelectorAll('a')]\n      .some((link) => (link.getAttribute('href') || '').includes('en/now/'));\n    return hasPhrase && hasEnglishNowRoute;\n  }, null, {timeout: 7000});\n\n  if (await page.locator('a[href*="en/now/"]').count() < 1) {\n    throw new Error(\`English Now search query did not route to /en/now/: \${query}\`);\n  }\n}\n\n`;
replaceOnce(
  'scripts/search-smoke.cjs',
  'async function assertSameOriginBackNavigation(page, baseUrl) {',
  `${searchHelper}async function assertSameOriginBackNavigation(page, baseUrl) {`,
  'search now helper',
);
replaceOnce(
  'scripts/search-smoke.cjs',
  '      await assertEnglishVlezetSearchCoverage(page);\n      await assertSameOriginBackNavigation(page, baseUrl);',
  '      await assertEnglishVlezetSearchCoverage(page);\n      await assertEnglishNowSearchCoverage(page);\n      await assertSameOriginBackNavigation(page, baseUrl);',
  'search now call',
);
replaceOnce(
  'scripts/search-smoke.cjs',
  "      englishVlezetQueries: name === 'desktop' ? 1 : 0,",
  "      englishVlezetQueries: name === 'desktop' ? 1 : 0,\n      englishNowQueries: name === 'desktop' ? 1 : 0,",
  'search now summary',
);

for (const path of ['scripts/copy-assets.js', 'data/page-meta.json', 'docs/toc.yaml', 'scripts/i18n-browser-smoke.cjs', 'scripts/search-smoke.cjs']) {
  const text = fs.readFileSync(path, 'utf8');
  if (!text.includes('en/now')) throw new Error(`English Now wiring missing after patch: ${path}`);
}

fs.rmSync('scripts/_p3-5b-integration-patch.mjs');
fs.rmSync('.github/workflows/_p3-5b-integration-patch.yml');
