import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVIDENCE_PATH = ROOT / "data" / "project-evidence.json"
HISTORY_DIR = ROOT / "data" / "project-history"


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def snapshot(evidence, slug):
    return next(item for item in evidence if item["project"] == slug)


def set_version(entry, label, value):
    for item in entry["versions"]:
        if item["label"] == label:
            item["value"] = value
            return
    entry["versions"].append({"label": label, "value": value})


def remove_signal(entry, *, url=None, label=None):
    entry["signals"] = [
        item
        for item in entry["signals"]
        if not ((url is not None and item.get("url") == url) or (label is not None and item.get("label") == label))
    ]


def add_signal(entry, signal):
    remove_signal(entry, url=signal.get("url"), label=signal.get("label"))
    entry["signals"].append(signal)


def supersede_timeline_entry(entry, note):
    entry["state"] = "past"
    if note not in entry["description"]:
        entry["description"] = f'{entry["description"]} {note}'


evidence = load_json(EVIDENCE_PATH)

# Vlezet: advance the controlled snapshot to the current Draft M8.2 evidence only.
vlezet = snapshot(evidence, "vlezet")
vlezet["lastVerified"] = "2026-08-12"
set_version(
    vlezet,
    "Next acceptance boundary",
    "M8.2 focused manual product-owner retest and explicit acceptance/merge boundary",
)
set_version(
    vlezet,
    "Active product slice",
    "M8.2 precision drawing and structural editing — Draft; focused manual product-owner retest pending",
)
remove_signal(vlezet, url="https://github.com/True-Ruslan/vlezet/pull/87")
add_signal(
    vlezet,
    {
        "kind": "pr",
        "mode": "automated",
        "label": "M8.2 precision drawing and structural editing Draft PR #87",
        "state": "pending",
        "url": "https://github.com/True-Ruslan/vlezet/pull/87",
        "observedAt": "2026-08-12",
        "scope": "PR #87 remains Draft on exact head 789f1de8eae92eebc8988a41f07439927431fb8b. The original seven product-owner scenarios passed; follow-up source work covers connected-wall/whole-room clipboard behavior, precise room/composite selection semantics and direct room translation. Automated evidence is green: dotnet test 693 passed, npm test 353 passed, CI #5021 PASS and Browser Acceptance #1471 PASS in Chromium/WebKit with artifact 9129992269 (sha256:8b48c9b29087c9442538ebf7888051c27e8c5f369566a5e7f61c14e1dba3ea44). Focused manual product-owner retest remains pending; no merge, release, lifecycle promotion or acceptance is claimed.",
    },
)

vlezet_timeline_path = HISTORY_DIR / "vlezet.json"
vlezet_timeline = load_json(vlezet_timeline_path)
for item in vlezet_timeline:
    if item["state"] == "current":
        supersede_timeline_entry(
            item,
            "This was the earlier bounded M8.2 state and was superseded by the broader 2026-08-12 precision/structural Draft evidence; it was not accepted by this transition.",
        )
    elif item["state"] == "next":
        supersede_timeline_entry(
            item,
            "This clipboard-only next-step wording was superseded by the broader focused manual product-owner retest boundary; it was not automatically completed.",
        )
vlezet_timeline.extend(
    [
        {
            "date": "2026-08",
            "title": "M8.2 precision drawing and structural editing — Draft",
            "description": "PR #87 remains Draft on exact head 789f1de8eae92eebc8988a41f07439927431fb8b. Automated .NET/npm/CI and Chromium/WebKit evidence is green, but the focused manual product-owner retest remains pending. No merge, release, lifecycle promotion or acceptance is claimed.",
            "state": "current",
            "evidence": "https://github.com/True-Ruslan/vlezet/pull/87",
        },
        {
            "date": "NEXT",
            "title": "Complete focused M8.2 product-owner retest",
            "description": "Run the focused manual product-owner retest against the current Draft, reconcile only observed defects, then require fresh exact-head automation and explicit product-owner acceptance before Ready/merge or any lifecycle promotion.",
            "state": "next",
        },
    ]
)
write_json(vlezet_timeline_path, vlezet_timeline)

