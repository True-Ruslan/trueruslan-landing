const fs = require('node:fs');

const path = 'scripts/work-with-me-browser-smoke.cjs';
let source = fs.readFileSync(path, 'utf8');
const before = "    const cta = page.locator('.tr-home-collaboration__action--primary').first();";
const after = "    const cta = page.locator('.tr-home-collaboration__action.tr-home-bridge__action--primary').first();";
const occurrences = source.split(before).length - 1;
if (occurrences !== 1) throw new Error(`expected one stale collaboration selector, found ${occurrences}`);
source = source.replace(before, after);
fs.writeFileSync(path, source, 'utf8');
console.log('Aligned Work with me browser smoke with shared bridge primary action.');
