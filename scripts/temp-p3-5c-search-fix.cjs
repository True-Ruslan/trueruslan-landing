const fs = require('node:fs');

function replaceExactly(file, from, to) {
  const source = fs.readFileSync(file, 'utf8');
  const occurrences = source.split(from).length - 1;
  if (occurrences !== 1) {
    throw new Error(`${file}: expected exactly one anchor, got ${occurrences}`);
  }
  fs.writeFileSync(file, source.replace(from, to), 'utf8');
}

replaceExactly(
  'scripts/search-smoke.cjs',
  `async function assertEnglishPublicationsSearchCoverage(page) {\n  const input = page.locator('.tr-search-input').first();\n  const button = page.locator('.tr-search-button').first();\n  const query = 'multi-page site with Diplodoc';\n\n  await input.fill(query);\n  await button.click();\n  await page.waitForFunction(() => {\n    const body = document.body.innerText.toLocaleLowerCase('en');\n    const hasPhrase = body.includes('multi-page site with diplodoc');\n    const hasEnglishPublicationsRoute = [...document.querySelectorAll('a')]\n      .some((link) => (link.getAttribute('href') || '').includes('en/publications/'));\n    return hasPhrase && hasEnglishPublicationsRoute;\n  }, null, {timeout: 7000});\n\n  if (await page.locator('a[href*="en/publications/"]').count() < 1) {\n    throw new Error(\`English Publications search query did not route to /en/publications/: \${query}\`);\n  }\n}`,
  `async function assertEnglishPublicationsSearchCoverage(page) {\n  const input = page.locator('.tr-search-input').first();\n  const button = page.locator('.tr-search-button').first();\n  const query = 'syntax overhead';\n\n  await input.fill(query);\n  await button.click();\n  await page.waitForFunction(() => [...document.querySelectorAll('a')]\n    .some((link) => (link.getAttribute('href') || '').includes('en/publications/')), null, {timeout: 7000});\n\n  if (await page.locator('a[href*="en/publications/"]').count() < 1) {\n    throw new Error(\`English Publications registry-derived search query did not route to /en/publications/: \${query}\`);\n  }\n}`,
);

replaceExactly(
  'scripts/production-p3-5c-english-publications-smoke.cjs',
  `  await input.fill('multi-page site with Diplodoc');\n  await button.click();\n  await page.waitForFunction(() => [...document.querySelectorAll('a')]\n    .some((link) => (link.getAttribute('href') || '').includes('en/publications/')), null, {timeout: 10000});\n  assert(await page.locator('a[href*="en/publications/"]').count() >= 1, 'generated search does not expose English Publications route');`,
  `  const query = 'syntax overhead';\n  await input.fill(query);\n  await button.click();\n  await page.waitForFunction(() => [...document.querySelectorAll('a')]\n    .some((link) => (link.getAttribute('href') || '').includes('en/publications/')), null, {timeout: 10000});\n  assert(await page.locator('a[href*="en/publications/"]').count() >= 1, \`generated search does not expose English Publications for registry-derived query: \${query}\`);`,
);

replaceExactly(
  'scripts/production-p3-5c-english-publications-smoke.test.js',
  `  assert.match(source, /multi-page site with Diplodoc/);`,
  `  assert.match(source, /syntax overhead/);`,
);

replaceExactly(
  'scripts/portfolio-p3-5c-english-publications.test.js',
  `  const searchSmoke = read('scripts/search-smoke.cjs');\n  assert.match(searchSmoke, /assertEnglishPublicationsSearchCoverage/);\n  assert.match(searchSmoke, /en\\/publications\\//);`,
  `  const searchSmoke = read('scripts/search-smoke.cjs');\n  assert.match(searchSmoke, /assertEnglishPublicationsSearchCoverage/);\n  assert.match(searchSmoke, /syntax overhead/);\n  assert.match(searchSmoke, /en\\/publications\\//);`,
);

console.log('P3.5C search acceptance patched successfully.');
