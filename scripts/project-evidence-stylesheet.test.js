import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {applyProjectEvidenceStylesheet} from './copy-assets.js';
import {checkSiteIntegrity} from './site-integrity.js';

test('Project Evidence stylesheet respects Diplodoc base href', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-project-evidence-style-'));
  const relativePath = 'landing/projects/livingworld.html';
  const htmlPath = path.join(outputDir, relativePath);
  const stylePath = path.join(outputDir, '_assets', 'style', 'project-evidence.css');

  fs.mkdirSync(path.dirname(htmlPath), {recursive: true});
  fs.mkdirSync(path.dirname(stylePath), {recursive: true});
  fs.writeFileSync(stylePath, '.tr-project-evidence { min-width: 0; }', 'utf8');
  fs.writeFileSync(
    htmlPath,
    '<!doctype html><html><head><base href="../../"><title>Evidence</title></head><body></body></html>',
    'utf8',
  );

  assert.deepEqual(applyProjectEvidenceStylesheet(outputDir, [relativePath]), [relativePath]);
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /href="_assets\/style\/project-evidence\.css"/);
  assert.doesNotMatch(html, /href="\.\.\/\.\.\/_assets\/style\/project-evidence\.css"/);
  assert.doesNotThrow(() => checkSiteIntegrity(outputDir));
});
