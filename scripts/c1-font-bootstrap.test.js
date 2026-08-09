import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const OUTPUT = path.join(process.cwd(), 'quality-artifacts', 'font-bootstrap');
const FONT_SOURCE = Object.freeze({
  cyrillic: 'https://cdn.jsdelivr.net/fontsource/fonts/onest:vf@5.3.0/cyrillic-wght-normal.woff2',
  latin: 'https://cdn.jsdelivr.net/fontsource/fonts/onest:vf@5.3.0/latin-wght-normal.woff2',
});

async function fetchWoff2(url) {
  const response = await fetch(url, {signal: AbortSignal.timeout(15_000)});
  assert.equal(response.status, 200, `font bootstrap failed: ${url} -> ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'wOF2', `${url} is not WOFF2`);
  assert.ok(bytes.length > 4_000 && bytes.length < 200_000, `${url} has implausible size ${bytes.length}`);
  return bytes;
}

test('temporary C1 bootstrap captures version-pinned Onest Cyrillic and Latin WOFF2 assets', async () => {
  fs.mkdirSync(OUTPUT, {recursive: true});
  for (const [subset, url] of Object.entries(FONT_SOURCE)) {
    const bytes = await fetchWoff2(url);
    fs.writeFileSync(path.join(OUTPUT, `Onest-${subset}-wght-normal.woff2`), bytes);
  }
});
