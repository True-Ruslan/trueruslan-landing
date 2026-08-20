import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {writePublicationReceipt} from './launch-publication-receipt.js';

test('default intake resolves the real canonical distribution registry without external I/O', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launch-publication-registry-'));
  const inputPath = path.join(tempDir, 'operator-receipt.json');
  const outputDir = path.join(tempDir, 'output');
  fs.writeFileSync(inputPath, `${JSON.stringify({
    schemaVersion: 1,
    observedAt: '2026-08-21T00:30:00.000Z',
    publications: [
      {
        targetId: 'home',
        channel: 'telegram',
        canonicalUrl: 'https://trueruslan.ru/',
        publicationUrl: 'https://t.me/TrueRuslan_Blog/123',
        publishedAt: '2026-08-21T00:20:00.000Z',
      },
    ],
  }, null, 2)}\n`, 'utf8');

  try {
    const result = writePublicationReceipt({
      inputPath,
      outputDir,
      now: new Date('2026-08-21T00:40:00.000Z'),
    });

    assert.equal(result.receipt.observationCount, 1);
    assert.equal(result.receipt.publications[0].targetId, 'home');
    assert.equal(result.receipt.publications[0].targetPriority, 1);
    assert.equal(result.receipt.publications[0].canonicalUrl, 'https://trueruslan.ru/');
    assert.equal(result.receipt.publications[0].channel, 'telegram');
    assert.match(result.receipt.publications[0].title, /Руслан Немыкин/);
    assert.match(result.receipt.publications[0].evidenceBoundary, /охвате|canonical|публич/i);
    assert.equal(result.receipt.verificationState, 'operator-supplied-not-independently-fetched');
    assert.equal(result.receipt.stateImpact, 'none');
  } finally {
    fs.rmSync(tempDir, {recursive: true, force: true});
  }
});
