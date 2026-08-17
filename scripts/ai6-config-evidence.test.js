import assert from 'node:assert/strict';
import test from 'node:test';

import {buildAi6ConfigEvidence, canonicalJson} from './ai6-config-evidence.js';

const WORKER = 'https://ai6-search-canary.example.workers.dev';

function publicConfig() {
  return {
    schemaVersion: 1,
    mode: 'off',
    workerBaseUrl: '',
    embeddingModel: 'openai/text-embedding-3-small',
    embeddingDimensions: 512,
    answerModel: 'google/gemini-2.5-flash-lite',
    maxQueryChars: 500,
    maxResults: 5,
    includePagePaths: ['landing/projects.html', 'en/projects.html'],
    hybridWeights: null,
  };
}

test('canonical JSON is stable across object key order', () => {
  assert.equal(
    canonicalJson({b: 2, a: {d: 4, c: 3}, z: [2, {b: 1, a: 0}]}),
    canonicalJson({z: [2, {a: 0, b: 1}], a: {c: 3, d: 4}, b: 2}),
  );
});

test('AI-6 config evidence creates sanitized SEARCH candidate and exact OFF rollback', () => {
  const baseline = publicConfig();
  const baselineSnapshot = JSON.stringify(baseline);
  const evidence = buildAi6ConfigEvidence({publicConfig: baseline, workerBaseUrl: WORKER});

  assert.equal(JSON.stringify(baseline), baselineSnapshot, 'builder must not mutate public config');
  assert.equal(evidence.candidate.mode, 'search');
  assert.equal(evidence.candidate.sanitized, true);
  assert.match(evidence.candidate.workerBaseUrlDigest, /^sha256:[a-f0-9]{64}$/);
  assert.match(evidence.candidate.configDigest, /^sha256:[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(evidence.candidate).includes(WORKER), false, 'candidate artifact must not expose staging Worker URL');

  assert.equal(evidence.rollback.mode, 'off');
  assert.equal(evidence.rollback.workerBaseUrl, '');
  assert.deepEqual(evidence.rollback.config, baseline);
  assert.equal(evidence.rollback.configDigest, evidence.candidate.publicBaselineDigest);
  assert.equal(evidence.manifest.rollbackMatchesPublicBaseline, true);
  assert.equal(evidence.manifest.publicConfigUnchanged, true);
  assert.equal(evidence.manifest.candidateConfigDigest, evidence.candidate.configDigest);
  assert.equal(evidence.manifest.rollbackConfigDigest, evidence.rollback.configDigest);
  assert.equal(evidence.manifest.candidateWorkerBaseUrlDigest, evidence.candidate.workerBaseUrlDigest);
  assert.equal(JSON.stringify(evidence.manifest).includes(WORKER), false);
});

test('AI-6 config evidence is deterministic for the same baseline and Worker origin', () => {
  const first = buildAi6ConfigEvidence({publicConfig: publicConfig(), workerBaseUrl: `${WORKER}/`});
  const second = buildAi6ConfigEvidence({publicConfig: publicConfig(), workerBaseUrl: WORKER});
  assert.deepEqual(first, second);
});

test('AI-6 config evidence rejects non-OFF baselines and unsafe Worker URLs', () => {
  assert.throws(
    () => buildAi6ConfigEvidence({publicConfig: {...publicConfig(), mode: 'search'}, workerBaseUrl: WORKER}),
    /public OFF rollback baseline/,
  );
  assert.throws(
    () => buildAi6ConfigEvidence({publicConfig: publicConfig(), workerBaseUrl: 'http://example.com'}),
    /clean HTTPS origin/,
  );
  assert.throws(
    () => buildAi6ConfigEvidence({publicConfig: publicConfig(), workerBaseUrl: `${WORKER}/secret/path`}),
    /clean HTTPS origin/,
  );
});
