from pathlib import Path

FEATURE_HEAD = "3104089b500e1f680117eb86e14347f3a7309b35"
FEATURE_SQUASH = "3bed9077ea02f50d1e2d0bb13cc3430174486a7e"
HOTFIX_HEAD = "ffadb765ac29ffad4988727c980be7bffc0dd58a"
ACCEPTED_SHA = "4751e14f4464b1c55153bf8803d7367d67b5fa7b"
BUILD_RUN = "31471924720"
HOTFIX_BUILD_RUN = "31473097553"
PAGES_RUN = "31473635637"
DEPLOYMENT_ID = "5847044248"
LIVE_RUN = "31473689705"
PRODUCTION_DIGEST = "sha256:1d3c3b4cb6f068b2bb9e755ea17cc466f7afe4306e899d690b1d63c3ce5ec27f"

EVIDENCE = f"""- feature PR #195 exact head: `{FEATURE_HEAD}`;
- feature Build #1783 / `{BUILD_RUN}` — SUCCESS;
- feature squash: `{FEATURE_SQUASH}`;
- production-verifier correction PR #196 exact head: `{HOTFIX_HEAD}`;
- correction Build #1785 / `{HOTFIX_BUILD_RUN}` — SUCCESS;
- accepted squash / exact deployed SHA: `{ACCEPTED_SHA}`;
- Pages #221 / `{PAGES_RUN}` — SUCCESS;
- github-pages deployment `{DEPLOYMENT_ID}` — success;
- deployment-triggered Production Live #493 / `{LIVE_RUN}` — SUCCESS;
- production-live artifact `9094397196`, digest `{PRODUCTION_DIGEST}`."""

ACCEPTANCE = f"""# Portfolio Clarity C6 — final EN/SEO reconciliation — PRODUCTION ACCEPTED

> Accepted: 2026-08-11
> Accepted deployed SHA: `{ACCEPTED_SHA}`
> Durable state only; this ledger does not start, reset or close P3.6 Measurement.

## Exact evidence

- feature PR: #195 — MERGED;
- feature exact head: `{FEATURE_HEAD}`;
- TDD RED Build #1761 / `31468805456` — expected FAILURE, 671 PASS / exactly 6 C6 FAIL;
- final feature Build #1783 / `{BUILD_RUN}` — SUCCESS;
- feature quality artifact `9093868321`, digest `sha256:48409af7a388f1eee24cbbf79026078f2105ad3a3c591af102e1b2efbce0b229`;
- CodeQL #1327 / `31471924729` — SUCCESS;
- Dependency Review #1211 / `31471924711` — SUCCESS;
- feature squash: `{FEATURE_SQUASH}`;
- first C6 Pages #220 / `31472663458` — SUCCESS, but Production Live #490 / `31472764023` correctly failed only on a stale deployed English Now search oracle, so this SHA was not accepted;
- production-verifier correction PR: #196 — MERGED;
- correction RED Build #1784 / `31472974712` — expected FAILURE, 677 PASS / exactly 1 hotfix FAIL;
- correction exact head: `{HOTFIX_HEAD}`;
- correction Build #1785 / `{HOTFIX_BUILD_RUN}` — SUCCESS;
- correction quality artifact `9094266213`, digest `sha256:39dc83dd0a565bf7b628d6032b144bbf627b05cf3615a497661bbe0de6f8b877`;
- correction CodeQL #1330 / `31473097480` — SUCCESS;
- correction Dependency Review #1213 / `31473097505` — SUCCESS;
- accepted squash / exact deployed SHA: `{ACCEPTED_SHA}`;
- Pages #221 / `{PAGES_RUN}` — SUCCESS;
- github-pages deployment `{DEPLOYMENT_ID}` — success;
- Pages artifact `9094332009`, digest `sha256:fc7deaf6764a48f676c89cfaefdc1e210ebe0d37d064af3c792f06590c72ef7e`;
- Pages production verification reports `9094335892`, digest `sha256:4bdef3935198ac59c323183827d89762f66b2aec0e9420492dd27ada83397293`;
- deployment-triggered Production Live #493 / `{LIVE_RUN}` — SUCCESS;
- P3.5B English Now deployed smoke — PASS;
- production-live artifact `9094397196`, digest `{PRODUCTION_DIGEST}`.

## Accepted product boundary

C6 closes the approved final English/SEO reconciliation slice without creating parallel owners:

- all **13 controlled RU/EN pairs** are exercised by browser acceptance derived from canonical `data/i18n.json`, including canonical/hreflang and no-JavaScript behavior;
- top-level English Projects/Now and professional links use natural user-facing language, paired EN routes where they exist and explicit labels for deliberate RU-only deep links;
- existing `data/page-meta.json` remains the canonical metadata owner; C6 adds generated browser coverage for EN home/Experience rather than duplicating or rewriting metadata ownership;
- one bilingual **Person JSON-LD** identity is present on RU and EN home surfaces with `alternateName: Ruslan Nemykin`, not a second Person source;
- generated search remains the sole Diplodoc site-wide search owner;
- the deployed **English Now** production verifier now searches stable user-facing copy (`short snapshot`) while preserving exact `/en/now/`, rendered, no-JS, canonical/hreflang, project-link and diagnostics assertions.

Static-first architecture, clean URLs, privacy/Metrica, accessibility, visual thresholds and evidence ownership remain unchanged.

## Measurement boundary

C6 acceptance is presentation/runtime/SEO-contract acceptance, not evidence that engagement, conversion or SEO improved. It does not start, reset or close P3.6 Measurement. P3.6 remains **NEXT / WAITING** for sufficient real equal-duration `operator-observed` aggregate evidence and human review.

Next redesign slice: **C7 — production baseline + P3.6 handoff**.
"""


