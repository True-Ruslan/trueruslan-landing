import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  normalizePublicationReceipt,
  renderPublicationReceiptMarkdown,
  writePublicationReceipt,
} from './launch-publication-receipt.js';

function targets() {
  return [
    {
      id: 'home',
      priority: 1,
      canonicalUrl: 'https://trueruslan.ru/',
      title: 'Руслан Немыкин — Backend Engineer',
      displayTitle: 'Руслан Немыкин',
      framing: 'Персональная инженерная платформа.',
      evidenceBoundary: 'Не является заявлением об охвате или найме.',
      audiences: ['recruiter', 'engineer', 'general'],
      channels: ['github', 'habr', 'telegram', 'direct'],
    },
    {
      id: 'projects',
      priority: 2,
      canonicalUrl: 'https://trueruslan.ru/projects/',
      title: 'Проекты — Руслан Немыкин',
      displayTitle: 'Проекты',
      framing: 'Каталог инженерных case studies.',
      evidenceBoundary: 'Lifecycle каждого проекта принадлежит canonical evidence.',
      audiences: ['recruiter', 'engineer'],
      channels: ['github', 'telegram', 'direct'],
    },
  ];
}

function input() {
  return {
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
      {
        targetId: 'projects',
        channel: 'github',
        canonicalUrl: 'https://trueruslan.ru/projects/',
        publicationUrl: 'https://github.com/True-Ruslan',
        publishedAt: '2026-08-21T00:25:00.000Z',
      },
    ],
  };
}

