import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {loadCollaboration} from './collaboration.js';
import {loadProjectRegistry} from './project-registry.js';
import {renderStandaloneHome} from './standalone-home.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECTS = path.join(ROOT, 'data', 'projects.json');
const RU_TEMPLATE = path.join(ROOT, 'templates', 'index.html');
const EN_TEMPLATE = path.join(ROOT, 'templates', 'index.en.html');
const HOME_REFINEMENT_STYLES = path.join(ROOT, 'docs', '_assets', 'style', 'home-refinement.css');

function count(source, marker) {
  return source.split(marker).length - 1;
}

test('production homepage templates reserve the C2 fast-scan build surfaces', () => {
  const ru = fs.readFileSync(RU_TEMPLATE, 'utf8');
  const en = fs.readFileSync(EN_TEMPLATE, 'utf8');
  const css = fs.readFileSync(HOME_REFINEMENT_STYLES, 'utf8');

  for (const template of [ru, en]) {
    assert.equal(count(template, '{{HOME_PROOF_STRIP}}'), 1);
    assert.equal(count(template, '{{HOME_FLAGSHIPS}}'), 1);
    assert.equal(count(template, '{{HOME_EXPERIENCE_BRIDGE}}'), 1);
    assert.equal(count(template, '{{HOME_WRITING_BRIDGE}}'), 1);
    assert.equal(count(template, '{{HOME_COLLABORATION_BRIDGE}}'), 1);
    assert.equal(count(template, '{{HOME_PERSONAL_BRIDGE}}'), 1);
    assert.doesNotMatch(template, /\{\{HOME_PRIMARY_PATHS\}\}|\{\{HOME_EVIDENCE_SIGNALS\}\}|\{\{CURRENTLY_BUILDING\}\}/);
    assert.doesNotMatch(template, /JAVA 8–21|AI \/ LLM \/ AGENTS|EVIDENCE \/ CURRENT BOUNDARY/);
  }

  for (const selector of [
    '.tr-home-proof-strip',
    '.tr-home-proof',
    '.tr-home-flagship',
    '.tr-home-bridge',
    '.tr-home-bridge__actions',
  ]) {
    assert.ok(css.includes(selector), `missing C2 homepage style: ${selector}`);
  }
});

test('production homepage rendering exposes concise proof, three public flagships and no private or de-emphasized project', () => {
  const projects = loadProjectRegistry(PROJECTS);
  const collaboration = loadCollaboration();
  const ru = renderStandaloneHome(
    fs.readFileSync(RU_TEMPLATE, 'utf8'),
    'https://trueruslan.ru',
    projects,
    {collaboration},
  );
  const en = renderStandaloneHome(
    fs.readFileSync(EN_TEMPLATE, 'utf8'),
    'https://trueruslan.ru',
    projects,
    {
      locale: 'en',
      collaboration,
      hrefTransform: (href, project) => {
        if (project.slug === 'livingworld') return 'en/projects/livingworld.html';
        if (project.slug === 'notchhub') return 'en/projects/notchhub.html';
        if (project.slug === 'portfolio-platform') return 'en/projects/portfolio-platform.html';
        return href;
      },
    },
  );

  for (const html of [ru, en]) {
    assert.equal(count(html, 'data-home-proof='), 4);
    assert.equal(count(html, 'data-home-flagship='), 3);
    assert.equal(count(html, 'data-home-bridge='), 3);
    assert.equal(count(html, 'data-home-collaboration='), 1);
    assert.doesNotMatch(html, /data-home-path=|data-home-evidence=/);
    assert.doesNotMatch(html, /NODE ZERO|data-home-flagship="node-zero"|data-home-flagship="vlezet"/);
    assert.doesNotMatch(html, /\{\{HOME_/);
    assert.match(html, /data-home-flagship="notchhub"/);
  }

  assert.match(ru, /href="landing\/resume\.html"/);
  assert.match(ru, /href="landing\/notes\.html"/);
  assert.match(ru, /href="landing\/publications\.html"/);
  assert.match(en, /href="en\/resume\.html"/);
  assert.match(en, /href="en\/notes\/server-authoritative-ai-npcs\.html"/);
  assert.match(en, /href="en\/projects\/notchhub\.html"/);
  assert.doesNotMatch(ru, /Принятый installed результат|7 PASS \/ 0 FAIL|0\.1\.0 Personal build|Static-first production platform/);
});