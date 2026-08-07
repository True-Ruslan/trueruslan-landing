import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`${label}: expected marker not found`);
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`${label}: expected marker is not unique`);
  }
  return `${source.slice(0, first)}${after}${source.slice(first + before.length)}`;
}

function update(relativePath, replacements) {
  const target = path.join(ROOT, relativePath);
  let text = fs.readFileSync(target, 'utf8');
  for (const replacement of replacements) {
    text = replaceOnce(text, replacement.before, replacement.after, `${relativePath}: ${replacement.label}`);
  }
  fs.writeFileSync(target, text, 'utf8');
}

const acceptedSha = '9bccf042fa6f9ce3ab289c7d023077c137ab238c';
const evidence = `\`\`\`text
PR #158 squash / deployed SHA:       ${acceptedSha}
Pages:                               #187 / 31227641778 — SUCCESS
Pages deployment ID:                 5803497490
Pages artifact:                      9012660943
Pages artifact digest:               sha256:79e2f08aae0523b5d84274be08cd2e554ab4d88e8f01e7f745fc6547109be622
Pages production reports:            9012663370
Pages reports digest:                sha256:baa0333182cd825287a67e0cca9b444bef1273ce631409d2bc945f53f161767d
Production Live Smoke:               #288 / 31227681975 — SUCCESS
Yandex pre-consent production smoke: PASS — zero Yandex requests before consent
production artifact:                 9012692719
production digest:                   sha256:1688d968db168f8342b9fca95b3550cbd7b4065aed0d6e6d282dc5e4fb22230a
\`\`\``;

update('docs/PROJECT_STATE.md', [
  {
    label: 'header',
    before: '> Последнее смысловое обновление: **2026-08-07**, после реального подключения P3.6B Reports API и реализации P3.6C browser collection в PR #158; P3.6 measurement остаётся открытым.',
    after: '> Последнее смысловое обновление: **2026-08-08**, после exact-production acceptance P3.6C consent-gated Yandex Metrica browser collection; P3.6 measurement остаётся открытым.',
  },
  {
    label: 'P3.6C block',
    before: `### P3.6C — Consent-gated Yandex Metrica browser collection — PR #158 / PENDING PRODUCTION ACCEPTANCE

P3.6C implements explicit-consent browser collection as progressive enhancement. No Yandex provider script, provider request or provider cookie is allowed before explicit consent. The bounded init disables Webvisor/session replay, Click Map, outbound-link tracking, accurate-bounce events, hash tracking and page-title transmission; custom events, user parameters, ecommerce and noscript tracking remain out of scope.

PR #158 has deterministic policy/schema contracts, final-artifact verification, fake-counter Chromium consent lifecycle coverage and an exact-deployment pre-consent production verifier. **Production acceptance remains pending** until the merged SHA is deployed by Pages and independent Production Live Smoke proves the real artifact keeps Yandex network/scripts/cookies at zero before consent.

P3.6 remains open: browser collection readiness is not equivalent to real equal-duration aggregate observations, sufficient traffic or human review.`,
    after: `### P3.6C — Consent-gated Yandex Metrica browser collection — PRODUCTION ACCEPTED

P3.6C implements **explicit consent** browser collection as progressive enhancement. No Yandex provider script, provider request or provider cookie is allowed before explicit consent. The bounded init disables Webvisor/session replay, Click Map, outbound-link tracking, accurate-bounce events, hash tracking and page-title transmission; custom events, user parameters, ecommerce and noscript tracking remain out of scope. Withdrawal after active initialization persists \`denied\`, sets the disable flag and reloads into a pre-init denied state.

The owner confirmed the counter-side privacy gate before production acceptance. Exact Pages #187 built the real-counter artifact from merged SHA \`${acceptedSha}\`; the final verifier accepted one bounded controller on representative RU/EN routes. Deployment-triggered Production Live #288 resolved the exact successful Pages deployment and the real-site Yandex pre-consent smoke proved **zero Yandex requests before consent**.

${evidence}

P3.6C is accepted only for the exact deployed SHA and evidence above. P3.6 remains open: production collection acceptance is not equivalent to real equal-duration aggregate observations, sufficient traffic or human review.`,
  },
]);

