import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(ROOT, 'scripts', file), 'utf8');

test('portfolio production search resolves the exact RU canonical pathname instead of trusting result order', () => {
  const source = read('production-portfolio-platform-smoke.cjs');
  assert.match(source, /async function findExactPathResult\(page, expectedUrl\)/);
  assert.match(source, /new URL\(href, page\.url\(\)\)\.pathname === expectedPath/);
  assert.match(source, /findExactPathResult\(page, PORTFOLIO_PLATFORM_URL\)/);
  assert.doesNotMatch(source, /a\[href\*=\"projects\/portfolio-platform\/\"\][^\n]*\.first\(\)/);
  assert.doesNotMatch(source, /a\[href\*=\"landing\/projects\/portfolio-platform\"\]/);
});

test('flagship production related-link checks select visible canonical links', () => {
  const source = read('production-flagship-normalization-smoke.cjs');
  assert.match(source, /a\[href\*=\"\$\{fragment\}\"\]:visible/);
  assert.doesNotMatch(source, /['"]landing\/projects\/livingworld['"]/);
});

test('Work with me production verifier follows canonical contextual routes, current-tab internals and simplified Contacts', () => {
  const source = read('production-work-with-me-smoke.cjs');
  for (const route of [
    'projects/portfolio-platform/',
    'projects/notchhub/',
    'notes/deployment-success-is-not-production-verification/',
    'notes/server-authoritative-ai-npcs/',
    'about/',
    'resume/',
    'photos/',
    'bibliography/',
    'engineering-map/',
  ]) assert.ok(source.includes(`'${route}'`), `missing canonical production route ${route}`);

  assert.doesNotMatch(source, /['"]landing\/(?:projects|notes|about|resume|photos|bibliography|engineering-map)\//);
  assert.match(source, /Основные контакты/);
  assert.match(source, /https:\/\/t\.me\/TrueRuslan_Blog/);
  assert.match(source, /mailto:nemykin@true-ruslan\.ru/);
  assert.doesNotMatch(source, /mailto:(?:contact@trueruslan\.ru|ruslan\.nemikin@gmail\.com)/i);
  assert.match(source, /internal homepage CTA must stay in current tab/);
  assert.match(source, /approved contextual CTA must stay in current tab/);
  assert.match(source, /generated internal search result opened a new tab/);
  assert.match(source, /generated internal search result did not navigate current tab/);
  assert.match(source, /navigatedInCurrentTab:\s*true/);
  assert.match(source, /collaboration-rendered=\"handoff\"[^\n]*count\(\) === 0|count\(\) === 0[^\n]*collaboration-rendered=\"handoff\"/);
  assert.doesNotMatch(source, /Contacts canonical handoff missing/);
});

test('favicon production verifier uses the canonical resume route model', () => {
  const source = read('production-favicon-smoke.cjs');
  assert.match(source, /\{APEX, RESUME_URL\}\s*=\s*require\(['"]\.\/production-live-routes\.cjs['"]\)/);
  assert.doesNotMatch(source, /new URL\(['"]landing\/resume\.html['"]/);
});

test('P3.4A-F production Note search verifiers accept canonical result routes only', () => {
  const cases = [
    ['production-deployment-verification-note-smoke.cjs', 'deployment-success-is-not-production-verification'],
    ['production-clean-urls-note-smoke.cjs', 'clean-urls-without-cloudflare-routing'],
    ['production-hybrid-recognition-note-smoke.cjs', 'hybrid-cv-ai-recognition-boundaries'],
    ['production-gametests-installed-acceptance-note-smoke.cjs', 'gametests-vs-installed-gameplay-acceptance'],
    ['production-passive-pdf-semantic-completeness-note-smoke.cjs', 'passive-pdf-validation-vs-semantic-completeness'],
    ['production-evidence-driven-project-state-note-smoke.cjs', 'evidence-driven-project-state'],
  ];

  for (const [file, slug] of cases) {
    const source = read(file);
    const canonicalSelector = `a[href*="notes/${slug}/"]:not([href*="landing/notes/${slug}/"])`;
    assert.ok(source.includes(canonicalSelector), `${file} must select canonical search result ${canonicalSelector}`);
    assert.doesNotMatch(source, new RegExp(`a\\[href\\*=\\"landing/notes/${slug}`), `${file} still treats legacy search href as canonical`);
  }
});

test('P3.4B legacy compatibility probe targets the retained landing HTML alias', () => {
  const source = read('production-clean-urls-note-smoke.cjs');
  assert.match(source, /new URL\(['"]landing\/notes\/clean-urls-without-cloudflare-routing\.html\?source=production-smoke#legacy-compatibility['"],\s*APEX\)\.href/);
  assert.doesNotMatch(source, /CLEAN_URLS_NOTE_URL\.slice\(0, -1\).*\.html/);
  assert.match(source, /queryPreserved:\s*true/);
  assert.match(source, /fragmentPreserved:\s*true/);
});