def replace_once(path: str, old: str, new: str) -> None:
    target = Path(path)
    source = target.read_text(encoding="utf-8")
    count = source.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one occurrence, found {count}: {old!r}")
    target.write_text(source.replace(old, new, 1), encoding="utf-8")


Path("docs/acceptance/2026-08-11-portfolio-clarity-c6.md").write_text(ACCEPTANCE, encoding="utf-8")

replace_once(
    "docs/PROJECT_STATE.md",
    "> Последнее смысловое обновление: **2026-08-11**, после exact-production acceptance C5 — Knowledge surfaces; P3.6 measurement остаётся открытым.",
    "> Последнее смысловое обновление: **2026-08-11**, после exact-production acceptance C6 — final EN/SEO reconciliation; P3.6 measurement остаётся открытым.",
)
replace_once(
    "docs/PROJECT_STATE.md",
    "Next redesign slice: **C6 — final EN/SEO reconciliation**.\n\n## 3. External project evidence boundaries",
    f"""### C6 — final EN/SEO reconciliation — PRODUCTION ACCEPTED

The sixth runtime slice of **Portfolio Clarity & Scanability** is production-accepted. Canonical i18n acceptance now covers all 13 controlled RU/EN pairs from one manifest, English discovery copy and paired links are reconciled, existing metadata ownership is browser-verified on EN surfaces, and one bilingual Person JSON-LD identity is shared across RU/EN home.

{EVIDENCE}

The first feature deployment was not promoted: Production Live #490 exposed only a stale deployed English Now search query after the C6 copy change. PR #196 corrected that production verifier with RED-first coverage; final Production Live #493 executed P3.5B and every other deployment-only gate successfully on exact SHA `{ACCEPTED_SHA}`.

Durable ledger: `docs/acceptance/2026-08-11-portfolio-clarity-c6.md`. C6 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim.

Next redesign slice: **C7 — production baseline + P3.6 handoff**.

## 3. External project evidence boundaries""",
)
replace_once(
    "docs/PROJECT_STATE.md",
    "**C6 — final EN/SEO reconciliation — NEXT IMPLEMENTATION SLICE.**",
    "**C7 — production baseline + P3.6 handoff — NEXT IMPLEMENTATION SLICE.**",
)