update('docs/ROADMAP.md', [
  {
    label: 'header',
    before: '> Обновлено: **2026-08-07**, после реального подключения P3.6B Reports API и реализации P3.6C browser collection в PR #158; P3.6 measurement ожидает внешние aggregate observations.',
    after: '> Обновлено: **2026-08-08**, после exact-production acceptance P3.6C consent-gated Yandex Metrica browser collection; P3.6 measurement ожидает внешние aggregate observations.',
  },
  {
    label: 'completed milestone',
    before: '- P3.5C English Publications — PR #153.',
    after: '- P3.5C English Publications — PR #153.\n- P3.6A Measurement readiness — PR #155.\n- P3.6B Yandex Metrica Reports API connection — PR #157.\n- P3.6C consent-gated Yandex Metrica browser collection — PR #158 / PRODUCTION ACCEPTED.',
  },
  {
    label: 'P3.6C block',
    before: `### P3.6C — Consent-gated Yandex Metrica browser collection — PR #158 / PENDING PRODUCTION ACCEPTANCE

Implemented with **explicit consent**: no Yandex provider network/script/cookies before opt-in; Webvisor, Click Map, link tracking, accurate-bounce events, hash tracking, title transmission, custom events, user parameters, ecommerce and noscript tracking are disabled or forbidden. PR CI uses a fake counter and intercepts provider traffic; the production verifier never grants consent.

Next acceptance gate for P3.6C is exact merged Pages deployment plus Production Live pre-consent verification. This does not close P3.6 measurement.`,
    after: `### P3.6C — Consent-gated Yandex Metrica browser collection — PRODUCTION ACCEPTED

Accepted with **explicit consent**: no Yandex provider network/script/cookies before opt-in; Webvisor, Click Map, link tracking, accurate-bounce events, hash tracking, title transmission, custom events, user parameters, ecommerce and noscript tracking are disabled or forbidden. PR CI uses a fake counter and intercepts provider traffic; production acceptance automation never grants consent.

${evidence}

The owner confirmed the counter-side privacy settings before acceptance. P3.6C is accepted only on exact deployed SHA \`${acceptedSha}\`. This does **not** close P3.6 measurement.`,
  },
  {
    label: 'new-session rule',
    before: 'Confirm P3.6A Measurement readiness acceptance for SHA `7cc56d024fbde53156a9136b14b00c81c6718811`, post-merge Measurement Checkpoint run `31185967995`, Pages run `31185967012`, deployment `5795968137` and Production Live run `31186078593`. Continue with **P3.6 — Measurement checkpoint — NEXT / WAITING** only when real `operator-observed` aggregate evidence satisfies the documented window and human-review boundaries.',
    after: `Confirm P3.6A Measurement readiness acceptance for SHA \`7cc56d024fbde53156a9136b14b00c81c6718811\`, post-merge Measurement Checkpoint run \`31185967995\`, Pages run \`31185967012\`, deployment \`5795968137\` and Production Live run \`31186078593\`. Confirm P3.6B real Reports API connection run \`31201235872\`. Confirm P3.6C production acceptance for SHA \`${acceptedSha}\`, Pages run \`31227641778\`, deployment \`5803497490\`, Production Live run \`31227681975\` and production evidence digest \`sha256:1688d968db168f8342b9fca95b3550cbd7b4065aed0d6e6d282dc5e4fb22230a\`. Continue with **P3.6 — Measurement checkpoint — NEXT / WAITING** only when real \`operator-observed\` aggregate evidence satisfies the documented window and human-review boundaries.`,
  },
]);

