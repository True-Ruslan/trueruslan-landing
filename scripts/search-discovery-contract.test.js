import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadI18nManifest} from './i18n.js';
import {loadPageMeta} from './page-meta.js';
import {
  buildSearchDiscoveryReadiness,
  loadSearchDiscoveryPolicy,
  renderSearchDiscoveryMarkdown,
  validateSearchDiscoveryPolicy,
} from './search-discovery.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SPEC_PATH = path.join(ROOT, 'docs', 'keystone', 'specs', '2026-08-11-p4-1-search-discovery.md');
const ROADMAP_PATH = path.join(ROOT, 'docs', 'ROADMAP.md');
const STATE_PATH = path.join(ROOT, 'docs', 'PROJECT_STATE.md');
const PACKAGE_PATH = path.join(ROOT, 'package.json');
const BUILD_WORKFLOW_PATH = path.join(ROOT, '.github', 'workflows', 'build.yml');

function canonicalInputs() {
  return {
    policy: loadSearchDiscoveryPolicy(),
    pageMeta: loadPageMeta(),
    i18n: loadI18nManifest(),
    siteUrl: 'https://trueruslan.ru',
  };
}

test('P4.1A policy is repository-readiness only and never stores external search metrics', () => {
  const policy = loadSearchDiscoveryPolicy();

  assert.equal(policy.schemaVersion, 1);
  assert.equal(policy.evidenceClass, 'repository-readiness');
  assert.equal(policy.externalEvidence, 'not-collected');
  assert.ok(policy.surfaces.length >= 8, 'strategic discovery scope must cover the core product surfaces');

  const serialized = JSON.stringify(policy);
  for (const forbidden of ['impressions', 'clicks', 'position', 'ctr', 'indexedCleanUrls', 'indexedLegacyHtmlUrls']) {
    assert.doesNotMatch(serialized, new RegExp(`"${forbidden}"\\s*:`), `policy must not persist ${forbidden}`);
  }
});

test('P4.1A policy references canonical i18n identities instead of duplicating bilingual paths', () => {
  const policy = loadSearchDiscoveryPolicy();
  const paired = policy.surfaces.filter((surface) => surface.i18nId);

  assert.ok(paired.some((surface) => surface.i18nId === 'home'));
  assert.ok(paired.some((surface) => surface.i18nId === 'resume'));
  assert.ok(paired.some((surface) => surface.i18nId === 'projects'));
  assert.ok(paired.some((surface) => surface.i18nId === 'publications'));
  assert.ok(paired.some((surface) => surface.i18nId === 'work-with-me'));

  for (const surface of paired) {
    assert.equal(surface.path, undefined, `${surface.id} must not duplicate a path owned by data/i18n.json`);
  }
});

