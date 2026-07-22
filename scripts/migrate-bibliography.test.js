import test from 'node:test';
import assert from 'node:assert/strict';

async function loadMigrationModule() {
  try {
    return await import('./migrate-bibliography.js');
  } catch (error) {
    assert.fail(`bibliography migration module must load: ${error.code || error.message}`);
  }
}

test('bibliography migration preserves URL, publisher, tags and summary bullets', async () => {
  const {parseBibliographyMarkdown} = await loadMigrationModule();
  const markdown = `# Sources\n\n| ID | Название | Источник | Ссылка | Теги | Резюме |\n| --- | --- | --- | --- | --- | --- |\n| 1 | Как мы сократили объем данных | #Habr | [Статья](https://habr.com/ru/companies/kts/articles/988510/) | #БД #Postgres | • Первый вывод.<br>• Второй вывод. |\n`;

  const registry = parseBibliographyMarkdown(markdown);

  assert.equal(registry.sources.length, 1);
  assert.equal(registry.sources[0].title, 'Как мы сократили объем данных');
  assert.equal(registry.sources[0].url, 'https://habr.com/ru/companies/kts/articles/988510/');
  assert.equal(registry.sources[0].publisher, 'Habr');
  assert.equal(registry.sources[0].sourceType, 'article');
  assert.deepEqual(registry.sources[0].topics, ['Базы данных', 'PostgreSQL']);
  assert.deepEqual(registry.sources[0].summary, ['Первый вывод.', 'Второй вывод.']);
  assert.match(registry.sources[0].id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.match(registry.sources[0].id, /988510$/);
});

test('bibliography migration rejects malformed data rows instead of silently dropping them', async () => {
  const {parseBibliographyMarkdown} = await loadMigrationModule();
  const markdown = `| ID | Название | Источник | Ссылка | Теги | Резюме |\n| --- | --- | --- | --- | --- | --- |\n| 1 | Broken | #Habr | not-a-link | #AI | Summary |\n`;

  assert.throws(() => parseBibliographyMarkdown(markdown), /invalid bibliography link/i);
});

test('current bibliography migrates all 31 real records without losing representative content', async () => {
  const {migrateBibliographyFile} = await loadMigrationModule();
  const registry = migrateBibliographyFile();

  assert.equal(registry.sources.length, 31);
  const first = registry.sources.find((source) => source.url === 'https://habr.com/ru/companies/kts/articles/988510/');
  const blog = registry.sources.find((source) => source.url === 'https://360.yandex.ru/roadtohighload/');
  const last = registry.sources.find((source) => source.url === 'https://habr.com/ru/companies/spring_aio/articles/1041836/');

  assert.ok(first);
  assert.match(first.title, /Postgres → ClickHouse/);
  assert.ok(first.summary.some((item) => item.includes('2 ТБ')));
  assert.equal(blog?.sourceType, 'blog');
  assert.equal(last?.title, 'Axelix. Cпецназ для Вашей Spring Boot экосистемы');

  console.log(`SOURCES_MIGRATION_JSON_BEGIN${JSON.stringify(registry)}SOURCES_MIGRATION_JSON_END`);
});
