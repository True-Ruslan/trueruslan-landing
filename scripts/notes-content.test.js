import test from 'node:test';
import assert from 'node:assert/strict';

import {
  loadNotesManifest,
  renderAtomFeed,
  renderNoteMeta,
  renderNoteNavigation,
  renderNotesIndex,
  validateNotesManifest,
} from './notes-content.js';

const notes = [
  {
    slug: 'first-note',
    title: 'First & note',
    description: 'A <useful> note.',
    published: '2026-07-20',
    updated: '2026-07-21',
    readingMinutes: 5,
    tags: ['Architecture', 'CI'],
    related: ['second-note'],
    series: 'evidence-verification',
    seriesOrder: 1,
    readerRole: 'start',
  },
  {
    slug: 'second-note',
    title: 'Second note',
    description: 'Another note.',
    published: '2026-07-20',
    updated: '2026-07-22',
    readingMinutes: 7,
    tags: ['AI'],
    related: ['first-note'],
    series: 'evidence-verification',
    seriesOrder: 2,
    readerRole: 'path',
  },
];

const expectedSeries = {
  'evidence-verification': [
    'green-ci-is-not-product-verification',
    'static-site-quality-gates',
    'source-tests-to-installed-acceptance',
    'gametests-vs-installed-gameplay-acceptance',
    'restart-persistence-is-a-product-contract',
    'deployment-success-is-not-production-verification',
    'passive-pdf-validation-vs-semantic-completeness',
    'evidence-driven-project-state',
  ],
  'ai-authority-protocols': [
    'server-authoritative-ai-npcs',
    'llm-output-is-a-protocol-boundary',
    'probabilistic-proposals-deterministic-authority',
    'hybrid-cv-ai-recognition-boundaries',
  ],
  'static-first-web': [
    'portfolio-runtime-boundary',
    'static-first-sources-no-js',
    'intersection-observer-giant-table',
    'clean-urls-without-cloudflare-routing',
  ],
};

const auditedZeroInboundDeepDives = [
  'clean-urls-without-cloudflare-routing',
  'hybrid-cv-ai-recognition-boundaries',
  'gametests-vs-installed-gameplay-acceptance',
  'evidence-driven-project-state',
];

test('validateNotesManifest rejects invalid dates and unknown related notes', () => {
  assert.throws(
    () => validateNotesManifest([{...notes[0], updated: 'yesterday'}, notes[1]], {requireFiles: false}),
    /invalid note date/,
  );
  assert.throws(
    () => validateNotesManifest([{...notes[0], related: ['missing']}, notes[1]], {requireFiles: false}),
    /unknown slug/,
  );
});

test('validateNotesManifest fails closed on invalid reader architecture metadata', () => {
  assert.throws(
    () => validateNotesManifest([{...notes[0], series: 'unknown-series'}, notes[1]], {requireFiles: false}),
    /invalid note series/,
  );
  assert.throws(
    () => validateNotesManifest([{...notes[0], seriesOrder: 0}, notes[1]], {requireFiles: false}),
    /invalid seriesOrder/,
  );
  assert.throws(
    () => validateNotesManifest([{...notes[0], readerRole: 'featured'}, notes[1]], {requireFiles: false}),
    /invalid readerRole/,
  );
  assert.throws(
    () => validateNotesManifest([notes[0], {...notes[1], seriesOrder: 1}], {requireFiles: false}),
    /duplicate seriesOrder/,
  );
  assert.throws(
    () => validateNotesManifest([notes[0], {...notes[1], readerRole: 'start'}], {requireFiles: false}),
    /exactly one start note/,
  );
});

test('renderNoteMeta exposes reading time, dates and escaped tags', () => {
  const html = renderNoteMeta({...notes[0], tags: ['<CI>']});
  assert.match(html, /5 мин/);
  assert.match(html, /datetime="2026-07-20"/);
  assert.match(html, /&lt;CI&gt;/);
});

test('renderNoteNavigation includes previous next and related links', () => {
  const html = renderNoteNavigation(notes[1], notes);
  assert.match(html, /first-note\.html/);
  assert.match(html, /Связанные заметки/);
});

test('renderNotesIndex keeps the complete registry-derived catalogue latest-first and compact', () => {
  const html = renderNotesIndex(notes);
  assert.equal((html.match(/data-tr-note-index-card=/g) ?? []).length, 2);
  const catalogueStart = html.indexOf('data-tr-notes-catalogue');
  const secondCard = html.indexOf('data-tr-note-index-card="second-note"', catalogueStart);
  const firstCard = html.indexOf('data-tr-note-index-card="first-note"', catalogueStart);
  assert.ok(catalogueStart >= 0);
  assert.ok(secondCard >= 0 && firstCard >= 0 && secondCard < firstCard);
  assert.match(html, /Another note\./);
  assert.match(html, /7 мин/);
  assert.match(html, /datetime="2026-07-22"/);
  assert.match(html, /landing\/notes\/second-note\.html/);
  assert.match(html, /First &amp; note/);
  assert.match(html, /A &lt;useful&gt; note\./);
  assert.doesNotMatch(html, /First & note|A <useful> note/);
});

