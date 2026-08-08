import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {loadProjectEvidence} from './project-evidence.js';
import {loadProjectRegistry} from './project-registry.js';
import {renderStandaloneHome} from './standalone-home.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS = path.join(ROOT, 'data', 'projects.json');
const EVIDENCE = path.join(ROOT, 'data', 'project-evidence.json');
const RU_TEMPLATE = path.join(ROOT, 'templates', 'index.html');
const EN_TEMPLATE = path.join(ROOT, 'templates', 'index.en.html');
const HOME_STYLES = path.join(ROOT, 'docs', '_assets', 'style', 'home.css');

function count(source, marker) {
  return source.split(marker).length - 1;
}

test('production homepage templates reserve evidence-first build surfaces', () => {
  const ru = fs.readFileSync(RU_TEMPLATE, 'utf8');
  const en = fs.readFileSync(EN_TEMPLATE, 'utf8');
  const css = fs.readFileSync(HOME_STYLES, 'utf8');

  for (const template of [ru, en]) {
    assert.equal(count(template, '{{HOME_PRIMARY_PATHS}}'), 1);
    assert.equal(count(template, '{{HOME_EVIDENCE_SIGNALS}}'), 1);
    assert.equal(count(template, '{{HOME_FLAGSHIPS}}'), 1);
    assert.doesNotMatch(template, /\{\{CURRENTLY_BUILDING\}\}/);
    assert.doesNotMatch(template, /JAVA 8–21|AI \/ LLM \/ AGENTS/);
  }

  for (const selector of [
    '.tr-home-paths',
    '.tr-home-evidence__grid',
    '.tr-home-flagships',
    '.tr-home-now--link',
  ]) {
    assert.ok(css.includes(selector), `missing homepage evidence style: ${selector}`);
  }
});

test('production homepage rendering exposes three public flagships and no private project', () => {
  const projects = loadProjectRegistry(PROJECTS);
  const evidence = loadProjectEvidence(EVIDENCE, {projects});
  const ru = renderStandaloneHome(
    fs.readFileSync(RU_TEMPLATE, 'utf8'),
    'https://trueruslan.ru',
    projects,
    {evidence},
  );
  const en = renderStandaloneHome(
    fs.readFileSync(EN_TEMPLATE, 'utf8'),
    'https://trueruslan.ru',
    projects,
    {
      locale: 'en',
      evidence,
      hrefTransform: (href, project) => {
        if (project.slug === 'livingworld') return 'en/projects/livingworld.html';
        if (project.slug === 'portfolio-platform') return 'en/projects.html';
        return href;
      },
      ctaTransform: (project, cta) => (
        ['livingworld', 'portfolio-platform'].includes(project.slug)
          ? cta
          : 'Open case study (RU) →'
      ),
    },
  );

  for (const html of [ru, en]) {
    assert.equal(count(html, 'data-home-path='), 3);
    assert.equal(count(html, 'data-home-evidence='), 3);
    assert.equal(count(html, 'data-home-flagship='), 3);
    assert.doesNotMatch(html, /NODE ZERO|data-home-flagship="node-zero"/);
    assert.doesNotMatch(html, /\{\{HOME_/);
  }

  assert.match(ru, /href="landing\/resume\.html"/);
  assert.match(ru, /href="landing\/notes\.html"/);
  assert.match(en, /href="en\/resume\.html"/);
  assert.match(en, /href="en\/notes\/server-authoritative-ai-npcs\.html"/);
  assert.match(ru, /Принятый installed результат/);
  assert.match(ru, /7 PASS \/ 0 FAIL/);
  assert.match(ru, /M7\.8B/);
  assert.match(ru, /Static-first production platform/);
  assert.doesNotMatch(ru, /VAI-M2-INST-005[^<]*PASS|VAI-CONCUR-004[^<]*PASS/i);
});
