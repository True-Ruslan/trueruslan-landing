import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const projects = readFileSync(new URL('../docs/landing/projects.md', import.meta.url), 'utf8');

test('Projects presents current QWEP work as a lightweight commercial-context callout before MarketDB', () => {
  assert.match(projects, /^## Коммерческий контекст$/m);

  const currentIndex = projects.indexOf('data-c3-commercial="current"');
  const marketDbIndex = projects.indexOf('data-c3-commercial="marketdb"');
  assert.ok(currentIndex >= 0, 'current commercial-context callout must exist');
  assert.ok(marketDbIndex >= 0, 'MarketDB commercial card must remain');
  assert.ok(currentIndex < marketDbIndex, 'current work should appear before historical MarketDB context');

  assert.match(projects, /class="tr-commercial-current"[^>]*data-c3-commercial="current"/);
  assert.match(projects, /class="tr-commercial-current__status"[^>]*>Сейчас<\/span>/);
  assert.match(projects, /class="tr-commercial-current__title"[^>]*>QWEP<\/p>/);
  assert.match(projects, /class="tr-commercial-current__summary"[^>]*>Текущая коммерческая работа\.<\/p>/);
  assert.match(
    projects,
    /<a class="tr-commercial-current__link" href="resume\.md">Роль, задачи и стек — в разделе «Опыт» →<\/a>/,
  );

  assert.doesNotMatch(projects, /<h3>QWEP<\/h3>/, 'QWEP is work context, not a portfolio-project peer');
  assert.doesNotMatch(projects, /Текущая коммерческая работа — QWEP;/);
});
