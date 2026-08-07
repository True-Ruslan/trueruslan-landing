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
  assert.match(workflow, /push:\s*\n\s+branches:\s*\n\s+- master/);
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
  assert.doesNotMatch(uploadBlock, /measurement-observations(?:-enriched)?\.json|RUNNER_TEMP|YANDEX_METRIKA/);
});

test('PR and master-push workflow paths prove the report pipeline with synthetic aggregate-only observations', () => {
  const workflow = readWorkflow();
  assert.match(workflow, /Synthetic aggregate measurement fixture/);
  assert.match(workflow, /if: github\.event_name != 'workflow_dispatch'/);
  assert.match(workflow, /"evidenceClass": "synthetic"/);
  assert.match(workflow, /aggregateTrafficSufficient/);
  assert.match(workflow, /indexedCleanUrls/);
  assert.match(workflow, /indexedLegacyHtmlUrls/);
  assert.match(workflow, /"metrica": \{"visits": \d+, "pageviews": \d+, "users": \d+\}/);
  assert.doesNotMatch(workflow, /sessionId|userId|visitorId|ipAddress|cookie|userAgent/);
});

test('manual checkpoint can optionally enrich from Yandex Metrica without exposing credentials or raw API data', () => {
  const workflow = readWorkflow();

  assert.match(workflow, /YANDEX_METRIKA_COUNTER_ID:\s*\$\{\{ vars\.YANDEX_METRIKA_COUNTER_ID \}\}/);
  assert.match(workflow, /YANDEX_METRIKA_OAUTH_TOKEN:\s*\$\{\{ secrets\.YANDEX_METRIKA_OAUTH_TOKEN \}\}/);
  assert.match(workflow, /Resolve optional Yandex Metrica enrichment/);
  assert.match(workflow, /Enrich manual observations from Yandex Metrica Reports API/);
  assert.match(workflow, /node scripts\/yandex-metrica-enrich\.js/);
  assert.match(workflow, /\$RUNNER_TEMP\/measurement-observations-enriched\.json/);
  assert.match(workflow, /METRICA_ENABLED=true/);
  assert.match(workflow, /METRICA_ENABLED=false/);
  assert.match(workflow, /both Yandex Metrica credentials must be configured/i);
  assert.doesNotMatch(workflow, /api-metrika\.yandex\.net|Authorization:\s*OAuth|logsapi|logs\/v1/);

  assert.match(workflow, /scripts\/yandex-metrica-\*\.js/);
  assert.match(workflow, /if: github\.event_name == 'workflow_dispatch'/);
});
