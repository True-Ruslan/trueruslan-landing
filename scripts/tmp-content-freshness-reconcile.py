import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EVIDENCE = ROOT / "data" / "project-evidence.json"
HISTORY = ROOT / "data" / "project-history"
TODAY = "2026-08-14"


def load(path):
    return json.loads(path.read_text())


def save(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def snapshot(items, slug):
    matches = [item for item in items if item.get("project") == slug]
    assert len(matches) == 1, f"expected one evidence snapshot for {slug}"
    return matches[0]


def version(item, label, value):
    matches = [fact for fact in item["versions"] if fact.get("label") == label]
    assert len(matches) == 1, f"expected version fact {label!r} for {item['project']}"
    matches[0]["value"] = value


def append_signal(item, signal):
    if any(existing.get("label") == signal["label"] for existing in item["signals"]):
        return
    item["signals"].append(signal)


def reconcile_evidence():
    items = load(EVIDENCE)

    vlezet = snapshot(items, "vlezet")
    vlezet["lastVerified"] = TODAY
    version(vlezet, "Accepted editor slice", "M8.2 — product-owner accepted, protected squash-merged and post-merge verified")
    version(vlezet, "Active product slice", "M8.2 complete; project-wide testing-policy + coverage audit is current engineering priority before M8.3")
    version(vlezet, "Next acceptance boundary", "Testing-policy + coverage audit, then M8.3 Precision Reference Calibration")
    draft = [signal for signal in vlezet["signals"] if signal.get("label") == "M8.2 precision drawing and structural editing Draft PR #87"]
    if draft:
        assert len(draft) == 1
        draft[0].update({
            "label": "M8.2 precision drawing and structural editing PR #87",
            "state": "merged",
            "observedAt": "2026-08-13",
            "scope": "PR #87 completed M8.2 with explicit product-owner acceptance after the final three-scenario door-UX retest passed. The accepted delivery head passed exact-head CI plus Chromium/WebKit Browser Acceptance and was protected squash-merged as e323e331a435ae356b91decbdea80dde95028d8a. Post-merge CI #5097 and CodeQL run 31683756298 passed. Vlezet remains pre-production; this is acceptance of the M8.2 editor slice, not a public-beta release claim.",
        })
    append_signal(vlezet, {
        "kind": "pr",
        "mode": "automated",
        "label": "M8.2 post-merge truth reconciliation PR #88",
        "state": "merged",
        "url": "https://github.com/True-Ruslan/vlezet/pull/88",
        "observedAt": "2026-08-13",
        "scope": "PR #88 reconciled canonical project state after the already accepted M8.2 protected merge. M8.3 is technically unblocked, but the project-wide testing-policy and coverage audit requested by the product owner remains the current engineering priority before further product work.",
    })

    livingworld = snapshot(items, "livingworld")
    livingworld["lastVerified"] = TODAY
    version(livingworld, "Current official release", "0.3.1+1.21.1")
    version(livingworld, "Active development slice", "0.3.1 corrective installed VAI-PCM-MULTI-001 canary pending; do not start 0.4 before real installed evidence")
    version(livingworld, "Latest merged source capability", "0.3.1 bounded targeted Memory 2.0 recall correction and published corrective release")
    if not any(fact.get("label") == "Current 0.3.1 acceptance" for fact in livingworld["versions"]):
        index = next(i for i, fact in enumerate(livingworld["versions"]) if fact.get("label") == "Current official release") + 1
        livingworld["versions"].insert(index, {
            "label": "Current 0.3.1 acceptance",
            "value": "automated release gates PASS; installed corrective VAI-PCM-MULTI-001 canary PENDING",
        })
    append_signal(livingworld, {
        "kind": "release",
        "mode": "automated",
        "label": "Official 0.3.1+1.21.1 corrective release",
        "state": "published",
        "url": "https://github.com/True-Ruslan/villAIgence/releases/tag/0.3.1%2B1.21.1",
        "observedAt": "2026-08-13",
        "scope": "Official 0.3.1+1.21.1 is published from immutable release commit bc7c68ac2f3a4f761aa3b03a2f5c1fe1201745ab. The Fabric JAR SHA-256 is f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f. Automated release and post-release acceptance are green, but installed corrective VAI-PCM-MULTI-001 remains pending; lifecycle therefore stays release-candidate / ACCEPTANCE IN PROGRESS.",
    })
    append_signal(livingworld, {
        "kind": "pr",
        "mode": "automated",
        "label": "0.3.1 targeted Memory 2.0 recall correction PR #165",
        "state": "merged",
        "url": "https://github.com/True-Ruslan/villAIgence/pull/165",
        "observedAt": "2026-08-13",
        "scope": "PR #165 restored bounded query-aware recall for retained older eligible Memory 2.0 dialogue while preserving NPC/player isolation and the existing 32-candidate and 6-entry prompt bounds. Automated CI, security, production soak, persistence recovery, GameTests, supported-loader builds and release dry-run passed. Installed VAI-PCM-MULTI-001 was explicitly left pending the official 0.3.1 JAR.",
    })
    append_signal(livingworld, {
        "kind": "pr",
        "mode": "automated",
        "label": "0.3.1 installed corrective acceptance handoff PR #167",
        "state": "merged",
        "url": "https://github.com/True-Ruslan/villAIgence/pull/167",
        "observedAt": TODAY,
        "scope": "PR #167 records the exact 0.3.1 release identity and the remaining installed corrective canary procedure. It preserves the retained 0.3.0 world/history, uses exact text as the decisive retrieval oracle, keeps cross-NPC isolation and duplicate-persistence checks, and explicitly leaves VAI-M2-INST-005 and VAI-CONCUR-004 deferred. No installed PASS is claimed before real server evidence exists.",
    })

    portfolio = snapshot(items, "portfolio-platform")
    portfolio["lastVerified"] = TODAY
    version(portfolio, "Current production baseline", "master f0e489d75f5bcb1f64057e1046faad877bf3f952 — N6 product accepted and canonical state reconciled")
    version(portfolio, "Search Discovery", "P4.1A READY; P4.1B IN PROGRESS / SPARSE PRE-LAUNCH BASELINE; controlled launch not-published; P4.1C WAITING")
    append_signal(portfolio, {
        "kind": "pr",
        "mode": "automated",
        "label": "N6 production verifier correction PR #234",
        "state": "merged",
        "url": "https://github.com/True-Ruslan/trueruslan-landing/pull/234",
        "observedAt": TODAY,
        "scope": "PR #234 corrected the stale locale contract in the deployed Work with me no-JS smoke after N6C. Exact product SHA 635b4a0760765a515277ad8abcbb1500bf646027 passed Pages #255, Production Live #564/#565 and master CodeQL #1662, including the previously failing Work with me smoke. This is product/deployment evidence only, not search or engagement evidence.",
    })
    append_signal(portfolio, {
        "kind": "pr",
        "mode": "automated",
        "label": "N6 durable state reconciliation PR #237",
        "state": "merged",
        "url": "https://github.com/True-Ruslan/trueruslan-landing/pull/237",
        "observedAt": TODAY,
        "scope": "PR #237 reconciled PROJECT_STATE, ROADMAP and CHANGELOG with the production-accepted N6 editorial programme. Squash f0e489d75f5bcb1f64057e1046faad877bf3f952 passed post-merge Pages #257, Production Live #568/#569 and master CodeQL #1667. Controlled launch remains not-published; P4.1B stays sparse/in progress and P4.1C/P3.6 remain external-evidence gated.",
    })

    node_zero = snapshot(items, "node-zero")
    assert node_zero["status"] == "stale", "node-zero must remain stale"
    node_zero["lastVerified"] = TODAY
    append_signal(node_zero, {
        "kind": "manual",
        "mode": "manual",
        "label": "Stale-evidence review — no new private acceptance evidence",
        "state": "unavailable",
        "observedAt": TODAY,
        "scope": "The controlled snapshot was explicitly reviewed for freshness. No new authoritative private-repository or executable acceptance evidence is available in the portfolio evidence boundary, so the project remains stale / REVIEW REQUIRED and no lifecycle, version or acceptance claim is promoted. The July production-foundation acceptance remains the last positive executable evidence.",
    })

    save(EVIDENCE, items)


def reconcile_history(slug, marker, current, next_entry):
    path = HISTORY / f"{slug}.json"
    entries = load(path)
    if any(entry.get("title") == marker for entry in entries):
        assert sum(entry.get("state") == "current" for entry in entries) == 1
        return
    for entry in entries:
        if entry.get("state") in {"current", "next"}:
            entry["state"] = "past"
    entries.extend([current, next_entry])
    assert sum(entry.get("state") == "current" for entry in entries) == 1
    save(path, entries)


def reconcile_histories():
    reconcile_history(
        "livingworld",
        "0.3.1 corrective release published — installed canary pending",
        {
            "date": "2026-08",
            "title": "0.3.1 corrective release published — installed canary pending",
            "description": "Official 0.3.1+1.21.1 is published after the bounded targeted Memory 2.0 recall correction. Automated release and post-release gates are green, but the exact installed VAI-PCM-MULTI-001 corrective canary is still pending on the retained server world. The project therefore remains release-candidate / ACCEPTANCE IN PROGRESS; no installed-acceptance or 0.4 claim is made.",
            "state": "current",
            "evidence": "https://github.com/True-Ruslan/villAIgence/pull/167",
        },
        {
            "date": "NEXT",
            "title": "Run exact 0.3.1 installed VAI-PCM-MULTI-001 corrective canary",
            "description": "Install the official 0.3.1+1.21.1 JAR, verify SHA-256 f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f, reuse the retained crowded-history world and execute the exact-text Muammer/Nurey isolation and persistence procedure from PR #167. Only real installed PASS evidence may close the 0.3 corrective boundary and unblock 0.4.",
            "state": "next",
            "evidence": "https://github.com/True-Ruslan/villAIgence/pull/167",
        },
    )
    reconcile_history(
        "vlezet",
        "M8.2 precision drawing and structural editing accepted and merged",
        {
            "date": "2026-08",
            "title": "M8.2 precision drawing and structural editing accepted and merged",
            "description": "PR #87 closed the M8.2 product-owner gate after the final focused door-UX retest passed, exact-head CI plus Chromium/WebKit Browser Acceptance were green, and the slice was protected squash-merged as e323e331a435ae356b91decbdea80dde95028d8a. Post-merge CI and CodeQL passed. Vlezet remains pre-production.",
            "state": "current",
            "evidence": "https://github.com/True-Ruslan/vlezet/pull/87",
        },
        {
            "date": "NEXT",
            "title": "Complete testing-policy and coverage audit before M8.3",
            "description": "The M8.3 Precision Reference Calibration product milestone is technically unblocked, but the current engineering priority is the project-wide testing-policy and coverage audit recorded by PR #88. Complete that quality boundary first; then start M8.3 without changing the pre-production lifecycle by inference.",
            "state": "next",
            "evidence": "https://github.com/True-Ruslan/vlezet/pull/88",
        },
    )
    reconcile_history(
        "portfolio-platform",
        "N6 full-site editorial UX and bounded copy polish production accepted",
        {
            "date": "2026-08",
            "title": "N6 full-site editorial UX and bounded copy polish production accepted",
            "description": "N6 completed the 50-route editorial audit and bounded RU/EN reader-facing copy polish without reopening architecture, canonical URLs, registries or typography. The stale Work with me production verifier was corrected in PR #234; canonical state was reconciled in PR #237. Exact master f0e489d75f5bcb1f64057e1046faad877bf3f952 is deployment-verified. Controlled launch is still not-published and no SEO, engagement or causal impact claim is inferred.",
            "state": "current",
            "evidence": "https://github.com/True-Ruslan/trueruslan-landing/pull/237",
        },
        {
            "date": "NEXT",
            "title": "Controlled manual launch, then real search and measurement evidence",
            "description": "Use the already accepted 10-target / 38-draft launch pack for the deliberate operator-controlled manual launch. Repository automation must not post or mutate external publication state. After launch, accumulate authenticated/operator-supplied Google Search Console and Yandex Webmaster observations for P4.1B; P4.1C and P3.6 remain evidence-gated.",
            "state": "next",
        },
    )


def verify():
    items = load(EVIDENCE)
    for slug in ("vlezet", "livingworld", "portfolio-platform"):
        item = snapshot(items, slug)
        assert item["status"] == "verified"
        assert item["lastVerified"] == TODAY
        assert max([item["lastVerified"], *[signal["observedAt"] for signal in item["signals"]]]) == TODAY
    node_zero = snapshot(items, "node-zero")
    assert node_zero["status"] == "stale"
    assert node_zero["lastVerified"] == TODAY
    assert any(signal["label"] == "Stale-evidence review — no new private acceptance evidence" for signal in node_zero["signals"])
    for slug in ("vlezet", "livingworld", "portfolio-platform", "node-zero"):
        entries = load(HISTORY / f"{slug}.json")
        assert sum(entry.get("state") == "current" for entry in entries) == 1


def main():
    reconcile_evidence()
    reconcile_histories()
    verify()


if __name__ == "__main__":
    main()
