import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {loadAiConfig, validateAiConfig} from './ai-config.js';

const valid = Object.freeze({
  schemaVersion: 1,
  mode: 'off',
  workerBaseUrl: '',
  embeddingModel: 'openai/text-embedding-3-small',
  embeddingDimensions: 512,
  answerModel: 'google/gemini-2.5-flash-lite',
  maxQueryChars: 500,
  maxResults: 5,
  answerMaxChunks: 5,
  answerMaxContextChars: 18000,
  answerMaxTokens: 700,
  includePagePaths: [
    'landing/projects.html',
    'landing/projects/vlezet.html',
    'landing/projects/livingworld.html',
    'landing/projects/notchhub.html',
    'landing/projects/portfolio-platform.html',
    'landing/about.html',
    'landing/resume.html',
    'landing/now.html',
    'landing/work-with-me.html',
    'landing/publications.html',
    'en/projects.html',
    'en/projects/vlezet.html',
    'en/projects/livingworld.html',
    'en/projects/notchhub.html',
    'en/projects/portfolio-platform.html',
    'en/about.html',
    'en/resume.html',
    'en/now.html',
    'en/work-with-me.html',
    'en/publications.html',
  ],
  hybridWeights: null,
});

function clone(value = valid) {
  return structuredClone(value);
}

function writeConfig(value) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-ai-config-'));
  const filePath = path.join(dir, 'ai-navigator.json');
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return filePath;
}

test('AI Navigator config accepts the pinned off-mode contract', () => {
  assert.doesNotThrow(() => validateAiConfig(clone()));
  const config = loadAiConfig(writeConfig(valid));
  assert.deepEqual(config, valid);
  assert.notEqual(config, valid);
});

test('AI Navigator config rejects unknown fields and modes', () => {
  const unknown = clone();
  unknown.surprise = true;
  assert.throws(() => validateAiConfig(unknown), /unknown.*surprise/i);

  const mode = clone();
  mode.mode = 'auto';
  assert.throws(() => validateAiConfig(mode), /mode/i);
});

test('AI Navigator config rejects unsafe worker URLs and unpinned models', () => {
  const worker = clone();
  worker.workerBaseUrl = 'http://example.test';
  assert.throws(() => validateAiConfig(worker), /https/i);

  for (const [field, value] of [
    ['embeddingModel', 'openai/text-embedding-3-large'],
    ['answerModel', 'openai/gpt-5'],
  ]) {
    const changed = clone();
    changed[field] = value;
    assert.throws(() => validateAiConfig(changed), new RegExp(field, 'i'));
  }
});

test('AI Navigator config requires positive integer bounds', () => {
  for (const field of [
    'embeddingDimensions',
    'maxQueryChars',
    'maxResults',
    'answerMaxChunks',
    'answerMaxContextChars',
    'answerMaxTokens',
  ]) {
    for (const value of [0, -1, 1.5, '5']) {
      const changed = clone();
      changed[field] = value;
      assert.throws(() => validateAiConfig(changed), new RegExp(field, 'i'));
    }
  }
});

test('enabled AI modes require normalized benchmark-selected hybrid weights', () => {
  for (const mode of ['search', 'full']) {
    const missing = clone();
    missing.mode = mode;
    missing.workerBaseUrl = 'https://ai.example.workers.dev';
    assert.throws(() => validateAiConfig(missing), /hybridWeights/i);

    const validEnabled = clone();
    validEnabled.mode = mode;
    validEnabled.workerBaseUrl = 'https://ai.example.workers.dev';
    validEnabled.hybridWeights = {
      semantic: 0.65,
      lexical: 0.20,
      title: 0.10,
      language: 0.05,
    };
    assert.doesNotThrow(() => validateAiConfig(validEnabled));
  }

  const invalid = clone();
  invalid.mode = 'search';
  invalid.workerBaseUrl = 'https://ai.example.workers.dev';
  invalid.hybridWeights = {
    semantic: 0.7,
    lexical: 0.2,
    title: 0.1,
    language: 0.1,
  };
  assert.throws(() => validateAiConfig(invalid), /sum.*1|weights/i);
});

test('AI Navigator includePagePaths are unique repository-relative HTML routes', () => {
  const duplicate = clone();
  duplicate.includePagePaths.push(duplicate.includePagePaths[0]);
  assert.throws(() => validateAiConfig(duplicate), /includePagePaths/i);

  for (const value of ['/absolute.html', '../escape.html', 'landing/projects.md']) {
    const changed = clone();
    changed.includePagePaths = [value];
    assert.throws(() => validateAiConfig(changed), /includePagePaths/i);
  }
});
