import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildLaunchPack,
  renderLaunchPackMarkdown,
  writeLaunchPack,
} from './launch-pack.js';

const ROOT = path.resolve(import.meta.dirname, '..');

function targets() {
  return [
    {
      id: 'home',
      priority: 1,
      canonicalUrl: 'https://trueruslan.ru/',
      title: 'Руслан Немыкин — Backend Engineer',
      displayTitle: 'Руслан Немыкин',
      framing: 'Персональная инженерная платформа: опыт, проекты, технические заметки и публикации.',
      evidenceBoundary: 'Показывает текущую публичную платформу; не является заявлением об охвате или найме.',
      audiences: ['recruiter', 'engineer', 'general'],
      channels: ['github', 'habr', 'telegram', 'direct'],
    },
    {
      id: 'work-with-me',
      priority: 2,
      canonicalUrl: 'https://trueruslan.ru/work-with-me/',
      title: 'Работа со мной — Руслан Немыкин',
      displayTitle: 'Работа со мной',
      framing: 'Прямой путь от интереса к конкретной инженерной задаче.',
      evidenceBoundary: 'Не фиксирует SLA, цены или гарантированную доступность.',
      audiences: ['recruiter', 'engineer'],
      channels: ['github', 'telegram', 'direct'],
    },
  ];
}

test('builds deterministic manual launch drafts only for channels allowed by canonical distribution targets', () => {
  const pack = buildLaunchPack({targets: targets()});

  assert.equal(pack.schemaVersion, 1);
  assert.equal(pack.status, 'prepared');
  assert.equal(pack.publicationState, 'not-published');
  assert.deepEqual(pack.channels, ['github', 'habr', 'telegram', 'direct']);
  assert.equal(pack.drafts.length, 7);
  assert.deepEqual(
    pack.drafts.map(({targetId, channel}) => `${targetId}:${channel}`),
    [
      'home:github',
      'home:habr',
      'home:telegram',
      'home:direct',
      'work-with-me:github',
      'work-with-me:telegram',
      'work-with-me:direct',
    ],
  );

  for (const draft of pack.drafts) {
    const url = new URL(draft.canonicalUrl);
    assert.equal(url.origin, 'https://trueruslan.ru');
    assert.equal(url.search, '');
    assert.equal(url.hash, '');
    assert.ok(draft.text.includes(draft.canonicalUrl));
    assert.ok(draft.text.includes(draft.framing));
    assert.equal(draft.publicationState, 'not-published');
    assert.doesNotMatch(draft.text, /utm_|published|опубликован|охват|гарантирован/i);
  }
});

test('curates a small Telegram-native first wave without inventing publication evidence', () => {
  const realTargets = [
    ...targets(),
    {
      id: 'projects',
      priority: 3,
      canonicalUrl: 'https://trueruslan.ru/projects/',
      title: 'Проекты — Руслан Немыкин',
      displayTitle: 'Проекты',
      framing: 'Каталог инженерных case studies.',
      evidenceBoundary: 'Lifecycle каждого проекта принадлежит canonical evidence.',
      audiences: ['recruiter', 'engineer'],
      channels: ['github', 'habr', 'telegram', 'direct'],
    },
    {
      id: 'engineering-notes',
      priority: 4,
      canonicalUrl: 'https://trueruslan.ru/notes/',
      title: 'Инженерные заметки — Руслан Немыкин',
      displayTitle: 'Инженерные заметки',
      framing: 'Практические инженерные разборы.',
      evidenceBoundary: 'Каждая заметка сохраняет собственную evidence boundary.',
      audiences: ['engineer', 'researcher'],
      channels: ['github', 'habr', 'telegram', 'direct'],
    },
  ];
  const pack = buildLaunchPack({targets: realTargets});

  assert.equal(pack.firstWave.status, 'prepared');
  assert.equal(pack.firstWave.publicationState, 'not-published');
  assert.equal(pack.firstWave.mode, 'manual-only');
  assert.equal(pack.firstWave.draftCount, 3);
  assert.deepEqual(
    pack.firstWave.drafts.map(({targetId, channel}) => `${targetId}:${channel}`),
    ['home:telegram', 'projects:telegram', 'engineering-notes:telegram'],
  );

  const fullDraftText = new Map(pack.drafts.map((draft) => [`${draft.targetId}:${draft.channel}`, draft.text]));
  for (const draft of pack.firstWave.drafts) {
    assert.equal(draft.channel, 'telegram');
    assert.equal(draft.publicationState, 'not-published');
    assert.ok(draft.text.includes(draft.canonicalUrl));
    assert.notEqual(draft.text, fullDraftText.get(`${draft.targetId}:${draft.channel}`));
    assert.doesNotMatch(draft.text, /utm_|published|опубликован|охват|клик|CTR|SEO|гарантирован/i);
  }
});

test('launch pack renderer keeps operator evidence boundaries outside ready-to-paste draft copy', () => {
  const pack = buildLaunchPack({targets: targets()});
  const markdown = renderLaunchPackMarkdown(pack);

  assert.match(markdown, /^# Controlled Launch Pack$/m);
  assert.match(markdown, /Status: `prepared`/);
  assert.match(markdown, /Publication state: `not-published`/);
  assert.match(markdown, /manual/i);
  assert.match(markdown, /Evidence boundary:/);
  assert.match(markdown, /Персональная инженерная платформа/);
  assert.match(markdown, /https:\/\/trueruslan\.ru\//);
  assert.doesNotMatch(markdown, /utm_/i);
});

test('launch pack fails closed on non-canonical URLs', () => {
  const dirty = targets();
  dirty[0] = {...dirty[0], canonicalUrl: 'https://trueruslan.ru/?utm_source=test'};
  assert.throws(() => buildLaunchPack({targets: dirty}), /canonical|query|URL/i);

  const legacy = targets();
  legacy[0] = {...legacy[0], canonicalUrl: 'https://trueruslan.ru/landing/index.html'};
  assert.throws(() => buildLaunchPack({targets: legacy}), /clean|canonical|legacy/i);
});

test('real registry writes a prepared artifact without changing publication state', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launch-pack-'));
  try {
    const result = writeLaunchPack({outputDir});
    assert.equal(result.pack.targetCount, 10);
    assert.ok(result.pack.draftCount > result.pack.targetCount);
    assert.equal(result.pack.publicationState, 'not-published');
    assert.equal(result.pack.firstWave.draftCount, 3);
    assert.equal(fs.existsSync(result.jsonPath), true);
    assert.equal(fs.existsSync(result.markdownPath), true);
    assert.match(fs.readFileSync(result.markdownPath, 'utf8'), /Publication remains a deliberate manual action/i);
  } finally {
    fs.rmSync(outputDir, {recursive: true, force: true});
  }
});

test('launch pack is reproducible locally and owned by the existing read-only distribution workflow', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'distribution-readiness.yml'), 'utf8');

  assert.equal(pkg.scripts['report:launch-pack'], 'node scripts/launch-pack.js');
  assert.ok(workflow.includes("scripts/launch-pack.js"));
  assert.ok(workflow.includes("scripts/launch-pack.test.js"));
  assert.match(workflow, /node scripts\/launch-pack\.js/);
  assert.match(workflow, /contents:\s*read/);
  assert.doesNotMatch(workflow, /contents:\s*write|issues:\s*write|deployments:\s*write/);
  assert.doesNotMatch(workflow, /curl|telegram|api\.github\.com|habr\.com/i);
});
