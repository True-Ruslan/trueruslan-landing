# Full-site Editorial & UX QA — N6B disposition ledger

Date: **2026-08-13**

Status: **AUDIT COMPLETE / N6C CANDIDATES SELECTED**

## Evidence identity

- branch: `docs/full-site-editorial-ux-qa`;
- machine-audit head: `171ab2c8742f4b13d5f811367cf30dae8e857549`;
- evidence workflow: `N6 Editorial Audit Evidence` run `31706835072` — **SUCCESS**;
- artifact: `9183532020` (`n6-editorial-ux-audit`);
- artifact digest: `sha256:b2fff87182c34910a84a1ded97191e08f72464627606aeba74fc24d5239ca647`;
- generated: `2026-08-13T13:49:11.514Z`;
- canonical routes: **50**;
- Tier 1 / decision: **14**;
- Tier 2 / discovery: **18**;
- Tier 3 / deep: **18**;
- automated scanability warnings after Oracle-DB false-positive regression fix: **0**.

The zero-warning result means no configured threshold is currently violated. It does **not** mean every page is editorially finished; the human review below intentionally catches tone, mixed-language and repository-facing wording that deterministic thresholds cannot judge.

## Typography disposition

**KEEP.** The accepted self-hosted Onest typography foundation remains appropriate. N6 found no concrete glyph, readability, fallback or performance defect that justifies reopening C1/PR #174.

## Route-by-route review

