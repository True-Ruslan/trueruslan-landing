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

test('renderProjectCards localizes bounded UI copy and accepts safe href transforms', () => {
  const html = renderProjectCards([validProject], {
    locale: 'en',
    hrefTransform: () => 'projects/livingworld.html',
  });

  assert.match(html, /Technologies and areas/);
  assert.match(html, /Open case study →/);
  assert.match(html, /href="projects\/livingworld\.html"/);
  assert.throws(() => renderProjectCards([validProject], {locale: 'de'}), /unsupported project card locale/i);
});

test('renderProjectCards can explicitly mark untranslated English fallbacks without duplicating project data', () => {
  const nodeZero = {
    ...validProject,
    slug: 'node-zero',
    name: 'NODE ZERO',
    href: 'landing/projects/node-zero.html',
  };
  const html = renderProjectCards([validProject, nodeZero], {
    locale: 'en',
    hrefTransform: (href, project) => project.slug === 'livingworld' ? 'en/projects/livingworld.html' : href,
    ctaTransform: (project, defaultCta) => project.slug === 'livingworld' ? defaultCta : 'Open case study (RU) →',
  });

  assert.match(html, /href="en\/projects\/livingworld\.html"[^>]*>[\s\S]*?Open case study →/);
  assert.match(html, /href="landing\/projects\/node-zero\.html"[^>]*>[\s\S]*?Open case study \(RU\) →/);
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

test('applyProjectRegistryContent supports bounded RU and EN hub targets from one registry', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-project-hubs-'));
  const targets = ['landing/projects.html', 'en/projects.html'];
  for (const target of targets) {
    const hubPath = path.join(outputDir, ...target.split('/'));
    fs.mkdirSync(path.dirname(hubPath), {recursive: true});
    fs.writeFileSync(hubPath, '<main><span data-tr-project-status="livingworld"></span></main>');
  }

  assert.equal(applyProjectRegistryContent(outputDir, [validProject], {targets}), 2);
  for (const target of targets) {
    const html = fs.readFileSync(path.join(outputDir, ...target.split('/')), 'utf8');
    assert.match(html, /RELEASE CANDIDATE/);
  }
});

test('applyProjectRegistryContent automatically renders existing canonical project pages', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-project-canonical-'));
  const hubPath = path.join(outputDir, 'landing', 'projects.html');
  const projectPath = path.join(outputDir, ...validProject.href.split('/'));
  fs.mkdirSync(path.dirname(hubPath), {recursive: true});
  fs.mkdirSync(path.dirname(projectPath), {recursive: true});
  fs.writeFileSync(hubPath, '<main><p>Projects hub</p></main>');
  fs.writeFileSync(projectPath, '<main><span data-tr-project-status="livingworld"></span></main>');

  assert.equal(applyProjectRegistryContent(outputDir, [validProject]), 1);
  const projectHtml = fs.readFileSync(projectPath, 'utf8');
  assert.match(projectHtml, /data-project-status="livingworld"/);
  assert.match(projectHtml, /RELEASE CANDIDATE/);
  assert.doesNotMatch(projectHtml, /data-tr-project-status/);
});
