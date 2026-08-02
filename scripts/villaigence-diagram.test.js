import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIAGRAM_PATH = path.join(ROOT, 'docs', 'assets', 'diagrams', 'villaigence-authority-and-acceptance.svg');

test('VillAIgence authority diagram is semantic and production-safe', () => {
  assert.equal(fs.existsSync(DIAGRAM_PATH), true, 'VillAIgence authority diagram must exist');
  const svg = fs.readFileSync(DIAGRAM_PATH, 'utf8');

  assert.match(svg, /<title>VillAIgence authority and acceptance boundaries<\/title>/);
  assert.match(svg, /<desc>[^<]+<\/desc>/);
  assert.match(svg, /viewBox="0 0 1200 760"/);
  assert.doesNotMatch(svg, /<style\b/i);
  assert.doesNotMatch(svg, /class=/i);
  assert.match(svg, /fill="#[0-9A-Fa-f]{6}"/);
  assert.match(svg, /stroke="#[0-9A-Fa-f]{6}"/);

  for (const label of [
    'SERVER AUTHORITY',
    'MEMORY 2.0',
    'LLM PROPOSAL',
    'EXACT JAR',
    'INSTALLED ACCEPTANCE',
    'PENDING',
  ]) {
    assert.match(svg, new RegExp(label.replace('.', '\\.')));
  }

  assert.match(svg, /0\.1\.20 PARTIAL PASS/);
  assert.match(svg, /0\.1\.21 STARTUP FAIL/);
  assert.match(svg, /0\.1\.22 LIVE RETEST PENDING/);
});
