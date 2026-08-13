import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadNotesManifest} from './notes-content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'docs', 'research', '2026-08-12-engineering-notes-content-seo-audit.md');
const report = fs.readFileSync(REPORT_PATH, 'utf8');
const notes = loadNotesManifest();

const DISPOSITIONS = Object.freeze([
  'keep as-is',
  'keep URL, strengthen intro/summary',
  'keep URL, group into explicit series/hub',
  'expand with examples/evidence',
  'merge candidate only with concrete duplication rationale + migration plan',
]);

test('N5 report covers every registered Note with exactly one approved primary disposition', () => {
  assert.equal(notes.length, 16);

  for (const note of notes) {
    const route = `/landing/notes/${note.slug}/`;
    const row = report.split('\n').find((line) => line.includes(route));
    assert.ok(row, `${note.slug}: missing per-note decision row`);

    const matches = DISPOSITIONS.filter((disposition) => row.includes(`**${disposition}**`));
    assert.equal(matches.length, 1, `${note.slug}: expected exactly one approved disposition, got ${matches.join(', ') || 'none'}`);
  }
});

test('N5 report preserves all Note URLs and rejects structural consolidation in this audit', () => {
  assert.match(report, /KEEP ALL CURRENT NOTE URLS/);
  assert.match(report, /NO MERGE/);
  assert.match(report, /NO REDIRECT/);
  assert.match(report, /NO CANONICAL CONSOLIDATION/);
  assert.match(report, /NO SEO IMPACT CLAIM/);
  assert.match(report, /reader architecture before URL architecture/i);
});

test('N5 report keeps pre-launch search evidence bounded', () => {
  assert.match(report, /1 click \/ 8 impressions/);
  assert.match(report, /no exposed query rows/i);
  assert.match(report, /IN PROGRESS \/ SPARSE PRE-LAUNCH BASELINE/);
  assert.match(report, /P4\.1C: `WAITING`/);
  assert.match(report, /P3\.6: `NEXT \/ WAITING FOR EXTERNAL EVIDENCE`/);
  assert.match(report, /2026-08-05T00:00:00Z/);
});

test('N5 report cites only primary Google and Yandex guidance for the external SEO research section', () => {
  const required = [
    'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
    'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls',
    'https://developers.google.com/search/docs/crawling-indexing/links-crawlable',
    'https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes',
    'https://yandex.com/support/webmaster/en/yandex-indexing/about-doubles',
    'https://yandex.com/support/webmaster/en/recommendations/site-structure',
  ];
  for (const url of required) assert.ok(report.includes(url), `missing primary research source: ${url}`);
});

test('N5 report records the deterministic inventory and selected non-destructive implementation scope', () => {
  assert.match(report, /\| Registered Notes \| 16 \|/);
  assert.match(report, /\| Approx\. prose words \| 17,351 \|/);
  assert.match(report, /\| `##\+` headings \| 174 \|/);
  assert.match(report, /Priority 1 — Start here \+ series metadata\/hub/);
  assert.match(report, /Priority 2 — Intentional related-reading graph/);
  assert.match(report, /Priority 3 — Differentiate six scan summaries\/intros/);
  assert.match(report, /Priority 4 — Post-launch evidence review, not pre-launch consolidation/);
});
