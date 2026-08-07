import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {applyProjectEvidence, renderProjectEvidence} from './project-evidence.js';

const snapshot = {
  project: 'vlezet',
  status: 'verified',
  lastVerified: '2026-08-05',
  versions: [
    {label: 'Accepted recognition slice', value: 'M7.8B'},
    {label: 'Next acceptance boundary', value: 'M7.8C product-owner retest'},
  ],
  signals: [{
    kind: 'pr',
    mode: 'automated',
    label: 'M7.8C Draft opening classification PR #42',
    state: 'pending',
    url: 'https://github.com/True-Ruslan/vlezet/pull/42',
    observedAt: '2026-08-05',
    scope: 'The product-owner retest remains mandatory. This signal does not promote M7.8C.',
  }],
};

function encodedStateHtml(content) {
  const state = JSON.stringify({data: {html: content}})
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  return `<!doctype html><html><head></head><body><div id="root"></div><script type="application/json" id="diplodoc-state">${state}</script></body></html>`;
}

function writeTarget(root, relativePath, html) {
  const target = path.join(root, ...relativePath.split('/'));
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(target, html, 'utf8');
  return target;
}

test('English project evidence localizes presentation copy without duplicating facts', () => {
  const html = renderProjectEvidence(snapshot, {locale: 'en'});

  for (const marker of [
    'lang="en"',
    '>VERIFIED<',
    'Automated evidence',
    'Verifiable project state',
    'Last verified:',
    'State:',
    'What it proves:',
    'Open evidence ↗',
    'M7.8B',
    'M7.8C product-owner retest',
    'PR #42',
  ]) {
    assert.ok(html.includes(marker), `missing English evidence marker: ${marker}`);
  }

  assert.doesNotMatch(html, /[А-Яа-яЁё]/);
  assert.equal((html.match(/M7\.8B/g) || []).length, 1);
  assert.equal((html.match(/M7\.8C product-owner retest/g) || []).length, 1);
});

test('applyProjectEvidence writes canonical RU and explicit localized EN targets from one snapshot', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-evidence-localized-'));
  const ruPath = writeTarget(
    outputDir,
    'landing/projects/vlezet.html',
    encodedStateHtml('<h1>Vlezet</h1><div data-tr-project-evidence="vlezet"></div>'),
  );
  const enPath = writeTarget(
    outputDir,
    'en/projects/vlezet.html',
    encodedStateHtml('<h1>Vlezet</h1><div data-tr-project-evidence="vlezet"></div>'),
  );

  const targets = applyProjectEvidence(outputDir, [snapshot], {
    requiredProjects: ['vlezet'],
    targetsByProject: {
      vlezet: [{path: 'en/projects/vlezet.html', locale: 'en'}],
    },
  });

  assert.deepEqual(targets, [
    'landing/projects/vlezet.html',
    'en/projects/vlezet.html',
  ]);

  const ru = fs.readFileSync(ruPath, 'utf8');
  const en = fs.readFileSync(enPath, 'utf8');

  assert.match(ru, /ПРОВЕРЕНО/);
  assert.match(ru, /data-tr-project-evidence-noscript="vlezet-ru"/);
  assert.match(en, /VERIFIED/);
  assert.match(en, /data-tr-project-evidence-noscript="vlezet-en"/);
  assert.doesNotMatch(en, /ПРОВЕРЕНО|Ручная|Автоматическое|Состояние|Что подтверждает/);
  assert.match(en, /M7\.8C Draft opening classification PR #42/);
});

test('localized project evidence targets fail closed on unsafe, unsupported and unrelated mappings', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-evidence-targets-'));
  writeTarget(
    outputDir,
    'landing/projects/vlezet.html',
    '<!doctype html><html><body><div data-tr-project-evidence="vlezet"></div></body></html>',
  );

  assert.throws(
    () => applyProjectEvidence(outputDir, [snapshot], {
      requiredProjects: ['vlezet'],
      targetsByProject: {vlezet: [{path: '../escape.html', locale: 'en'}]},
    }),
    /unsafe project evidence target/i,
  );
  assert.throws(
    () => applyProjectEvidence(outputDir, [snapshot], {
      requiredProjects: ['vlezet'],
      targetsByProject: {vlezet: [{path: 'en/projects/vlezet.html', locale: 'de'}]},
    }),
    /unsupported project evidence locale/i,
  );
  assert.throws(
    () => applyProjectEvidence(outputDir, [snapshot], {
      requiredProjects: ['vlezet'],
      targetsByProject: {livingworld: []},
    }),
    /non-required project/i,
  );
});
