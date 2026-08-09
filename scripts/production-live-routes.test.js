import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const routes = require('./production-live-routes.cjs');

test('production live smoke uses projected clean canonical routes', () => {
  assert.equal(
    routes.NOTE_URL,
    'https://trueruslan.ru/notes/restart-persistence-is-a-product-contract/',
  );
  assert.equal(
    routes.WWW_NOTE_URL,
    'https://www.trueruslan.ru/notes/restart-persistence-is-a-product-contract/',
  );
  assert.equal(
    routes.DEPLOYMENT_VERIFICATION_NOTE_URL,
    'https://trueruslan.ru/notes/deployment-success-is-not-production-verification/',
  );
  assert.equal(
    routes.CLEAN_URLS_NOTE_URL,
    'https://trueruslan.ru/notes/clean-urls-without-cloudflare-routing/',
  );
  assert.equal(
    routes.HYBRID_RECOGNITION_NOTE_URL,
    'https://trueruslan.ru/notes/hybrid-cv-ai-recognition-boundaries/',
  );
  assert.equal(routes.SEARCH_URL, 'https://trueruslan.ru/_search/ru/');
  assert.equal(routes.RESUME_URL, 'https://trueruslan.ru/resume/');
  assert.equal(routes.NOW_URL, 'https://trueruslan.ru/now/');
  assert.equal(routes.PUBLICATIONS_URL, 'https://trueruslan.ru/publications/');
  assert.equal(routes.WORK_WITH_ME_URL, 'https://trueruslan.ru/work-with-me/');
  assert.equal(routes.WORK_WITH_ME_EN_URL, 'https://trueruslan.ru/en/work-with-me/');
  assert.equal(routes.CONTACTS_URL, 'https://trueruslan.ru/contacts/');
  assert.equal(
    routes.PORTFOLIO_PLATFORM_URL,
    'https://trueruslan.ru/projects/portfolio-platform/',
  );
  assert.equal(
    routes.PORTFOLIO_PLATFORM_EN_URL,
    'https://trueruslan.ru/en/projects/portfolio-platform/',
  );
  assert.equal(
    routes.VILLAIGENCE_URL,
    'https://trueruslan.ru/projects/livingworld/',
  );
  assert.equal(
    routes.VLEZET_URL,
    'https://trueruslan.ru/projects/vlezet/',
  );
  assert.equal(
    routes.NOTCHHUB_URL,
    'https://trueruslan.ru/projects/notchhub/',
  );
  assert.equal(
    routes.VILLAIGENCE_EN_URL,
    'https://trueruslan.ru/en/projects/livingworld/',
  );
  assert.equal(
    routes.VLEZET_EN_URL,
    'https://trueruslan.ru/en/projects/vlezet/',
  );
});

test('production live smoke preserves explicit legacy directory and html route coverage', () => {
  assert.equal(
    routes.LEGACY_NOTE_DIRECTORY_URL,
    'https://trueruslan.ru/landing/notes/restart-persistence-is-a-product-contract/',
  );
  assert.equal(
    routes.LEGACY_NOTE_URL,
    'https://trueruslan.ru/landing/notes/restart-persistence-is-a-product-contract.html',
  );
  assert.notEqual(routes.LEGACY_NOTE_DIRECTORY_URL, routes.NOTE_URL);
  assert.notEqual(routes.LEGACY_NOTE_URL, routes.NOTE_URL);
});