replace_once(
    "docs/ROADMAP.md",
    "> Обновлено: **2026-08-11**, после exact-production acceptance C5 — Knowledge surfaces; C6 — final EN/SEO reconciliation является следующим implementation slice, P3.6 measurement ожидает внешние aggregate observations.",
    "> Обновлено: **2026-08-11**, после exact-production acceptance C6 — final EN/SEO reconciliation; C7 — production baseline + P3.6 handoff является следующим implementation slice, P3.6 measurement ожидает внешние aggregate observations.",
)
replace_once(
    "docs/ROADMAP.md",
    "- Portfolio Clarity C5 — Knowledge surfaces — PR #193 / PRODUCTION ACCEPTED.",
    "- Portfolio Clarity C5 — Knowledge surfaces — PR #193 / PRODUCTION ACCEPTED.\n- Portfolio Clarity C6 — final EN/SEO reconciliation — PR #195/#196 / PRODUCTION ACCEPTED.",
)
replace_once(
    "docs/ROADMAP.md",
    "Next redesign slice: **C6 — final EN/SEO reconciliation**.\n\n## P3.6 — Measurement checkpoint — NEXT / WAITING",
    f"""### C6 — final EN/SEO reconciliation — PRODUCTION ACCEPTED

Accepted outcome: one canonical 13-pair RU/EN manifest drives browser acceptance; EN discovery copy and paired links are reconciled; `data/page-meta.json` remains the sole metadata owner; one bilingual Person JSON-LD identity covers RU/EN home; generated Diplodoc search remains the sole site-wide search owner; exact production acceptance includes the focused deployed English Now search-oracle correction.

{EVIDENCE}

The first feature deployment was deliberately not accepted because Production Live #490 exposed the stale deployed P3.5B query. Final exact SHA `{ACCEPTED_SHA}` passed Pages #221, deployment `{DEPLOYMENT_ID}` and deployment-triggered Production Live #493 with P3.5B and all downstream deployment-only gates executed successfully.

C6 does not start, reset or close P3.6 Measurement.

Next redesign slice: **C7 — production baseline + P3.6 handoff**.

## P3.6 — Measurement checkpoint — NEXT / WAITING""",
)
replace_once(
    "docs/ROADMAP.md",
    "Continue with **C6 — final EN/SEO reconciliation** as the next product implementation slice.",
    "Continue with **C7 — production baseline + P3.6 handoff** as the next product implementation slice.",
)

replace_once(
    "docs/CHANGELOG.md",
    "> Обновлено: **2026-08-11**, после exact-production acceptance C5 — Knowledge surfaces; P3.6 measurement остаётся открытым.",
    "> Обновлено: **2026-08-11**, после exact-production acceptance C6 — final EN/SEO reconciliation; P3.6 measurement остаётся открытым.",
)
changelog_marker = "## 2026-08-11 — C5 Knowledge surfaces — PRODUCTION ACCEPTED"
changelog_section = f"""## 2026-08-11 — C6 final EN/SEO reconciliation — PRODUCTION ACCEPTED

- Replaced the stale hard-coded i18n browser pair list with canonical `data/i18n.json` ownership, so all **13 controlled RU/EN pairs** are covered by generated canonical/hreflang/no-JavaScript acceptance.
- Reconciled top-level English Projects/Now and professional links into natural user-facing copy, using paired EN routes where available and explicit labels for intentional RU-only deep links.
- Kept `data/page-meta.json` as the sole canonical metadata owner while adding generated browser coverage for EN home/Experience canonical metadata/OpenGraph.
- Extended one Person JSON-LD identity across RU and EN home with `alternateName: Ruslan Nemykin`; no second structured-data identity was introduced.
- Preserved one Diplodoc generated search owner. C6 updated the EN Now search oracle from removed implementation-oriented copy to stable user-facing `short snapshot`.
- The first exact feature deployment passed Pages but Production Live #490 exposed the same stale phrase in the deployment-only P3.5B verifier. PR #196 corrected only that verifier query plus its regression contract; no product/runtime behavior changed.
- {EVIDENCE.replace(chr(10), chr(10) + '')}

C6 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim. Next implementation slice: **C7 — production baseline + P3.6 handoff**.

{changelog_marker}"""
replace_once("docs/CHANGELOG.md", changelog_marker, changelog_section)

for path in [
    "docs/acceptance/2026-08-11-portfolio-clarity-c6.md",
    "docs/PROJECT_STATE.md",
    "docs/ROADMAP.md",
    "docs/CHANGELOG.md",
]:
    text = Path(path).read_text(encoding="utf-8")
    for marker in [FEATURE_HEAD, FEATURE_SQUASH, HOTFIX_HEAD, ACCEPTED_SHA, BUILD_RUN, HOTFIX_BUILD_RUN, PAGES_RUN, DEPLOYMENT_ID, LIVE_RUN, PRODUCTION_DIGEST]:
        if marker not in text:
            raise SystemExit(f"{path}: durable evidence marker missing after migration: {marker}")
    if "C7 — production baseline + P3.6 handoff" not in text:
        raise SystemExit(f"{path}: C7 next slice missing after migration")

print("C6 durable acceptance migration completed successfully")
