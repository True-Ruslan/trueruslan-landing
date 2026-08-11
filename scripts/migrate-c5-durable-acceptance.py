from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE = ROOT / 'docs' / 'PROJECT_STATE.md'
ROADMAP = ROOT / 'docs' / 'ROADMAP.md'
CHANGELOG = ROOT / 'docs' / 'CHANGELOG.md'
ACCEPTANCE = ROOT / 'docs' / 'acceptance' / '2026-08-11-portfolio-clarity-c5.md'

PR_HEAD = 'f99c4534932a86e6cac0876b4a082639786d4ad9'
ACCEPTED_SHA = '00900e832d69356bbccaa874f1b625876dad1e21'
BUILD_RUN = '31437853159'
PAGES_RUN = '31466807721'
DEPLOYMENT_ID = '5845809144'
LIVE_RUN = '31466868392'
PRODUCTION_DIGEST = 'sha256:4e3349bdbb8b44326049750074810b3f6ed150e7b6b8922bf75aee43354d93b0'


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)


def write_if_changed(path: Path, before: str, after: str) -> None:
    if before == after:
        raise SystemExit(f'{path}: migration produced no change')
    path.write_text(after, encoding='utf-8')


acceptance = f'''# Portfolio Clarity C5 — Knowledge surfaces — PRODUCTION ACCEPTED

> Accepted: 2026-08-11
> Accepted deployed SHA: `{ACCEPTED_SHA}`
> Durable state only; this ledger does not start, reset or close P3.6 Measurement.

## Exact evidence

- feature PR: #193 — MERGED;
- exact feature head: `{PR_HEAD}`;
- TDD RED Build #1721 / `31404495416` — expected FAILURE, 661 PASS / exactly 5 C5 FAIL;
- final exact-head Build #1754 / `{BUILD_RUN}` — SUCCESS;
- quality artifact `9081845821`, digest `sha256:1aad891494f773059237052fedecddbc7ea0d41b6160d007d1e5bfdd1a2313e8`;
- CodeQL #1296 / `31437853182` — SUCCESS;
- Dependency Review #1182 / `31437853183` — SUCCESS;
- accepted squash / exact deployed SHA: `{ACCEPTED_SHA}`;
- Pages #218 / `{PAGES_RUN}` — SUCCESS;
- github-pages deployment `{DEPLOYMENT_ID}` — success;
- Pages artifact `9091830845`, digest `sha256:d21cea0af2c20f8e20c4218244481d5127717c3e02c31816804a290f8dfd25b6`;
- Pages production verification reports `9091833853`, digest `sha256:606c1516529640b51cab480dd0e8a8b9347072c3a2be9b33f032419cf38e6179`;
- deployment-triggered Production Live #486 / `{LIVE_RUN}` — SUCCESS;
- production-live artifact `9091881791`, digest `{PRODUCTION_DIGEST}`.

## Accepted product boundary

C5 applies the approved scan-first presentation contract to the knowledge layer:

- **Engineering Notes** uses a concise registry-derived index from canonical `data/notes.json`, with latest-first summaries, reading time, tags and semantic no-JavaScript fallback; no second Notes index registry exists;
- **Publications RU/EN** presents Featured/published work and the generated catalogue before methodology framing while the canonical Publications Registry keeps bibliographic ownership;
- **Engineering Map** renders the graph before taxonomy explanation, preserves the reading guide after real scroll, and uses reviewed map-first visual baselines (`1440×1465` desktop / `390×2817` mobile) without changing global visual thresholds;
- **Sources** exposes the useful searchable/filterable knowledge base before meta framing while the existing Sources Registry remains authoritative.

Canonical registries, one Diplodoc site-wide search owner, clean URLs, static-first/no-JavaScript behavior, privacy/SEO ownership and evidence boundaries are unchanged.

## Measurement boundary

C5 acceptance is presentation/runtime acceptance, not evidence that engagement, conversion or SEO improved. It does not start, reset or close P3.6 Measurement. P3.6 remains **NEXT / WAITING** for sufficient real equal-duration operator-observed aggregate evidence and human review.
'''
if ACCEPTANCE.exists():
    raise SystemExit(f'{ACCEPTANCE}: already exists')
ACCEPTANCE.parent.mkdir(parents=True, exist_ok=True)
ACCEPTANCE.write_text(acceptance, encoding='utf-8')