test('canonical discovery readiness resolves clean strategic routes with complete metadata', () => {
  const report = buildSearchDiscoveryReadiness(canonicalInputs());

  assert.equal(report.schemaVersion, 1);
  assert.equal(report.evidenceClass, 'repository-readiness');
  assert.equal(report.externalEvidence, 'not-collected');
  assert.equal(report.ready, true, JSON.stringify(report.findings, null, 2));
  assert.deepEqual(report.findings, []);
  assert.ok(report.routes.some((route) => route.publicRoute === '/'));
  assert.ok(report.routes.some((route) => route.publicRoute === '/en/'));
  assert.ok(report.routes.some((route) => route.publicRoute === '/projects/'));
  assert.ok(report.routes.some((route) => route.publicRoute === '/publications/'));
  assert.ok(report.routes.some((route) => route.publicRoute === '/work-with-me/'));

  for (const route of report.routes) {
    assert.ok(route.title);
    assert.ok(route.description);
    assert.doesNotMatch(route.publicRoute, /\.html(?:$|[?#])/);
    assert.doesNotMatch(route.publicRoute, /^\/landing\//);
  }
});

test('same proper-name title is allowed only inside one canonical RU EN surface', () => {
  const report = buildSearchDiscoveryReadiness(canonicalInputs());
  const pair = report.routes.filter((route) => route.surfaceId === 'villaigence');

  assert.equal(pair.length, 2);
  assert.equal(pair[0].title, pair[1].title);
  assert.equal(report.findings.some((finding) => finding.code === 'duplicate-title'), false);
});

test('readiness fails closed on missing metadata, unknown i18n identity and duplicate strategic metadata', () => {
  const inputs = canonicalInputs();
  const withoutHome = inputs.pageMeta.filter((entry) => entry.path !== 'index.html');
  const missingMeta = buildSearchDiscoveryReadiness({...inputs, pageMeta: withoutHome});
  assert.equal(missingMeta.ready, false);
  assert.ok(missingMeta.findings.some((finding) => finding.code === 'missing-page-meta'));

  const unknownPairPolicy = structuredClone(inputs.policy);
  unknownPairPolicy.surfaces[0] = {...unknownPairPolicy.surfaces[0], i18nId: 'missing-pair'};
  const unknownPair = buildSearchDiscoveryReadiness({...inputs, policy: unknownPairPolicy});
  assert.equal(unknownPair.ready, false);
  assert.ok(unknownPair.findings.some((finding) => finding.code === 'missing-i18n-pair'));

  const duplicateMeta = structuredClone(inputs.pageMeta);
  const routes = buildSearchDiscoveryReadiness(inputs).routes;
  const firstRoute = routes[0];
  const secondRoute = routes.find((route) => route.surfaceId !== firstRoute.surfaceId);
  const first = duplicateMeta.find((entry) => entry.path === firstRoute.sourcePath);
  const second = duplicateMeta.find((entry) => entry.path === secondRoute.sourcePath);
  second.title = first.title;
  second.description = first.description;
  const duplicate = buildSearchDiscoveryReadiness({...inputs, pageMeta: duplicateMeta});
  assert.equal(duplicate.ready, false);
  assert.ok(duplicate.findings.some((finding) => finding.code === 'duplicate-title'));
  assert.ok(duplicate.findings.some((finding) => finding.code === 'duplicate-description'));
});

test('policy validation rejects duplicated identities, unsafe direct paths and external-evidence promotion', () => {
  const valid = {
    schemaVersion: 1,
    evidenceClass: 'repository-readiness',
    externalEvidence: 'not-collected',
    surfaces: [
      {id: 'home', role: 'identity', intentClass: 'name-role', i18nId: 'home'},
      {id: 'notes', role: 'knowledge', intentClass: 'engineering-notes', path: 'landing/notes.html'},
    ],
  };
  assert.equal(validateSearchDiscoveryPolicy(valid).surfaces.length, 2);

  assert.throws(
    () => validateSearchDiscoveryPolicy({...valid, externalEvidence: 'verified'}),
    /externalEvidence/i,
  );
  assert.throws(
    () => validateSearchDiscoveryPolicy({...valid, surfaces: [valid.surfaces[0], valid.surfaces[0]]}),
    /duplicate/i,
  );
  assert.throws(
    () => validateSearchDiscoveryPolicy({...valid, surfaces: [{...valid.surfaces[1], path: '../secret.html'}]}),
    /unsafe/i,
  );
  assert.throws(
    () => validateSearchDiscoveryPolicy({...valid, surfaces: [{...valid.surfaces[0], path: 'index.html'}]}),
    /exactly one/i,
  );
});

test('human-readable readiness report repeats the no-external-evidence boundary', () => {
  const report = buildSearchDiscoveryReadiness(canonicalInputs());
  const markdown = renderSearchDiscoveryMarkdown(report);

  assert.match(markdown, /P4\.1A Search Discovery Readiness/);
  assert.match(markdown, /repository-readiness/);
  assert.match(markdown, /external evidence:\s*not-collected/i);
  assert.match(markdown, /does not contain Search Console or Yandex Webmaster performance observations/i);
});

test('P4.1A is durably specified and wired into ordinary Build evidence without closing P3.6', () => {
  assert.equal(fs.existsSync(SPEC_PATH), true, 'P4.1 specification must be durable');

  const roadmap = fs.readFileSync(ROADMAP_PATH, 'utf8');
  const state = fs.readFileSync(STATE_PATH, 'utf8');
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  const build = fs.readFileSync(BUILD_WORKFLOW_PATH, 'utf8');

  assert.match(roadmap, /P4\.1A[^\n]*Search Discovery/i);
  assert.match(roadmap, /P4\.1B[^\n]*(Search Console|Webmaster|external)/i);
  assert.match(state, /P4\.1A[^\n]*Search Discovery/i);
  assert.match(roadmap, /P3\.6[\s\S]{0,240}(NEXT|WAITING FOR EXTERNAL EVIDENCE)/i);
  assert.match(state, /P3\.6[\s\S]{0,240}(NEXT|WAITING FOR EXTERNAL EVIDENCE)/i);

  assert.equal(pkg.scripts['check:discovery'], 'node scripts/search-discovery-report.js --output-dir quality-artifacts');
  assert.match(pkg.scripts.test, /npm run check:discovery/);
  assert.match(build, /npm test/);
  assert.match(build, /- name:\s*Search discovery readiness[\s\S]{0,220}npm run check:discovery/);
  assert.match(build, /cp search-discovery-readiness\.log quality-artifacts\/search-discovery-readiness\.log/);
  assert.match(build, /name:\s*quality-artifacts/);
  assert.match(build, /path:\s*quality-artifacts\//);
});
