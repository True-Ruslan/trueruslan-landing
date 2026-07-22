import test from 'node:test';
import assert from 'node:assert/strict';

import {
  analyzeContentFreshness,
  renderFreshnessMarkdown,
} from './content-freshness.js';

function project(overrides = {}) {
  return {
    slug: 'livingworld',
    name: 'LivingWorld',
    status: 'release-candidate',
    statusLabel: 'RELEASE CANDIDATE',
    summary: 'summary',
    featured: true,
    active: true,
    visibility: 'public',
    href: 'landing/projects/livingworld.html',
    tags: ['Java', 'AI'],
    links: {github: 'https://github.com/True-Ruslan/minecraft-botics-ai'},
    timeline: 'livingworld',
    ...overrides,
  };
}

function snapshot(overrides = {}) {
  return {
    project: 'livingworld',
    status: 'verified',
    lastVerified: '2026-07-22',
    versions: [],
    signals: [
      {
        kind: 'ci',
        mode: 'automated',
        label: 'CI',
        state: 'green',
        observedAt: '2026-07-22',
        scope: 'Bounded CI scope.',
      },
    ],
    ...overrides,
  };
}

function timeline(entries = null) {
  return entries ?? [
    {date: '2026-07', title: 'Past', description: 'past', state: 'past'},
    {date: '2026-07', title: 'Current', description: 'current', state: 'current'},
    {date: 'NEXT', title: 'Next', description: 'next', state: 'next'},
  ];
}

function run(overrides = {}) {
  return analyzeContentFreshness({
    projects: [project()],
    evidence: [snapshot()],
    timelines: {livingworld: timeline()},
    observations: {repositories: {}, links: {}},
    now: '2026-07-22',
    maxVerifiedAgeDays: 30,
    ...overrides,
  });
}

test('fresh verified snapshot is clean and projects outside evidence scope do not create coverage findings', () => {
  const report = run({
    projects: [
      project(),
      project({
        slug: 'portfolio-platform',
        name: 'Portfolio',
        status: 'production',
        statusLabel: 'PRODUCTION',
        href: 'landing/projects.html',
        links: {github: 'https://github.com/True-Ruslan/trueruslan-landing'},
        timeline: undefined,
      }),
    ],
  });

  assert.deepEqual(report.findings, []);
  assert.deepEqual(report.summary, {total: 0, info: 0, warning: 0, error: 0});
});

test('lastVerified older than threshold creates a maintenance finding, exact boundary stays clean', () => {
  const clean = run({now: '2026-08-21'});
  assert.equal(clean.findings.some((finding) => finding.code === 'evidence-too-old'), false);

  const stale = run({now: '2026-08-22'});
  const finding = stale.findings.find((candidate) => candidate.code === 'evidence-too-old');
  assert.ok(finding);
  assert.equal(finding.project, 'livingworld');
  assert.equal(finding.details.ageDays, 31);
  assert.equal(finding.details.thresholdDays, 30);
});

test('unreachable configured evidence URL becomes an actionable finding', () => {
  const url = 'https://example.test/evidence/1';
  const report = run({
    evidence: [snapshot({
      signals: [{...snapshot().signals[0], url}],
    })],
    observations: {
      repositories: {},
      links: {
        [url]: {status: 'unreachable', httpStatus: 503, error: 'service unavailable'},
      },
    },
  });

  const finding = report.findings.find((candidate) => candidate.code === 'evidence-link-unreachable');
  assert.ok(finding);
  assert.equal(finding.details.url, url);
  assert.equal(finding.details.httpStatus, 503);
});

test('repository activity newer than the controlled snapshot creates drift without changing trust state', () => {
  const report = run({
    observations: {
      repositories: {
        livingworld: {
          url: 'https://github.com/True-Ruslan/minecraft-botics-ai',
          pushedAt: '2026-07-24T12:00:00Z',
        },
      },
      links: {},
    },
  });

  const finding = report.findings.find((candidate) => candidate.code === 'repository-drift');
  assert.ok(finding);
  assert.equal(finding.project, 'livingworld');
  assert.equal(finding.details.lastRecordedDate, '2026-07-22');
  assert.equal(finding.details.repositoryActivityDate, '2026-07-24');
  assert.equal(snapshot().status, 'verified');
});

test('a release newer than evidence is highlighted when registry still says release-candidate', () => {
  const report = run({
    observations: {
      repositories: {
        livingworld: {
          url: 'https://github.com/True-Ruslan/minecraft-botics-ai',
          pushedAt: '2026-07-22T10:00:00Z',
          latestRelease: {
            tagName: '0.2.0',
            publishedAt: '2026-07-25T09:00:00Z',
            url: 'https://github.com/True-Ruslan/minecraft-botics-ai/releases/tag/0.2.0',
          },
        },
      },
      links: {},
    },
  });

  const finding = report.findings.find((candidate) => candidate.code === 'release-candidate-has-new-release');
  assert.ok(finding);
  assert.equal(finding.details.tagName, '0.2.0');
});

test('timeline reference requires exactly one current entry', () => {
  const report = run({
    timelines: {
      livingworld: timeline([
        {date: '2026-07', title: 'A', description: 'a', state: 'current'},
        {date: '2026-07', title: 'B', description: 'b', state: 'current'},
      ]),
    },
  });

  const finding = report.findings.find((candidate) => candidate.code === 'timeline-current-count');
  assert.ok(finding);
  assert.equal(finding.details.currentCount, 2);
});

test('verified snapshot with a newer recorded signal requires re-review', () => {
  const report = run({
    evidence: [snapshot({
      lastVerified: '2026-07-20',
      signals: [{...snapshot().signals[0], observedAt: '2026-07-22'}],
    })],
  });

  const finding = report.findings.find((candidate) => candidate.code === 'verified-signal-after-check');
  assert.ok(finding);
  assert.equal(finding.details.lastVerified, '2026-07-20');
  assert.equal(finding.details.latestSignalDate, '2026-07-22');
});

test('stale and unverified are valid maintenance states and do not create trust-state errors by themselves', () => {
  const staleReport = run({
    evidence: [snapshot({status: 'stale'})],
  });
  assert.equal(staleReport.findings.some((finding) => finding.code === 'invalid-trust-state'), false);

  const unverifiedReport = run({
    evidence: [snapshot({status: 'unverified', lastVerified: undefined, signals: []})],
  });
  assert.equal(unverifiedReport.findings.some((finding) => finding.code === 'invalid-trust-state'), false);
});

test('findings and markdown rendering are deterministic', () => {
  const input = {
    now: '2026-08-30',
    observations: {
      repositories: {
        livingworld: {
          url: 'https://github.com/True-Ruslan/minecraft-botics-ai',
          pushedAt: '2026-08-29T12:00:00Z',
        },
      },
      links: {},
    },
  };

  const first = run(input);
  const second = run(input);
  assert.deepEqual(first, second);
  assert.equal(renderFreshnessMarkdown(first), renderFreshnessMarkdown(second));
  assert.match(renderFreshnessMarkdown(first), /Content Freshness Guard/);
  assert.match(renderFreshnessMarkdown(first), /repository-drift/);
});
