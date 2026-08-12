import test from 'node:test';
import assert from 'node:assert/strict';

import {normalizeGoogleSearchConsoleCsvExport} from './search-discovery-google-csv.js';

function realShapeFiles() {
  return {
    'Диаграмма.csv': [
      'Дата,Kлики,Показы,CTR,Позиция',
      '2026-08-02,0,0,,',
      '2026-08-03,0,1,0%,4',
      '2026-08-09,1,4,25%,3.8',
    ].join('\n'),
    'Запросы.csv': [
      'Популярные запросы,Kлики,Показы,CTR,Позиция',
      'java backend portfolio,1,4,25%,3.8',
    ].join('\n'),
    'Страницы.csv': [
      'Популярные страницы,Kлики,Показы,CTR,Позиция',
      'https://example.invalid/en/projects/livingworld.html,1,5,20%,10.4',
      'https://example.invalid/en/,0,2,0%,6',
    ].join('\n'),
    'Страны.csv': 'Страна,Kлики,Показы,CTR,Позиция\nРоссия,0,1,0%,4',
    'Устройства.csv': 'Устройство,Kлики,Показы,CTR,Позиция\nПК,1,8,12.5%,13.38',
    'Вид в поиске.csv': 'Вид в поиске,Kлики,Показы,CTR,Позиция',
    'Фильтры.csv': 'Фильтр,Значение\nТип поиска,Веб\nДата,За последние 3 месяца',
  };
}

test('normalizes the observed Russian Google Search Console performance CSV export shape', () => {
  const normalized = normalizeGoogleSearchConsoleCsvExport({
    files: realShapeFiles(),
    property: 'https://example.invalid/',
    collectedAt: '2026-08-12T14:00:00Z',
  });

  assert.equal(normalized.schemaVersion, 1);
  assert.equal(normalized.evidenceClass, 'external-search-observations');
  assert.equal(normalized.property, 'https://example.invalid/');
  assert.equal(normalized.observations.length, 1);

  const observation = normalized.observations[0];
  assert.equal(observation.source, 'google-search-console');
  assert.equal(observation.collectionMethod, 'export');
  assert.equal(observation.kind, 'performance');
  assert.deepEqual(observation.window, {start: '2026-08-02', end: '2026-08-09'});
  assert.deepEqual(observation.rows, [
    {dimension: 'query', value: 'java backend portfolio', clicks: 1, impressions: 4, ctr: 0.25, position: 3.8},
    {dimension: 'page', value: 'https://example.invalid/en/projects/livingworld.html', clicks: 1, impressions: 5, ctr: 0.2, position: 10.4},
    {dimension: 'page', value: 'https://example.invalid/en/', clicks: 0, impressions: 2, ctr: 0, position: 6},
  ]);
});

test('accepts the observed export when the query table has only its header', () => {
  const files = realShapeFiles();
  files['Запросы.csv'] = 'Популярные запросы,Kлики,Показы,CTR,Позиция';

  const normalized = normalizeGoogleSearchConsoleCsvExport({
    files,
    property: 'https://example.invalid/',
    collectedAt: '2026-08-12T14:00:00Z',
  });

  assert.deepEqual(normalized.observations[0].rows.map(({dimension}) => dimension), ['page', 'page']);
});

test('fails closed when required Google Search Console performance files or metric shapes are missing', () => {
  const missingPages = realShapeFiles();
  delete missingPages['Страницы.csv'];
  assert.throws(() => normalizeGoogleSearchConsoleCsvExport({
    files: missingPages,
    property: 'https://example.invalid/',
    collectedAt: '2026-08-12T14:00:00Z',
  }), /Страницы\.csv|required/i);

  const invalidMetric = realShapeFiles();
  invalidMetric['Страницы.csv'] = [
    'Популярные страницы,Kлики,Показы,CTR,Позиция',
    'https://example.invalid/en/,0,2,not-a-percent,6',
  ].join('\n');
  assert.throws(() => normalizeGoogleSearchConsoleCsvExport({
    files: invalidMetric,
    property: 'https://example.invalid/',
    collectedAt: '2026-08-12T14:00:00Z',
  }), /CTR|percent/i);
});
