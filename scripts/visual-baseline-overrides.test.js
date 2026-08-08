import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'visual-baselines.json'), 'utf8'));
const overrides = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'visual-baseline-overrides.json'), 'utf8'));
const harness = fs.readFileSync(path.join(ROOT, 'scripts', 'visual-regression.cjs'), 'utf8');

test('inspected visual overrides are bounded to existing homepage baseline keys', () => {
  assert.deepEqual(Object.keys(overrides).sort(), ['home-desktop.png', 'home-mobile.png']);
  for (const [name, value] of Object.entries(overrides)) {
    assert.ok(Object.hasOwn(base.baselines, name), `override may not introduce a new visual surface: ${name}`);
    assert.deepEqual(Object.keys(value).sort(), ['height', 'rgbDeflateBase64', 'width']);
    assert.equal(Number.isInteger(value.width) && value.width > 0, true);
    assert.equal(Number.isInteger(value.height) && value.height > 0, true);
    assert.match(value.rgbDeflateBase64, /^[A-Za-z0-9+/]+=*$/);
  }
});

test('visual harness merges only baseline entries and retains global thresholds from the canonical config', () => {
  assert.match(harness, /visual-baseline-overrides\.json/);
  assert.match(harness, /unknown visual baseline override/i);
  assert.match(harness, /config\.baselines = \{\.\.\.config\.baselines, \.\.\.overrides\}/);
  assert.equal(base.sampleSize, 16);
  assert.equal(base.maxMeanChannelDelta, 5);
  assert.equal(base.maxDimensionDeltaRatio, 0.03);
});
