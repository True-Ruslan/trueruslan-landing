import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {buildAiCorpus} from './ai-corpus.js';
import {loadAiConfig} from './ai-config.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projects = readFileSync(new URL('../docs/landing/projects.md', import.meta.url), 'utf8');
const yfm = readFileSync(new URL('../docs/.yfm', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../docs/_assets/style/projects-refinement.css', import.meta.url), 'utf8');

test('Projects turns the existing QWEP sentence into a lightweight current-work callout without making it a project peer', () => {
  assert.match(projects, /^## Исторический коммерческий контекст$/m);

  const marketDbIndex = projects.indexOf('data-c3-commercial="marketdb"');
  const currentIndex = projects.indexOf('data-tr-commercial-current');
  assert.ok(marketDbIndex >= 0, 'MarketDB commercial card must remain');
  assert.ok(currentIndex >= 0, 'current commercial-context callout must exist');
  assert.ok(marketDbIndex < currentIndex, 'presentation-only refinement must preserve canonical commercial-section text order');

  assert.match(projects, /class="tr-commercial-current"[^>]*data-tr-commercial-current/);
  assert.match(projects, /class="tr-commercial-current__status"[^>]*>текущая занятость<\/span>/);
  assert.match(projects, /class="tr-commercial-current__title"[^>]*>— QWEP<\/strong>/);
  assert.doesNotMatch(projects, /— QWEP;/, 'current employment title must not end with a semicolon');
  assert.match(
    projects,
    /<a class="tr-commercial-current__link" href="resume\.md">подробности по ролям и стеку — в разделе Опыт\.<\/a>/,
  );
  assert.equal((projects.match(/data-c3-commercial=/g) ?? []).length, 1, 'QWEP callout must stay outside the C3 project-card identity set');
  assert.doesNotMatch(projects, /<h3>QWEP<\/h3>/, 'QWEP is work context, not a portfolio-project peer');
});

test('Projects current-work refinement stays page-scoped, wired once and mobile-safe', () => {
  const resource = '_assets/style/projects-refinement.css';
  assert.equal(yfm.split(resource).length - 1, 1, 'projects refinement stylesheet must be loaded exactly once');

  assert.match(styles, /html\[data-tr-page='projects'\] \.tr-commercial-current\s*\{/);
  assert.match(styles, /html\[data-tr-page='projects'\] \.tr-commercial-current__status\s*\{/);
  assert.match(styles, /html\[data-tr-page='projects'\] \.tr-commercial-current__link\s*\{/);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*\.tr-commercial-current__link[\s\S]*flex-basis:\s*100%/);
  assert.doesNotMatch(styles, /!important/, 'bounded refinement should not need cascade escalation');
});

test('Projects presentation refinement preserves the accepted AI-corpus content hash', () => {
  const config = loadAiConfig(path.join(ROOT, 'data', 'ai-navigator.json'));
  const acceptedMeta = JSON.parse(readFileSync(path.join(ROOT, 'data', 'ai-index-accepted', 'ai5', 'index-meta.json'), 'utf8'));
  const chunkId = 'ru:page:projects:istoricheskii-kommercheskii-kontekst';
  const chunk = buildAiCorpus({rootDir: ROOT, config}).find(({id}) => id === chunkId);

  assert.ok(chunk, `expected AI corpus chunk ${chunkId}`);
  assert.equal(chunk.contentHash, acceptedMeta.contentHashes[chunkId]);
});
