import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DURABLE_DIR = path.join(ROOT, 'data', 'ai-index-accepted', 'ai5');
const EXPECTED = Object.freeze({
  'chunks.json': '1249ed898193d1a05bda632b1328a860909887a1700092ba38e612ac7e6ac17a',
  'index-meta.json': 'ad301d88071b2a57fe68df07cd98cdd9596ecc1ccc832453fc692af4d92f718d',
  'embeddings.bin': 'aaf2c7ba86a53f0ff040e63c2c75decbf538a84d6c54c1da0e44f124b199510a',
});

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

test('accepted AI-5 index is repository-owned and byte-exact', () => {
  for (const [name, digest] of Object.entries(EXPECTED)) {
    const filePath = path.join(DURABLE_DIR, name);
    assert.equal(fs.statSync(filePath, {throwIfNoEntry: false})?.isFile(), true, `${name} must be stored durably in the repository`);
    assert.equal(sha256(filePath), digest, `${name} digest drifted`);
  }

  const meta = JSON.parse(fs.readFileSync(path.join(DURABLE_DIR, 'index-meta.json'), 'utf8'));
  assert.equal(meta.chunkCount, 327, 'accepted chunk count drifted');
  assert.equal(meta.embeddingDimensions, 512, 'accepted embedding dimensions drifted');
});

test('production index restore is provider-free and no longer depends on Actions artifact retention', () => {
  const source = fs.readFileSync(path.join(ROOT, 'scripts', 'ai-index-restore.js'), 'utf8');
  assert.doesNotMatch(source, /actions\/artifacts|ACCEPTED_AI5_ARTIFACT_ID|GITHUB_TOKEN|Authorization:\s*`Bearer/);
  assert.match(source, /ai-index-accepted/);
  assert.match(source, /verifyAiIndex/);
});
