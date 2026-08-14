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
    'mailto:nemykin@true-ruslan.ru',
    'internal homepage CTA must stay in current tab',
    'approved contextual CTA must stay in current tab',
    'generated internal search result opened a new tab',
    'generated internal search result did not navigate current tab',
    'navigatedInCurrentTab: true',
    'generated search does not expose English Work with me',
    'work-with-me-production-summary.json',
  ]) assert.ok(smoke.includes(literal), `production Work with me smoke missing contract: ${literal}`);

  assert.doesNotMatch(smoke, /mailto:(?:contact@trueruslan\.ru|ruslan\.nemikin@gmail\.com)/i);
});

test('production homepage verifier follows the C2 fast-scan hierarchy instead of removed C1 path cards', () => {
  for (const literal of [
    "[data-home-proof]",
    "[data-home-flagship]",
    "[data-home-bridge=\"experience\"]",
    "[data-home-bridge=\"writing\"]",
    "[data-home-collaboration=\"true\"]",
    "[data-home-bridge=\"personal\"]",
    'C2 homepage must expose exactly four proof facts',
    'C2 homepage must preserve exactly three selected projects',
    'C2 homepage order drifted after selected work',
    'positive-first homepage collaboration copy is missing',
    '.tr-home-collaboration__action.tr-home-bridge__action--primary',
    'homepage collaboration CTA route drifted',
    'WORK_WITH_ME_EN_URL',
  ]) assert.ok(smoke.includes(literal), `production C2 homepage verifier missing contract: ${literal}`);

  assert.doesNotMatch(smoke, /\[data-home-path\]/);
  assert.doesNotMatch(smoke, /#now-title/);
  assert.doesNotMatch(smoke, /homepage primary path count drifted/);
  assert.doesNotMatch(smoke, /primaryPaths:\s*3/);
  assert.doesNotMatch(smoke, /tr-home-collaboration__action--primary/);
});
