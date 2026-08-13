import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function rule(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `missing CSS rule for ${selector}`);
  return match[1];
}

test('publication cards preserve the semantic meta-title-summary-topics-actions order', () => {
  const renderer = read('scripts/publication-renderer.js');
  const card = renderer.match(/return `<article class="tr-publication-card[\s\S]*?<\/article>`;/)?.[0] || '';

  const positions = [
    card.indexOf('tr-publication-card__meta'),
    card.indexOf('<${headingLevel}>'),
    card.indexOf('tr-publication-card__summary'),
    card.indexOf('${renderTopics('),
    card.indexOf('tr-publication-card__actions'),
  ];

  assert.ok(positions.every((position) => position >= 0), 'publication card semantic regions must remain present');
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, 'publication card semantic regions must keep their approved reading order');
});

test('featured publication cards align variable content with shared natural grid rows', () => {
  const css = read('docs/_assets/style/publications.css');
  const featured = rule(css, '.tr-publication-card--featured');

  assert.match(featured, /display:\s*grid;/, 'featured cards must use grid rather than independent flex columns');
  assert.match(featured, /grid-row:\s*span\s+5;/, 'featured cards must participate in the five-row shared rhythm');
  assert.match(featured, /grid-template-rows:\s*subgrid;/, 'featured cards must use natural subgrid rows so titles, summaries, topics and actions align without truncation');
});

test('publication topic chips keep consistent inline metrics and allow long labels to wrap safely', () => {
  const css = read('docs/_assets/style/publications.css');
  const topics = rule(css, '.tr-publication-card__topics');
  const chip = rule(css, '.tr-publication-card__topics li');

  assert.match(topics, /align-items:\s*flex-start;/, 'topic rows must align chips to a stable content edge');
  assert.match(chip, /min-width:\s*0;/, 'chips must be allowed to shrink inside narrow cards');
  assert.match(chip, /max-width:\s*100%;/, 'chips must never exceed the card content width');
  assert.match(chip, /line-height:\s*1\.35;/, 'chip line-height must stay explicit and consistent across wrapped labels');
  assert.match(chip, /overflow-wrap:\s*anywhere;/, 'long topic labels must wrap instead of clipping or overflowing');
});

test('publication actions remain naturally separated without featured-card auto-margin hacks', () => {
  const css = read('docs/_assets/style/publications.css');
  const featuredActions = rule(css, '.tr-publication-card--featured .tr-publication-card__actions');

  assert.doesNotMatch(featuredActions, /margin-top:\s*auto;/, 'shared grid rows must own vertical alignment instead of pushing actions independently');
  assert.match(featuredActions, /padding-top:\s*1\.15rem;/, 'the existing deliberate action separation must remain visible');
});
