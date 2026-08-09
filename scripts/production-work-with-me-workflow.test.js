import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'production-live.yml'), 'utf8');
const smoke = fs.readFileSync(path.join(ROOT, 'scripts', 'production-work-with-me-smoke.cjs'), 'utf8');

function stepBody(name) {
  const marker = `- name: ${name}`;
  const start = workflow.indexOf(marker);
  assert.notEqual(start, -1, `missing workflow step: ${name}`);
  const next = workflow.indexOf('\n      - name:', start + marker.length);
  return workflow.slice(start, next === -1 ? workflow.length : next);
}

test('Production Live owns an exact-deployment-only Work with me acceptance gate', () => {
  const step = stepBody('Run deployed Work with me smoke');
  assert.match(step, /if: github\.event_name != 'pull_request'/);
  assert.match(step, /EXPECTED_DEPLOYED_SHA: \$\{\{ steps\.pages\.outputs\.deployed_sha \}\}/);
  assert.match(step, /node scripts\/production-work-with-me-smoke\.cjs/);

  assert.match(workflow, /scripts\/production-work-with-me-smoke\.cjs/);
  assert.match(workflow, /scripts\/production-work-with-me-workflow\.test\.js/);
});

test('production Work with me smoke remains SHA-bound and checks the bounded product contract', () => {
  for (const literal of [
    'EXPECTED_DEPLOYED_SHA',
    'WORK_WITH_ME_URL',
    'WORK_WITH_ME_EN_URL',
    'CONTACTS_URL',
    'CONTEXTUAL_ALLOWED',
    'CONTEXTUAL_FORBIDDEN',
    'javaScriptEnabled: false',
    'https://t.me/TrueRuslan',
    'mailto:ruslan.nemikin@gmail.com',
    'generated search does not expose English Work with me',
    'work-with-me-production-summary.json',
  ]) assert.ok(smoke.includes(literal), `production Work with me smoke missing contract: ${literal}`);
});
