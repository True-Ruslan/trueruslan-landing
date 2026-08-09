import fs from 'node:fs';

function read(path) { return fs.readFileSync(path, 'utf8'); }
function write(path, content) { fs.writeFileSync(path, content, 'utf8'); }
function insertBefore(path, anchor, block) {
  const source = read(path);
  if (!source.includes(anchor)) throw new Error(`${path}: anchor missing`);
  if (source.includes('### C1 — Presentation foundation — PRODUCTION ACCEPTED') || source.includes('## 2026-08-09 — C1 Presentation foundation — PRODUCTION ACCEPTED')) {
    throw new Error(`${path}: C1 acceptance already present`);
  }
  write(path, source.replace(anchor, `${block}\n\n${anchor}`));
}

const evidence = `- PR #174 squash / deployed SHA: \`9cc9d69e6b49e3e9f3432788f0deb943d7acebf5\`;\n- final exact-head Build #1463 / \`31304311486\` — SUCCESS;\n- Pages #202 / \`31304612906\` — SUCCESS;\n- Pages deployment \`5817134996\` — success;\n- Production Live Smoke #354 / \`31304642055\` — SUCCESS;\n- production artifact \`9035548962\`;\n- production digest \`sha256:41af56c91d59b5c80134d49b1928b0fde348384334c8863ddd9c74c9f4e5c85c\`;\n- production observation: \`2026-08-09T08:55:33.810Z\`.`;

insertBefore(
  'docs/PROJECT_STATE.md',
  '## External product reconciliation — 2026-08-08',
  `### C1 — Presentation foundation — PRODUCTION ACCEPTED\n\nThe first runtime slice of **Portfolio Clarity & Scanability** is production-accepted. It establishes self-hosted Onest Variable typography, bounded readability tokens and one five-destination RU/EN primary navigation while preserving secondary content, static-first/no-JS behavior and every existing quality gate.\n\n${evidence}\n\nThe durable acceptance ledger is \`docs/acceptance/2026-08-09-portfolio-clarity-c1.md\`. This is an isolated foundation slice, not the final redesign measurement baseline: **P3.6 — Measurement checkpoint — NEXT / WAITING** remains unchanged until the full accepted redesign and its new observation window exist.`
);

insertBefore(
  'docs/ROADMAP.md',
  '### P3.6 — Measurement checkpoint — NEXT / WAITING FOR EXTERNAL EVIDENCE',
  `### C1 — Presentation foundation — PRODUCTION ACCEPTED\n\nPortfolio Clarity & Scanability implementation has started with a bounded production foundation:\n\n- Onest Variable is self-hosted with exact reviewed WOFF2 subsets and OFL license;\n- shared readability tokens use a 17px desktop / 16px mobile body target, 1.62 line height and 70ch long-form width;\n- RU/EN primary navigation is limited to five semantic destinations while secondary knowledge surfaces remain in the content tree;\n- mobile overflow, Chromium accessibility/Lighthouse, Firefox/WebKit, privacy, metadata/search and visual-regression gates remain green without weakening.\n\n${evidence}\n\nNext redesign slice: **C2 — Homepage structure**. C1 does not start/reset/close P3.6; the final accepted redesign remains the new presentation-baseline boundary.`
);

insertBefore(
  'docs/CHANGELOG.md',
  '## 2026-08-09 — Evidence-led Work with me capability — PRODUCTION ACCEPTED',
  `## 2026-08-09 — C1 Presentation foundation — PRODUCTION ACCEPTED\n\n- Began implementation of the approved **Portfolio Clarity & Scanability** redesign with an intentionally bounded foundation slice.\n- Replaced the generic system/UI typography with self-hosted **Onest Variable** using reviewed Cyrillic + Latin WOFF2 subsets, exact SHA-256 contracts and retained SIL OFL 1.1 text.\n- Added shared readability tokens: 17px desktop body target, 16px mobile body target, 1.62 line-height and 70ch long-form width.\n- Reduced primary navigation to exactly five semantic destinations in both RU and EN while keeping /now, Engineering Map, Notes, Publications, Sources, Photos and Contacts available through the existing content tree/sidebar.\n- Extended build-time asset publication to WOFF2 and license text; no runtime font CDN was introduced.\n- TDD RED: head \`a6e3c067c63d8ca91245e941b89c9ac0b0514a1a\`, Build #1442 / \`31301733976\`, 585 PASS / exactly 5 expected FAIL.\n- Final source acceptance: Build #1463 / \`31304311486\`, 591 PASS / 0 FAIL; CodeQL #988 and Dependency Review #891 SUCCESS; full browser/a11y/Lighthouse/cross-browser/privacy/SEO/visual matrix SUCCESS.\n- Manual visual review accepted only the homepage desktop/mobile baseline change caused by the new font; unrelated shared baselines were preserved.\n- Production accepted exact squash SHA \`9cc9d69e6b49e3e9f3432788f0deb943d7acebf5\`.\n\n${evidence}\n\nC1 is not the final redesign measurement baseline. P3.6 remains **NEXT / WAITING**, and the next implementation slice is **C2 — Homepage structure**.`
);

console.log('C1 durable acceptance migration applied');

// Retrigger marker: 2026-08-09
