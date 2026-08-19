const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'docs', '_assets', 'script', 'ai-search.js'),
  'utf8',
);

test('FULL answer requests are cancelled and invalidated across UI state changes', () => {
  assert.match(source, /function invalidatePendingAnswer\(state\)/);
  assert.match(source, /state\.controller\?\.abort\?\.\(\)/);
  assert.match(source, /state\.generation \+= 1/);
  assert.match(source, /new root\.AbortController\(\)/);

  assert.match(
    source,
    /async function requestGroundedAnswer\(\{workerBaseUrl, question, chunkIds, signal, fetchImpl = root\.fetch\?\.bind\(root\)\}\)/,
  );
  assert.match(source, /body: JSON\.stringify\(\{question: normalizedQuestion, chunkIds\}\),\n\s+signal,/);

  const setEnabled = source.match(/function setEnabled\(next\) \{[\s\S]*?\n    \}/)?.[0] || '';
  assert.match(setEnabled, /if \(!enabled\) invalidatePendingAnswer\(answerRequestState\)/);

  const submitAi = source.match(/async function submitAi\(event\) \{[\s\S]*?\n    \}/)?.[0] || '';
  assert.match(submitAi, /invalidatePendingAnswer\(answerRequestState\)/);

  const createAnswerAction = source.match(/function createAnswerAction\([\s\S]*?\n  \}/)?.[0] || '';
  assert.match(createAnswerAction, /answerRequestState/);
  assert.match(createAnswerAction, /const request = beginAnswerRequest\(answerRequestState\)/);
  assert.match(createAnswerAction, /signal: request\.controller\?\.signal/);
  assert.match(createAnswerAction, /if \(!isCurrentAnswerRequest\(answerRequestState, request\.generation\)\) return;/);
  assert.match(createAnswerAction, /error\?\.name === 'AbortError'/);
  assert.match(createAnswerAction, /if \(isCurrentAnswerRequest\(answerRequestState, request\.generation\)\) \{/);
});
