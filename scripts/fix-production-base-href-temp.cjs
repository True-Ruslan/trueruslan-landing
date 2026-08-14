const fs = require('node:fs');

function replaceOnce(file, before, after) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(before)) throw new Error(`${file}: expected source block not found`);
  const next = source.replace(before, after);
  if (next === source) throw new Error(`${file}: replacement made no change`);
  fs.writeFileSync(file, next, 'utf8');
}

replaceOnce(
  'scripts/production-work-with-me-smoke.cjs',
  `  const internalHref = await internalCta.getAttribute('href');\n  const expectedWorkPath = new URL(locale === 'ru' ? WORK_WITH_ME_URL : WORK_WITH_ME_EN_URL).pathname;\n  assert(\n    internalHref && new URL(internalHref, url).pathname === expectedWorkPath,\n    \`\${locale}: homepage collaboration CTA route drifted: \${internalHref}\`,\n  );`,
  `  const internalHref = await internalCta.getAttribute('href');\n  const resolvedInternalHref = await internalCta.evaluate((anchor) => anchor.href);\n  const expectedWorkPath = new URL(locale === 'ru' ? WORK_WITH_ME_URL : WORK_WITH_ME_EN_URL).pathname;\n  assert(\n    resolvedInternalHref && new URL(resolvedInternalHref).pathname === expectedWorkPath,\n    \`\${locale}: homepage collaboration CTA route drifted: \${internalHref}\`,\n  );`,
);

replaceOnce(
  'scripts/work-with-me-browser-smoke.cjs',
  `    workHref: 'work-with-me/',\n`,
  '',
);
replaceOnce(
  'scripts/work-with-me-browser-smoke.cjs',
  `    workHref: 'en/work-with-me/',\n`,
  '',
);
replaceOnce(
  'scripts/work-with-me-browser-smoke.cjs',
  `    const href = await cta.getAttribute('href');\n    if (!href || !new URL(href, page.url()).pathname.endsWith(copy.workHref)) throw new Error(\`\${locale}: homepage collaboration CTA route drifted: \${href}\`);`,
  `    const href = await cta.getAttribute('href');\n    const resolvedHref = await cta.evaluate((anchor) => anchor.href);\n    if (!resolvedHref || new URL(resolvedHref).pathname !== copy.route) throw new Error(\`\${locale}: homepage collaboration CTA route drifted: \${href}\`);`,
);

replaceOnce(
  'scripts/production-work-with-me-workflow.test.js',
  `const smoke = fs.readFileSync(path.join(ROOT, 'scripts', 'production-work-with-me-smoke.cjs'), 'utf8');`,
  `const smoke = fs.readFileSync(path.join(ROOT, 'scripts', 'production-work-with-me-smoke.cjs'), 'utf8');\nconst browserSmoke = fs.readFileSync(path.join(ROOT, 'scripts', 'work-with-me-browser-smoke.cjs'), 'utf8');`,
);
replaceOnce(
  'scripts/production-work-with-me-workflow.test.js',
  `    'WORK_WITH_ME_EN_URL',\n  ]) assert.ok(smoke.includes(literal), \`production C2 homepage verifier missing contract: \${literal}\`);`,
  `    'WORK_WITH_ME_EN_URL',\n    'resolvedInternalHref',\n    '.evaluate((anchor) => anchor.href)',\n  ]) assert.ok(smoke.includes(literal), \`production C2 homepage verifier missing contract: \${literal}\`);`,
);
replaceOnce(
  'scripts/production-work-with-me-workflow.test.js',
  `  assert.doesNotMatch(smoke, /tr-home-collaboration__action--primary/);\n});`,
  `  assert.doesNotMatch(smoke, /tr-home-collaboration__action--primary/);\n  assert.doesNotMatch(smoke, /new URL\\(internalHref,\\s*url\\)/);\n});\n\ntest('local Work with me browser smoke resolves homepage CTAs through the document base URL', () => {\n  assert.match(browserSmoke, /cta\\.evaluate\\(\\(anchor\\) => anchor\\.href\\)/);\n  assert.match(browserSmoke, /new URL\\(resolvedHref\\)\\.pathname !== copy\\.route/);\n  assert.doesNotMatch(browserSmoke, /new URL\\(href,\\s*page\\.url\\(\\)\\)/);\n  assert.doesNotMatch(browserSmoke, /workHref:/);\n});`,
);

console.log('Applied base-aware homepage CTA verification repair.');
