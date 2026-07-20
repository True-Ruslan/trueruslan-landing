import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {encodeBaselineSample, decodeBaselineSample} = require('./visual-baseline.cjs');

test('compressed visual baseline codec round-trips exact RGB bytes', () => {
  const sample = Buffer.from(Array.from({length: 768}, (_, index) => index % 37));
  const encoded = encodeBaselineSample(sample);
  const decoded = decodeBaselineSample({rgbDeflateBase64: encoded}, sample.length);

  assert.deepEqual(decoded, sample);
  assert.ok(encoded.length < sample.toString('base64').length);
});

test('decodeBaselineSample rejects corrupted compressed content', () => {
  assert.throws(
    () => decodeBaselineSample({rgbDeflateBase64: 'not-valid-deflate'}, 768),
    /Invalid compressed visual baseline/,
  );
});

test('decodeBaselineSample rejects wrong sample length instead of producing NaN comparisons', () => {
  const encoded = encodeBaselineSample(Buffer.from([1, 2, 3]));
  assert.throws(
    () => decodeBaselineSample({rgbDeflateBase64: encoded}, 768),
    /sample length mismatch/,
  );
});

test('decodeBaselineSample supports legacy uncompressed baseline during migration', () => {
  const sample = Buffer.from([1, 2, 3, 4, 5, 6]);
  const decoded = decodeBaselineSample({rgbBase64: sample.toString('base64')}, sample.length);
  assert.deepEqual(decoded, sample);
});
