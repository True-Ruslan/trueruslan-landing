import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {analyzeContentFreshness} from './content-freshness.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));

const projects = readJson('data/projects.json');
const evidence = readJson('data/project-evidence.json');
const timelines = {
  vlezet: readJson('data/project-history/vlezet.json'),
  livingworld: readJson('data/project-history/livingworld.json'),
  'portfolio-platform': readJson('data/project-history/portfolio-platform.json'),
};

function project(slug) {
  return projects.find((entry) => entry.slug === slug);
}

function snapshot(slug) {
  return evidence.find((entry) => entry.project === slug);
}

function signalByUrl(slug, url) {
  return snapshot(slug).signals.find((entry) => entry.url === url);
}

function signalByLabel(slug, label) {
  return snapshot(slug).signals.find((entry) => entry.label === label);
}

function currentTimeline(slug) {
  return timelines[slug].filter((entry) => entry.state === 'current');
}

function nextTimeline(slug) {
  return timelines[slug].filter((entry) => entry.state === 'next');
}

test('current reconciliation records accepted Vlezet M8.3 and pending M8.4 retest without lifecycle promotion', () => {
  const registry = project('vlezet');
  const current = currentTimeline('vlezet');
  const next = nextTimeline('vlezet');
  const controlled = snapshot('vlezet');

  assert.equal(registry.status, 'pre-production');
  assert.equal(registry.statusLabel, 'ACTIVE DEVELOPMENT');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-19');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Accepted editor slice' && /M8\.3.*accepted.*merged.*post-merge verified/i.test(entry.value)));
  assert.equal(controlled.versions.find((entry) => entry.label === 'Next acceptance boundary')?.value, 'M8.4 Assisted Tracing');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Active product slice'
    && /M8\.4 Assisted Tracing Draft PR #94/i.test(entry.value)
    && /automated GREEN/i.test(entry.value)
    && /two real-plan Product Owner FAILs/i.test(entry.value)
    && /same-plan Product Owner retest pending/i.test(entry.value)
    && /not accepted, merged or released/i.test(entry.value)));

  assert.equal(signalByUrl('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/52').state, 'unavailable');
  assert.equal(signalByUrl('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/87').state, 'merged');
  assert.equal(signalByUrl('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/90').state, 'merged');
  assert.match(signalByUrl('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/90').scope, /7cb9cfd2a8f809e6000209188b5fab99a2fabfb9/);
  assert.equal(signalByUrl('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/91').state, 'merged');

  const draft = signalByLabel('vlezet', 'M8.3 Precision Reference Calibration Draft PR #92');
  const accepted = signalByLabel('vlezet', 'M8.3 Precision Reference Calibration accepted PR #92');
  const handoff = signalByUrl('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/93');
  const m84 = signalByUrl('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/94');
  assert.ok(draft && accepted && handoff && m84);
  assert.equal(draft.state, 'pending');
  assert.equal(draft.observedAt, '2026-08-16');
  assert.match(draft.scope, /TDD RED/i);
  assert.match(draft.scope, /historical pre-acceptance evidence only/i);
  assert.equal(accepted.state, 'merged');
  assert.match(accepted.scope, /01f520988a84291fb6e4f918e21f3403f17c4529/);
  assert.match(accepted.scope, /post-merge main passed CI #5248 and CodeQL #608/i);
  assert.equal(handoff.state, 'merged');
  assert.equal(m84.state, 'pending');
  assert.match(m84.scope, /c019af73a9224c1a63d4f377c21d03949ee9c28c/);
  assert.match(m84.scope, /CI #5337.*Browser Acceptance #1780/i);
  assert.match(m84.scope, /same real plan.*Product Owner retest/i);
  assert.match(m84.scope, /not accepted, merged or released/i);

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /M8\.4 Assisted Tracing.*product retest pending/i);
  assert.match(current[0].description, /two real-plan Product Owner.*failed usefulness acceptance/i);
  assert.match(current[0].description, /not accepted, merged or released/i);
  assert.match(next[0].title, /Retest M8\.4.*same real plan/i);
  assert.match(next[0].description, /only an observed PASS.*merge/i);
});

