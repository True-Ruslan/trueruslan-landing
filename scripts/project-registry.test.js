import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  applyProjectRegistryContent,
  getActiveProjects,
  renderProjectCards,
  renderProjectStatus,
  validateProjectRegistry,
} from './project-registry.js';

const validProject = {
  slug: 'livingworld',
  name: 'LivingWorld',
  status: 'release-candidate',
  statusLabel: 'RELEASE CANDIDATE',
  summary: 'Server-authoritative AI NPC conversations.',
  featured: true,
  active: true,
  visibility: 'public',
  href: 'landing/projects/livingworld.html',
  tags: ['Java 21', 'Fabric'],
};

test('validateProjectRegistry accepts canonical project records', () => {
  assert.equal(validateProjectRegistry([validProject], {requireTimelineFiles: false})[0].slug, 'livingworld');
});

test('validateProjectRegistry rejects duplicate slugs and unknown statuses', () => {
  assert.throws(
    () => validateProjectRegistry([validProject, {...validProject}], {requireTimelineFiles: false}),
    /duplicate project slug/,
  );
  assert.throws(
    () => validateProjectRegistry([{...validProject, status: 'almost-done'}], {requireTimelineFiles: false}),
    /unknown project status/,
  );
});

test('validateProjectRegistry rejects unsafe hrefs and invalid tags', () => {
  assert.throws(
    () => validateProjectRegistry([{...validProject, href: '../private.html'}], {requireTimelineFiles: false}),
    /unsafe project href/,
  );
  assert.throws(
    () => validateProjectRegistry([{...validProject, tags: ['Java']}], {requireTimelineFiles: false}),
    /2–5 items/,
  );
});

test('validateProjectRegistry requires referenced timeline data', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-project-history-'));
  assert.throws(
    () => validateProjectRegistry([{...validProject, timeline: 'livingworld'}], {historyDir: dir}),
    /missing timeline data/,
  );
  fs.writeFileSync(path.join(dir, 'livingworld.json'), '[]');
  assert.doesNotThrow(
    () => validateProjectRegistry([{...validProject, timeline: 'livingworld'}], {historyDir: dir}),
  );
});

test('getActiveProjects derives active state without duplicating metadata', () => {
  const projects = [validProject, {...validProject, slug: 'old', active: false}];
  assert.deepEqual(getActiveProjects(projects).map((project) => project.slug), ['livingworld']);
});

test('renderProjectCards uses statusLabel and escapes content', () => {
  const html = renderProjectCards([{...validProject, name: '<Living & World>'}]);
  assert.match(html, /RELEASE CANDIDATE/);
  assert.match(html, /&lt;Living &amp; World&gt;/);
  assert.doesNotMatch(html, /<Living/);
});

test('renderProjectStatus derives the public badge from canonical registry state', () => {
  const html = renderProjectStatus(validProject);
  assert.match(html, /tr-project-status--release-candidate/);
  assert.match(html, /RELEASE CANDIDATE/);
  assert.match(html, /data-project-status="livingworld"/);
});

test('applyProjectRegistryContent replaces project hub status placeholders only', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-project-hub-'));
  const hubPath = path.join(outputDir, 'landing', 'projects.html');
  fs.mkdirSync(path.dirname(hubPath), {recursive: true});
  fs.writeFileSync(
    hubPath,
    '<main><span data-tr-project-status="livingworld"></span><p>Keep me</p></main>',
  );

  assert.equal(applyProjectRegistryContent(outputDir, [validProject]), 1);
  const html = fs.readFileSync(hubPath, 'utf8');
  assert.match(html, /RELEASE CANDIDATE/);
  assert.match(html, /Keep me/);
  assert.doesNotMatch(html, /data-tr-project-status="livingworld"><\/span>/);
});
