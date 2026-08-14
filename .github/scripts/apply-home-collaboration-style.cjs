const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function write(path, content) {
  fs.writeFileSync(path, content, 'utf8');
}

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`${label}: source marker not found`);
  if (source.indexOf(before, first + before.length) >= 0) throw new Error(`${label}: source marker is not unique`);
  return source.slice(0, first) + after + source.slice(first + before.length);
}

function replaceBetween(source, start, end, replacement, label) {
  const startIndex = source.indexOf(start);
  if (startIndex < 0) throw new Error(`${label}: start marker not found`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (endIndex < 0) throw new Error(`${label}: end marker not found`);
  return source.slice(0, startIndex) + replacement + source.slice(endIndex);
}

const homePath = 'scripts/standalone-home.js';
let home = read(homePath);
home = replaceOnce(
  home,
  "      handoff: 'Написать напрямую',",
  "      handoff: 'Написать напрямую →',",
  'RU collaboration CTA',
);
home = replaceOnce(
  home,
  "      handoff: 'Contact me directly',",
  "      handoff: 'Contact me directly →',",
  'EN collaboration CTA',
);

const functionStart = "export function renderHomepageCollaborationSummary(collaboration, locale = 'ru') {";
const functionEnd = '\nexport function selectHomepageFlagships(projects) {';
const functionReplacement = `export function renderHomepageCollaborationSummary(collaboration, locale = 'ru') {
  const value = validateCollaboration(collaboration);
  const copy = getHomeCopy(locale).collaboration;
  const workWithMeHref = locale === 'en' ? 'en/work-with-me.html' : 'landing/work-with-me.html';
  const directHref = value.contact.telegram;
  const status = value.availability.engineering;
  const statusLabel = collaborationStatusLabel(status);

  return \`<section class="tr-home-section tr-home-bridge tr-home-collaboration" data-home-collaboration="true" aria-labelledby="home-collaboration-\${escapeHtml(locale)}-title">
  <div class="tr-home-bridge__copy tr-home-collaboration__copy">
    <p class="tr-home-bridge__eyebrow tr-home-collaboration__eyebrow">\${escapeHtml(copy.eyebrow)}</p>
    <h2 id="home-collaboration-\${escapeHtml(locale)}-title">\${escapeHtml(copy.title)}</h2>
    <p class="tr-home-collaboration__description">\${escapeHtml(copy.text)}</p>
    <p class="tr-home-collaboration__availability" aria-label="\${escapeHtml(copy.availability)}: \${escapeHtml(statusLabel)}">
      <span>\${escapeHtml(copy.availability)}</span>
      <strong data-tr-collaboration-home-availability data-status="\${escapeHtml(status)}">\${escapeHtml(statusLabel)}</strong>
    </p>
  </div>
  <div class="tr-home-bridge__actions tr-home-collaboration__actions">
    <a class="tr-home-bridge__action tr-home-bridge__action--primary tr-home-collaboration__action" href="\${escapeHtml(workWithMeHref)}">\${escapeHtml(copy.action)}</a>
    <a class="tr-home-bridge__action tr-home-collaboration__action" href="\${escapeHtml(directHref)}">\${escapeHtml(copy.handoff)}</a>
  </div>
</section>\`;
}
`;
home = replaceBetween(home, functionStart, functionEnd, functionReplacement, 'homepage collaboration renderer');
write(homePath, home);

const cssPath = 'docs/_assets/style/collaboration.css';
let css = read(cssPath);
css = css.replaceAll('.tr-home-collaboration__meta [data-status=', '.tr-home-collaboration__availability [data-status=');
const cssStart = '.tr-home-collaboration {\n  display: grid;';
const cssEnd = '\n.tr-contextual-collaboration {';
const cssReplacement = `.tr-home-collaboration__description {
  max-width: 720px;
  margin: .7rem 0 0;
  color: var(--tr-muted);
  line-height: 1.6;
}

.tr-home-collaboration__availability {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: .38rem .65rem;
  margin: .9rem 0 0;
  color: #8190a4;
  font: 650 .7rem/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: .075em;
  text-transform: uppercase;
}

.tr-home-collaboration__availability span,
.tr-home-collaboration__availability strong {
  margin: 0;
}

.tr-home-collaboration__availability strong {
  color: var(--tr-text);
  font-weight: 760;
  letter-spacing: .055em;
}

.tr-home-collaboration__actions {
  align-items: stretch;
}
`;
css = replaceBetween(css, cssStart, cssEnd, cssReplacement, 'homepage collaboration CSS');
const mobileBlock = `
  .tr-home-collaboration {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .tr-home-collaboration__meta {
    grid-column: auto;
  }
`;
css = replaceOnce(css, mobileBlock, '\n', 'obsolete homepage collaboration mobile overrides');
write(cssPath, css);

const testPath = 'scripts/standalone-home.test.js';
let tests = read(testPath);
const assertionAnchor = "  assert.equal(count(html, 'data-home-collaboration='), 1);";
const assertionBlock = `${assertionAnchor}
  assert.match(html, /class="tr-home-section tr-home-bridge tr-home-collaboration"/);
  assert.match(html, /class="tr-home-bridge__eyebrow tr-home-collaboration__eyebrow"/);
  assert.match(html, /class="tr-home-bridge__actions tr-home-collaboration__actions"/);
  assert.match(html, /class="tr-home-bridge__action tr-home-bridge__action--primary tr-home-collaboration__action" href="landing\\/work-with-me\\.html"/);
  assert.match(html, /data-tr-collaboration-home-availability data-status="limited">LIMITED<\\/strong>/);
  assert.doesNotMatch(html, /tr-home-collaboration__meta/);`;
tests = replaceOnce(tests, assertionAnchor, assertionBlock, 'homepage collaboration assertions');
write(testPath, tests);

for (const [path, required] of [
  [homePath, 'tr-home-section tr-home-bridge tr-home-collaboration'],
  [cssPath, '.tr-home-collaboration__availability'],
  [testPath, 'tr-home-collaboration__meta/'],
]) {
  if (!read(path).includes(required)) throw new Error(`${path}: required patch marker missing`);
}

console.log('Homepage collaboration style migration applied.');