update('docs/CHANGELOG.md', [
  {
    label: 'header',
    before: '> Обновлено: **2026-08-07**, после реального подключения P3.6B Reports API и реализации P3.6C browser collection в PR #158; P3.6 measurement остаётся открытым.',
    after: '> Обновлено: **2026-08-08**, после exact-production acceptance P3.6C consent-gated Yandex Metrica browser collection; P3.6 measurement остаётся открытым.',
  },
  {
    label: 'acceptance entry',
    before: '## 2026-08-07 — P3.6B real Reports API connection and P3.6C consent-gated browser collection',
    after: `## 2026-08-08 — P3.6C Yandex Metrica browser collection — PRODUCTION ACCEPTED

PR #158 was squash-merged as \`${acceptedSha}\` after exact-head Build/CodeQL/Dependency Review and consent-lifecycle verification. The owner confirmed the counter-side privacy gate before rollout. Pages #187 built the production artifact with the real repository counter variable and its fail-closed verifier accepted the bounded consent controller without a static provider script or expanded tracking options.

Deployment-triggered Production Live Smoke #288 resolved the exact successful Pages deployment and ran the real-site pre-consent browser check without granting consent or sending test telemetry. The check passed with **zero Yandex requests before consent**; the production workflow also preserved the exact deployment identity and uploaded durable evidence.

${evidence}

P3.6C is therefore **PRODUCTION ACCEPTED** for exact deployed SHA \`${acceptedSha}\`. P3.6 measurement remains open / NOT ACCEPTED until real equal-duration \`operator-observed\` aggregate windows, the minimum observation duration, traffic-sufficiency assessment and human review are complete.

## 2026-08-07 — P3.6B real Reports API connection and P3.6C consent-gated browser collection`,
  },
]);

update('docs/keystone/specs/2026-08-07-p3-6c-consent-gated-metrica.md', [
  {
    label: 'status',
    before: '> Status: IMPLEMENTED IN PR #158 / PRODUCTION ACCEPTANCE PENDING EXACT DEPLOYMENT\n>\n> Date: 2026-08-07',
    after: '> Status: PRODUCTION ACCEPTED\n>\n> Implemented: 2026-08-07\n>\n> Production accepted: 2026-08-08',
  },
  {
    label: 'operator gate wording',
    before: 'Frontend controls do not configure every counter-side feature. Before final production acceptance, verify in Yandex Metrica:',
    after: 'Frontend controls do not configure every counter-side feature. The owner reviewed and confirmed the following counter-side gate before final production acceptance on 2026-08-08:',
  },
  {
    label: 'acceptance evidence',
    before: 'P3.6C requires exact-head CI, consent lifecycle browser smoke, security/dependency gates, zero unresolved review findings, exact Pages deployment, final artifact verification with the real counter variable, and a Production Live Smoke proving zero Yandex provider requests on a fresh page before consent. Production acceptance automation must not click Allow on the real site.\n\nEven after P3.6C acceptance, **P3.6 MEASUREMENT remains NOT ACCEPTED** until its real equal-duration observation windows, minimum duration, traffic-sufficiency assessment and human review are complete.',
    after: `P3.6C requires exact-head CI, consent lifecycle browser smoke, security/dependency gates, zero unresolved review findings, exact Pages deployment, final artifact verification with the real counter variable, and a Production Live Smoke proving zero Yandex provider requests on a fresh page before consent. Production acceptance automation must not click Allow on the real site.

## Exact production acceptance evidence

${evidence}

Pages #187 injected the consent controller into 90 final HTML pages and the production artifact verifier returned \`ok: true\` for representative RU/EN routes. Deployment-triggered Production Live #288 checked out exact SHA \`${acceptedSha}\`, resolved the matching successful Pages deployment on its first attempt, and passed \`production-yandex-metrica-consent-smoke.cjs\` with **zero Yandex requests before consent**. The production acceptance automation did not grant consent.

P3.6C is **PRODUCTION ACCEPTED** only for this exact evidence chain. Even after P3.6C acceptance, **P3.6 MEASUREMENT remains NOT ACCEPTED** until its real equal-duration observation windows, minimum duration, traffic-sufficiency assessment and human review are complete.`,
  },
]);

console.log('P3.6C durable production acceptance docs updated successfully.');