# VillAIgence: source convergence advanced, immutable installed release did not.
vill = snapshot(evidence, "livingworld")
vill["lastVerified"] = "2026-08-12"
set_version(
    vill,
    "Active development slice",
    "0.3 release convergence planning complete — explicit release-request/candidate creation is next; no 0.3 publication/install claim",
)
set_version(
    vill,
    "Latest merged source capability",
    "0.3 dialogue/personality integration and release convergence contract — PR #160 merged",
)
remove_signal(vill, url="https://github.com/True-Ruslan/villAIgence/pull/155")
add_signal(
    vill,
    {
        "kind": "pr",
        "mode": "automated",
        "label": "Personality / social snapshot PR #155",
        "state": "merged",
        "url": "https://github.com/True-Ruslan/villAIgence/pull/155",
        "observedAt": "2026-08-11",
        "scope": "PR #155 merged bounded read-only MCA personality/direct NPC-pair social snapshot source capability at merge a04e76dcf3ca6a07126e4e4b46f4d417a857a10f. Exact-head CI, Production Soak and Release dry-run passed while github-release publication was skipped. It is source evidence only; official installed release remains 0.2.0+1.21.1 at 7 PASS / 0 FAIL with VAI-M2-INST-005 and VAI-CONCUR-004 still explicit NOT TESTED boundaries.",
    },
)
for item in [
    {
        "kind": "pr",
        "mode": "automated",
        "label": "Personality/social dialogue integration PR #158",
        "state": "merged",
        "url": "https://github.com/True-Ruslan/villAIgence/pull/158",
        "observedAt": "2026-08-12",
        "scope": "PR #158 merged personality/social dialogue integration at f6d8139cd1164653507ded8030b28c7c28e47cc2. Security #2456, CI #2821, Production Soak #490 and release dry-run #823 passed; release publication was skipped. The immutable official installed release remains 0.2.0+1.21.1, so this is not a 0.3 release or installed-acceptance claim.",
    },
    {
        "kind": "pr",
        "mode": "automated",
        "label": "0.3 dialogue integration state reconciliation PR #159",
        "state": "merged",
        "url": "https://github.com/True-Ruslan/villAIgence/pull/159",
        "observedAt": "2026-08-12",
        "scope": "PR #159 reconciled the 0.3 dialogue integration source state at 889d7ed7303250878b6afb42385f3a02ab169084. Repository security, CI, Production Soak and release dry-run passed while publication was skipped. It explicitly preserves 0.2.0+1.21.1 as the official installed release and makes no new release/install claim.",
    },
    {
        "kind": "pr",
        "mode": "automated",
        "label": "0.3 release convergence contract PR #160",
        "state": "merged",
        "url": "https://github.com/True-Ruslan/villAIgence/pull/160",
        "observedAt": "2026-08-12",
        "scope": "PR #160 merged the 0.3 release convergence contract at 03ccb2d5d047ca551a5ac6be6b927de4404f09cf. Repository security #2498, CI #2862, Production Soak #509 and release dry-run #842 passed; github-release publication was skipped. Planned candidate identity is 0.3.0+1.21.1, but docs/releases/NEXT_RELEASE.txt and the immutable official installed baseline remain 0.2.0+1.21.1. This is not a 0.3 release or installed-acceptance claim.",
    },
]:
    add_signal(vill, item)

vill_timeline_path = HISTORY_DIR / "livingworld.json"
vill_timeline = load_json(vill_timeline_path)
for item in vill_timeline:
    if item["state"] == "current":
        supersede_timeline_entry(
            item,
            "PR #155 subsequently merged as source capability; this historical Draft boundary did not itself publish or install a new release.",
        )
    elif item["state"] == "next":
        supersede_timeline_entry(
            item,
            "This earlier PR #155 completion boundary was superseded after the source slice merged and later 0.3 convergence work advanced; installed acceptance remained unchanged.",
        )
vill_timeline.extend(
    [
        {
            "date": "2026-08",
            "title": "0.3 release convergence contract merged — release not published",
            "description": "PRs #158/#159/#160 advanced personality/social dialogue source integration and defined the 0.3 release convergence contract. All referenced source/security/soak/dry-run gates passed, but release publication was skipped. Official installed acceptance remains 0.2.0+1.21.1 at 7 PASS / 0 FAIL with explicit NOT TESTED boundaries.",
            "state": "current",
            "evidence": "https://github.com/True-Ruslan/villAIgence/pull/160",
        },
        {
            "date": "NEXT",
            "title": "Create explicit 0.3 release-request/candidate",
            "description": "Create the separate 0.3.0+1.21.1 release-request/candidate only through the repository release contract. A later tag/release and installed acceptance must use exact-artifact and installed gates; no source convergence evidence may promote 0.3 automatically.",
            "state": "next",
        },
    ]
)
write_json(vill_timeline_path, vill_timeline)

