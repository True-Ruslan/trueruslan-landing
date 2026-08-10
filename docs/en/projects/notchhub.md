# NotchHub — local-first macOS productivity hub around the notch

**NotchHub** is a native macOS application that turns the area around the MacBook camera housing into a compact entry point for everyday tools. The product goal is an always-available surface that stays lightweight, local-first and independent of a dedicated cloud backend.

[GitHub repository ↗](https://github.com/True-Ruslan/notch-hub)

## At a glance

<dl class="tr-project-glance" data-tr-project-glance="notchhub">
<dt>My contribution</dt>
<dd>Solo product engineering across native macOS architecture, interaction, performance, security and release boundaries.</dd>
<dt>Stack</dt>
<dd>Swift 6 · SwiftUI · AppKit · macOS · XCTest</dd>
<dt>Challenge</dt>
<dd>Turn the MacBook notch area into a useful always-on surface without a heavy runtime or broad permissions.</dd>
<dt>Result</dt>
<dd>The 0.1.0 — Personal build foundation is accepted; the next interaction milestone remains separate work rather than inherited acceptance.</dd>
<dt>Status</dt>
<dd><span data-tr-project-status="notchhub"></span></dd>
</dl>

<div data-tr-project-timeline="notchhub"></div>

<!-- case-study:problem -->
## Problem: an always-on utility should not become another heavy application

The notch stays close to the user's focus but provides almost no application surface by itself. NotchHub explores whether that space can host useful local productivity tools without introducing a background web runtime, telemetry or broad operating-system permissions.

Planned modules are **Shelf, Snippets, Calendar, Translator and media controls**, with **Yandex Music** as the primary media target. They intentionally follow Notch Core work: geometry, interaction correctness, security and resource behavior must be credible before feature density grows.

<!-- case-study:constraints -->
## Constraints and product invariants

### Native and local-first by default

The accepted foundation uses **Swift 6**. **SwiftUI** owns composition, while **AppKit** owns `NSPanel`, window geometry, notch integration and system-facing transitions.

The current runtime boundary is deliberately narrow:

- **App Sandbox** is enabled;
- **Hardened Runtime** is enabled without dangerous exceptions;
- there are no third-party Swift runtime dependencies in the accepted baseline;
- there is no telemetry, analytics, advertising or licensing backend;
- there is no direct runtime network/WebKit surface in the accepted baseline;
- there is no subprocess/shell execution or dynamic plugin loading;
- global input observation is not broadened merely for UI convenience.

Any future capability that needs a wider permission or attack surface must first update the security contract, executable policy and tests.

### Resource efficiency is a product requirement

NotchHub is designed to remain available continuously, so CPU, RSS, threads, background work and artifact size are release concerns rather than a later optimization pass.

Accepted P0 measurements for `0.1.0` on the target MacBook/macOS 26.6:

| Scenario | CPU median / max | RSS max | Threads max |
|---|---:|---:|---:|
| Idle | `0.0% / 0.7%` | `33,808 KiB` | `4` |
| Hover | `5.95% / 22.3%` | `38,816 KiB` | `7` |
| 10-minute stability | `0.0% / 6.8%` | `34,384 KiB` | `7` |

The stability window showed no sustained memory growth. Shared CI separately enforces deterministic artifact-size budgets, but it does not pretend to replace physical target-Mac CPU/RAM evidence.

<!-- case-study:current-state -->
## Current boundary: accepted foundation versus pending interaction work

The accepted public foundation is **`0.1.0 — Personal build`**.

Four boundaries are complete:

- **M0 — Engineering foundation: ACCEPTED** — Swift 6 shell, notch geometry, pointer policy, AppKit-owned sizing and required real-hardware notch/hover checks;
- **R0.1 — Personal Release: ACCEPTED** — immutable personal-use DMG with checksum/provenance and the standard Gatekeeper flow;
- **P0 — Performance Foundation: ACCEPTED** — event-driven policy, target-Mac baselines, deterministic size budgets and regression tooling;
- **P0.1 — Public Repository Readiness: ACCEPTED** — public source with read-only, secret-free pull-request CI and isolated release authority.

That does **not** mean the next interaction milestone is complete.

**M1 — Notch Core hardening and interaction is not accepted.** Active work remains in **Draft PR #10**. It covers delayed hover, exactly-once public AppKit haptic feedback, pointer-monitor lifecycle, notch-adjacent visual chrome and deterministic expand/collapse transitions. A physical retest exposed a separate transition-quality regression: corrected endpoints rendered, but opening and closing became abrupt. M1 therefore remains Draft until deterministic tests, exact-head CI, performance/security/size gates and target-Mac interaction evidence all pass.

<!-- case-study:decisions -->
## Architecture and key decisions

### AppKit owns window geometry

SwiftUI must not accidentally redefine physical-notch sizing. Size, position and outer clipping belong to the AppKit-owned window boundary; the view layer receives an already-defined presentation state.

This boundary was strengthened after real defects involving panel width, hover oscillation and rounded-corner degradation across repeated transitions.

### Interaction stays event-driven

P0 prohibits unreviewed repeating timers, busy loops and display-link polling in runtime sources. M1 carries that forward: delayed hover uses one cancellable pending work item, while transition lifecycle behavior must remain deterministic and race-safe.

### Haptic feedback confirms one successful user transition

The M1 design uses public `NSHapticFeedbackManager.defaultPerformer`. Haptic feedback is allowed only for a successful deliberate `compact → expanded` transition and must not fire for cancellation, duplicate movement, collapse, programmatic transitions or stale callbacks.

### Reduce Motion and reversal are transition contracts

One transition coordinator owns `compact / expanding / expanded / collapsing` phases, generation-protected completions and coordinated frame/chrome evolution. Reversal during an in-flight transition is tested separately, and Reduce Motion is treated as behavior rather than a cosmetic afterthought.

<!-- case-study:release -->
## Personal Release trust boundary

`0.1.0` is distributed as a **Personal build**. It is:

- ad-hoc signed;
- App Sandbox and Hardened Runtime protected;
- published with SHA-256 and build provenance;
- intentionally **not notarized** by Apple and not represented as a Trusted Release.

A downloaded build may require the standard Finder **Open** or **System Settings → Privacy & Security → Open Anyway** path on first launch. The project does not disable Gatekeeper.

Developer ID/notarization remains a separate optional future tier. Lack of paid Apple Developer Program membership is not a blocker for the current personal-use product.

<!-- case-study:roadmap -->
## What comes next

After M1 is accepted, the roadmap moves through product modules:

1. **Shelf** — sandbox-compatible handling of user-selected files;
2. **Snippets** — local storage, search and a copy-first privacy model;
3. **Calendar** — EventKit with explicit permission states;
4. **Translator** — Apple Translation framework where available;
5. **Media / Yandex Music** — a provider abstraction with separate compatibility/security review;
6. **Product shell** — settings, module ordering and supported launch-at-login behavior.

The governing boundary stays the same: a new module must not silently weaken security, privacy or the resource profile of an always-on application.

<!-- case-study:lessons -->
## What the project already demonstrates

- notch-adjacent UI is primarily a geometry and window-lifecycle problem, not just SwiftUI styling;
- physical acceptance matters where simulation cannot prove hardware-surface behavior;
- measured resource baselines are more useful than a vague claim that an app is lightweight;
- security boundaries are easier to preserve when they become executable policy before feature pressure arrives;
- accepted `0.1.0` and current Draft M1 must remain separate evidence layers.

---

**Current-boundary sources:** `README.md`, `docs/PROJECT_STATE.md`, `docs/ROADMAP.md`, `SECURITY.md`, `PERFORMANCE.md` and Draft PR #10 in the NotchHub repository, reviewed for this page on 2026-08-08.
