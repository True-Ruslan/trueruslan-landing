import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const workflowPath = path.join(ROOT, '.github', 'workflows', 'measurement-checkpoint.yml');

function readWorkflow() {
  return fs.readFileSync(workflowPath, 'utf8');
}

test('measurement workflow is manual/PR-safe, minimally privileged and never persists raw observations', () => {
  const workflow = readWorkflow();

  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /pull_request:/);
  assert.doesNotMatch(workflow, /schedule:/);
  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.doesNotMatch(workflow, /issues: write|contents: write|pull-requests: write/);

  assert.match(workflow, /P3_6_MEASUREMENT_OBSERVATIONS_JSON/);
  assert.match(workflow, /\$RUNNER_TEMP\/measurement-observations\.json/);
  assert.match(workflow, /measurement-checkpoint-report\.js/);
  assert.match(workflow, /measurement-checkpoint-report\.json/);
  assert.match(workflow, /measurement-checkpoint-report\.md/);

  const uploadBlock = workflow.match(/- name: Upload measurement evidence[\s\S]*?(?=\n\s+- name:|\n\s*$)/)?.[0] ?? '';
  assert.match(uploadBlock, /measurement-checkpoint-report\.json/);
  assert.match(uploadBlock, /measurement-checkpoint-report\.md/);
  assert.doesNotMatch(uploadBlock, /measurement-observations\.json|RUNNER_TEMP/);
});

test('pull-request workflow proves the report pipeline with synthetic aggregate-only observations', () => {
  const workflow = readWorkflow();
  assert.match(workflow, /Synthetic aggregate measurement fixture/);
  assert.match(workflow, /aggregateTrafficSufficient/);
  assert.match(workflow, /indexedCleanUrls/);
  assert.match(workflow, /indexedLegacyHtmlUrls/);
  assert.doesNotMatch(workflow, /sessionId|userId|visitorId|ipAddress|cookie|userAgent/);
});
