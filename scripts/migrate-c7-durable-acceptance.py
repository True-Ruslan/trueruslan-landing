from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

FEATURE_HEAD = "6a511b8f7cc102cdcc1b00f1dda26bc57fdefae3"
ACCEPTED_SHA = "134043fa2bb5f6612266a04eab2853f71b207328"
BUILD_RUN = "31515510234"
QUALITY_ARTIFACT = "9111068659"
QUALITY_DIGEST = "sha256:528e13cbe2883644c4673ce18bd0475b8acb87bb81b98e7ad806953bacc27e24"
MEASUREMENT_RUN = "31515510155"
MEASUREMENT_ARTIFACT = "9110870252"
MEASUREMENT_DIGEST = "sha256:6aeca4695acb1cae8933a852ee6ad8fc1323a80208a90cb7abb0084afdbd229c"
PAGES_RUN = "31516118934"
PAGES_DEPLOYMENT = "5855067883"
PAGES_ARTIFACT = "9111122104"
PAGES_DIGEST = "sha256:22471106f7981d7cfd8b8d7245aeea0db140c1a2c3fc0fb7b092ca30e5814e41"
PAGES_REPORTS = "9111138147"
PAGES_REPORTS_DIGEST = "sha256:f3bf385afa7b727cd62a26ccdbeef5d64eb711e516c4a90e993d7a7c7f9e6b75"
LIVE_RUN = "31516213818"
PRODUCTION_ARTIFACT = "9111213502"
PRODUCTION_DIGEST = "sha256:fcacde8fd83e068fe094c05a0da07a23bb8ba88a42e15d87507cf5d8ccc1a1d8"
ACCEPTED_AT = "2026-08-11T17:12:43Z"
CLEAN_URL_EPOCH = "2026-08-05T00:00:00Z"

EVIDENCE_BLOCK = f"""- PR #198 exact feature head: `{FEATURE_HEAD}`;
- exact-head Build #1799 / `{BUILD_RUN}` — SUCCESS;
- quality artifact `{QUALITY_ARTIFACT}`, digest `{QUALITY_DIGEST}`;
- Measurement Checkpoint #174 / `{MEASUREMENT_RUN}` — SUCCESS;
- measurement artifact `{MEASUREMENT_ARTIFACT}`, digest `{MEASUREMENT_DIGEST}`;
- accepted squash / exact deployed SHA: `{ACCEPTED_SHA}`;
- Pages #223 / `{PAGES_RUN}` — SUCCESS;
- github-pages deployment `{PAGES_DEPLOYMENT}` — success;
- Pages artifact `{PAGES_ARTIFACT}`, digest `{PAGES_DIGEST}`;
- Pages production verification reports `{PAGES_REPORTS}`, digest `{PAGES_REPORTS_DIGEST}`;
- deployment-triggered Production Live #498 / `{LIVE_RUN}` — SUCCESS;
- production artifact `{PRODUCTION_ARTIFACT}`, digest `{PRODUCTION_DIGEST}`."""

C7_SECTION = f"""### C7 — production baseline + P3.6 handoff — PRODUCTION ACCEPTED

The final runtime slice of **Portfolio Clarity & Scanability** is production-accepted. One tracked presentation baseline is retained as `context-only` provenance for the existing P3.6 Measurement Checkpoint; it remains separate from operator observations, does not alter readiness, and does not create a second analytics or measurement source of truth.

{EVIDENCE_BLOCK}

`data/presentation-baseline.json` is now `production-accepted`. Its `measurementMode=context-only`, `resetsCleanUrlMeasurement=false`, and `cleanUrlMigrationAt={CLEAN_URL_EPOCH}` preserve the original clean-URL observation clock rather than resetting it at the end of the redesign.

Durable ledger: `docs/acceptance/2026-08-11-portfolio-clarity-c7.md`. C7 completes the Portfolio Clarity redesign implementation sequence only. P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE** for real equal-duration `operator-observed` aggregates, explicit traffic-sufficiency assessment and human review. C7 makes no engagement, conversion, SEO or causal product-impact claim.
"""


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one replacement anchor, found {count}")
    return text.replace(old, new, 1)


