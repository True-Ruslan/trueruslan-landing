import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {postprocessOutput} from './copy-assets.js';

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFileSync(filePath, JSON.stringify(value));
}

test('postprocessOutput injects the canonical Sources Knowledge Base during build post-processing', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-sources-postprocess-'));
  const docsDir = path.join(root, 'docs');
  const outputDir = path.join(root, 'docs-html');
  const dataDir = path.join(root, 'data');
  const historyDir = path.join(dataDir, 'project-history');
  const templatePath = path.join(root, 'templates', 'index.html');
  const noteSourcePath = path.join(docsDir, 'landing', 'notes', 'test-note.md');
  const sourcesPath = path.join(dataDir, 'sources.json');

  fs.mkdirSync(historyDir, {recursive: true});
  fs.mkdirSync(path.dirname(templatePath), {recursive: true});
  fs.mkdirSync(path.dirname(noteSourcePath), {recursive: true});
  fs.mkdirSync(path.join(outputDir, 'landing', 'notes'), {recursive: true});

  fs.writeFileSync(path.join(docsDir, 'toc.yaml'), 'items:\n  - name: Sources\n    href: ./landing/bibliography.md\n');
  fs.writeFileSync(noteSourcePath, '# Test note\n');
  fs.writeFileSync(
    templatePath,
    '<!doctype html><html><head><link rel="canonical" href="{{SITE_URL}}/"></head><body class="g-root"><h1>Руслан Немыкин</h1><section>{{CURRENTLY_BUILDING}}</section></body></html>',
  );

  writeJson(path.join(dataDir, 'projects.json'), [{
    slug: 'test-project',
    name: 'Test Project',
    status: 'production',
    statusLabel: 'PRODUCTION',
    summary: 'A test project.',
    featured: true,
    active: true,
    visibility: 'public',
    href: 'landing/projects/test-project.html',
    tags: ['Node.js', 'Testing'],
  }]);
  writeJson(path.join(dataDir, 'now.json'), {
    updated: '2026-07-22',
    focus: 'Testing sources integration.',
    learning: ['Build-time generation'],
    writing: ['Sources Registry'],
  });
  writeJson(path.join(dataDir, 'notes.json'), [{
    slug: 'test-note',
    title: 'Test note',
    description: 'Feed entry.',
    published: '2026-07-20',
    updated: '2026-07-22',
    readingMinutes: 3,
    tags: ['Testing'],
    related: [],
  }]);
  writeJson(path.join(dataDir, 'page-meta.json'), [{
    path: 'index.html',
    card: 'home',
    title: 'Руслан Немыкин — Backend Engineer',
    description: 'Portfolio test description.',
    displayTitle: 'RUSLAN NEMYKIN',
    kicker: 'BACKEND ENGINEER',
    tags: ['JAVA', 'AI'],
    accent: 'cyan',
  }]);
  writeJson(path.join(dataDir, 'engineering-graph.json'), {
    filters: [{id: 'backend', label: 'Backend'}],
    nodes: [
      {id: 'java', label: 'Java', kind: 'technology', description: 'Language', column: 1, row: 1, tags: ['backend']},
      {id: 'systems', label: 'Systems', kind: 'domain', description: 'Domain', column: 2, row: 2, tags: ['backend'], href: 'resume.html'},
    ],
    edges: [{from: 'java', to: 'systems', label: 'builds'}],
  });
  writeJson(sourcesPath, {sources: [{
    id: 'test-source',
    title: 'Test Source',
    url: 'https://example.com/source',
    sourceType: 'article',
    publisher: 'Example',
    topics: ['Testing'],
    summary: ['Semantic source content'],
    related: [],
  }]});

  fs.writeFileSync(path.join(outputDir, 'index.html'), '<!doctype html><html><head><title>Generated</title></head><body class="g-root"></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'projects.html'), '<!doctype html><html><body><main><span data-tr-project-status="test-project"></span></main></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'now.html'), '<!doctype html><html><body><main><div data-tr-now-placeholder></div></main></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'engineering-map.html'), '<!doctype html><html><body><main><div data-tr-engineering-graph-root></div></main></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'notes', 'test-note.html'), '<!doctype html><html><body><main><h1>Test note</h1><p>Body</p></main></body></html>');
  fs.writeFileSync(path.join(outputDir, 'landing', 'bibliography.html'), '<!doctype html><html><body><main><p>Intro</p><div data-tr-sources-placeholder></div></main></body></html>');

  const result = postprocessOutput({
    outputDir,
    docsDir,
    standaloneTemplatePath: templatePath,
    pageMetaPath: path.join(dataDir, 'page-meta.json'),
    engineeringGraphPath: path.join(dataDir, 'engineering-graph.json'),
    projectRegistryPath: path.join(dataDir, 'projects.json'),
    projectHistoryDir: historyDir,
    nowPath: path.join(dataDir, 'now.json'),
    notesPath: path.join(dataDir, 'notes.json'),
    sourcesPath,
    siteUrl: 'https://example.test',
    copyAssets: false,
  });

  const bibliography = fs.readFileSync(path.join(outputDir, 'landing', 'bibliography.html'), 'utf8');
  assert.equal(result.sourcesKnowledgeBaseTarget, 'landing/bibliography.html');
  assert.match(bibliography, /data-tr-sources-root/);
  assert.match(bibliography, /Test Source/);
  assert.match(bibliography, /Semantic source content/);
  assert.doesNotMatch(bibliography, /data-tr-sources-placeholder/);
});