test('normalizes only operator-supplied public publication observations without promoting product or measurement state', () => {
  const receipt = normalizePublicationReceipt({
    input: input(),
    targets: targets(),
    now: new Date('2026-08-21T00:40:00.000Z'),
  });

  assert.equal(receipt.schemaVersion, 1);
  assert.equal(receipt.evidenceClass, 'operator-supplied-publication-receipt');
  assert.equal(receipt.verificationState, 'operator-supplied-not-independently-fetched');
  assert.equal(receipt.stateImpact, 'none');
  assert.equal(receipt.observationCount, 2);
  assert.equal(receipt.observedAt, '2026-08-21T00:30:00.000Z');
  assert.deepEqual(
    receipt.publications.map(({targetId, channel}) => `${targetId}:${channel}`),
    ['home:telegram', 'projects:github'],
  );

  for (const publication of receipt.publications) {
    assert.match(publication.canonicalUrl, /^https:\/\/trueruslan\.ru\//);
    assert.equal(publication.publicationState, 'operator-reported-published');
    assert.equal(publication.verificationState, 'operator-supplied-not-independently-fetched');
    assert.ok(publication.evidenceBoundary);
    assert.doesNotMatch(JSON.stringify(publication), /clicks|impressions|ctr|ranking|engagement|conversion/i);
  }
});

test('fails closed on direct sharing, disallowed channels, canonical drift and mismatched public hosts', () => {
  const direct = input();
  direct.publications = [{...direct.publications[0], channel: 'direct', publicationUrl: 'https://t.me/TrueRuslan_Blog/123'}];
  assert.throws(
    () => normalizePublicationReceipt({input: direct, targets: targets(), now: new Date('2026-08-21T00:40:00.000Z')}),
    /direct|public publication evidence/i,
  );

  const disallowed = input();
  disallowed.publications = [{...disallowed.publications[1], channel: 'habr', publicationUrl: 'https://habr.com/ru/articles/1065768/'}];
  assert.throws(
    () => normalizePublicationReceipt({input: disallowed, targets: targets(), now: new Date('2026-08-21T00:40:00.000Z')}),
    /allowed|channel/i,
  );

  const canonicalDrift = input();
  canonicalDrift.publications = [{...canonicalDrift.publications[0], canonicalUrl: 'https://trueruslan.ru/resume/'}];
  assert.throws(
    () => normalizePublicationReceipt({input: canonicalDrift, targets: targets(), now: new Date('2026-08-21T00:40:00.000Z')}),
    /canonical/i,
  );

  const hostMismatch = input();
  hostMismatch.publications = [{...hostMismatch.publications[0], publicationUrl: 'https://example.com/post/123'}];
  assert.throws(
    () => normalizePublicationReceipt({input: hostMismatch, targets: targets(), now: new Date('2026-08-21T00:40:00.000Z')}),
    /host|telegram/i,
  );
});

test('fails closed on tracking URLs, duplicate target-channel observations, unknown keys and impossible timestamps', () => {
  const tracked = input();
  tracked.publications = [{...tracked.publications[0], publicationUrl: 'https://t.me/TrueRuslan_Blog/123?utm_source=test'}];
  assert.throws(
    () => normalizePublicationReceipt({input: tracked, targets: targets(), now: new Date('2026-08-21T00:40:00.000Z')}),
    /query|tracking|URL/i,
  );

  const duplicate = input();
  duplicate.publications.push({...duplicate.publications[0], publicationUrl: 'https://t.me/TrueRuslan_Blog/124'});
  assert.throws(
    () => normalizePublicationReceipt({input: duplicate, targets: targets(), now: new Date('2026-08-21T00:40:00.000Z')}),
    /duplicate/i,
  );

  const unknown = input();
  unknown.publications[0].impressions = 1000;
  assert.throws(
    () => normalizePublicationReceipt({input: unknown, targets: targets(), now: new Date('2026-08-21T00:40:00.000Z')}),
    /unknown|unsupported/i,
  );

  const impossible = input();
  impossible.publications[0].publishedAt = '2026-08-21T00:35:00.000Z';
  impossible.observedAt = '2026-08-21T00:30:00.000Z';
  assert.throws(
    () => normalizePublicationReceipt({input: impossible, targets: targets(), now: new Date('2026-08-21T00:40:00.000Z')}),
    /publishedAt|observedAt|after/i,
  );

  const future = input();
  future.observedAt = '2026-08-21T01:00:00.000Z';
  assert.throws(
    () => normalizePublicationReceipt({input: future, targets: targets(), now: new Date('2026-08-21T00:40:00.000Z')}),
    /future|observedAt/i,
  );
});

test('renders an explicit evidence boundary and keeps search-performance conclusions out of the receipt', () => {
  const receipt = normalizePublicationReceipt({
    input: input(),
    targets: targets(),
    now: new Date('2026-08-21T00:40:00.000Z'),
  });
  const markdown = renderPublicationReceiptMarkdown(receipt);

  assert.match(markdown, /^# Controlled Launch Publication Receipt$/m);
  assert.match(markdown, /operator-supplied-not-independently-fetched/);
  assert.match(markdown, /does not prove reach, clicks, engagement, ranking, SEO impact, hiring or product impact/i);
  assert.match(markdown, /P4\.1B|P3\.6/);
  assert.match(markdown, /https:\/\/t\.me\/TrueRuslan_Blog\/123/);
  assert.doesNotMatch(markdown, /P4\.1B.*(?:DONE|ACCEPTED)|P3\.6.*(?:DONE|ACCEPTED)/i);
});

test('writes normalized receipt artifacts with SHA-256 provenance while keeping the raw operator input private', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launch-publication-receipt-'));
  const inputPath = path.join(tempDir, 'operator-receipt.json');
  const outputDir = path.join(tempDir, 'output');
  const raw = `${JSON.stringify(input(), null, 2)}\n`;
  fs.writeFileSync(inputPath, raw, 'utf8');

  try {
    const result = writePublicationReceipt({
      inputPath,
      outputDir,
      targets: targets(),
      now: new Date('2026-08-21T00:40:00.000Z'),
    });

    assert.equal(result.receipt.sourceSha256, crypto.createHash('sha256').update(raw).digest('hex'));
    assert.equal(path.basename(result.jsonPath), 'controlled-launch-publication-receipt.json');
    assert.equal(path.basename(result.markdownPath), 'controlled-launch-publication-receipt.md');
    assert.equal(fs.existsSync(result.jsonPath), true);
    assert.equal(fs.existsSync(result.markdownPath), true);
    assert.equal(fs.existsSync(path.join(outputDir, 'operator-receipt.json')), false);
    assert.match(fs.readFileSync(result.markdownPath, 'utf8'), /SHA-256 provenance/i);
  } finally {
    fs.rmSync(tempDir, {recursive: true, force: true});
  }
});
