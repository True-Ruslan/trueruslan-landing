import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(ROOT, 'scripts', file), 'utf8');

test('portfolio production search accepts only the canonical portfolio-platform result route', () => {
  const source = read('production-portfolio-platform-smoke.cjs');
  assert.match(source, /a\[href\*=\"projects\/portfolio-platform\/\"\]:not\(\[href\*=\"landing\/projects\/portfolio-platform\/\"\]\)/);
  assert.doesNotMatch(source, /a\[href\*=\"landing\/projects\/portfolio-platform\"\]/);
});

test('flagship production related-link checks select visible canonical links', () => {
  const source = read('production-flagship-normalization-smoke.cjs');
  assert.match(source, /a\[href\*=\"\$\{fragment\}\"\]:visible/);
  assert.doesNotMatch(source, /['"]landing\/projects\/livingworld['"]/);
});

test('Work with me production verifier follows canonical contextual routes and simplified Contacts', () => {
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
  assert.match(source, /mailto:contact@trueruslan\.ru/);
  assert.match(source, /collaboration-rendered=\"handoff\"[^\n]*count\(\) === 0|count\(\) === 0[^\n]*collaboration-rendered=\"handoff\"/);
  assert.doesNotMatch(source, /Contacts canonical handoff missing/);
});

test('favicon production verifier uses the canonical resume route model', () => {
  const source = read('production-favicon-smoke.cjs');
  assert.match(source, /RESUME_URL/);
  assert.doesNotMatch(source, /new URL\(['"]landing\/resume\.html['"]/);
});
