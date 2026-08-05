import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const routes = require('./production-live-routes.cjs');

test('production live smoke uses repository-native clean canonical routes', () => {
  assert.equal(
    routes.NOTE_URL,
    'https://trueruslan.ru/landing/notes/restart-persistence-is-a-product-contract/',
  );
  assert.equal(
    routes.WWW_NOTE_URL,
    'https://www.trueruslan.ru/landing/notes/restart-persistence-is-a-product-contract/',
  );
  assert.equal(routes.SEARCH_URL, 'https://trueruslan.ru/_search/ru/');
  assert.equal(
    routes.PORTFOLIO_PLATFORM_URL,
    'https://trueruslan.ru/landing/projects/portfolio-platform/',
  );
  assert.equal(
    routes.PORTFOLIO_PLATFORM_EN_URL,
    'https://trueruslan.ru/en/projects/portfolio-platform/',
  );
  assert.equal(
    routes.VILLAIGENCE_URL,
    'https://trueruslan.ru/landing/projects/livingworld/',
  );
  assert.equal(
    routes.VLEZET_URL,
    'https://trueruslan.ru/landing/projects/vlezet/',
  );
  assert.equal(
    routes.VILLAIGENCE_EN_URL,
    'https://trueruslan.ru/en/projects/livingworld/',
  );
});

test('production live smoke preserves explicit legacy route coverage', () => {
  assert.equal(
    routes.LEGACY_NOTE_URL,
    'https://trueruslan.ru/landing/notes/restart-persistence-is-a-product-contract.html',
  );
  assert.notEqual(routes.LEGACY_NOTE_URL, routes.NOTE_URL);
});