state = STATE.read_text(encoding='utf-8')
updated = replace_once(
    state,
    '> Последнее смысловое обновление: **2026-08-10**, после exact-production acceptance C4 — Professional surfaces; P3.6 measurement остаётся открытым.',
    '> Последнее смысловое обновление: **2026-08-11**, после exact-production acceptance C5 — Knowledge surfaces; P3.6 measurement остаётся открытым.',
    'PROJECT_STATE header',
)
c5_state = f'''### C5 — Knowledge surfaces — PRODUCTION ACCEPTED

The fifth runtime slice of **Portfolio Clarity & Scanability** is production-accepted. Engineering Notes, Publications RU/EN, Engineering Map and Sources now use the approved scan-first knowledge presentation without creating parallel registries or a second site-wide search owner.

- PR #193 exact feature head: `{PR_HEAD}`;
- exact-head Build #1754 / `{BUILD_RUN}` — SUCCESS;
- quality artifact `9081845821`, digest `sha256:1aad891494f773059237052fedecddbc7ea0d41b6160d007d1e5bfdd1a2313e8`;
- CodeQL #1296 / `31437853182` — SUCCESS;
- Dependency Review #1182 / `31437853183` — SUCCESS;
- accepted squash / deployed SHA: `{ACCEPTED_SHA}`;
- Pages #218 / `{PAGES_RUN}` — SUCCESS;
- github-pages deployment `{DEPLOYMENT_ID}` — success;
- Pages artifact `9091830845`, digest `sha256:d21cea0af2c20f8e20c4218244481d5127717c3e02c31816804a290f8dfd25b6`;
- Pages production verification reports `9091833853`, digest `sha256:606c1516529640b51cab480dd0e8a8b9347072c3a2be9b33f032419cf38e6179`;
- deployment-triggered Production Live #486 / `{LIVE_RUN}` — SUCCESS;
- production artifact `9091881791`, digest `{PRODUCTION_DIGEST}`.

Durable ledger: `docs/acceptance/2026-08-11-portfolio-clarity-c5.md`. C5 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim.

Next redesign slice: **C6 — final EN/SEO reconciliation**.

## 3. External project evidence boundaries'''
updated = replace_once(
    updated,
    'Next redesign slice: **C5 — Knowledge surfaces**.\n\n## 3. External project evidence boundaries',
    c5_state,
    'PROJECT_STATE C5 insertion',
)
updated = replace_once(
    updated,
    '**C5 — Knowledge surfaces — NEXT IMPLEMENTATION SLICE.**',
    '**C6 — final EN/SEO reconciliation — NEXT IMPLEMENTATION SLICE.**',
    'PROJECT_STATE next slice',
)
updated = updated.replace('C2/C3/C4 presentation work', 'C2/C3/C4/C5 presentation work')
write_if_changed(STATE, state, updated)

roadmap = ROADMAP.read_text(encoding='utf-8')
updated = replace_once(
    roadmap,
    '> Обновлено: **2026-08-10**, после exact-production acceptance C4 — Professional surfaces; C5 — Knowledge surfaces является следующим implementation slice, P3.6 measurement ожидает внешние aggregate observations.',
    '> Обновлено: **2026-08-11**, после exact-production acceptance C5 — Knowledge surfaces; C6 — final EN/SEO reconciliation является следующим implementation slice, P3.6 measurement ожидает внешние aggregate observations.',
    'ROADMAP header',
)
updated = replace_once(
    updated,
    '- Homepage/Experience/NotchHub presentation refinement — PR #167/#168 / PRODUCTION ACCEPTED.',
    '- Homepage/Experience/NotchHub presentation refinement — PR #167/#168 / PRODUCTION ACCEPTED.\n- Portfolio Clarity C5 — Knowledge surfaces — PR #193 / PRODUCTION ACCEPTED.',
    'ROADMAP completed milestone',
)
c5_roadmap = f'''## C5 — Knowledge surfaces — DONE / PRODUCTION ACCEPTED

Accepted outcome: Engineering Notes index derives from canonical `data/notes.json`; Publications RU/EN puts published work before methodology; Engineering Map is map-first with reviewed responsive visuals; Sources puts searchable/filterable utility before meta framing. No second Notes/Publications/Sources registry or site-wide search owner was introduced.

```text
PR #193 exact head:              {PR_HEAD}
Build:                           #1754 / {BUILD_RUN} — SUCCESS
quality artifact:                9081845821
quality digest:                  sha256:1aad891494f773059237052fedecddbc7ea0d41b6160d007d1e5bfdd1a2313e8
accepted squash / deployed SHA:  {ACCEPTED_SHA}
Pages:                           #218 / {PAGES_RUN} — SUCCESS
Pages deployment ID:             {DEPLOYMENT_ID}
Pages artifact:                  9091830845
Pages artifact digest:           sha256:d21cea0af2c20f8e20c4218244481d5127717c3e02c31816804a290f8dfd25b6
Production Live Smoke:           #486 / {LIVE_RUN} — SUCCESS
production artifact:             9091881791
production digest:               {PRODUCTION_DIGEST}
```

C5 does not start, reset or close P3.6 Measurement.

Next redesign slice: **C6 — final EN/SEO reconciliation**.

## P3.6 — Measurement checkpoint — NEXT / WAITING'''
updated = replace_once(
    updated,
    'Next redesign slice: **C5 — Knowledge surfaces**. Apply the approved scan-first hierarchy to Engineering Notes, Publications, Sources and Engineering Map without creating parallel registries/search ownership or collapsing evidence depth.\n\n## P3.6 — Measurement checkpoint — NEXT / WAITING',
    c5_roadmap,
    'ROADMAP C5 section',
)
old_tail = 'Confirm C4 exact production acceptance for SHA `12ea58e815ebf09bcc5915e92a715cd3bfed5241`, Pages run `31401684624`, deployment `5834505086` and Production Live run `31402338027`. Continue with **C5 — Knowledge surfaces** as the next product implementation slice. Keep **P3.6 — Measurement checkpoint — NEXT / WAITING** parallel and untouched until real `operator-observed` aggregate evidence satisfies the documented window and human-review boundaries.'
new_tail = f'Confirm C4 exact production acceptance for SHA `12ea58e815ebf09bcc5915e92a715cd3bfed5241`, Pages run `31401684624`, deployment `5834505086` and Production Live run `31402338027`. Confirm C5 exact production acceptance for SHA `{ACCEPTED_SHA}`, Pages run `{PAGES_RUN}`, deployment `{DEPLOYMENT_ID}` and Production Live run `{LIVE_RUN}`. Continue with **C6 — final EN/SEO reconciliation** as the next product implementation slice. Keep **P3.6 — Measurement checkpoint — NEXT / WAITING** parallel and untouched until real `operator-observed` aggregate evidence satisfies the documented window and human-review boundaries.'
updated = replace_once(updated, old_tail, new_tail, 'ROADMAP new-session rule')
write_if_changed(ROADMAP, roadmap, updated)

