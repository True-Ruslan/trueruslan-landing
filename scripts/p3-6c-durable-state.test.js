import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const state = fs.readFileSync(path.join(ROOT, 'docs', 'PROJECT_STATE.md'), 'utf8');
const roadmap = fs.readFileSync(path.join(ROOT, 'docs', 'ROADMAP.md'), 'utf8');
const changelog = fs.readFileSync(path.join(ROOT, 'docs', 'CHANGELOG.md'), 'utf8');

for (const [name, text] of [['PROJECT_STATE', state], ['ROADMAP', roadmap]]) {
  test(`${name} records the real P3.6B Reports API connection`, () => {
    assert.match(text, /P3\.6B[\s\S]*Yandex Metrica Reports API/i);
    assert.match(text, /31201235872/);
    assert.match(text, /authenticated|реальн.*подключ|connection/i);
  });

  test(`${name} keeps P3.6C browser collection pending exact production acceptance`, () => {
    assert.match(text, /P3\.6C[\s\S]*browser|P3\.6C[\s\S]*браузер/i);
    assert.match(text, /PR #158/);
    assert.match(text, /pending.*production|ожидает.*production|production.*pending/i);
    assert.match(text, /explicit.*consent|явн.*соглас/i);
  });

  test(`${name} does not promote P3.6 measurement to accepted`, () => {
    assert.match(text, /P3\.6[\s\S]*(remains|оста[её]тся).*open|P3\.6[\s\S]*NOT ACCEPTED/i);
  });
}

test('CHANGELOG records the P3.6B connection and P3.6C implementation without false production acceptance', () => {
  assert.match(changelog, /2026-08-07/);
  assert.match(changelog, /P3\.6B[\s\S]*31201235872/i);
  assert.match(changelog, /P3\.6C[\s\S]*PR #158/i);
  assert.match(changelog, /explicit.*consent|явн.*соглас/i);
  assert.match(changelog, /pending.*production|ожидает.*production|production.*pending/i);
});
