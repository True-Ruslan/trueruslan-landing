import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {applyProjectEvidence} from './project-evidence.js';

const livingworld = {
  project: 'livingworld',
  status: 'verified',
  lastVerified: '2026-07-22',
  versions: [{label: 'LivingWorld', value: '0.1.0'}],
  signals: [{
    kind: 'ci',
    mode: 'automated',
    label: 'CI',
    state: 'green',
    observedAt: '2026-07-20',
    scope: 'Automated contracts passed for this milestone.',
  }],
};

const nodeZero = {
  project: 'node-zero',
  status: 'stale',
  lastVerified: '2026-07-14',
  versions: [{label: 'Unity', value: '6000.3.0f1'}],
  signals: [{
    kind: 'manual',
    mode: 'manual',
    label: 'Foundation acceptance',
    state: 'accepted',
    observedAt: '2026-07-14',
    scope: 'The production foundation milestone passed its manual executable gate.',
  }],
};

function writePage(outputDir, project, html) {
  const filePath = path.join(outputDir, 'landing', 'projects', `${project}.html`);
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, html, 'utf8');
  return filePath;
}

test('applyProjectEvidence replaces required placeholders in generated DOM pages', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-project-evidence-dom-'));
  const livingworldPath = writePage(
    outputDir,
    'livingworld',
    '<!doctype html><html><body><main><div data-tr-project-evidence="livingworld"></div></main></body></html>',
  );
  const nodeZeroPath = writePage(
    outputDir,
    'node-zero',
    '<!doctype html><html><body><main><div data-tr-project-evidence="node-zero"></div></main></body></html>',
  );

  assert.deepEqual(
    applyProjectEvidence(outputDir, [livingworld, nodeZero], {
      requiredProjects: ['livingworld', 'node-zero'],
    }),
    ['landing/projects/livingworld.html', 'landing/projects/node-zero.html'],
  );

  const livingworldHtml = fs.readFileSync(livingworldPath, 'utf8');
  const nodeZeroHtml = fs.readFileSync(nodeZeroPath, 'utf8');
  assert.match(livingworldHtml, /data-project-evidence="livingworld"/);
  assert.match(livingworldHtml, /data-evidence-status="verified"/);
  assert.match(nodeZeroHtml, /data-project-evidence="node-zero"/);
  assert.match(nodeZeroHtml, /data-evidence-status="stale"/);
  assert.doesNotMatch(livingworldHtml, /data-tr-project-evidence=/);
  assert.doesNotMatch(nodeZeroHtml, /data-tr-project-evidence=/);
});

test('applyProjectEvidence injects Diplodoc state plus semantic no-JavaScript fallback', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-project-evidence-state-'));
  const state = JSON.stringify({
    data: {
      html: '<article><h1>LivingWorld</h1><div data-tr-project-evidence="livingworld"></div></article>',
    },
  }).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const htmlPath = writePage(
    outputDir,
    'livingworld',
    `<!doctype html><html><body><div id="root"></div><script id="diplodoc-state" type="application/json">${state}</script></body></html>`,
  );

  assert.deepEqual(
    applyProjectEvidence(outputDir, [livingworld], {requiredProjects: ['livingworld']}),
    ['landing/projects/livingworld.html'],
  );

  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /data-project-evidence="livingworld"/);
  assert.doesNotMatch(html, /data-tr-project-evidence=/);
  assert.match(html, /<noscript[^>]*data-tr-project-evidence-noscript="livingworld"/);
  assert.match(html, /data-evidence-status="verified"/);
  assert.match(html, /Automated contracts passed for this milestone\./);
});

test('applyProjectEvidence fails when required evidence or placeholder is missing', () => {
  const missingEvidenceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-project-evidence-missing-data-'));
  writePage(
    missingEvidenceDir,
    'livingworld',
    '<!doctype html><html><body><main><div data-tr-project-evidence="livingworld"></div></main></body></html>',
  );
  assert.throws(
    () => applyProjectEvidence(missingEvidenceDir, [], {requiredProjects: ['livingworld']}),
    /missing.*evidence|evidence.*missing/i,
  );

  const missingPlaceholderDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-project-evidence-missing-placeholder-'));
  writePage(
    missingPlaceholderDir,
    'livingworld',
    '<!doctype html><html><body><main><p>No evidence placeholder</p></main></body></html>',
  );
  assert.throws(
    () => applyProjectEvidence(missingPlaceholderDir, [livingworld], {requiredProjects: ['livingworld']}),
    /placeholder/i,
  );
});
