import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWarnings } from './editorial-ux-audit/warnings.js';

const metrics = (text) => ({ tier: 'tier1', h1: 'Experience', firstParagraphWords: 20, longestParagraphWords: 30, __proseText: text });

test('Oracle database is not repository process jargon', () => {
  const warnings = buildWarnings(metrics('Java PostgreSQL Oracle ClickHouse Kafka'));
  assert.equal(warnings.some(({ code }) => code === 'PROCESS_JARGON'), false);
});

test('test oracle and state oracle remain process jargon', () => {
  for (const phrase of ['test oracle', 'state oracle']) {
    const warnings = buildWarnings(metrics(phrase));
    assert.equal(warnings.some(({ code }) => code === 'PROCESS_JARGON'), true);
  }
});
