import assert from 'node:assert/strict';
import test from 'node:test';

import pageMeta from '../data/page-meta.json' with {type: 'json'};
import projects from '../data/projects.json' with {type: 'json'};
import rawTargets from '../data/distribution-targets.json' with {type: 'json'};
import {
  resolveDistributionTargets,
  validateDistributionTargets,
} from './distribution-readiness.js';

function resolvedTargets() {
  const targets = validateDistributionTargets(rawTargets, {pageMeta});
  return resolveDistributionTargets(targets, pageMeta, 'https://trueruslan.ru');
}

test('launch share targets resolve to canonical clean production URLs', () => {
  const targets = resolvedTargets();

  for (const target of targets) {
    const url = new URL(target.canonicalUrl);
    assert.equal(url.origin, 'https://trueruslan.ru');
    assert.equal(url.search, '');
    assert.equal(url.hash, '');
    assert.doesNotMatch(url.pathname, /\.html(?:$|\/)/, `${target.id} leaked a legacy .html route`);
    assert.doesNotMatch(url.pathname, /^\/landing(?:\/|$)/, `${target.id} leaked the internal landing prefix`);
    assert.ok(url.pathname === '/' || url.pathname.endsWith('/'), `${target.id} must be a directory-style canonical URL`);
  }

  const byId = new Map(targets.map((target) => [target.id, target]));
  assert.equal(byId.get('home')?.canonicalUrl, 'https://trueruslan.ru/');
  assert.equal(byId.get('resume')?.canonicalUrl, 'https://trueruslan.ru/resume/');
  assert.equal(byId.get('projects')?.canonicalUrl, 'https://trueruslan.ru/projects/');
  assert.equal(byId.get('notchhub-case-study')?.canonicalUrl, 'https://trueruslan.ru/projects/notchhub/');
  assert.equal(byId.get('villaigence-case-study')?.canonicalUrl, 'https://trueruslan.ru/projects/livingworld/');
  assert.equal(byId.get('portfolio-platform-case-study')?.canonicalUrl, 'https://trueruslan.ru/projects/portfolio-platform/');
  assert.equal(byId.get('engineering-notes')?.canonicalUrl, 'https://trueruslan.ru/notes/');
  assert.equal(byId.get('publications')?.canonicalUrl, 'https://trueruslan.ru/publications/');
  assert.equal(byId.get('work-with-me')?.canonicalUrl, 'https://trueruslan.ru/work-with-me/');
});

test('launch case-study targets follow the canonical public featured project selection', () => {
  const expectedPagePaths = projects
    .filter((project) => project.featured && project.visibility === 'public')
    .map((project) => project.href)
    .sort();
  const actualPagePaths = rawTargets
    .filter((target) => target.id.endsWith('-case-study'))
    .map((target) => target.pagePath)
    .sort();

  assert.deepEqual(actualPagePaths, expectedPagePaths);
  assert.ok(actualPagePaths.includes('landing/projects/notchhub.html'));
  assert.ok(!actualPagePaths.includes('landing/projects/vlezet.html'));
});

test('launch registry is a compact journey rather than a legacy article dump', () => {
  const targets = resolvedTargets();
  const ids = targets.map((target) => target.id);

  for (const id of [
    'home',
    'resume',
    'projects',
    'notchhub-case-study',
    'villaigence-case-study',
    'portfolio-platform-case-study',
    'engineering-notes',
    'publications',
    'work-with-me',
  ]) {
    assert.ok(ids.includes(id), `missing launch target: ${id}`);
  }

  assert.ok(targets.length <= 10, 'launch registry should remain compact');
  assert.equal(new Set(targets.map((target) => target.priority)).size, targets.length);

  for (const target of targets) {
    assert.doesNotMatch(target.evidenceBoundary, /M7\.8C\s+(?:оста[её]тся\s+)?Draft/i, `${target.id} preserves a stale Vlezet boundary`);
    assert.doesNotMatch(target.evidenceBoundary, /cumulative provider\/gameplay acceptance ещё не завершён/i, `${target.id} preserves a stale VillAIgence boundary`);
  }
});