test('renderAtomFeed is deterministic, ordered by update date and XML-safe', () => {
  const first = renderAtomFeed(notes, 'https://example.test/site/');
  const second = renderAtomFeed(notes, 'https://example.test/site/');
  assert.equal(first, second);
  assert.match(first, /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom">/);
  assert.ok(first.indexOf('second-note.html') < first.indexOf('first-note.html'));
  assert.match(first, /First &amp; note/);
  assert.match(first, /A &lt;useful&gt; note\./);
  assert.doesNotMatch(first, /First & note/);
});

test('canonical notes include the grounded Engineering Notes milestones', () => {
  const requiredGroundedNotes = [
    'intersection-observer-giant-table',
    'static-first-sources-no-js',
    'green-ci-is-not-product-verification',
    'llm-output-is-a-protocol-boundary',
    'source-tests-to-installed-acceptance',
    'probabilistic-proposals-deterministic-authority',
    'deployment-success-is-not-production-verification',
  ];
  const canonicalNotes = loadNotesManifest();

  for (const slug of requiredGroundedNotes) {
    assert.ok(
      canonicalNotes.some((note) => note.slug === slug),
      `missing grounded Engineering Note: ${slug}`,
    );
  }
});

test('canonical notes match the approved three-series reader architecture exactly', () => {
  const canonicalNotes = loadNotesManifest();
  assert.equal(canonicalNotes.length, 16);

  const actualSeries = Object.fromEntries(
    Object.keys(expectedSeries).map((series) => [
      series,
      canonicalNotes
        .filter((note) => note.series === series)
        .sort((a, b) => a.seriesOrder - b.seriesOrder)
        .map((note) => note.slug),
    ]),
  );
  assert.deepEqual(actualSeries, expectedSeries);

  for (const [series, slugs] of Object.entries(expectedSeries)) {
    const members = canonicalNotes
      .filter((note) => note.series === series)
      .sort((a, b) => a.seriesOrder - b.seriesOrder);
    assert.deepEqual(members.map((note) => note.seriesOrder), slugs.map((_, index) => index + 1));
    assert.equal(members.filter((note) => note.readerRole === 'start').length, 1, `${series} must have one start note`);
    assert.equal(members[0].readerRole, 'start', `${series} first note must be the start note`);
    assert.ok(members.slice(1).every((note) => note.readerRole === 'path'), `${series} later notes must be path notes`);
  }
});

test('canonical related-reading graph gives every note meaningful inbound and outbound paths', () => {
  const canonicalNotes = loadNotesManifest();
  const inbound = new Map(canonicalNotes.map((note) => [note.slug, 0]));

  for (const note of canonicalNotes) {
    assert.ok(note.related.length >= 1, `${note.slug} must keep at least one outbound related edge`);
    for (const relatedSlug of note.related) inbound.set(relatedSlug, inbound.get(relatedSlug) + 1);
  }

  for (const note of canonicalNotes) {
    assert.ok(inbound.get(note.slug) >= 1, `${note.slug} must have at least one inbound related edge`);
  }
  for (const slug of auditedZeroInboundDeepDives) {
    assert.ok(inbound.get(slug) >= 1, `${slug} must gain an intentional inbound related edge`);
  }
});

test('canonical Notes hub renders Start here, three guided series and the complete catalogue', () => {
  const canonicalNotes = loadNotesManifest();
  const html = renderNotesIndex(canonicalNotes);

  assert.equal((html.match(/data-tr-notes-start-here(?:=|\s|>)/g) ?? []).length, 1);
  assert.equal((html.match(/data-tr-notes-start-choice=/g) ?? []).length, 3);
  assert.equal((html.match(/data-tr-notes-series=/g) ?? []).length, 3);
  assert.equal((html.match(/data-tr-notes-series-note=/g) ?? []).length, 16);
  assert.equal((html.match(/data-tr-notes-catalogue(?:=|\s|>)/g) ?? []).length, 1);
  assert.equal((html.match(/data-tr-note-index-card=/g) ?? []).length, 16);
  assert.match(html, /С чего начать/);
  assert.match(html, /Все заметки/);

  for (const [series, slugs] of Object.entries(expectedSeries)) {
    assert.match(html, new RegExp(`data-tr-notes-series="${series}"`));
    for (const slug of slugs) {
      assert.equal(
        (html.match(new RegExp(`data-tr-notes-series-note="${slug}"`, 'g')) ?? []).length,
        1,
        `${slug} must appear exactly once in guided series`,
      );
      assert.match(html, new RegExp(`href="landing/notes/${slug}\\.html"`));
    }
  }

  const startSlugs = Object.values(expectedSeries).map(([slug]) => slug);
  for (const slug of startSlugs) {
    assert.match(html, new RegExp(`data-tr-notes-start-choice="[^"]+"[\\s\\S]*?href="landing/notes/${slug}\\.html"`));
  }
});
