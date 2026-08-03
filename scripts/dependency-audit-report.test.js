import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'dependency-audit-report.js');
const WORKFLOW_PATH = path.join(ROOT, '.github', 'workflows', 'dependency-audit.yml');

test('dependency audit generator normalizes advisories and explain evidence', async () => {
  assert.ok(fs.existsSync(SCRIPT_PATH), 'missing dependency audit report generator');
  const {normalizeAudit, renderMarkdown} = await import(pathToFileURL(SCRIPT_PATH));

  const audit = {
    auditReportVersion: 2,
    vulnerabilities: {
      'markdown-it': {
        name: 'markdown-it',
        severity: 'high',
        isDirect: false,
        via: [
          {
            source: 1100001,
            name: 'markdown-it',
            dependency: 'markdown-it',
            title: 'Example quadratic complexity advisory',
            url: 'https://github.com/advisories/GHSA-example-0001',
            severity: 'high',
            range: '<=14.1.1',
          },
          {
            source: 1100002,
            name: 'markdown-it',
            dependency: 'markdown-it',
            title: 'Example quadratic complexity advisory',
            url: 'https://github.com/advisories/GHSA-example-0001',
            severity: 'high',
            range: '>=13.0.0 <14.1.1',
          },
        ],
        effects: ['@diplodoc/translation'],
        range: '<=14.1.1',
        nodes: ['node_modules/markdown-it'],
        fixAvailable: false,
      },
      '@diplodoc/translation': {
        name: '@diplodoc/translation',
        severity: 'high',
        isDirect: false,
        via: ['markdown-it'],
        effects: ['@diplodoc/cli'],
        range: '*',
        nodes: ['node_modules/@diplodoc/translation'],
        fixAvailable: {
          name: '@diplodoc/cli',
          version: '6.0.0',
          isSemVerMajor: true,
        },
      },
    },
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 0,
        moderate: 0,
        high: 2,
        critical: 0,
        total: 2,
      },
      dependencies: {
        prod: 100,
        dev: 20,
        optional: 0,
        peer: 0,
        peerOptional: 0,
        total: 120,
      },
    },
  };

  const explains = {
    'markdown-it': [{name: 'markdown-it', version: '13.0.2', location: 'node_modules/markdown-it'}],
    '@diplodoc/translation': [{name: '@diplodoc/translation', version: '1.7.26', location: 'node_modules/@diplodoc/translation'}],
  };

  const report = normalizeAudit({
    audit,
    auditExitCode: 1,
    nodeVersion: 'v24.0.0',
    npmVersion: '11.5.1',
    explains,
    generatedAt: '2026-08-04T00:00:00.000Z',
  });

  assert.deepEqual(report.summary, audit.metadata.vulnerabilities);
  assert.equal(report.auditExitCode, 1);
  assert.equal(report.vulnerabilities.length, 2);
  assert.equal(report.advisories.length, 1);
  assert.equal(report.advisories[0].id, 'GHSA-EXAMPLE-0001');
  assert.deepEqual(report.advisories[0].instances, [
    {source: 1100001, range: '<=14.1.1'},
    {source: 1100002, range: '>=13.0.0 <14.1.1'},
  ]);

  const markdownIt = report.vulnerabilities.find((record) => record.package === 'markdown-it');
  const translation = report.vulnerabilities.find((record) => record.package === '@diplodoc/translation');
  assert.ok(markdownIt);
  assert.ok(translation);
  assert.equal(markdownIt.explain.length, 1);
  assert.deepEqual(translation.fixAvailable, {
    name: '@diplodoc/cli',
    version: '6.0.0',
    isSemVerMajor: true,
  });

  const markdown = renderMarkdown(report);
  assert.match(markdown, /GHSA-EXAMPLE-0001/);
  assert.match(markdown, /<=14\.1\.1/);
  assert.match(markdown, />=13\.0\.0 <14\.1\.1/);
  assert.match(markdown, /markdown-it/);
  assert.match(markdown, /2 high/);
  assert.match(markdown, /evidence only/i);
});

test('dependency audit workflow is read-only, scoped and artifact-producing', () => {
  assert.ok(fs.existsSync(WORKFLOW_PATH), 'missing dependency audit workflow');
  const workflow = fs.readFileSync(WORKFLOW_PATH, 'utf8');

  assert.match(workflow, /^name: Dependency Audit Evidence$/m);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /pull_request:/);
  for (const controlledPath of [
    '.github/workflows/dependency-audit.yml',
    'package.json',
    'package-lock.json',
    'scripts/dependency-audit-report.js',
    'scripts/dependency-audit-report.test.js',
  ]) {
    assert.ok(workflow.includes(controlledPath), `missing dependency audit path: ${controlledPath}`);
  }

  assert.match(workflow, /contents:\s*read/);
  assert.doesNotMatch(workflow, /contents:\s*write|issues:\s*write/);
  assert.match(workflow, /dependency-audit-report\.js/);
  assert.match(workflow, /actions\/upload-artifact@[0-9a-f]{40}/i);
  assert.match(workflow, /name:\s*dependency-audit-report/);
  assert.match(workflow, /retention-days:\s*30/);
  assert.doesNotMatch(workflow, /npm\s+audit\s+fix|\bgit\s+(?:commit|push)\b/);
});