# 1. Canonical presentation baseline: advance only the production identity fields.
baseline_path = ROOT / "data/presentation-baseline.json"
baseline = json.loads(baseline_path.read_text(encoding="utf-8"))
expected_baseline = {
    "schemaVersion": 1,
    "slice": "C7",
    "status": "pending-production-acceptance",
    "measurementMode": "context-only",
    "resetsCleanUrlMeasurement": False,
    "cleanUrlMigrationAt": CLEAN_URL_EPOCH,
    "acceptedAt": None,
    "deployedSha": None,
    "pagesDeploymentId": None,
    "productionLiveRunId": None,
}
if baseline != expected_baseline:
    raise SystemExit(f"presentation baseline drifted before durable migration: {baseline!r}")
baseline.update({
    "status": "production-accepted",
    "acceptedAt": ACCEPTED_AT,
    "deployedSha": ACCEPTED_SHA,
    "pagesDeploymentId": PAGES_DEPLOYMENT,
    "productionLiveRunId": LIVE_RUN,
})
baseline_path.write_text(json.dumps(baseline, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# 2. Durable acceptance ledger.
ledger_path = ROOT / "docs/acceptance/2026-08-11-portfolio-clarity-c7.md"
if ledger_path.exists():
    raise SystemExit("C7 durable ledger already exists")
ledger_path.write_text(f"""# Portfolio Clarity C7 — production baseline + P3.6 handoff — PRODUCTION ACCEPTED

Accepted at: `{ACCEPTED_AT}`

## Accepted boundary

C7 establishes one tracked presentation baseline as `context-only` provenance for the existing P3.6 Measurement Checkpoint. The baseline is separate from private aggregate observations and from readiness analysis. It did not reset `cleanUrlMigrationAt={CLEAN_URL_EPOCH}`: `resetsCleanUrlMeasurement=false` remains canonical.

The private observation contract remains unchanged. Real P3.6 evidence must still be `operator-observed`, use equal-duration aggregate windows, include an explicit traffic-sufficiency assessment, and receive human review before any product interpretation.

## Exact repository and production evidence

{EVIDENCE_BLOCK}

The exact Pages deployment and deployment-triggered Production Live run both verified `{ACCEPTED_SHA}`. The Production Live run executed the deployed production smoke, Yandex Metrica pre-consent boundary, portfolio platform, flagship normalization, English Now, English Publications, Work with me, P3.4A–F Note and favicon gates successfully before publishing the production evidence artifact.

## Non-claims

C7 closes the Portfolio Clarity redesign implementation sequence only. P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**. This acceptance makes no engagement, conversion, SEO or causal product-impact claim; descriptive aggregate differences, when real observations eventually exist, still require human review and do not establish causality.
""", encoding="utf-8")

# 3. PROJECT_STATE.
state = read("docs/PROJECT_STATE.md")
state = replace_once(
    state,
    "> Последнее смысловое обновление: **2026-08-11**, после exact-production acceptance C6 — final EN/SEO reconciliation; P3.6 measurement остаётся открытым.",
    "> Последнее смысловое обновление: **2026-08-11**, после exact-production acceptance C7 — production baseline + P3.6 handoff; redesign implementation sequence завершён, P3.6 measurement остаётся открытым.",
    "PROJECT_STATE header",
)
state = replace_once(
    state,
    "Next redesign slice: **C7 — production baseline + P3.6 handoff**.",
    C7_SECTION.rstrip(),
    "PROJECT_STATE C7 insertion",
)
state = replace_once(
    state,
    "Portfolio 1.0 remains **IN PROGRESS**.\n\nContinue with:\n\n**C7 — production baseline + P3.6 handoff — NEXT IMPLEMENTATION SLICE.**\n\nP3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE** in parallel; it is not closed or reset by C2/C3/C4/C5 presentation work.",
    "Portfolio 1.0 implementation is **COMPLETE THROUGH C7**; measurement acceptance remains separate.\n\n**Portfolio Clarity redesign implementation sequence — COMPLETE through C7.**\n\nP3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE**; it was not closed or reset by C2/C3/C4/C5/C6/C7 presentation work.",
    "PROJECT_STATE next slice",
)
write("docs/PROJECT_STATE.md", state)

# 4. ROADMAP.
roadmap = read("docs/ROADMAP.md")
roadmap = replace_once(
    roadmap,
    "> Обновлено: **2026-08-11**, после exact-production acceptance C6 — final EN/SEO reconciliation; C7 — production baseline + P3.6 handoff является следующим implementation slice, P3.6 measurement ожидает внешние aggregate observations.",
    "> Обновлено: **2026-08-11**, после exact-production acceptance C7 — production baseline + P3.6 handoff; Portfolio Clarity redesign implementation sequence завершён, P3.6 measurement ожидает реальные aggregate observations.",
    "ROADMAP header",
)
roadmap = replace_once(
    roadmap,
    "- Portfolio Clarity C6 — final EN/SEO reconciliation — PR #195/#196 / PRODUCTION ACCEPTED.",
    "- Portfolio Clarity C6 — final EN/SEO reconciliation — PR #195/#196 / PRODUCTION ACCEPTED.\n- Portfolio Clarity C7 — production baseline + P3.6 handoff — PR #198 / PRODUCTION ACCEPTED.",
    "ROADMAP completed milestone",
)
roadmap = replace_once(
    roadmap,
    "Next redesign slice: **C7 — production baseline + P3.6 handoff**.",
    C7_SECTION.rstrip(),
    "ROADMAP C7 insertion",
)
roadmap = replace_once(
    roadmap,
    "Continue with **C7 — production baseline + P3.6 handoff** as the next product implementation slice. Keep **P3.6 — Measurement checkpoint — NEXT / WAITING** parallel and untouched until real `operator-observed` aggregate evidence satisfies the documented window and human-review boundaries.",
    "The Portfolio Clarity redesign implementation sequence is complete through **C7 — production baseline + P3.6 handoff**. Keep **P3.6 — Measurement checkpoint — NEXT / WAITING** untouched until real `operator-observed` aggregate evidence satisfies the documented equal-duration window, traffic-sufficiency and human-review boundaries.",
    "ROADMAP new-session handoff",
)
write("docs/ROADMAP.md", roadmap)

# 5. CHANGELOG.
changelog = read("docs/CHANGELOG.md")
changelog = replace_once(
    changelog,
    "> Обновлено: **2026-08-11**, после exact-production acceptance C6 — final EN/SEO reconciliation; P3.6 measurement остаётся открытым.",
    "> Обновлено: **2026-08-11**, после exact-production acceptance C7 — production baseline + P3.6 handoff; redesign implementation sequence завершён, P3.6 measurement остаётся открытым.",
    "CHANGELOG header",
)
changelog_entry = f"""## 2026-08-11 — C7 production baseline + P3.6 handoff — PRODUCTION ACCEPTED

- Added one tracked `data/presentation-baseline.json` as `context-only` provenance for the existing P3.6 Measurement Checkpoint, separate from private operator observations and readiness analysis.
- Kept `cleanUrlMigrationAt={CLEAN_URL_EPOCH}` and `resetsCleanUrlMeasurement=false`; C7 did not restart the observation clock.
- Extended the existing measurement report/workflow with an explicit tracked `--presentation-baseline` input without adding a secret, second analytics owner or second observation schema.
- Preserved the existing P3.6 rules: real evidence remains equal-duration `operator-observed` aggregates plus explicit traffic sufficiency and human review.
{EVIDENCE_BLOCK}

C7 completes the Portfolio Clarity redesign implementation sequence only. P3.6 remains **NEXT / WAITING FOR EXTERNAL EVIDENCE** and no engagement, conversion, SEO or causal product-impact claim is made.

"""
changelog = replace_once(
    changelog,
    "## 2026-08-11 — C6 final EN/SEO reconciliation — PRODUCTION ACCEPTED",
    changelog_entry + "## 2026-08-11 — C6 final EN/SEO reconciliation — PRODUCTION ACCEPTED",
    "CHANGELOG C7 insertion",
)
write("docs/CHANGELOG.md", changelog)

# 6. Handoff specification: retain pre-acceptance lifecycle explanation while recording the satisfied gate.
handoff = read("docs/keystone/specs/2026-08-11-portfolio-clarity-c7-baseline-handoff.md")
handoff = replace_once(
    handoff,
    "Status: **pending-production-acceptance**",
    "Status: **production-accepted**",
    "C7 handoff status",
)
acceptance_append = f"""
## Accepted production evidence

The production gate is now satisfied for the C7 feature squash. The historical pre-acceptance state was `pending-production-acceptance`; it advanced only after the exact deployed evidence below existed.

{EVIDENCE_BLOCK}

The accepted presentation baseline remains `context-only`, keeps `resetsCleanUrlMeasurement=false`, and preserves `cleanUrlMigrationAt={CLEAN_URL_EPOCH}`. This acceptance does not close P3.6: real evidence remains `operator-observed`, equal-duration, traffic-sufficient and subject to human review. No causal engagement, conversion, SEO or product-impact conclusion is authorized.
"""
if "## Accepted production evidence" in handoff:
    raise SystemExit("C7 handoff already contains accepted evidence")
handoff = handoff.rstrip() + "\n" + acceptance_append
write("docs/keystone/specs/2026-08-11-portfolio-clarity-c7-baseline-handoff.md", handoff)

# 7. Historical C7 feature test: preserve both lifecycle phases and fail closed on incoherent identity.
test_path = "scripts/portfolio-clarity-c7.test.js"
test_text = read(test_path)
old_first = """test('C7 owns one pending canonical presentation baseline before exact production acceptance', () => {
  assert.ok(fs.existsSync(path.join(ROOT, BASELINE_PATH)), `${BASELINE_PATH} must exist`);
  const baseline = readJson(BASELINE_PATH);

  assert.equal(baseline.schemaVersion, 1);
  assert.equal(baseline.status, 'pending-production-acceptance');
  assert.equal(baseline.slice, 'C7');
  assert.equal(baseline.measurementMode, 'context-only');
  assert.equal(baseline.resetsCleanUrlMeasurement, false);
  assert.equal(baseline.acceptedAt, null);
  assert.equal(baseline.deployedSha, null);
  assert.equal(baseline.pagesDeploymentId, null);
  assert.equal(baseline.productionLiveRunId, null);
});"""
new_first = """test('C7 owns one canonical presentation baseline across the production acceptance lifecycle', () => {
  assert.ok(fs.existsSync(path.join(ROOT, BASELINE_PATH)), `${BASELINE_PATH} must exist`);
  const baseline = readJson(BASELINE_PATH);

  assert.equal(baseline.schemaVersion, 1);
  assert.ok(['pending-production-acceptance', 'production-accepted'].includes(baseline.status));
  assert.equal(baseline.slice, 'C7');
  assert.equal(baseline.measurementMode, 'context-only');
  assert.equal(baseline.resetsCleanUrlMeasurement, false);
  assert.equal(baseline.cleanUrlMigrationAt, '2026-08-05T00:00:00Z');

  if (baseline.status === 'pending-production-acceptance') {
    assert.equal(baseline.acceptedAt, null);
    assert.equal(baseline.deployedSha, null);
    assert.equal(baseline.pagesDeploymentId, null);
    assert.equal(baseline.productionLiveRunId, null);
  } else {
    assert.match(baseline.acceptedAt, /^\\d{4}-\\d{2}-\\d{2}T/);
    assert.match(baseline.deployedSha, /^[0-9a-f]{40}$/i);
    assert.match(baseline.pagesDeploymentId, /^[1-9][0-9]*$/);
    assert.match(baseline.productionLiveRunId, /^[1-9][0-9]*$/);
  }
});"""
test_text = replace_once(test_text, old_first, new_first, "historical C7 baseline test")
old_final = """test('C7 finalization remains production-gated rather than self-accepting on a PR artifact', () => {
  const handoff = read(HANDOFF_PATH);
  const baseline = readJson(BASELINE_PATH);

  assert.match(handoff, /exact Pages deployment/i);
  assert.match(handoff, /deployment-triggered Production Live/i);
  assert.match(handoff, /durable acceptance/i);
  assert.equal(baseline.status, 'pending-production-acceptance');
});"""
new_final = """test('C7 finalization remains production-gated rather than self-accepting on a PR artifact', () => {
  const handoff = read(HANDOFF_PATH);
  const baseline = readJson(BASELINE_PATH);

  assert.match(handoff, /exact Pages deployment/i);
  assert.match(handoff, /deployment-triggered Production Live/i);
  assert.match(handoff, /durable acceptance/i);
  assert.ok(['pending-production-acceptance', 'production-accepted'].includes(baseline.status));
  if (baseline.status === 'production-accepted') {
    assert.match(handoff, /Accepted production evidence/i);
    assert.match(handoff, new RegExp(baseline.deployedSha));
  }
});"""
test_text = replace_once(test_text, old_final, new_final, "historical C7 production gate test")
write(test_path, test_text)

print("C7 durable acceptance migration applied successfully")
