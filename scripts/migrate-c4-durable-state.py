from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PR_HEAD = "90551bf476a167a589ee1b4a5fab2cb11c8cd923"
ACCEPTED = "12ea58e815ebf09bcc5915e92a715cd3bfed5241"
BUILD = "31400871629"
PAGES = "31401684624"
DEPLOYMENT = "5834505086"
LIVE = "31402338027"
PRODUCTION_DIGEST = "sha256:8548b1740dd7d8e746feaedcc08ce6b227df786fa4646b4b7018e9bb1928f264"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, value: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(value, encoding="utf-8")


def replace_once(source: str, old: str, new: str, label: str) -> str:
    count = source.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    return source.replace(old, new, 1)


ledger_path = ROOT / "docs/acceptance/2026-08-10-portfolio-clarity-c4.md"
if ledger_path.exists():
    raise SystemExit(f"ledger already exists: {ledger_path}")

ledger = f"""# Portfolio Clarity C4 — Professional surfaces — PRODUCTION ACCEPTED

> Accepted: 2026-08-10
> Accepted deployed SHA: `{ACCEPTED}`
> Durable state only; this ledger does not start, reset or close P3.6 Measurement.

## Exact evidence

- feature PR: #191 — MERGED;
- exact feature head: `{PR_HEAD}`;
- exact-head Build #1712 / `{BUILD}` — SUCCESS;
- quality artifact `9067791638`, digest `sha256:0699049422b719281dbb68980bcde478a0adbd37dfad03ac19b69280ab32151c`;
- CodeQL #1252 / `31400871940` — SUCCESS;
- Dependency Review #1140 / `31400871675` — SUCCESS;
- accepted squash / exact deployed SHA: `{ACCEPTED}`;
- Pages #216 / `{PAGES}` — SUCCESS;
- github-pages deployment `{DEPLOYMENT}` — success;
- Pages artifact `9067905904`, digest `sha256:b1ed622b6b40f7b4fbec5e11afa161ca40eb53337fdfb9f7cc625d7fef4d1d4e`;
- Pages production verification reports `9068142728`, digest `sha256:8f05a5c04f4f4269ddcf947e87c39f74d375fd45d1081f8a44f084784344adbd`;
- deployment-triggered Production Live #482 / `{LIVE}` — SUCCESS;
- production-live artifact `9068239234`, digest `{PRODUCTION_DIGEST}`.

## Accepted product boundary

C4 applies the approved scan-first presentation contract to the professional layer:

- **Experience** RU/EN leads with concise positioning, direct contact, five grouped stack areas and impact-first role summaries;
- **Work with me** RU/EN exposes canonical availability, exactly three professional tracks, a three-step process, direct handoff and explicit boundaries;
- **About** RU/EN is reduced to three concise personal-professional sections without becoming a second Experience/Projects source of truth;
- **Now** RU/EN renders the canonical generated current snapshot before meta explanation while `data/now.json` and Project Registry keep ownership;
- **Contacts** keeps direct Telegram/email first and remains independent from the collaboration renderer;
- Resume desktop/mobile visual acceptance is tied to reviewed `1440×3631` / `390×4964` samples with unchanged global visual thresholds.

Canonical collaboration/Now/project registries, static-first/no-JavaScript behavior, one Diplodoc search owner, clean URLs, privacy/SEO ownership and external evidence boundaries are unchanged.

## Measurement boundary

C4 acceptance is presentation/runtime acceptance, not evidence that engagement, conversion or SEO improved. It does not start, reset or close P3.6 Measurement. P3.6 remains **NEXT / WAITING** for sufficient real equal-duration operator-observed aggregate evidence and human review.
"""
write("docs/acceptance/2026-08-10-portfolio-clarity-c4.md", ledger)

