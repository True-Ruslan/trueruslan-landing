import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const providerWorkflowPath = '.github/workflows/ai-index-content-maintenance.yml';
const persistWorkflowPath = '.github/workflows/ai-index-maintenance-persist.yml';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

test('provider maintenance remains read-only while durable persistence is a separate downstream workflow', () => {
  const provider = read(providerWorkflowPath);
  const persist = read(persistWorkflowPath);

  assert.doesNotMatch(provider, /contents:\s*write/);
  assert.match(persist, /^name: AI Index Maintenance Persist$/m);
  assert.match(
    persist,
    /^\s{2}workflow_run:\s*\n\s{4}workflows: \[AI Index Content Maintenance\]\s*\n\s{4}types: \[completed\]$/m,
  );
  assert.match(persist, /^permissions: \{\}$/m);
  assert.doesNotMatch(persist, /environment:|OPENROUTER|secrets\./);
});

test('persistence gates write permission behind secret-free artifact and exact-PR authorization', () => {
  const source = read(persistWorkflowPath);
  const gateStart = source.indexOf('  gate:');
  const persistStart = source.indexOf('  persist:');
  assert.ok(gateStart >= 0 && persistStart > gateStart, 'secret-free gate must precede the write-capable persist job');

  const gate = source.slice(gateStart, persistStart);
  const persist = source.slice(persistStart);

  assert.match(gate, /permissions:[\s\S]*?actions: read[\s\S]*?contents: read[\s\S]*?pull-requests: read/);
  assert.doesNotMatch(gate, /contents:\s*write|pull-requests:\s*write|issues:\s*write/);
  assert.match(gate, /eligible=false/);
  assert.match(gate, /eligible=true/);
  assert.match(gate, /AI Index Content Maintenance/);
  assert.match(gate, /ai-index-content-maintenance-/);
  assert.match(gate, /workflow_run\.id/);
  assert.match(gate, /artifact_digest/);
  assert.match(gate, /pulls\/\$PR_NUMBER/);
  assert.match(gate, /CONFIRM_OPENROUTER_REAL_EMBEDDING_RUN/);
  assert.match(gate, /HEAD_REPO/);
  assert.match(gate, /HEAD_SHA/);

  assert.match(persist, /needs: gate/);
  assert.match(persist, /needs\.gate\.outputs\.eligible == 'true'/);
  assert.match(persist, /permissions:[\s\S]*?actions: read[\s\S]*?contents: write[\s\S]*?pull-requests: read/);
  assert.doesNotMatch(persist, /environment:|OPENROUTER|secrets\./);
});

test('artifact persistence is byte-verified, exact-head race-safe and writes exactly three accepted files', () => {
  const source = read(persistWorkflowPath);
  const persist = source.slice(source.indexOf('  persist:'));

  assert.match(persist, /actions\/artifacts\/\$ARTIFACT_ID/);
  assert.match(persist, /sha256sum/);
  assert.match(persist, /AI index persistence refuses unexpected artifact files/);
  assert.match(persist, /find .* -type l/);
  assert.match(persist, /real-provider-index-maintenance/);
  assert.match(persist, /providerAccess/);
  assert.match(persist, /sourceCommit/);
  assert.match(persist, /corpusDigest/);
  assert.match(persist, /embeddingsDigest/);

  assert.match(persist, /pulls\/\$PR_NUMBER/);
  assert.match(persist, /Persistence candidate no longer matches the current PR head/);
  assert.match(persist, /git\/ref\/heads\/\$HEAD_REF/);
  assert.match(persist, /Ref moved before accepted-index persistence/);

  for (const path of [
    'data/ai-index-accepted/ai5/chunks.json',
    'data/ai-index-accepted/ai5/index-meta.json',
    'data/ai-index-accepted/ai5/embeddings.bin',
  ]) {
    assert.match(persist, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(persist, /git\/blobs/);
  assert.match(persist, /git\/trees/);
  assert.match(persist, /git\/commits/);
  assert.match(persist, /git\/refs\/heads\/\$HEAD_REF/);
  assert.match(persist, /Persist verified AI index for \$CANDIDATE_SHA/);
  assert.doesNotMatch(persist, /git push|persist-credentials:\s*true|allow-unsafe-pr-checkout:\s*true/);
});

test('persistence never trusts or executes files from the maintenance artifact', () => {
  const source = read(persistWorkflowPath);
  assert.doesNotMatch(source, /node .*artifact|npm .*artifact|bash .*artifact|sh .*artifact|source .*artifact/);
  assert.doesNotMatch(source, /actions\/checkout|actions\/download-artifact|actions\/cache/);
  assert.match(source, /quality-artifacts\/ai-index-maintenance-provider\.json/);
  assert.match(source, /quality-artifacts\/ai-index-maintenance-verify\.json/);
});
