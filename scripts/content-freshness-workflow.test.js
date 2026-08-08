import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const WORKFLOW_PATH = path.join(ROOT, '.github', 'workflows', 'content-freshness.yml');
const CONTROLLED_PATHS = Object.freeze([
  '.github/workflows/content-freshness.yml',
  'data/projects.json',
  'data/project-evidence.json',
  'data/project-history/**',
  'scripts/content-freshness*.js',
]);

test('Content Freshness workflow is scheduled/manual, minimally privileged and never mutates canonical content', () => {
  const workflow = fs.readFileSync(WORKFLOW_PATH, 'utf8');

  assert.match(workflow, /^name: Content Freshness$/m);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /cron:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /issues:\s*write/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
  assert.doesNotMatch(workflow, /\bgit\s+(?:commit|push)\b/);

  assert.match(workflow, /content-freshness-probe\.js/);
  assert.match(workflow, /content-freshness-report\.js/);
  assert.match(workflow, /actions\/upload-artifact@[0-9a-f]{40}/i);
  assert.match(workflow, /content-freshness-report\.json/);
  assert.match(workflow, /content-freshness-report\.md/);
  assert.match(workflow, /<!-- content-freshness-guard -->/);
  assert.match(workflow, /state:\s*'closed'/);
});

test('Content Freshness produces reviewable PR evidence without mutating the maintenance issue', () => {
  const workflow = fs.readFileSync(WORKFLOW_PATH, 'utf8');

  assert.match(workflow, /pull_request:/);
  for (const controlledPath of CONTROLLED_PATHS) {
    assert.ok(workflow.includes(controlledPath), `missing PR freshness path: ${controlledPath}`);
  }

  const issueStep = workflow.match(/- name: Create, update or close freshness issue[\s\S]*?uses: actions\/github-script@[0-9a-f]{40}/i)?.[0];
  assert.ok(issueStep, 'missing freshness issue mutation step');
  assert.match(issueStep, /if:\s*github\.event_name\s*!=\s*'pull_request'/);

  assert.match(workflow, /name:\s*content-freshness-report/);
  assert.match(workflow, /retention-days:\s*30/);
});

test('Content Freshness refreshes the maintenance issue on controlled master changes', () => {
  const workflow = fs.readFileSync(WORKFLOW_PATH, 'utf8');

  assert.match(workflow, /push:\s*\n\s*branches:\s*\n\s*- master/m);
  for (const controlledPath of CONTROLLED_PATHS) {
    const escaped = controlledPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(workflow, new RegExp(`push:[\\s\\S]*?paths:[\\s\\S]*?${escaped}`), `missing master-push freshness path: ${controlledPath}`);
  }

  assert.match(workflow, /if:\s*github\.event_name\s*!=\s*'pull_request'/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
});
