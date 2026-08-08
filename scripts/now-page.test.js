import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {applyNowPage, loadNowData, renderNowContent, validateNowData} from './now-page.js';

const nowData = {
  updated: '2026-07-22',
  focus: 'Current engineering focus.',
  learning: ['AI systems'],
  writing: ['Engineering Notes'],
  en: {
    focus: 'Current engineering focus in English.',
    learning: ['AI systems in English'],
    writing: ['Engineering Notes in English'],
  },
};

const projects = [{
  slug: 'livingworld',
  name: 'VillAIgence',
  status: 'release-candidate',
  statusLabel: 'ACCEPTANCE IN PROGRESS',
  summary: 'Server-authoritative Minecraft AI society with bounded installed acceptance.',
  featured: true,
  active: true,
  visibility: 'public',
  href: 'landing/projects/livingworld.html',
  tags: ['Java 21', 'Memory 2.0'],
}];

test('validateNowData rejects invalid dates, empty lists and invalid localized slices', () => {
  assert.throws(() => validateNowData({...nowData, updated: '22-07-2026'}), /ISO date/);
  assert.throws(() => validateNowData({...nowData, learning: []}), /non-empty string array/);
  assert.throws(() => validateNowData({...nowData, en: {...nowData.en, writing: []}}), /now\.en\.writing/);
});

test('renderNowContent preserves the stable route under the public VillAIgence identity', () => {
  const html = renderNowContent(nowData, projects);
  assert.match(html, /VillAIgence/);
  assert.doesNotMatch(html, /LivingWorld/);
  assert.match(html, /href="landing\/projects\/livingworld\.html"/);
  assert.match(html, /AI systems/);
  assert.match(html, /Engineering Notes/);
  assert.match(html, /datetime="2026-07-22"/);
  assert.match(html, /Сейчас в работе/);
});

test('renderNowContent localizes presentation and project links without duplicating project data', () => {
  const html = renderNowContent(nowData, projects, {
    locale: 'en',
    hrefTransform: (href) => href.replace('landing/projects/', 'en/projects/'),
  });
  assert.match(html, /Current work/);
  assert.match(html, /What I&#39;m learning/);
  assert.match(html, /What I&#39;m writing/);
  assert.match(html, /Current engineering focus in English/);
  assert.match(html, /href="en\/projects\/livingworld\.html"/);
  assert.match(html, /aria-label="Technologies and areas"/);
  assert.match(html, /Open case study →/);
  assert.doesNotMatch(html, /Сейчас в работе|Что изучаю|Что пишу/);
});

test('repository now snapshot reflects current bounded external-project evidence', () => {
  const current = loadNowData();
  const editorialText = [current.focus, ...current.learning, ...current.writing].join('\n');
  const englishText = [current.en.focus, ...current.en.learning, ...current.en.writing].join('\n');

  assert.equal(current.updated, '2026-08-08');
  for (const text of [editorialText, englishText]) {
    assert.match(text, /Vlezet/);
    assert.match(text, /M7\.8B/);
    assert.match(text, /Assisted Tracing/i);
    assert.match(text, /#42/);
    assert.match(text, /closed unmerged|закрыт.*unmerged|R&D/i);
    assert.match(text, /VillAIgence/);
    assert.match(text, /0\.2\.0\+1\.21\.1/);
    assert.match(text, /7 PASS \/ 0 FAIL/);
    assert.match(text, /BELIEF/i);
    assert.match(text, /#125/);
    assert.match(text, /Draft\/RED|Draft|RED/i);
  }
  assert.match(editorialText, /measurement|aggregate/i);
  assert.match(englishText, /measurement|aggregate/i);
  assert.doesNotMatch(editorialText, /LivingWorld/);
  assert.doesNotMatch(englishText, /LivingWorld/);
});

test('renderNowContent escapes editorial copy', () => {
  const html = renderNowContent({...nowData, focus: '<script>alert(1)</script>'}, projects);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('applyNowPage writes localized targets and semantic no-JavaScript fallback without check-before-read', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-now-localized-'));
  const htmlPath = path.join(outputDir, 'en', 'now.html');
  fs.mkdirSync(path.dirname(htmlPath), {recursive: true});
  const state = JSON.stringify({data: {html: '<article><h1>Now</h1><div data-tr-now-placeholder></div></article>'}})
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  fs.writeFileSync(htmlPath, `<!doctype html><html><body><div id="root"></div><script id="diplodoc-state" type="application/json">${state}</script></body></html>`, 'utf8');

  assert.equal(applyNowPage(outputDir, nowData, projects, {
    target: 'en/now.html',
    locale: 'en',
    hrefTransform: (href) => href.replace('landing/projects/', 'en/projects/'),
  }), 'en/now.html');

  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /data-tr-now-noscript="en"/);
  assert.match(html, /Current work/);
  assert.match(html, /Current engineering focus in English/);
  assert.match(html, /href=&quot;en\/projects\/livingworld\.html&quot;|href="en\/projects\/livingworld\.html"/);
});

test('applyNowPage and loadNowData preserve explicit missing-file diagnostics via direct reads', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-now-missing-'));
  assert.throws(
    () => applyNowPage(outputDir, nowData, projects),
    /generated now page not found: landing\/now\.html/,
  );
  assert.throws(
    () => loadNowData(path.join(outputDir, 'missing-now.json')),
    /now data not found:/,
  );
});
