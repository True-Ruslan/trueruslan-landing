import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'gametests-vs-installed-gameplay-acceptance';
const TITLE = 'Почему зелёные GameTests ещё не доказывают installed gameplay acceptance';
const NOTE = path.join(ROOT, 'docs', 'landing', 'notes', `${SLUG}.md`);
const PRODUCTION_SMOKE = path.join(ROOT, 'scripts', 'production-gametests-installed-acceptance-note-smoke.cjs');
const WORKFLOW = path.join(ROOT, '.github', 'workflows', 'production-live.yml');
const ROUTES = path.join(ROOT, 'scripts', 'production-live-routes.cjs');
const read = (...segments) => fs.readFileSync(path.join(ROOT, ...segments), 'utf8');

test('GameTests acceptance Note is registered with bounded metadata', () => {
  const notes = JSON.parse(read('data', 'notes.json'));
  const note = notes.find((candidate) => candidate.slug === SLUG);

  assert.ok(note, 'missing P3.4D GameTests acceptance Engineering Note');
  assert.equal(note.title, TITLE);
  assert.equal(note.published, '2026-08-05');
  assert.equal(note.updated, '2026-08-05');
  assert.ok(note.tags.includes('GameTests'));
  assert.ok(note.tags.includes('Release Engineering'));
  assert.ok(note.tags.includes('Acceptance'));
  assert.ok(note.related.includes('source-tests-to-installed-acceptance'));
  assert.ok(note.related.includes('restart-persistence-is-a-product-contract'));
});

test('GameTests acceptance Note separates automated, exact-artifact and installed evidence', () => {
  assert.ok(fs.existsSync(NOTE), 'missing P3.4D Note source');
  const source = fs.readFileSync(NOTE, 'utf8');

  for (const marker of [
    'source/unit contracts',
    'remapped package',
    'fabric.mod.json',
    'manifest',
    'SHA-256',
    'GameTests',
    'controlled server runtime',
    'exact production-JAR',
    'two-JVM',
    'startup/restart',
    'literal-loopback',
    'provider-client',
    'physical microphone',
    'Simple Voice Chat',
    'UDP/Opus',
    'logical-client',
    'real installed two-client',
    'VAI-CONCUR-003',
    'VAI-CONCUR-004',
    '0.1.25+1.21.1',
    '588cc676d356271c4cf74eb21131f6d071476e48',
    '67e0644b355708c06747e3ec4659a337bc4189b3',
    'PR #105',
    'PR #108',
    'PR #110',
    'PR #112',
    'PR #114',
    'Draft',
    'inventory/grave/resurrection canary',
    'product-owner acceptance',
    'rollback',
    'recovery',
    'Проверенный факт',
    'Инженерный вывод',
    'Ограничение',
    '../projects/livingworld.md',
    'source-tests-to-installed-acceptance.md',
    'restart-persistence-is-a-product-contract.md',
    'не доказывает',
  ]) {
    assert.ok(source.includes(marker), `missing required P3.4D marker: ${marker}`);
  }

  assert.match(source, /VillAIgence PR #114 \*\*Draft\*\*/);
  assert.match(source, /Draft PR #114 не является accepted evidence/);
  assert.doesNotMatch(source, /PR #114 (?:accepted|принят|merged|слит)/i);
  assert.doesNotMatch(source, /GameTests[^\n]*(?:полностью доказывают|гарантируют).*installed/i);
  assert.doesNotMatch(source, /0\.1\.25[^\n]*(?:полностью принят|fully accepted)/i);
  assert.doesNotMatch(source, /physical microphone[^\n]*(?:автоматизирован|automated)/i);
});

test('GameTests acceptance Note is exposed through index toc and page metadata', () => {
  assert.match(read('docs', 'landing', 'notes.md'), new RegExp(`${SLUG}\\.md`));
  assert.match(read('docs', 'toc.yaml'), new RegExp(`${SLUG}\\.md`));

  const pageMeta = JSON.parse(read('data', 'page-meta.json'));
  const meta = pageMeta.find((entry) => entry.path === `landing/notes/${SLUG}.html`);

  assert.ok(meta, 'missing P3.4D page metadata');
  assert.equal(meta.card, 'note-gametests-acceptance');
  assert.equal(meta.displayTitle, 'GAMETESTS VS INSTALLED');
});

test('deployment-only P3.4D smoke covers route content feed search and Draft boundaries', () => {
  assert.ok(fs.existsSync(PRODUCTION_SMOKE), 'missing deployment-only P3.4D smoke');
  assert.ok(fs.existsSync(ROUTES), 'missing production route contract');
  assert.ok(fs.existsSync(WORKFLOW), 'missing production workflow');

  const source = `${fs.readFileSync(ROUTES, 'utf8')}\n${fs.readFileSync(PRODUCTION_SMOKE, 'utf8')}`;
  const workflow = fs.readFileSync(WORKFLOW, 'utf8');

  for (const marker of [
    'notes/gametests-vs-installed-gameplay-acceptance/',
    TITLE,
    'main.dc-doc-page__content',
    'GameTests',
    'exact production-JAR',
    'VAI-CONCUR-003',
    'VAI-CONCUR-004',
    'PR #114',
    'Draft',
    'inventory/grave/resurrection canary',
    'feed.xml',
    'generated search',
    'gametests-installed-acceptance-note-production-summary.json',
  ]) {
    assert.ok(source.includes(marker), `missing deployed P3.4D smoke marker: ${marker}`);
  }

  assert.match(workflow, /scripts\/production-gametests-installed-acceptance-note-smoke\.cjs/);
  assert.match(workflow, /name: Run deployed P3\.4D GameTests Acceptance Note smoke/);
  assert.match(source, /EXPECTED_DEPLOYED_SHA/);
  assert.match(source, /link\[rel="canonical"\]/);
  assert.match(source, /meta\[property="og:url"\]/);
  assert.match(source, /page\.screenshot/);
});