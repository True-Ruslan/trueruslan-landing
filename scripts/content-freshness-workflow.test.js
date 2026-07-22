import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const WORKFLOW_PATH = path.join(ROOT, '.github', 'workflows', 'content-freshness.yml');

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
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /content-freshness-report\.json/);
  assert.match(workflow, /content-freshness-report\.md/);
  assert.match(workflow, /<!-- content-freshness-guard -->/);
  assert.match(workflow, /state:\s*'closed'/);
});
