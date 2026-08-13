import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const absent = (source, phrases, label) => {
  for (const phrase of phrases) assert.equal(source.includes(phrase), false, `${label}: ${phrase}`);
};

test('RU Projects uses public-facing project language while preserving project truth', async () => {
  const source = await read('docs/landing/projects.md');
  assert.match(source, /AI-общество NPC для Minecraft: сервер хранит состояние, память и управляет действиями/);
  assert.match(source, /Статическое инженерное портфолио и база материалов/);
  assert.match(source, /распознавание используется как подсказка, которую нужно проверить/);
  assert.match(source, /Открыть проект →/);
  assert.match(source, /<strong>Статус:<\/strong> закрыт\./);
  assert.match(source, /Текущая коммерческая работа — QWEP/);
  absent(source, ['Открыть case study', 'Static-first', 'source, artifact, deployment', 'recognition как'], 'RU Projects');
});

test('RU Work with me uses natural client-facing Russian labels', async () => {
  const source = await read('docs/landing/work-with-me.md');
  for (const expected of [
    '<h2>Backend и интеграции</h2>',
    '<h2>AI-инструменты</h2>',
    '<h2>Обучение и наставничество</h2>',
    '<strong>Задача и рамки.</strong>',
    '<strong>Оценка и работа.</strong>',
    '<strong>Передача результата.</strong>'
  ]) assert.match(source, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  absent(source, ['Backend engineering', 'AI tooling', 'Teaching & Mentoring', 'Context & Scope', 'Estimate & Implementation', 'Handover.', 'fixed-price', 'scope.'], 'RU Work with me');
  assert.match(source, /Java\/Spring/);
  assert.match(source, /LLM\/MCP/);
});

test('RU About is personal and precise without repository-facing architecture language', async () => {
  const source = await read('docs/landing/about.md');
  assert.match(source, /backend-разработка в \*\*QWEP\*\* на полной занятости/);
  assert.match(source, /\[Опыт\]\(resume\.md\)/);
  assert.match(source, /AI и LLM использую как инженерный инструмент/);
  absent(source, ['источникам истины', 'agentic', 'полномочия', '[Резюме](resume.md)'], 'RU About');
});

test('RU Materials names all four entry points and avoids unnecessary process English', async () => {
  const source = await read('docs/landing/materials.md');
  assert.match(source, /Публикации, Engineering Map, Engineering Notes и Источники — четыре/);
  assert.match(source, /проверок качества/);
  absent(source, ['quality gates', 'distributed systems', 'reliability, AI engineering'], 'RU Materials');
});

test('RU Publications describes external sources naturally', async () => {
  const source = await read('docs/landing/publications.md');
  assert.match(source, /со ссылками на исходные страницы и записи/);
  absent(source, ['PUBLICATIONS · TALKS · RESEARCH', 'проверяемой внешней точкой'], 'RU Publications');
  assert.match(source, /только уже опубликованные или состоявшиеся материалы/);
});

test('RU Notes hub uses reader-facing orientation and preserves N5 generated architecture', async () => {
  const source = await read('docs/landing/notes.md');
  assert.match(source, /На каждой странице — конкретная проблема, решение и контекст\./);
  assert.match(source, /<div data-tr-notes-index-placeholder><\/div>/);
  absent(source, ['engineering evidence', 'Notes Registry', 'AI systems и delivery'], 'RU Notes');
});

test('EN Projects removes internal pipeline wording while preserving lifecycle truth', async () => {
  const source = await read('docs/en/projects.md');
  assert.match(source, /the model can suggest actions but does not own world state/i);
  assert.match(source, /automated build, browser and production checks/i);
  assert.match(source, /My current commercial work is at QWEP/);
  assert.match(source, /<strong>Status:<\/strong> closed\./);
  absent(source, ['bounded source of proposals', 'source, artifact, deployment and live-production verification'], 'EN Projects');
});

test('EN About stays factual but reads like a personal introduction', async () => {
  const source = await read('docs/en/about.md');
  assert.match(source, /I work full-time as a backend engineer at \*\*QWEP\*\*/);
  assert.match(source, /I use AI and LLMs as engineering tools/);
  absent(source, ['sources of truth', 'ownership boundaries', 'agentic systems', 'capability is bounded'], 'EN About');
});
