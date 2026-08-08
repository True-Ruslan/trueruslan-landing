import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'build.yml'), 'utf8');
const smoke = fs.readFileSync(path.join(ROOT, 'scripts', 'work-with-me-browser-smoke.cjs'), 'utf8');
const crossBrowser = fs.readFileSync(path.join(ROOT, 'scripts', 'cross-browser-smoke.cjs'), 'utf8');

function stepBody(name) {
  const marker = `- name: ${name}`;
  const start = workflow.indexOf(marker);
  assert.notEqual(start, -1, `missing workflow step: ${name}`);
  const next = workflow.indexOf('\n      - name:', start + marker.length);
  return workflow.slice(start, next === -1 ? workflow.length : next);
}

test('Build runs a dedicated Work with me browser/no-JS/search/a11y smoke and preserves its evidence', () => {
  const step = stepBody('Work with me browser smoke');
  assert.match(step, /node scripts\/work-with-me-browser-smoke\.cjs/);
  assert.match(workflow, /cp work-with-me-browser-smoke\.log quality-artifacts\/work-with-me-browser-smoke\.log/);
  assert.match(workflow, /cp artifacts\/work-with-me-summary\.json quality-artifacts\/work-with-me-summary\.json/);
  assert.match(workflow, /cp artifacts\/work-with-me-ru-desktop\.png quality-artifacts\/work-with-me-ru-desktop\.png/);
  assert.match(workflow, /cp artifacts\/work-with-me-en-desktop\.png quality-artifacts\/work-with-me-en-desktop\.png/);
});

test('dedicated Work with me smoke covers both locales, no-JS, search, Contacts and exact CTA boundaries', () => {
  for (const literal of [
    '/landing/work-with-me/',
    '/en/work-with-me/',
    'javaScriptEnabled: false',
    '/landing/contacts/',
    'ALLOWED_CONTEXTUAL',
    'FORBIDDEN_CONTEXTUAL',
    '/_search/ru/',
    'assertNoBlockingAxe',
    'assertNoHorizontalOverflow',
    'https://t.me/TrueRuslan',
    'mailto:ruslan.nemikin@gmail.com',
  ]) assert.ok(smoke.includes(literal), `Work with me browser smoke missing contract: ${literal}`);
});

test('Firefox and WebKit compatibility matrix includes Work with me', () => {
  assert.match(crossBrowser, /CORE_SCENARIOS\.workWithMe/);
  assert.match(crossBrowser, /workWithMe: true/);
  assert.match(crossBrowser, /data-tr-collaboration-rendered="availability"/);
});
