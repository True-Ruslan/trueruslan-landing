import fs from 'node:fs';

function replaceExactlyOnce(text, marker, replacement, label) {
  const first = text.indexOf(marker);
  if (first === -1) throw new Error(`${label}: marker not found`);
  if (text.indexOf(marker, first + marker.length) !== -1) throw new Error(`${label}: marker is not unique`);
  return text.replace(marker, replacement);
}

function updateFile(path, transform) {
  const before = fs.readFileSync(path, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`${path}: updater produced no change`);
  fs.writeFileSync(path, after, 'utf8');
}

const projectBlock = `### P3.6B — Yandex Metrica Reports API — CONNECTED / TOOLING ACCEPTED

P3.6B extends the accepted P3.6A measurement tooling with read-only aggregate Yandex Metrica Reports API enrichment. The real authenticated connection was verified against the configured counter; OAuth remains least-privilege \`metrika:read\` and is confined to GitHub Actions.

\`\`\`text
PR #157 squash / deployed SHA:       f0600dceef16d3471f5a2c67fecd28ff18f174dc
real connection check:               31201235872 — SUCCESS
probe day:                            2026-08-06 UTC
\`\`\`

The successful authenticated probe proves API/counter access only. It does **not** accept P3.6 measurement, manufacture historical traffic or replace the observation-window and human-review gates.

### P3.6C — Consent-gated Yandex Metrica browser collection — PR #158 / PENDING PRODUCTION ACCEPTANCE

P3.6C implements explicit-consent browser collection as progressive enhancement. No Yandex provider script, provider request or provider cookie is allowed before explicit consent. The bounded init disables Webvisor/session replay, Click Map, outbound-link tracking, accurate-bounce events, hash tracking and page-title transmission; custom events, user parameters, ecommerce and noscript tracking remain out of scope.

PR #158 has deterministic policy/schema contracts, final-artifact verification, fake-counter Chromium consent lifecycle coverage and an exact-deployment pre-consent production verifier. **Production acceptance remains pending** until the merged SHA is deployed by Pages and independent Production Live Smoke proves the real artifact keeps Yandex network/scripts/cookies at zero before consent.

P3.6 remains open: browser collection readiness is not equivalent to real equal-duration aggregate observations, sufficient traffic or human review.

`;

const roadmapBlock = `### P3.6B — Yandex Metrica Reports API — CONNECTED / DONE AS TOOLING

PR #157 added bounded read-only aggregate Reports API enrichment. The real authenticated connection is verified by run \`31201235872\` — SUCCESS. The browser OAuth boundary remains separate and the token is not exposed to generated pages.

### P3.6C — Consent-gated Yandex Metrica browser collection — PR #158 / PENDING PRODUCTION ACCEPTANCE

Implemented with **explicit consent**: no Yandex provider network/script/cookies before opt-in; Webvisor, Click Map, link tracking, accurate-bounce events, hash tracking, title transmission, custom events, user parameters, ecommerce and noscript tracking are disabled or forbidden. PR CI uses a fake counter and intercepts provider traffic; the production verifier never grants consent.

Next acceptance gate for P3.6C is exact merged Pages deployment plus Production Live pre-consent verification. This does not close P3.6 measurement.

`;

const changelogBlock = `## 2026-08-07 — P3.6B real Reports API connection and P3.6C consent-gated browser collection

P3.6B moved from synthetic-only readiness to a real authenticated Yandex Metrica Reports API connection. The configured repository counter and read-only OAuth access were verified by connection-check run \`31201235872\` — SUCCESS for completed UTC day 2026-08-06. This accepts the API connection/tooling boundary only; P3.6 measurement remains open.

P3.6C is implemented in **PR #158** with **explicit consent** before any Yandex browser provider request. The final postprocessor is after clean URLs; generated pages contain only a first-party consent controller until opt-in. Webvisor/session replay, Click Map, link tracking, accurate-bounce events, hash tracking, title transmission, custom events, user parameters, ecommerce and noscript tracking are disabled or forbidden. Consent withdrawal disables future collection and denied-state reloads do not load the provider.

P3.6C is **pending production acceptance** until PR #158 is merged, the exact SHA is deployed by Pages with the real counter variable, the final artifact verifier passes, and Production Live Smoke proves a fresh RU/EN context makes zero Yandex provider requests before consent. P3.6 itself remains NOT ACCEPTED pending real observation windows, traffic-sufficiency assessment and human review.

`;

updateFile('docs/PROJECT_STATE.md', (text) => {
  let next = replaceExactlyOnce(
    text,
    '> Последнее смысловое обновление: **2026-08-07**, после exact acceptance P3.6A Measurement readiness; реальный P3.6 measurement остаётся открытым.',
    '> Последнее смысловое обновление: **2026-08-07**, после реального подключения P3.6B Reports API и реализации P3.6C browser collection в PR #158; P3.6 measurement остаётся открытым.',
    'PROJECT_STATE header',
  );
  next = replaceExactlyOnce(
    next,
    '**P3.6 — Measurement checkpoint — NEXT / WAITING FOR EXTERNAL EVIDENCE.**',
    `${projectBlock}**P3.6 — Measurement checkpoint — NEXT / WAITING FOR EXTERNAL EVIDENCE.**`,
    'PROJECT_STATE P3.6 insertion',
  );
  return next;
});

updateFile('docs/ROADMAP.md', (text) => {
  let next = replaceExactlyOnce(
    text,
    '> Обновлено: **2026-08-07**, после exact acceptance P3.6A Measurement readiness; P3.6 measurement ожидает внешние aggregate observations.',
    '> Обновлено: **2026-08-07**, после реального подключения P3.6B Reports API и реализации P3.6C browser collection в PR #158; P3.6 measurement ожидает внешние aggregate observations.',
    'ROADMAP header',
  );
  next = replaceExactlyOnce(
    next,
    '## P3.6 — Measurement checkpoint — NEXT / WAITING',
    `${roadmapBlock}## P3.6 — Measurement checkpoint — NEXT / WAITING`,
    'ROADMAP P3.6 insertion',
  );
  return next;
});

updateFile('docs/CHANGELOG.md', (text) => {
  let next = replaceExactlyOnce(
    text,
    '> Обновлено: **2026-08-07**, после exact acceptance P3.6A Measurement readiness; P3.6 measurement остаётся открытым.',
    '> Обновлено: **2026-08-07**, после реального подключения P3.6B Reports API и реализации P3.6C browser collection в PR #158; P3.6 measurement остаётся открытым.',
    'CHANGELOG header',
  );
  next = replaceExactlyOnce(
    next,
    '## 2026-08-07 — P3.6A Measurement readiness',
    `${changelogBlock}## 2026-08-07 — P3.6A Measurement readiness`,
    'CHANGELOG insertion',
  );
  return next;
});

console.log('P3.6B/P3.6C durable state updated successfully.');
