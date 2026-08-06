import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODULE = path.join(ROOT, 'scripts', 'resume-noscript-fallback.js');
const PACKAGE = path.join(ROOT, 'package.json');
const PRODUCTION_SMOKE = path.join(ROOT, 'scripts', 'production-passive-pdf-semantic-completeness-note-smoke.cjs');

test('resume no-JS fallback module owns a base-safe idempotent semantic surface', async () => {
  assert.ok(fs.existsSync(MODULE), 'missing build-time resume no-JS fallback module');
  const {injectResumeNoscriptFallback} = await import('./resume-noscript-fallback.js');
  const source = '<!doctype html><html lang="ru"><head><base href="../../"></head><body><div id="root"></div></body></html>';
  const transformed = injectResumeNoscriptFallback(source, {locale: 'ru'});

  assert.match(transformed, /<noscript data-tr-resume-fallback>/);
  assert.match(transformed, /<main class="tr-resume-noscript"/);
  assert.match(transformed, /href="assets\/documents\/cv\.pdf"/);
  assert.match(transformed, />Открыть PDF-резюме</);
  assert.equal(transformed.includes('raw.githubusercontent.com'), false);
  assert.equal(injectResumeNoscriptFallback(transformed, {locale: 'ru'}), transformed);
  assert.equal((transformed.match(/data-tr-resume-fallback/g) || []).length, 1);
});

test('resume no-JS fallback supports controlled RU and EN generated pages', async () => {
  assert.ok(fs.existsSync(MODULE), 'missing build-time resume no-JS fallback module');
  const {applyResumeNoscriptFallback} = await import('./resume-noscript-fallback.js');
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'resume-noscript-'));

  try {
    for (const target of ['landing/resume.html', 'en/resume.html']) {
      const file = path.join(outputDir, target);
      fs.mkdirSync(path.dirname(file), {recursive: true});
      fs.writeFileSync(file, '<!doctype html><html><head><base href="../../"></head><body><div id="root"></div></body></html>', 'utf8');
    }

    const updated = applyResumeNoscriptFallback(outputDir);
    assert.deepEqual(updated, ['landing/resume.html', 'en/resume.html']);

    const ru = fs.readFileSync(path.join(outputDir, 'landing/resume.html'), 'utf8');
    const en = fs.readFileSync(path.join(outputDir, 'en/resume.html'), 'utf8');
    assert.match(ru, />Открыть PDF-резюме</);
    assert.match(en, />Open PDF resume</);
    assert.match(ru, /href="assets\/documents\/cv\.pdf"/);
    assert.match(en, /href="assets\/documents\/cv\.pdf"/);
  } finally {
    fs.rmSync(outputDir, {recursive: true, force: true});
  }
});

test('resume no-JS fallback reports a missing generated target without check-then-read', async () => {
  const {applyResumeNoscriptFallback} = await import('./resume-noscript-fallback.js');
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'resume-noscript-missing-'));

  try {
    assert.throws(
      () => applyResumeNoscriptFallback(outputDir),
      /Generated resume page not found: landing\/resume\.html/,
    );
  } finally {
    fs.rmSync(outputDir, {recursive: true, force: true});
  }
});

test('build chain publishes the real resume no-JS fallback before clean URLs', () => {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE, 'utf8'));

  assert.equal(pkg.scripts['postprocess:resume-noscript'], 'node scripts/resume-noscript-fallback.js');
  assert.match(pkg.scripts['copy-assets'], /npm run postprocess:resume-noscript/);
  assert.match(pkg.scripts['copy-assets'], /npm run postprocess:clean-urls/);
  assert.ok(
    pkg.scripts['copy-assets'].indexOf('postprocess:resume-noscript')
      < pkg.scripts['copy-assets'].indexOf('postprocess:clean-urls'),
    'resume fallback must be injected before clean URL directory routes are published',
  );
});

test('P3.4E production smoke requires no-JS markup and PDF route in raw exact HTML', () => {
  const source = fs.readFileSync(PRODUCTION_SMOKE, 'utf8');

  assert.match(source, /rawResumeHtml\.includes\('<noscript>'\)|rawResumeHtml\.includes\('<noscript data-tr-resume-fallback>'\)/);
  assert.match(source, /rawResumeHtml\.includes\('assets\/documents\/cv\.pdf'\)/);
  assert.match(source, /noscriptFallbackPresent: true/);
  assert.match(source, /rawPdfRoutePresent: true/);
});
