import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildLaunchPack,
  renderLaunchPackMarkdown,
} from './launch-pack.js';

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
