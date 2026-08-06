import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODULE = path.join(ROOT, 'scripts', 'resume-noscript-fallback.js');
const COPY_ASSETS = path.join(ROOT, 'scripts', 'copy-assets.js');
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
  assert.doesNotMatch(transformed, /raw\.githubusercontent\.com/);
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

test('site post-processing injects and reports the real resume no-JS fallback', () => {
  const source = fs.readFileSync(COPY_ASSETS, 'utf8');

  assert.match(source, /from '\.\/resume-noscript-fallback\.js'/);
  assert.match(source, /const resumeNoscriptTargets = applyResumeNoscriptFallback\(outputDir\)/);
  assert.match(source, /resumeNoscriptTargets,/);
  assert.match(source, /Injected \$\{result\.resumeNoscriptTargets\.length\} resume no-JS fallback page\(s\)\./);
});

test('P3.4E production smoke requires the generated fallback marker in raw exact HTML', () => {
  const source = fs.readFileSync(PRODUCTION_SMOKE, 'utf8');

  assert.match(source, /rawResumeHtml\.includes\('data-tr-resume-fallback'\)/);
  assert.match(source, /rawResumeHtml\.includes\('<noscript data-tr-resume-fallback>'\)/);
  assert.match(source, /rawResumeHtml\.includes\('assets\/documents\/cv\.pdf'\)/);
  assert.match(source, /noscriptFallbackPresent: true/);
  assert.match(source, /rawPdfRoutePresent: true/);
});
