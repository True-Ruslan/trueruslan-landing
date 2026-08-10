import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'probabilistic-proposals-deterministic-authority';
const TITLE = 'AI может предложить, но не применить: как строить deterministic authority';
const read = (...segments) => fs.readFileSync(path.join(ROOT, ...segments), 'utf8');

test('deterministic-authority note is registered with bounded metadata', () => {
  const notes = JSON.parse(read('data', 'notes.json'));
  const note = notes.find((candidate) => candidate.slug === SLUG);

  assert.ok(note, 'missing deterministic-authority Engineering Note');
  assert.equal(note.title, TITLE);
  assert.equal(note.published, '2026-08-03');
  assert.equal(note.updated, '2026-08-03');
  assert.equal(note.readingMinutes, 12);
  assert.ok(note.tags.includes('Authority'));
  assert.ok(note.tags.includes('Validation'));
  assert.ok(note.related.includes('server-authoritative-ai-npcs'));
  assert.ok(note.related.includes('source-tests-to-installed-acceptance'));
});

test('deterministic-authority note preserves accepted and Draft evidence boundaries', () => {
  const source = read('docs', 'landing', 'notes', `${SLUG}.md`);

  assert.match(source, /Vlezet[\s\S]*PR #41[\s\S]*(accepted|принят)/i);
  assert.match(source, /PR #42[\s\S]*(Draft|не принят|ожидает)/i);
  assert.match(source, /(immutable|неизменяем)[\s\S]{0,120}(ID|геометр)/i);
  assert.match(source, /(explicit Apply|явн[^\n]{0,80}Apply)/i);
  assert.match(source, /(server[- ]side|сервер[^\n]{0,100}(разреш|определ|вычисл))/i);
  assert.match(source, /(SHA-256|revision)[\s\S]{0,160}(CONFLICT|конфликт)/i);
  assert.match(source, /(current[- ]state|актуальн[^\n]{0,100}состояни)/i);
  assert.match(source, /APPLY[\s\S]*CONFLICT[\s\S]*(REJECT|INVALID)[\s\S]*UNCHANGED/i);

  for (const marker of [
    '27 local',
    '19 AI-confirmed',
    '8 review',
    'VillAIgence',
    'WORLD',
    'PLAYER',
    'VILLAGER',
    'VILLAGE',
  ]) {
    assert.ok(source.includes(marker), `missing required authority marker: ${marker}`);
  }

  assert.match(source, /(не является универсальной гарантией|не универсальная гарантия|не гарантирует безопасность всех AI)/i);
  assert.doesNotMatch(source, /M7\.8C[^\n]{0,120}(принят|accepted|merged)/i);
  assert.doesNotMatch(source, /полностью автономн/i);
});

test('deterministic-authority note is exposed through registry index toc and page metadata', () => {
  assert.match(read('docs', 'landing', 'notes.md'), /data-tr-notes-index-placeholder/);
  assert.ok(
    JSON.parse(read('data', 'notes.json')).some((note) => note.slug === SLUG),
    'missing deterministic-authority Note from canonical Notes Registry',
  );
  assert.match(read('docs', 'toc.yaml'), new RegExp(`${SLUG}\\.md`));

  const pageMeta = JSON.parse(read('data', 'page-meta.json'));
  const entry = pageMeta.find((candidate) => candidate.path === `landing/notes/${SLUG}.html`);

  assert.ok(entry, 'missing deterministic-authority page metadata');
  assert.equal(entry.title, TITLE);
  assert.equal(entry.displayTitle, 'DETERMINISTIC AUTHORITY');
});