state = read("docs/PROJECT_STATE.md")
state = replace_once(
    state,
    "> Последнее смысловое обновление: **2026-08-10**, после exact-production acceptance C3 — Projects and flagship summary layer; P3.6 measurement остаётся открытым.",
    "> Последнее смысловое обновление: **2026-08-10**, после exact-production acceptance C4 — Professional surfaces; P3.6 measurement остаётся открытым.",
    "PROJECT_STATE top marker",
)
state_anchor = "Durable ledger: `docs/acceptance/2026-08-10-portfolio-clarity-c3.md`. C3 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim.\n\nNext redesign slice: **C4 — Professional surfaces**.\n\n## 3. External project evidence boundaries"
state_replacement = f"""Durable ledger: `docs/acceptance/2026-08-10-portfolio-clarity-c3.md`. C3 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim.

### C4 — Professional surfaces — PRODUCTION ACCEPTED

The fourth runtime slice of **Portfolio Clarity & Scanability** is production-accepted. Experience, Work with me, About, Now and Contacts now use the approved scan-first professional presentation while canonical collaboration/Now/project registries, no-JavaScript semantics, one Diplodoc search owner, privacy/SEO and clean-route ownership remain unchanged.

- PR #191 exact feature head: `{PR_HEAD}`;
- exact-head Build #1712 / `{BUILD}` — SUCCESS;
- quality artifact `9067791638`, digest `sha256:0699049422b719281dbb68980bcde478a0adbd37dfad03ac19b69280ab32151c`;
- CodeQL #1252 / `31400871940` — SUCCESS;
- Dependency Review #1140 / `31400871675` — SUCCESS;
- accepted squash / deployed SHA: `{ACCEPTED}`;
- Pages #216 / `{PAGES}` — SUCCESS;
- Pages deployment `{DEPLOYMENT}` — success;
- Pages artifact `9067905904`, digest `sha256:b1ed622b6b40f7b4fbec5e11afa161ca40eb53337fdfb9f7cc625d7fef4d1d4e`;
- deployment-triggered Production Live #482 / `{LIVE}` — SUCCESS;
- production artifact `9068239234`, digest `{PRODUCTION_DIGEST}`.

Durable ledger: `docs/acceptance/2026-08-10-portfolio-clarity-c4.md`. C4 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim.

Next redesign slice: **C5 — Knowledge surfaces**.

## 3. External project evidence boundaries"""
state = replace_once(state, state_anchor, state_replacement, "PROJECT_STATE C3→C4 section")
write("docs/PROJECT_STATE.md", state)

roadmap = read("docs/ROADMAP.md")
roadmap = replace_once(
    roadmap,
    "> Обновлено: **2026-08-10**, после exact-production acceptance C3 — Projects and flagship summary layer; C4 — Professional surfaces является следующим implementation slice, P3.6 measurement ожидает внешние aggregate observations.",
    "> Обновлено: **2026-08-10**, после exact-production acceptance C4 — Professional surfaces; C5 — Knowledge surfaces является следующим implementation slice, P3.6 measurement ожидает внешние aggregate observations.",
    "ROADMAP top marker",
)
roadmap_anchor = "C3 preserves project lifecycle/evidence ownership and does not start, reset or close P3.6.\n\nNext redesign slice: **C4 — Professional surfaces**. Apply the approved scan-first contracts to Experience, Work with me, About, Now and Contacts without changing their canonical data/privacy/URL ownership.\n\n## P3.6 — Measurement checkpoint — NEXT / WAITING"
roadmap_replacement = f"""C3 preserves project lifecycle/evidence ownership and does not start, reset or close P3.6.

### C4 — Professional surfaces — PRODUCTION ACCEPTED

Accepted scan-first professional layer: Experience, Work with me, About, Now and Contacts are concise and useful on first scan while canonical mutable truth stays registry-owned. Resume keeps passive PDF/no-JS semantics and reviewed desktop/mobile presentation; generated search, privacy, SEO and clean routes remain unchanged.

- PR #191 exact feature head: `{PR_HEAD}`;
- exact-head Build #1712 / `{BUILD}` — SUCCESS;
- CodeQL #1252 / `31400871940` — SUCCESS;
- Dependency Review #1140 / `31400871675` — SUCCESS;
- accepted squash / deployed SHA: `{ACCEPTED}`;
- Pages #216 / `{PAGES}` — SUCCESS;
- Pages deployment `{DEPLOYMENT}` — success;
- deployment-triggered Production Live #482 / `{LIVE}` — SUCCESS;
- production artifact digest: `{PRODUCTION_DIGEST}`.

C4 does not start, reset or close P3.6 Measurement.

Next redesign slice: **C5 — Knowledge surfaces**. Apply the approved scan-first hierarchy to Engineering Notes, Publications, Sources and Engineering Map without creating parallel registries/search ownership or collapsing evidence depth.

## P3.6 — Measurement checkpoint — NEXT / WAITING"""
roadmap = replace_once(roadmap, roadmap_anchor, roadmap_replacement, "ROADMAP C3→C4 section")
roadmap = replace_once(
    roadmap,
    "Continue with **C4 — Professional surfaces** as the next product implementation slice. Keep **P3.6 — Measurement checkpoint — NEXT / WAITING** parallel and untouched until real `operator-observed` aggregate evidence satisfies the documented window and human-review boundaries.",
    f"Confirm C4 exact production acceptance for SHA `{ACCEPTED}`, Pages run `{PAGES}`, deployment `{DEPLOYMENT}` and Production Live run `{LIVE}`. Continue with **C5 — Knowledge surfaces** as the next product implementation slice. Keep **P3.6 — Measurement checkpoint — NEXT / WAITING** parallel and untouched until real `operator-observed` aggregate evidence satisfies the documented window and human-review boundaries.",
    "ROADMAP new-session next slice",
)
write("docs/ROADMAP.md", roadmap)

