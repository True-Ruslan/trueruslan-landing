import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'visual-baselines.json'), 'utf8'));
const overrides = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'visual-baseline-overrides.json'), 'utf8'));
const harness = fs.readFileSync(path.join(ROOT, 'scripts', 'visual-regression.cjs'), 'utf8');

const INSPECTED_OVERRIDE_KEYS = [
  'home-desktop.png',
  'home-mobile.png',
  'projects-desktop.png',
  'projects-mobile.png',
  'resume-desktop.png',
  'resume-mobile.png',
  'engineering-map-desktop.png',
  'engineering-map-mobile.png',
].sort();

test('inspected visual overrides are bounded to explicitly reviewed baseline keys', () => {
  assert.deepEqual(Object.keys(overrides).sort(), INSPECTED_OVERRIDE_KEYS);
  for (const [name, value] of Object.entries(overrides)) {
    assert.ok(Object.hasOwn(base.baselines, name), `override may not introduce a new visual surface: ${name}`);
    assert.deepEqual(Object.keys(value).sort(), ['height', 'rgbDeflateBase64', 'width']);
    assert.equal(Number.isInteger(value.width) && value.width > 0, true);
    assert.equal(Number.isInteger(value.height) && value.height > 0, true);
    assert.match(value.rgbDeflateBase64, /^[A-Za-z0-9+/]+=*$/);
  }
});

test('C3/N3 Projects overrides record the reviewed scan-first layouts', () => {
  assert.deepEqual(
    {
      desktop: [overrides['projects-desktop.png'].width, overrides['projects-desktop.png'].height],
      mobile: [overrides['projects-mobile.png'].width, overrides['projects-mobile.png'].height],
    },
    {
      desktop: [1440, 1753],
      mobile: [390, 3099],
    },
  );
  assert.ok(overrides['projects-desktop.png'].height < base.baselines['projects-desktop.png'].height);
  assert.ok(overrides['projects-mobile.png'].height < base.baselines['projects-mobile.png'].height);
});

test('C4 Resume overrides preserve the reviewed scan-first layout after intentional IA footer drift', () => {
  assert.deepEqual(
    {
      desktop: [overrides['resume-desktop.png'].width, overrides['resume-desktop.png'].height],
      mobile: [overrides['resume-mobile.png'].width, overrides['resume-mobile.png'].height],
    },
    {
      desktop: [1440, 3631],
      mobile: [390, 4980],
    },
  );
  assert.ok(overrides['resume-desktop.png'].height < base.baselines['resume-desktop.png'].height);
  assert.ok(overrides['resume-mobile.png'].height < base.baselines['resume-mobile.png'].height);
});

test('C5 Engineering Map overrides record the reviewed map-first layouts', () => {
  assert.deepEqual(
    {
      desktop: [overrides['engineering-map-desktop.png'].width, overrides['engineering-map-desktop.png'].height],
      mobile: [overrides['engineering-map-mobile.png'].width, overrides['engineering-map-mobile.png'].height],
    },
    {
      desktop: [1440, 1465],
      mobile: [390, 2817],
    },
  );
  assert.ok(overrides['engineering-map-desktop.png'].height < base.baselines['engineering-map-desktop.png'].height);
  assert.ok(overrides['engineering-map-mobile.png'].height < base.baselines['engineering-map-mobile.png'].height);
});

test('visual harness merges only baseline entries and retains global thresholds from the canonical config', () => {
  assert.match(harness, /visual-baseline-overrides\.json/);
  assert.match(harness, /unknown visual baseline override/i);
  assert.match(harness, /config\.baselines = \{\.\.\.config\.baselines, \.\.\.overrides\}/);
  assert.equal(base.sampleSize, 16);
  assert.equal(base.maxMeanChannelDelta, 5);
  assert.equal(base.maxDimensionDeltaRatio, 0.03);
});
