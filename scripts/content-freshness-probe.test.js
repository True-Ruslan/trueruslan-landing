import test from 'node:test';
import assert from 'node:assert/strict';

import {
  collectEvidenceUrls,
  parseGitHubRepoUrl,
  probeFreshnessObservations,
} from './content-freshness-probe.js';

test('parseGitHubRepoUrl accepts canonical repository URLs and rejects non-repository URLs', () => {
  assert.deepEqual(
    parseGitHubRepoUrl('https://github.com/True-Ruslan/minecraft-botics-ai'),
    {owner: 'True-Ruslan', repo: 'minecraft-botics-ai'},
  );
  assert.deepEqual(
    parseGitHubRepoUrl('https://github.com/True-Ruslan/minecraft-botics-ai/'),
    {owner: 'True-Ruslan', repo: 'minecraft-botics-ai'},
  );
  assert.equal(parseGitHubRepoUrl('https://example.com/repo'), null);
  assert.equal(parseGitHubRepoUrl('https://github.com/True-Ruslan'), null);
  assert.equal(parseGitHubRepoUrl('https://github.com/True-Ruslan/repo/issues/1'), null);
});

test('collectEvidenceUrls deduplicates only explicitly configured signal URLs', () => {
  const evidence = [
    {
      project: 'a',
      signals: [
        {url: 'https://example.test/evidence/1'},
        {url: 'https://example.test/evidence/1'},
        {},
      ],
    },
    {
      project: 'b',
      signals: [{url: 'https://example.test/evidence/2'}],
    },
  ];

  assert.deepEqual(collectEvidenceUrls(evidence), [
    'https://example.test/evidence/1',
    'https://example.test/evidence/2',
  ]);
});

test('probe normalizes repository metadata, latest release and evidence link status', async () => {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({url, options});
    if (url === 'https://api.github.com/repos/True-Ruslan/minecraft-botics-ai') {
      return {
        ok: true,
        status: 200,
        async json() {
          return {pushed_at: '2026-07-24T12:00:00Z', html_url: 'https://github.com/True-Ruslan/minecraft-botics-ai'};
        },
      };
    }
    if (url === 'https://api.github.com/repos/True-Ruslan/minecraft-botics-ai/releases/latest') {
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            tag_name: '0.2.0',
            published_at: '2026-07-25T09:00:00Z',
            html_url: 'https://github.com/True-Ruslan/minecraft-botics-ai/releases/tag/0.2.0',
          };
        },
      };
    }
    if (url === 'https://example.test/evidence/1') {
      return {ok: true, status: 200};
    }
    throw new Error(`unexpected URL ${url}`);
  };

  const result = await probeFreshnessObservations({
    projects: [
      {
        slug: 'livingworld',
        links: {github: 'https://github.com/True-Ruslan/minecraft-botics-ai'},
      },
      {
        slug: 'private-without-link',
      },
    ],
    evidence: [
      {project: 'livingworld', signals: [{url: 'https://example.test/evidence/1'}]},
    ],
    fetchImpl,
    token: 'secret-token',
    now: '2026-07-26T00:00:00Z',
  });

  assert.equal(result.generatedAt, '2026-07-26T00:00:00.000Z');
  assert.deepEqual(result.repositories.livingworld, {
    url: 'https://github.com/True-Ruslan/minecraft-botics-ai',
    pushedAt: '2026-07-24T12:00:00Z',
    latestRelease: {
      tagName: '0.2.0',
      publishedAt: '2026-07-25T09:00:00Z',
      url: 'https://github.com/True-Ruslan/minecraft-botics-ai/releases/tag/0.2.0',
    },
  });
  assert.deepEqual(result.links['https://example.test/evidence/1'], {status: 'ok', httpStatus: 200});
  assert.equal(Object.hasOwn(result.repositories, 'private-without-link'), false);
  assert.ok(calls.some((call) => call.options.headers?.Authorization === 'Bearer secret-token'));
});

test('probe turns network and HTTP failures into bounded observations instead of throwing', async () => {
  const fetchImpl = async (url) => {
    if (url.includes('/repos/True-Ruslan/repo/releases/latest')) return {ok: false, status: 404};
    if (url.includes('/repos/True-Ruslan/repo')) throw new Error('network down');
    if (url === 'https://example.test/broken') return {ok: false, status: 503};
    throw new Error(`unexpected ${url}`);
  };

  const result = await probeFreshnessObservations({
    projects: [{slug: 'project', links: {github: 'https://github.com/True-Ruslan/repo'}}],
    evidence: [{project: 'project', signals: [{url: 'https://example.test/broken'}]}],
    fetchImpl,
    now: '2026-07-26T00:00:00Z',
  });

  assert.equal(result.repositories.project.status, 'unavailable');
  assert.match(result.repositories.project.error, /network down/);
  assert.deepEqual(result.links['https://example.test/broken'], {status: 'unreachable', httpStatus: 503});
});