| Route | Tier | Words | Disposition | Review |
|---|---:|---:|---|---|
| `/` | tier1 | 188 | **KEEP** | Clear purpose, short opening and no residual high-value scanability defect found. |
| `/projects/` | tier1 | 262 | **TIGHTEN_COPY** | Selected-project summaries mix Russian with internal English/process vocabulary (`case study`, source/artifact/deployment/live production, authority-style phrasing); simplify without changing evidence truth. |
| `/projects/livingworld/` | tier2 | 1724 | **KEEP** | Case-study depth is intentional; opening and paragraph lengths remain scan-friendly for a project detail page. |
| `/projects/notchhub/` | tier2 | 896 | **KEEP** | Case-study depth is intentional; opening and paragraph lengths remain scan-friendly for a project detail page. |
| `/projects/portfolio-platform/` | tier2 | 1082 | **KEEP** | Case-study depth is intentional; opening and paragraph lengths remain scan-friendly for a project detail page. |
| `/projects/node-zero/` | tier2 | 1269 | **KEEP** | Case-study depth is intentional; opening and paragraph lengths remain scan-friendly for a project detail page. |
| `/projects/taskhub/` | tier2 | 347 | **KEEP** | Case-study depth is intentional; opening and paragraph lengths remain scan-friendly for a project detail page. |
| `/projects/minichess/` | tier2 | 332 | **KEEP** | Case-study depth is intentional; opening and paragraph lengths remain scan-friendly for a project detail page. |
| `/projects/godot-horror-template/` | tier2 | 354 | **KEEP** | Case-study depth is intentional; opening and paragraph lengths remain scan-friendly for a project detail page. |
| `/projects/vlezet/` | tier2 | 1737 | **KEEP** | Case-study depth is intentional; opening and paragraph lengths remain scan-friendly for a project detail page. |
| `/resume/` | tier1 | 467 | **KEEP** | Clear current professional context and scannable grouped stack; the former `PROCESS_JARGON` warning was the legitimate Oracle database name, not public process jargon. |
| `/materials/` | tier1 | 67 | **TIGHTEN_COPY** | Structurally light, but several summaries stack English category/process terms; simplify the Russian orientation copy while keeping established section names. |
| `/publications/` | tier2 | 222 | **TIGHTEN_COPY** | “Проверяемая внешняя точка” and the all-English eyebrow are more registry-like than reader-facing; replace with natural publication/source wording. |
| `/engineering-map/` | tier2 | 101 | **KEEP** | The taxonomy directly explains the graph and remains short; English node-type labels correspond to actual graph semantics. |
| `/notes/` | tier2 | 47 | **TIGHTEN_COPY** | The hub still exposes internal `engineering evidence` and `Notes Registry` vocabulary after N5 reader improvements; keep the reader architecture but remove repository-facing language. |
| `/notes/portfolio-runtime-boundary/` | tier3 | 328 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/static-site-quality-gates/` | tier3 | 508 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/server-authoritative-ai-npcs/` | tier3 | 635 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/llm-output-is-a-protocol-boundary/` | tier3 | 866 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/intersection-observer-giant-table/` | tier3 | 530 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/static-first-sources-no-js/` | tier3 | 600 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/green-ci-is-not-product-verification/` | tier3 | 632 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/deployment-success-is-not-production-verification/` | tier3 | 1099 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/evidence-driven-project-state/` | tier3 | 539 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/clean-urls-without-cloudflare-routing/` | tier3 | 1187 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/source-tests-to-installed-acceptance/` | tier3 | 1933 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/gametests-vs-installed-gameplay-acceptance/` | tier3 | 1643 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/passive-pdf-validation-vs-semantic-completeness/` | tier3 | 1212 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/probabilistic-proposals-deterministic-authority/` | tier3 | 1321 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/hybrid-cv-ai-recognition-boundaries/` | tier3 | 1681 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/notes/restart-persistence-is-a-product-contract/` | tier3 | 1587 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/bibliography/` | tier2 | 35 | **KEEP** | Short orientation, obvious collection purpose and no redundant explanation. |
| `/work-with-me/` | tier1 | 183 | **TIGHTEN_COPY** | Russian decision surface overuses English service/process labels (`Backend engineering`, `AI tooling`, `Context & Scope`, `Handover`, fixed-price/scope) and can read more naturally in Russian. |
| `/about/` | tier1 | 211 | **TIGHTEN_COPY** | Concise, but still uses internal engineering language such as “источники истины”, agentic scenarios and authority framing on a personal surface; make it more human without losing technical precision. |
| `/now/` | tier1 | 36 | **KEEP** | Short public snapshot with QWEP correctly presented as current full-time commercial context. |
| `/photos/` | tier2 | 0 | **KEEP** | Markdown owner is intentionally a generated placeholder; current visible archive content comes from the photo archive registry rather than prose. |
| `/contacts/` | tier1 | 53 | **KEEP** | Direct purpose, contact methods visible immediately and one bounded pointer to collaboration context. |
| `/en/projects/` | tier1 | 286 | **TIGHTEN_COPY** | Flagship portfolio summary still foregrounds internal pipeline vocabulary (“source, artifact, deployment and live-production verification”); simplify for a public projects hub. |
| `/en/about/` | tier1 | 242 | **TIGHTEN_COPY** | Readable, but “sources of truth / ownership boundaries / bounded capability” makes the personal introduction more system-internal than necessary. |
| `/en/resume/` | tier1 | 520 | **KEEP** | Clear grouped Experience surface; Oracle is a legitimate database technology and no true process-jargon warning remains. |
| `/en/work-with-me/` | tier1 | 220 | **KEEP** | English process vocabulary is native to the locale and the page remains concise, explicit and action-oriented. |
| `/en/now/` | tier1 | 38 | **KEEP** | Short public snapshot aligned with the RU current-employment truth. |
| `/en/publications/` | tier2 | 247 | **KEEP** | Natural English publication/source wording and bounded orientation around the generated catalogue. |
| `/en/projects/livingworld/` | tier2 | 1190 | **KEEP** | Case-study depth is intentional; the English opening and section rhythm remain bounded. |
| `/en/projects/notchhub/` | tier2 | 977 | **KEEP** | Case-study depth is intentional; the English opening and section rhythm remain bounded. |
| `/en/projects/portfolio-platform/` | tier2 | 1020 | **KEEP** | Case-study depth is intentional; the English opening and section rhythm remain bounded. |
| `/en/notes/server-authoritative-ai-npcs/` | tier3 | 614 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/en/notes/llm-output-is-a-protocol-boundary/` | tier3 | 727 | **DEEP_KEEP** | Long-form technical Note; depth is intentional and N5 already validated standalone reader value. |
| `/en/projects/vlezet/` | tier2 | 1776 | **KEEP** | Case-study depth is intentional; the English opening and section rhythm remain bounded. |
| `/en/` | tier1 | 218 | **KEEP** | Clear landing purpose, short opening and no residual high-value scanability defect found. |

## N6C selected corrections

Only the following public surfaces are selected for the correction slice:

1. **RU Projects `/projects/` — `TIGHTEN_COPY`**
   - reduce mixed English/internal delivery vocabulary in project summaries;
   - keep project status, QWEP/MarketDB truth and all evidence semantics unchanged;
   - keep case-study depth one click deeper.
2. **RU Work with me `/work-with-me/` — `TIGHTEN_COPY`**
   - replace unnecessary English service/process labels with natural Russian;
   - retain established technical terms such as Java, Spring, API, Kafka, CI/CD, LLM and MCP;
   - keep scope/boundary meaning, but phrase it as client-facing copy rather than an internal engagement contract.
3. **RU About `/about/` — `TIGHTEN_COPY`**
   - make the personal introduction less architecture-internal;
   - replace or explain “источники истины”, agentic/authority-style wording where it is not needed;
   - preserve QWEP, current stack, teaching/research and personal interests exactly.
4. **RU Materials `/materials/` — `TIGHTEN_COPY`**
   - keep product names `Engineering Map` and `Engineering Notes`, but simplify surrounding Russian descriptions;
   - remove unnecessary category/process English where Russian is clearer.
5. **RU Publications `/publications/` — `TIGHTEN_COPY`**
   - replace “проверяемая внешняя точка” with natural source/publication wording;
   - remove the decorative all-English eyebrow if it adds no information;
   - preserve canonical external evidence rules.
6. **RU Notes hub `/notes/` — `TIGHTEN_COPY`**
   - remove repository-facing `engineering evidence` / `Notes Registry` language from the public orientation copy;
   - preserve the N5 Start here / series / related-reading architecture and every Note URL.
7. **EN Projects `/en/projects/` — `TIGHTEN_COPY`**
   - remove internal build/deployment-pipeline wording from the flagship portfolio summary;
   - preserve the same factual project boundary as RU.
8. **EN About `/en/about/` — `TIGHTEN_COPY`**
   - make the personal surface less systems-internal while keeping the same commercial/technical facts.

No layout restructuring, global font change, project-detail shortening, Note merge/delete, URL migration or speculative SEO rewrite is selected.

## Explicitly accepted surfaces

- Resume/Experience: **KEEP**. The apparent `PROCESS_JARGON` finding was a tooling false positive caused by the legitimate **Oracle** database name. A dedicated regression test now distinguishes `Oracle DB` from phrases such as `test oracle` / `state oracle`.
- Now and Contacts: **KEEP**; both are short, direct decision surfaces.
- Engineering Map and Sources: **KEEP**; their taxonomy/collection language directly serves the page purpose.
- Photos: **KEEP** as a registry/postprocessed archive surface; the Markdown owner is intentionally only a placeholder, while `data/photo-archive.json` owns the current archive entries.
- Detailed project pages: **KEEP**; depth is the purpose of a case study and paragraph metrics remain bounded.
- Individual Engineering Notes: **DEEP_KEEP**; N5 already performed the destructive-change/readability audit, and N6 found no new evidence justifying consolidation.

## N6C acceptance boundary

N6C is an editorial correction slice, not an SEO or conversion experiment. It must preserve URLs, canonical/hreflang/feed/search contracts, accessibility, no-JS usefulness, project lifecycle truth and external-measurement state. Selected copy changes require focused source/browser assertions where wording is a durable product contract, followed by the full exact-head quality/security/visual matrix and exact production verification.
