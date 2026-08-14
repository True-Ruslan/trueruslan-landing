const fs = require('node:fs');

const smokePath = 'scripts/production-work-with-me-smoke.cjs';
const testPath = 'scripts/production-work-with-me-workflow.test.js';

let smoke = fs.readFileSync(smokePath, 'utf8');
const oldBlock = `  const internalCta = page.locator('.tr-bridge-actions__link--primary[href="/work-with-me/"]').first();\n  assert(await internalCta.count() === 1, \`${'${locale}'}: homepage collaboration primary CTA missing\`);\n  assert(!(await internalCta.getAttribute('target')), \`${'${locale}'}: internal homepage CTA must stay in current tab\`);`;
const newBlock = `  const internalCta = page.locator('.tr-home-collaboration__action.tr-home-bridge__action--primary').first();\n  assert(await internalCta.count() === 1, \`${'${locale}'}: homepage collaboration primary CTA missing\`);\n  const internalHref = await internalCta.getAttribute('href');\n  const expectedWorkPath = new URL(locale === 'ru' ? WORK_WITH_ME_URL : WORK_WITH_ME_EN_URL).pathname;\n  assert(\n    internalHref && new URL(internalHref, url).pathname === expectedWorkPath,\n    \`${'${locale}'}: homepage collaboration CTA route drifted: ${'${internalHref}'}\`,\n  );\n  assert(!(await internalCta.getAttribute('target')), \`${'${locale}'}: internal homepage CTA must stay in current tab\`);`;
if (!smoke.includes(oldBlock)) throw new Error('stale production homepage CTA block not found');
smoke = smoke.replace(oldBlock, newBlock);
fs.writeFileSync(smokePath, smoke);

let testSource = fs.readFileSync(testPath, 'utf8');
const oldLiteral = `    '.tr-bridge-actions__link--primary[href="/work-with-me/"]',`;
const newLiterals = `    '.tr-home-collaboration__action.tr-home-bridge__action--primary',\n    'homepage collaboration CTA route drifted',\n    'WORK_WITH_ME_EN_URL',`;
if (!testSource.includes(oldLiteral)) throw new Error('stale production CTA test literal not found');
testSource = testSource.replace(oldLiteral, newLiterals);
fs.writeFileSync(testPath, testSource);