# Portfolio Platform: current repository/build/deployment evidence, no external outcome claims.
portfolio = snapshot(evidence, "portfolio-platform")
portfolio["lastVerified"] = "2026-08-12"
set_version(
    portfolio,
    "Current production baseline",
    "master 80195a39ac40cb5f8c97d1f8ea8bbd1f3d744613 — launch/discovery + maintenance evidence production accepted",
)
set_version(
    portfolio,
    "Search Discovery",
    "P4.1A READY — 11 strategic surfaces / 21 clean routes / 0 findings / externalEvidence=not-collected; P4.1B NEXT",
)
for item in [
    {
        "kind": "build",
        "mode": "automated",
        "label": "Current production GitHub Pages #232",
        "state": "published",
        "url": "https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31583969846",
        "observedAt": "2026-08-12",
        "scope": "Pages #232 successfully deployed exact master 80195a39ac40cb5f8c97d1f8ea8bbd1f3d744613 after launch distribution, preview metadata, P4.1A Search Discovery, maintenance hardening and durable reconciliation. Deployment success is production identity evidence, not search-engine or engagement evidence.",
    },
    {
        "kind": "ci",
        "mode": "automated",
        "label": "Current Production Live Smoke #516",
        "state": "passed",
        "url": "https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31583969870",
        "observedAt": "2026-08-12",
        "scope": "Production Live Smoke #516 verified all deployment-only surfaces for exact deployed master 80195a39ac40cb5f8c97d1f8ea8bbd1f3d744613. Repository/build evidence includes 719 PASS / 0 FAIL and P4.1A discovery readiness 11 strategic surfaces / 21 clean routes / 0 findings / externalEvidence=not-collected. P3.6 remains NEXT / WAITING FOR EXTERNAL EVIDENCE; P4.1B remains NEXT and P4.1C WAITING, so no SEO, engagement, ranking or causal product-impact claim is inferred.",
    },
    {
        "kind": "ci",
        "mode": "automated",
        "label": "Current master CodeQL #1449",
        "state": "green",
        "url": "https://github.com/True-Ruslan/trueruslan-landing/actions/runs/31583969801",
        "observedAt": "2026-08-12",
        "scope": "Post-merge CodeQL #1449 completed SUCCESS on exact master 80195a39ac40cb5f8c97d1f8ea8bbd1f3d744613. It proves the configured JavaScript/TypeScript security analysis for that source identity; it does not substitute for deployment or external search evidence.",
    },
]:
    add_signal(portfolio, item)

portfolio_timeline_path = HISTORY_DIR / "portfolio-platform.json"
portfolio_timeline = load_json(portfolio_timeline_path)
for item in portfolio_timeline:
    if item["state"] == "current":
        supersede_timeline_entry(
            item,
            "C7 remains accepted historical production evidence; later launch/discovery and maintenance slices advanced the current exact production baseline without resetting P3.6.",
        )
    elif item["state"] == "next":
        item["description"] = "P3.6 remains NEXT / WAITING for real equal-duration operator-observed aggregate evidence, explicit traffic-sufficiency assessment and human review. P4.1B is separately NEXT for real Search Console / Yandex Webmaster observations; P4.1C remains WAITING for that evidence or a concrete structural finding. Synthetic pipeline or production readiness cannot create engagement, SEO or causal product-impact conclusions."
portfolio_timeline.append(
    {
        "date": "2026-08",
        "title": "Current launch / discovery / maintenance production baseline",
        "description": "Exact master 80195a39ac40cb5f8c97d1f8ea8bbd1f3d744613 is production-accepted after launch distribution, preview metadata, P4.1A Search Discovery readiness and maintenance reconciliation. Pages #232, Production Live #516 and CodeQL #1449 are green; P4.1A remains repository/deployment readiness only with externalEvidence=not-collected.",
        "state": "current",
        "evidence": "https://github.com/True-Ruslan/trueruslan-landing/pull/208",
    }
)
write_json(portfolio_timeline_path, portfolio_timeline)

write_json(EVIDENCE_PATH, evidence)
