import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workflowPath = '.github/workflows/ai-index-durable-acceptance.yml';

test('durable AI-index acceptance is exact-artifact, provider-free and atomic toward the owner PR branch', () => {
  const source = fs.readFileSync(workflowPath, 'utf8');

  assert.match(source, /^name: AI Index Durable Acceptance$/m);
  assert.match(source, /^\s{2}workflow_run:\s*\n\s{4}workflows: \[Build\]\s*\n\s{4}types: \[completed\]$/m);
  assert.match(source, /CONFIRM_AI_INDEX_DURABLE_ACCEPTANCE/);
  assert.match(source, /github\.event\.workflow_run\.head_sha/);
  assert.match(source, /github\.event\.workflow_run\.pull_requests\[0\]\.number/);
  assert.match(source, /github\.repository_owner/);

  assert.match(source, /actions:\s*read/);
  assert.match(source, /contents:\s*write/);
  assert.match(source, /pull-requests:\s*read/);
  assert.doesNotMatch(source, /issues:\s*write|pull-requests:\s*write/);

  assert.match(source, /ai-index-content-maintenance-/);
  assert.match(source, /artifact.*digest|digest.*artifact/i);
  assert.match(source, /sha256sum/);
  assert.match(source, /providerAccess/);
  assert.match(source, /changedChunkCount/);
  assert.match(source, /sourceCommit/);
  assert.match(source, /embeddingsDigest/);

  assert.doesNotMatch(source, /OPENROUTER_API_KEY|secrets\.OPENROUTER|npm\s+(?:ci|install)|node\s+scripts\//);
  assert.doesNotMatch(source, /actions\/checkout|actions\/download-artifact|allow-unsafe-pr-checkout/);
  assert.doesNotMatch(source, /git\s+(?:checkout|merge|rebase|push)/);

  assert.match(source, /git\/blobs/);
  assert.match(source, /git\/trees/);
  assert.match(source, /git\/commits/);
  assert.match(source, /git\/refs\/heads/);
  assert.match(source, /force=false/);

  assert.match(source, /data\/ai-index-accepted\/ai5\/chunks\.json/);
  assert.match(source, /data\/ai-index-accepted\/ai5\/index-meta\.json/);
  assert.match(source, /data\/ai-index-accepted\/ai5\/embeddings\.bin/);
  assert.match(source, /scripts\/ai-index-restore\.js/);
});