test('current reconciliation records VillAIgence 0.3.2 publication without inventing installed acceptance', () => {
  const registry = project('livingworld');
  const current = currentTimeline('livingworld');
  const next = nextTimeline('livingworld');
  const controlled = snapshot('livingworld');

  assert.equal(registry.status, 'release-candidate');
  assert.equal(registry.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-16');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Current official release' && entry.value === '0.3.2+1.21.1'));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Installed 0.2.0 result' && entry.value === '7 PASS / 0 FAIL'));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Current 0.3.2 acceptance' && /automated.*PASS.*VAI-PCM-MULTI-001.*PENDING/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Latest merged source capability' && /0\.3\.2.*targeted-recall ranking correction.*installed retest contract/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Active development slice' && /0\.3\.1 installed FAIL/i.test(entry.value) && /VAI-PCM-MULTI-001.*pending/i.test(entry.value) && /do not start 0\.4/i.test(entry.value)));

  for (const number of [125, 153, 155, 158, 159, 160, 165, 167, 169, 171]) {
    assert.equal(signalByUrl('livingworld', `https://github.com/True-Ruslan/villAIgence/pull/${number}`).state, 'merged');
  }
  const installed031 = signalByUrl('livingworld', 'https://github.com/True-Ruslan/villAIgence/blob/1.21.1/docs/livingworld/VALIDATION_0.3.1_CORRECTIVE_INSTALLED.md');
  assert.equal(installed031.state, 'failed');
  assert.equal(installed031.observedAt, '2026-08-15');
  assert.match(installed031.scope, /Muammer.*amber-pine-314.*did not recall/i);
  const release032 = signalByUrl('livingworld', 'https://github.com/True-Ruslan/villAIgence/releases/tag/0.3.2%2B1.21.1');
  assert.equal(release032.state, 'published');
  assert.match(release032.scope, /b51cfcf3f46718fac9620586cf8b5aae53356c600d5ac375ca3280050befe015/);
  assert.match(release032.scope, /not installed acceptance/i);

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /0\.3\.2.*corrective release.*installed canary pending/i);
  assert.match(current[0].description, /VAI-PCM-MULTI-001 remains PENDING/i);
  assert.match(current[0].description, /0\.4 stays blocked/i);
  assert.match(next[0].title, /0\.3\.2.*VAI-PCM-MULTI-001.*canary/i);
});

test('current reconciliation preserves C7 and N6 history while recording AI-8 FULL with AI-6 rollback', () => {
  const registry = project('portfolio-platform');
  const current = currentTimeline('portfolio-platform');
  const next = nextTimeline('portfolio-platform');
  const controlled = snapshot('portfolio-platform');

  assert.equal(registry.status, 'production');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-20');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Portfolio Clarity redesign' && /C7/.test(entry.value) && /production accepted/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Current production baseline'
    && /93028b979f273b6382f480a500555a258c426607/.test(entry.value)
    && /be439044b67b93c6112659c5ac8c6f50153b1f52/.test(entry.value)
    && /3809d6f0290ab22f080e919f2ff26b1b018f3db6.*rollback/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'AI Navigator' && /public FULL production accepted/i.test(entry.value) && /provider-free/i.test(entry.value) && /SEARCH rollback/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Measurement checkpoint' && /P3\.6.*NEXT.*WAITING/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Search Discovery' && /P4\.1A READY.*P4\.1B IN PROGRESS.*SPARSE PRE-LAUNCH BASELINE.*not-published.*P4\.1C WAITING/i.test(entry.value)));

  for (const number of [198, 234, 237, 253, 254, 294, 295]) {
    assert.equal(signalByUrl('portfolio-platform', `https://github.com/True-Ruslan/trueruslan-landing/pull/${number}`).state, 'merged');
  }
  assert.match(signalByUrl('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/237').scope, /f0e489d75f5bcb1f64057e1046faad877bf3f952/);
  assert.match(signalByUrl('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/254').scope, /Pages #273.*Production Live #620.*CodeQL #1752/i);
  assert.match(signalByUrl('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/32148448724').scope, /semantic result.*answer disabled.*zero unexpected external requests/i);
  assert.match(signalByUrl('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/actions/runs/32355776796').scope, /512 dimensions.*grounded canonical citation.*zero unexpected external requests/i);

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /AI-8 public FULL production accepted/i);
  assert.match(current[0].description, /93028b979f273b6382f480a500555a258c426607/);
  assert.match(current[0].description, /AI-6 SEARCH remains the explicit rollback baseline/i);
  assert.match(current[0].description, /ordinary CI stays provider-free/i);
  assert.match(next[0].title, /Controlled manual launch.*real search.*measurement evidence/i);
  assert.match(next[0].description, /10-target \/ 38-draft/i);
  assert.match(next[0].description, /Search Console.*Yandex Webmaster/i);
  assert.match(next[0].description, /P4\.1C and P3\.6 remain evidence-gated/i);
});

test('reconciled controlled evidence produces no repository-drift finding for the observed 2026-08-11 state', () => {
  const selectedProjects = ['vlezet', 'livingworld', 'portfolio-platform'].map(project);
  const selectedEvidence = ['vlezet', 'livingworld', 'portfolio-platform'].map(snapshot);
  const report = analyzeContentFreshness({
    projects: selectedProjects,
    evidence: selectedEvidence,
    timelines,
    observations: {
      repositories: {
        vlezet: {url: 'https://github.com/True-Ruslan/vlezet', pushedAt: '2026-08-11T12:22:15Z'},
        livingworld: {
          url: 'https://github.com/True-Ruslan/villAIgence',
          pushedAt: '2026-08-11T08:31:25Z',
          latestRelease: {tagName: 'v0.2.0+1.21.1', publishedAt: '2026-08-07T00:00:00Z'},
        },
        'portfolio-platform': {url: 'https://github.com/True-Ruslan/trueruslan-landing', pushedAt: '2026-08-11T17:31:22Z'},
      },
      links: {},
    },
    now: new Date('2026-08-11T18:00:00Z'),
    maxVerifiedAgeDays: 30,
  });

  assert.deepEqual(report.summary, {total: 0, info: 0, warning: 0, error: 0});
  assert.deepEqual(report.findings, []);
});
