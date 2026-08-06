import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_STATE = path.join(ROOT, 'docs', 'PROJECT_STATE.md');
const ROADMAP = path.join(ROOT, 'docs', 'ROADMAP.md');
const CHANGELOG = path.join(ROOT, 'docs', 'CHANGELOG.md');
const PORTFOLIO_SPEC = path.join(
  ROOT,
  'docs',
  'keystone',
  'specs',
  '2026-08-05-portfolio-1-0-evidence-first.md',
);

function read(file) {
  assert.ok(fs.existsSync(file), `missing durable file: ${path.relative(ROOT, file)}`);
  return fs.readFileSync(file, 'utf8');
}

test('durable state closes P3.4E after exact production acceptance and promotes P3.4F', () => {
  const state = read(PROJECT_STATE);
  const roadmap = read(ROADMAP);
  const changelog = read(CHANGELOG);
  const spec = read(PORTFOLIO_SPEC);
  const combined = `${state}\n${roadmap}\n${changelog}\n${spec}`;

  for (const marker of [
    'P3.4E — Passive PDF validation versus semantic completeness',
    '/landing/notes/passive-pdf-validation-vs-semantic-completeness/',
    'PR #134',
    'ad3d46817bb40002e4f311acac2632929886780f',
    'fd09071730bf1a6d227ad544734b4ef15bb0a1f0',
    'f184236fec2f8985fe9f893a7d6819ad4e6eea37',
    '#996 / 31049874523',
    '403 PASS / 0 FAIL',
    '8948085565',
    'sha256:a31c074f337263d35181a7073fd5cbd6ef8f96ff0af92757c9cdb0c8e27d43b0',
    'PR #138',
    '90df9b8741b0d40b6ca3981f649624b55bfc85c1',
    '#1010 / 31083663155',
    '410 PASS / 0 FAIL',
    '8960804973',
    'sha256:47292ba7cb21abfc9d0ef7d862efdfc34423ef27a5df1a95145f3fcdb95e142e',
    'PR #139',
    'de79262c5db1e484b455409800c3dc060bf474b4',
    '0ccd8a5dc669212a46f9d2f3d2f5f6a73685be87',
    'a570dc420c83af33b483cb55c5904b3575ff729a',
    '#1013 / 31086478496',
    '411 PASS / 0 FAIL',
    '8961719018',
    'sha256:78ba029a7ae88cb9b20f456c0c5cffdd9609a0b4856cc7bbf456cc2e39f02e47',
    '#169 / 31086909691',
    'Pages deployment ID:            5776481884',
    '#168 / 31086909906',
    '8961927073',
    'sha256:681f8a098349bc4e44078273f5086f892f0dec7750abbe87de8ecf96702f24bc',
    '277792',
    'efd99499a483c06394dd0181b5d2be9b0e09265937163f74eeb8c05a0807e613',
    '<noscript data-tr-resume-fallback>',
    'tr_evidence_sha',
    'Cache-Control: no-cache',
    'rendered DOM',
    'raw HTML',
    'binary PDF',
    'Atom feed',
    'generated search',
    'P3.4F — Evidence-driven project state',
  ]) {
    assert.ok(combined.includes(marker), `missing P3.4E closure marker: ${marker}`);
  }

  assert.match(spec, /Status: \*\*IN PROGRESS — P3\.4E ACCEPTED IN PRODUCTION\*\*/);
  assert.ok(spec.includes('Continue with **P3.4F — Evidence-driven project state**'));

  for (const document of [state, roadmap, changelog, spec]) {
    assert.match(document, /parseable|валидн/i);
    assert.match(document, /complete|полнот/i);
    assert.match(document, /current|актуальн/i);
    assert.match(document, /accessible|доступн/i);
    assert.match(document, /semantic equivalence|semantically equivalent|семантическ/i);
  }

  assert.ok(state.includes('issue #111'), 'P3.4E closure must preserve search-engine observation');
  assert.ok(state.includes('issue #82'), 'P3.4E closure must preserve dependency blocker');
  assert.ok(state.includes('issue #78'), 'P3.4E closure must preserve Content Freshness owner state');
  assert.doesNotMatch(
    combined,
    /parseable PDF\s+(?:itself\s+)?(?:proves|guarantees)\b[^\n]*(?:complete|current|accessible)/i,
  );
  assert.doesNotMatch(
    combined,
    /parseable PDF\s+(?:сам по себе\s+)?(?:доказывает|гарантирует)\b[^\n]*(?:полнот|актуальн|доступн)/i,
  );
});
