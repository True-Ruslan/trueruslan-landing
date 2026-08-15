import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadAiConfig} from './ai-config.js';
import {
  buildAiCorpus,
  chunkMarkdown,
  normalizeChunkText,
  serializeCorpus,
} from './ai-corpus.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'data', 'ai-navigator.json');
const NOTES_PATH = path.join(ROOT, 'data', 'notes.json');

function corpus() {
  return buildAiCorpus({rootDir: ROOT, config: loadAiConfig(CONFIG_PATH)});
}

test('AI corpus is byte-deterministic with stable unique canonical identities', () => {
  const first = corpus();
  const second = corpus();

  assert.ok(first.length > 20, `expected meaningful corpus, got ${first.length}`);
  assert.equal(serializeCorpus(first), serializeCorpus(second));
  assert.equal(new Set(first.map(({id}) => id)).size, first.length);
  assert.equal(new Set(first.map(({text}) => normalizeChunkText(text))).size, first.length);

  for (const chunk of first) {
    assert.match(chunk.id, /^(ru|en):(note|project|page|publication):[a-z0-9-]+:[a-z0-9-]+$/);
    assert.ok(chunk.url.startsWith('/') && chunk.url.endsWith('/'), `non-canonical URL: ${chunk.url}`);
    assert.ok(['ru', 'en'].includes(chunk.lang), `unexpected language: ${chunk.lang}`);
    assert.ok(chunk.text.trim().length >= 80, `chunk too short: ${chunk.id}`);
    assert.match(chunk.contentHash, /^sha256:[a-f0-9]{64}$/);
    assert.ok(chunk.sourcePath.startsWith('docs/'), `non-doc source: ${chunk.sourcePath}`);
    assert.ok(!chunk.sourcePath.startsWith('docs/acceptance/'), `acceptance evidence leaked: ${chunk.sourcePath}`);
    assert.ok(!/(PROJECT_STATE|ROADMAP|CHANGELOG)/.test(chunk.sourcePath), `state file leaked: ${chunk.sourcePath}`);
  }
});

test('AI corpus contains every registered Engineering Note through canonical Markdown', () => {
  const chunks = corpus();
  const notes = JSON.parse(fs.readFileSync(NOTES_PATH, 'utf8'));
  const represented = new Set(chunks
    .filter(({type}) => type === 'note')
    .map(({sourcePath}) => sourcePath));

  for (const {slug} of notes) {
    const expected = `docs/landing/notes/${slug}.md`;
    assert.ok(represented.has(expected), `missing note source: ${expected}`);
  }
});

test('AI corpus resolves every configured page to an existing canonical Markdown owner', () => {
  const config = loadAiConfig(CONFIG_PATH);
  const chunks = corpus();
  const sourcePaths = new Set(chunks.map(({sourcePath}) => sourcePath));

  for (const route of config.includePagePaths) {
    const expectedSource = `docs/${route.replace(/\.html$/, '.md')}`;
    assert.ok(fs.existsSync(path.join(ROOT, expectedSource)), `configured source does not exist: ${expectedSource}`);
    assert.ok(sourcePaths.has(expectedSource), `configured source not represented: ${expectedSource}`);
  }
});

test('Markdown chunking creates bounded reader-owned sections and strips non-reader chrome', () => {
  const markdown = `---\ntitle: Fixture\nsecretField: do-not-index\n---\n# Fixture\n\nIntro paragraph that is intentionally long enough to become a useful semantic chunk for a reader and not just tiny metadata.\n\n<script>window.secret = true</script>\n<script>window.evasive = true</script >\n\n## Reliability Boundary\n\nThis section explains a deterministic reliability boundary in enough detail that the semantic chunk is meaningful and remains reader-owned source text.\n\n{% include [Registry cards](../../_includes/registry-cards.md) %}\n`;

  const chunks = chunkMarkdown({
    sourcePath: 'docs/fixture.md',
    url: '/fixture/',
    title: 'Fixture',
    type: 'page',
    lang: 'en',
    markdown,
  });

  assert.equal(chunks.length, 2);
  assert.deepEqual(chunks.map(({section}) => section), ['Intro', 'Reliability Boundary']);
  assert.ok(chunks.every(({text}) => !text.includes('secretField')));
  assert.ok(chunks.every(({text}) => !text.includes('window.secret')));
  assert.ok(chunks.every(({text}) => !text.includes('window.evasive')));
  assert.ok(chunks.every(({text}) => !text.includes('Registry cards')));
});

test('normalizeChunkText removes Markdown presentation without collapsing semantic prose', () => {
  assert.equal(
    normalizeChunkText(' **Static-first**  [search](https://example.test)\n\n`quality gates` '),
    'Static-first search quality gates',
  );
});

test('ai-corpus CLI prints the exact stable chunk IDs in corpus order', () => {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'ai-corpus.js'), '--print-ids'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const ids = result.stdout.trim().split(/\r?\n/).filter(Boolean);
  const expected = corpus().map(({id}) => id);
  assert.deepEqual(ids, expected);
  assert.ok(ids.includes('ru:project:livingworld:intro'));
  assert.ok(ids.includes('en:project:vlezet:intro'));
  assert.ok(ids.includes('ru:publication:diplodoc-github-pages:intro'));
});
