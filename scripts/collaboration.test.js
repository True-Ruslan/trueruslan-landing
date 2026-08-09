import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'collaboration.json');
const MODULE_PATH = path.join(__dirname, 'collaboration.js');

const EXPECTED_TARGETS = Object.freeze({
  'landing/projects/portfolio-platform.html': 'engineering',
  'landing/projects/notchhub.html': 'engineering',
  'landing/notes/deployment-success-is-not-production-verification.html': 'engineering',
  'landing/notes/server-authoritative-ai-npcs.html': 'ai-integration',
});

test('canonical collaboration manifest matches the approved private-practice boundary', () => {
  assert.equal(fs.existsSync(DATA_PATH), true, 'data/collaboration.json must exist');
  const value = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  assert.deepEqual(value, {
    updated: '2026-08-08',
    availability: {
      engineering: 'limited',
      education: 'limited',
    },
    contact: {
      telegram: 'https://t.me/TrueRuslan',
      email: 'ruslan.nemikin@gmail.com',
    },
    pricing: 'estimate-only',
    legalFormat: 'self-employed-receipt-supported',
    contextualTargets: EXPECTED_TARGETS,
  });
});

test('collaboration validator is fail-closed for state, policy, contacts and contextual targets', async () => {
  assert.equal(fs.existsSync(MODULE_PATH), true, 'scripts/collaboration.js must exist');
  const {
    AVAILABILITY_VALUES,
    COLLABORATION_CATEGORIES,
    loadCollaboration,
    resolveContextualCollaboration,
    validateCollaboration,
  } = await import(pathToFileURL(MODULE_PATH).href);

  assert.deepEqual(AVAILABILITY_VALUES, ['available', 'limited', 'consulting-only', 'unavailable']);
  assert.deepEqual(COLLABORATION_CATEGORIES, ['engineering', 'ai-integration', 'education', 'expert-content']);

  const valid = loadCollaboration(DATA_PATH);
  assert.equal(valid.availability.engineering, 'limited');
  assert.equal(valid.availability.education, 'limited');
  assert.deepEqual(resolveContextualCollaboration(valid, 'landing/projects/notchhub.html'), {
    target: 'landing/projects/notchhub.html',
    category: 'engineering',
  });
  assert.equal(resolveContextualCollaboration(valid, 'landing/about.html'), null);

  assert.throws(
    () => validateCollaboration({...valid, availability: {...valid.availability, engineering: 'busy'}}),
    /unknown collaboration availability/i,
  );
  assert.throws(
    () => validateCollaboration({...valid, pricing: 'hourly-public'}),
    /unsupported collaboration pricing policy/i,
  );
  assert.throws(
    () => validateCollaboration({...valid, contact: {...valid.contact, telegram: 'http://t.me/TrueRuslan'}}),
    /invalid collaboration Telegram/i,
  );
  assert.throws(
    () => validateCollaboration({...valid, contact: {...valid.contact, email: 'not-an-email'}}),
    /invalid collaboration email/i,
  );
  assert.throws(
    () => validateCollaboration({...valid, contextualTargets: {'../unsafe.html': 'engineering'}}),
    /unsafe collaboration target/i,
  );
  assert.throws(
    () => validateCollaboration({...valid, contextualTargets: {'landing/projects/notchhub.html': 'sales'}}),
    /unknown collaboration category/i,
  );
});
