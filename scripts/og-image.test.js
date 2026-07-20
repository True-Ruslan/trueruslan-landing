import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import {OG_HEIGHT, OG_WIDTH, readPngDimensions, renderOgPng} from './og-image.js';

const card = {
  card: 'notes',
  displayTitle: 'ENGINEERING NOTES',
  kicker: 'TECHNICAL WRITING',
  tags: ['ARCHITECTURE', 'RELIABILITY', 'AI SYSTEMS'],
  accent: 'cyan',
};

test('renderOgPng creates a valid 1200x630 PNG', () => {
  const png = renderOgPng(card);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.deepEqual(readPngDimensions(png), {width: OG_WIDTH, height: OG_HEIGHT});
  assert.ok(png.length > 1_000);
});

test('renderOgPng is deterministic', () => {
  const first = renderOgPng(card);
  const second = renderOgPng(card);
  const digest = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
  assert.equal(digest(first), digest(second));
});

test('renderOgPng rejects unsupported accents', () => {
  assert.throws(() => renderOgPng({...card, accent: 'red'}), /Unsupported OpenGraph accent/);
});

test('readPngDimensions rejects invalid buffers', () => {
  assert.throws(() => readPngDimensions(Buffer.from('not-a-png')), /Invalid PNG buffer/);
});
