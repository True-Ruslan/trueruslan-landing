import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {postprocessOutput} from './copy-assets.js';

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, JSON.stringify(value), 'utf8');
}

test('postprocessOutput loads and injects canonical project evidence when explicitly configured', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-project-evidence-orchestration-'));
  const docsDir = path.join(root, 'docs');
  const outputDir = path.join(root, 'docs-html');
  const dataDir = path.join(root, 'data');
  const historyDir = path.join(dataDir, 'project-history');
  const templatePath = path.join(root, 'templates', 'index.html');
  const noteSourcePath = path.join(docsDir, 'landing', 'notes', 'test-note.md');
  const evidencePath = path.join(dataDir, 'project-evidence.json');

  fs.mkdirSync(historyDir, {recursive: true});
  fs.mkdirSync(path.dirname(templatePath), {recursive: true});
  fs.mkdirSync(path.dirname(noteSourcePath), {recursive: true});
  fs.mkdirSync(path.join(outputDir, 'landing', 'projects'), {recursive: true});
  fs.mkdirSync(path.join(outputDir, 'landing', 'notes'), {recursive: true});

  fs.writeFileSync(path.join(docsDir, 'toc.yaml'), 'items:\n  - name: Projects\n    href: ./landing/projects.md\n');
  fs.writeFileSync(noteSourcePath, '# Test note\n');
  fs.writeFileSync(templatePath, '<!doctype html><html><head><link rel="canonical" href="{{SITE_URL}}/"></head><body class="g-root"><h1>Руслан Немыкин</h1><section>{{CURRENTLY_BUILDING}}</section></body></html>');

  const projects = [
    {
      slug: 'vlezet', name: 'Vlezet', status: 'pre-production', statusLabel: 'ACTIVE DEVELOPMENT',
      summary: 'Test Vlezet.', featured: true, active: true, visibility: 'public',
      href: 'landing/projects/vlezet.html', tags: ['TypeScript', 'Geometry'],
    },
    {
      slug: 'livingworld', name: 'LivingWorld', status: 'release-candidate', statusLabel: 'RELEASE CANDIDATE',
      summary: 'Test LivingWorld.', featured: true, active: true, visibility: 'public',
      href: 'landing/projects/livingworld.html', tags: ['Java', 'AI'],
    },
    {
      slug: 'node-zero', name: 'NODE ZERO', status: 'pre-production', statusLabel: 'PRE-PRODUCTION',
      summary: 'Test NODE ZERO.', featured: true, active: true, visibility: 'private',
      href: 'landing/projects/node-zero.html', tags: ['Unity', 'C#'],
    },
  ];
  writeJson(path.join(dataDir, 'projects.json'), projects);
  writeJson(path.join(dataDir, 'now.json'), {
    updated: '2026-07-22', focus: 'Evidence integration.', learning: ['Static builds'], writing: ['Evidence'],
  });
  writeJson(path.join(dataDir, 'notes.json'), [{
    slug: 'test-note', title: 'Test note', description: 'Feed entry.', published: '2026-07-20',
    updated: '2026-07-22', readingMinutes: 3, tags: ['Testing'], related: [],
  }]);
  writeJson(path.join(dataDir, 'page-meta.json'), [{
    path: 'index.html', card: 'home', title: 'Руслан Немыкин — Backend Engineer',
    description: 'Portfolio test description.', displayTitle: 'RUSLAN NEMYKIN', kicker: 'BACKEND ENGINEER',
    tags: ['JAVA', 'AI'], accent: 'cyan',
  }]);
  writeJson(path.join(dataDir, 'engineering-graph.json'), {
    filters: [{id: 'backend', label: 'Backend'}],
    nodes: [
      {id: 'java', label: 'Java', kind: 'technology', description: 'Language', column: 1, row: 1, tags: ['backend']},
      {id: 'systems', label: 'Systems', kind: 'domain', description: 'Domain', column: 2, row: 2, tags: ['backend'], href: 'resume.html'},
    ],
    edges: [{from: 'java', to: 'systems', label: 'builds'}],
  });
  writeJson(evidencePath, [
    {
      project: 'vlezet', status: 'verified', lastVerified: '2026-08-02', versions: [],
      signals: [{kind: 'pr', mode: 'automated', label: 'Recognition review', state: 'failed', observedAt: '2026-08-02', scope: 'Real-plan review failed and remains bounded.'}],
    },
    {
      project: 'livingworld', status: 'verified', lastVerified: '2026-07-22', versions: [],
      signals: [{kind: 'ci', mode: 'automated', label: 'CI', state: 'green', observedAt: '2026-07-22', scope: 'CI scope.'}],
    },
    {
      project: 'node-zero', status: 'stale', lastVerified: '2026-07-14', versions: [],
      signals: [{kind: 'manual', mode: 'manual', label: 'Foundation', state: 'accepted', observedAt: '2026-07-14', scope: 'Foundation scope.'}],
    },
  ]);

  fs.writeFileSync(path.join(outputDir, 'index.html'), '<!doctype html><html><head><title>Generated</title></head><body class="g-root"></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'projects.html'), '<!doctype html><html><body><main><span data-tr-project-status="vlezet"></span><span data-tr-project-status="livingworld"></span><span data-tr-project-status="node-zero"></span></main></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'now.html'), '<!doctype html><html><body><main><div data-tr-now-placeholder></div></main></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'engineering-map.html'), '<!doctype html><html><body><main><div data-tr-engineering-graph-root></div></main></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'notes', 'test-note.html'), '<!doctype html><html><body><main><h1>Test note</h1><p>Body</p></main></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'projects', 'vlezet.html'), '<!doctype html><html><body><main><div data-tr-project-evidence="vlezet"></div></main></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'projects', 'livingworld.html'), '<!doctype html><html><body><main><div data-tr-project-evidence="livingworld"></div></main></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'projects', 'node-zero.html'), '<!doctype html><html><body><main><div data-tr-project-evidence="node-zero"></div></main></body></html>');

  const result = postprocessOutput({
    outputDir,
    docsDir,
    standaloneTemplatePath: templatePath,
    pageMetaPath: path.join(dataDir, 'page-meta.json'),
    engineeringGraphPath: path.join(dataDir, 'engineering-graph.json'),
    projectRegistryPath: path.join(dataDir, 'projects.json'),
    projectHistoryDir: historyDir,
    projectEvidencePath: evidencePath,
    nowPath: path.join(dataDir, 'now.json'),
    notesPath: path.join(dataDir, 'notes.json'),
    siteUrl: 'https://example.test',
    copyAssets: false,
  });

  assert.deepEqual(result.projectEvidenceTargets, [
    'landing/projects/livingworld.html',
    'landing/projects/node-zero.html',
    'landing/projects/vlezet.html',
  ]);
  assert.match(fs.readFileSync(path.join(outputDir, 'landing', 'projects', 'vlezet.html'), 'utf8'), /data-evidence-status="verified"/);
  assert.match(fs.readFileSync(path.join(outputDir, 'landing', 'projects', 'vlezet.html'), 'utf8'), /Состояние:<\/strong> failed/);
  assert.match(fs.readFileSync(path.join(outputDir, 'landing', 'projects', 'livingworld.html'), 'utf8'), /data-evidence-status="verified"/);
  assert.match(fs.readFileSync(path.join(outputDir, 'landing', 'projects', 'node-zero.html'), 'utf8'), /data-evidence-status="stale"/);
});