changelog = CHANGELOG.read_text(encoding='utf-8')
updated = replace_once(
    changelog,
    '> Обновлено: **2026-08-10**, после exact-production acceptance C4 — Professional surfaces; P3.6 measurement остаётся открытым.',
    '> Обновлено: **2026-08-11**, после exact-production acceptance C5 — Knowledge surfaces; P3.6 measurement остаётся открытым.',
    'CHANGELOG header',
)
c5_changelog = f'''## 2026-08-11 — C5 Knowledge surfaces — PRODUCTION ACCEPTED

- Replaced the hand-authored Engineering Notes mini-catalogue with a compact latest-first index derived from canonical `data/notes.json`; added semantic no-JavaScript output and a dedicated registry/count/order/overflow/Axe browser gate.
- Reordered Publications RU/EN so Featured and generated catalogue precede methodology framing without changing bibliographic ownership.
- Moved Engineering Map before taxonomy explanation, verified the reading guide after real scroll and reviewed only the intentional map-first desktop/mobile visual overrides (`1440×1465` / `390×2817`) with unchanged global thresholds.
- Moved Sources searchable/filterable knowledge utility before meta framing while preserving the existing Sources Registry and page-local filter ownership.
- Resolved the Advanced Security TOCTOU finding in the new Notes index postprocessor with direct read + explicit `ENOENT` handling and regression coverage.
- PR #193 exact head: `{PR_HEAD}`;
- final exact-head Build #1754 / `{BUILD_RUN}` — SUCCESS;
- quality artifact `9081845821`, digest `sha256:1aad891494f773059237052fedecddbc7ea0d41b6160d007d1e5bfdd1a2313e8`;
- CodeQL #1296 / `31437853182` — SUCCESS;
- Dependency Review #1182 / `31437853183` — SUCCESS;
- accepted squash / deployed SHA: `{ACCEPTED_SHA}`;
- Pages #218 / `{PAGES_RUN}` — SUCCESS;
- Pages deployment `{DEPLOYMENT_ID}` — success;
- Pages artifact `9091830845`, digest `sha256:d21cea0af2c20f8e20c4218244481d5127717c3e02c31816804a290f8dfd25b6`;
- Pages verification reports `9091833853`, digest `sha256:606c1516529640b51cab480dd0e8a8b9347072c3a2be9b33f032419cf38e6179`;
- deployment-triggered Production Live #486 / `{LIVE_RUN}` — SUCCESS;
- production artifact `9091881791`, digest `{PRODUCTION_DIGEST}`.

C5 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim. Next implementation slice: **C6 — final EN/SEO reconciliation**.

## 2026-08-10 — C4 Professional surfaces — PRODUCTION ACCEPTED'''
updated = replace_once(
    updated,
    '## 2026-08-10 — C4 Professional surfaces — PRODUCTION ACCEPTED',
    c5_changelog,
    'CHANGELOG C5 insertion',
)
write_if_changed(CHANGELOG, changelog, updated)

print('C5 durable acceptance migration completed.')
