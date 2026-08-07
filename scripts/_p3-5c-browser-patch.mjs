import fs from 'node:fs';

function replaceOnce(file, from, to, label) {
  let text = fs.readFileSync(file, 'utf8');
  const first = text.indexOf(from);
  if (first < 0) throw new Error(`${file}: missing anchor ${label}`);
  if (text.indexOf(from, first + from.length) >= 0) throw new Error(`${file}: ambiguous anchor ${label}`);
  text = text.slice(0, first) + to + text.slice(first + from.length);
  fs.writeFileSync(file, text, 'utf8');
}

replaceOnce(
  'scripts/i18n-browser-smoke.cjs',
  "  {id: 'now', ru: '/landing/now/', en: '/en/now/'},\n  {id: 'livingworld'",
  "  {id: 'now', ru: '/landing/now/', en: '/en/now/'},\n  {id: 'publications', ru: '/landing/publications/', en: '/en/publications/'},\n  {id: 'livingworld'",
  'i18n Publications pair',
);

replaceOnce(
  'scripts/search-smoke.cjs',
  `async function assertSameOriginBackNavigation(page, baseUrl) {`,
  `async function assertEnglishPublicationsSearchCoverage(page) {
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  const query = 'multi-page site with Diplodoc';

  await input.fill(query);
  await button.click();
  await page.waitForFunction(() => {
    const body = document.body.innerText.toLocaleLowerCase('en');
    const hasPhrase = body.includes('multi-page site with diplodoc');
    const hasEnglishPublicationsRoute = [...document.querySelectorAll('a')]
      .some((link) => (link.getAttribute('href') || '').includes('en/publications/'));
    return hasPhrase && hasEnglishPublicationsRoute;
  }, null, {timeout: 7000});

  if (await page.locator('a[href*="en/publications/"]').count() < 1) {
    throw new Error(\`English Publications search query did not route to /en/publications/: \${query}\`);
  }
}

async function assertSameOriginBackNavigation(page, baseUrl) {`,
  'English Publications search helper',
);
replaceOnce(
  'scripts/search-smoke.cjs',
  `      await assertEnglishNowSearchCoverage(page);
      await assertSameOriginBackNavigation(page, baseUrl);`,
  `      await assertEnglishNowSearchCoverage(page);
      await assertEnglishPublicationsSearchCoverage(page);
      await assertSameOriginBackNavigation(page, baseUrl);`,
  'English Publications search invocation',
);
replaceOnce(
  'scripts/search-smoke.cjs',
  `      englishNowQueries: name === 'desktop' ? 1 : 0,
    };`,
  `      englishNowQueries: name === 'desktop' ? 1 : 0,
      englishPublicationsQueries: name === 'desktop' ? 1 : 0,
    };`,
  'English Publications search summary',
);

for (const [file, required] of [
  ['scripts/i18n-browser-smoke.cjs', "id: 'publications'"],
  ['scripts/search-smoke.cjs', 'assertEnglishPublicationsSearchCoverage'],
  ['scripts/search-smoke.cjs', 'en/publications/'],
]) {
  if (!fs.readFileSync(file, 'utf8').includes(required)) throw new Error(`${file}: missing P3.5C browser marker ${required}`);
}

fs.rmSync('scripts/_p3-5c-browser-patch.mjs');
fs.rmSync('.github/workflows/_p3-5c-browser-patch.yml');