changelog = read("docs/CHANGELOG.md")
changelog = replace_once(
    changelog,
    "> Обновлено: **2026-08-10**, после exact-production acceptance C3 — Projects and flagship summary layer; P3.6 measurement остаётся открытым.",
    "> Обновлено: **2026-08-10**, после exact-production acceptance C4 — Professional surfaces; P3.6 measurement остаётся открытым.",
    "CHANGELOG top marker",
)
changelog_anchor = "## 2026-08-10 — C3 Projects and flagship summary layer — PRODUCTION ACCEPTED"
changelog_entry = f"""## 2026-08-10 — C4 Professional surfaces — PRODUCTION ACCEPTED

- Reworked RU/EN Experience into a concise hero, direct contact action, five grouped stack areas and impact-first role summaries; removed the duplicated Profile/flat technology wall.
- Reduced RU/EN Work with me to exactly three useful tracks, canonical availability, three implementation steps, direct handoff and explicit boundaries.
- Reduced RU/EN About to three concise personal-professional sections while preserving current Java/Spring and AI/MCP facts without duplicating full Experience/Projects narratives.
- Moved the canonical generated Now snapshot before meta explanation in RU/EN; `data/now.json` and Project Registry remain authoritative.
- Made Telegram/email immediate on Contacts while profiles and qualification remain secondary; collaboration renderer still does not own Contacts.
- Reviewed the intentional Resume visual change before acceptance; final desktop/mobile samples are `1440×3631` / `390×4964` with unchanged global visual thresholds.
- PR #191 exact head: `{PR_HEAD}`;
- exact-head Build #1712 / `{BUILD}` — SUCCESS;
- quality artifact `9067791638`, digest `sha256:0699049422b719281dbb68980bcde478a0adbd37dfad03ac19b69280ab32151c`;
- CodeQL #1252 / `31400871940` — SUCCESS;
- Dependency Review #1140 / `31400871675` — SUCCESS;
- accepted squash / deployed SHA: `{ACCEPTED}`;
- Pages #216 / `{PAGES}` — SUCCESS;
- Pages deployment `{DEPLOYMENT}` — success;
- Pages artifact `9067905904`, digest `sha256:b1ed622b6b40f7b4fbec5e11afa161ca40eb53337fdfb9f7cc625d7fef4d1d4e`;
- deployment-triggered Production Live #482 / `{LIVE}` — SUCCESS;
- production artifact `9068239234`, digest `{PRODUCTION_DIGEST}`.

C4 does not start, reset or close P3.6 Measurement and makes no engagement, conversion, SEO or causal product-impact claim. Next implementation slice: **C5 — Knowledge surfaces**.

{changelog_anchor}"""
changelog = replace_once(changelog, changelog_anchor, changelog_entry, "CHANGELOG C4 entry")
write("docs/CHANGELOG.md", changelog)

print("C4 durable-state migration prepared successfully")
