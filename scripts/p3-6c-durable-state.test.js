import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const state = fs.readFileSync(path.join(ROOT, 'docs', 'PROJECT_STATE.md'), 'utf8');
const roadmap = fs.readFileSync(path.join(ROOT, 'docs', 'ROADMAP.md'), 'utf8');
const changelog = fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8');
const runbook = fs.readFileSync(
  path.join(ROOT, 'docs', 'keystone', 'specs', '2026-08-07-p3-6c-consent-gated-metrica.md'),
  'utf8',
);

const ACCEPTED_SHA = '9bccf042fa6f9ce3ab289c7d023077c137ab238c';
const PAGES_RUN = '31227641778';
const PRODUCTION_LIVE_RUN = '31227681975';
const PRODUCTION_EVIDENCE_DIGEST =
  'sha256:1688d968db168f8342b9fca95b3550cbd7b4065aed0d6e6d282dc5e4fb22230a';

for (const [name, text] of [['PROJECT_STATE', state], ['ROADMAP', roadmap]]) {
  test(`${name} records the real P3.6B Reports API connection`, () => {
    assert.match(text, /P3\.6B[\s\S]*Yandex Metrica Reports API/i);
    assert.match(text, /31201235872/);
    assert.match(text, /authenticated|реальн.*подключ|connection/i);
  });

  test(`${name} records exact P3.6C production acceptance evidence`, () => {
    assert.match(text, /P3\.6C[\s\S]*browser|P3\.6C[\s\S]*браузер/i);
    assert.match(text, /PRODUCTION ACCEPTED/i);
    assert.match(text, new RegExp(ACCEPTED_SHA));
    assert.match(text, new RegExp(PAGES_RUN));
    assert.match(text, new RegExp(PRODUCTION_LIVE_RUN));
    assert.match(text, /explicit.*consent|явн.*соглас/i);
  });

  test(`${name} does not promote P3.6 measurement to accepted`, () => {
    assert.match(text, /P3\.6[\s\S]*(remains|оста[её]тся).*open|P3\.6[\s\S]*NOT ACCEPTED/i);
  });
}

test('P3.6C runbook is production-accepted with exact deployment evidence', () => {
  assert.match(runbook, /Status:\s*PRODUCTION ACCEPTED/i);
  assert.match(runbook, new RegExp(ACCEPTED_SHA));
  assert.match(runbook, new RegExp(PAGES_RUN));
  assert.match(runbook, new RegExp(PRODUCTION_LIVE_RUN));
  assert.match(runbook, /zero Yandex requests before consent/i);
  assert.match(runbook, /P3\.6[\s\S]*NOT ACCEPTED/i);
});

test('CHANGELOG records exact P3.6C production acceptance without closing P3.6 measurement', () => {
  assert.match(changelog, /2026-08-08/);
  assert.match(changelog, /P3\.6C[\s\S]*PRODUCTION ACCEPTED/i);
  assert.match(changelog, new RegExp(ACCEPTED_SHA));
  assert.match(changelog, new RegExp(PAGES_RUN));
  assert.match(changelog, new RegExp(PRODUCTION_LIVE_RUN));
  assert.match(changelog, new RegExp(PRODUCTION_EVIDENCE_DIGEST.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(changelog, /P3\.6[\s\S]*(remains|оста[её]тся).*open|P3\.6[\s\S]*NOT ACCEPTED/i);
});
