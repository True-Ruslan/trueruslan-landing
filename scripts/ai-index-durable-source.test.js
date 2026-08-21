import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {ACCEPTED_AI5_FILE_DIGESTS, ACCEPTED_AI5_SOURCE} from './ai-index-restore.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DURABLE_DIR = path.join(ROOT, ...ACCEPTED_AI5_SOURCE.split('/'));

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

test('accepted AI-5 index is repository-owned and byte-exact', () => {
  assert.deepEqual(
    Object.keys(ACCEPTED_AI5_FILE_DIGESTS).sort(),
    ['chunks.json', 'embeddings.bin', 'index-meta.json'],
    'accepted durable-source allowlist drifted',
  );

  for (const [name, digest] of Object.entries(ACCEPTED_AI5_FILE_DIGESTS)) {
    const filePath = path.join(DURABLE_DIR, name);
    assert.equal(fs.statSync(filePath, {throwIfNoEntry: false})?.isFile(), true, `${name} must be stored durably in the repository`);
    assert.equal(sha256(filePath), digest, `${name} digest drifted`);
  }

  const meta = JSON.parse(fs.readFileSync(path.join(DURABLE_DIR, 'index-meta.json'), 'utf8'));
  assert.equal(meta.chunkIds.length, 327, 'accepted chunk count drifted');
  assert.equal(meta.dimensions, 512, 'accepted embedding dimensions drifted');
  assert.equal(meta.corpusDigest, `sha256:${ACCEPTED_AI5_FILE_DIGESTS['chunks.json']}`, 'accepted corpus digest drifted');
  assert.equal(meta.embeddingsDigest, `sha256:${ACCEPTED_AI5_FILE_DIGESTS['embeddings.bin']}`, 'accepted embeddings digest drifted');
});

test('production index restore is provider-free, retention-independent and race-free', () => {
  const source = fs.readFileSync(path.join(ROOT, 'scripts', 'ai-index-restore.js'), 'utf8');
  assert.doesNotMatch(source, /actions\/artifacts|ACCEPTED_AI5_ARTIFACT_ID|GITHUB_TOKEN|Authorization:\s*`Bearer/);
  assert.doesNotMatch(source, /statSync|copyFileSync/, 'restore must verify and publish the same in-memory bytes without check/use races');
  assert.match(source, /ai-index-accepted/);
  assert.match(source, /readFileSync/);
  assert.match(source, /writeFileSync/);
  assert.match(source, /verifyAiIndex/);
});
