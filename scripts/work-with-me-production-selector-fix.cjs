const fs = require('node:fs');

const smokePath = 'scripts/production-work-with-me-smoke.cjs';
const testPath = 'scripts/production-work-with-me-workflow.test.js';

let smoke = fs.readFileSync(smokePath, 'utf8');
const oldSelector = "const internalCta = page.locator('.tr-home-collaboration__action--primary').first();";
const newSelector = "const internalCta = page.locator('.tr-bridge-actions__link--primary[href=\"/work-with-me/\"]').first();";
if (!smoke.includes(oldSelector)) throw new Error('stale homepage production selector marker not found');
smoke = smoke.replace(oldSelector, newSelector);
fs.writeFileSync(smokePath, smoke);

let testSource = fs.readFileSync(testPath, 'utf8');
const literalAnchor = "    'positive-first homepage collaboration copy is missing',";
const literalInsertion = `${literalAnchor}\n    '.tr-bridge-actions__link--primary[href=\"/work-with-me/\"]',`;
if (!testSource.includes(literalAnchor)) throw new Error('production Work with me test literal anchor not found');
testSource = testSource.replace(literalAnchor, literalInsertion);
const staleAssertionAnchor = "  assert.doesNotMatch(smoke, /primaryPaths:\\s*3/);";
const staleAssertionInsertion = `${staleAssertionAnchor}\n  assert.doesNotMatch(smoke, /tr-home-collaboration__action--primary/);`;
if (!testSource.includes(staleAssertionAnchor)) throw new Error('production Work with me stale-selector assertion anchor not found');
testSource = testSource.replace(staleAssertionAnchor, staleAssertionInsertion);
fs.writeFileSync(testPath, testSource);
