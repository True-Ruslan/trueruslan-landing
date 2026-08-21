import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workflowPath = '.github/workflows/ai-index-content-maintenance.yml';

function readWorkflow() {
  return fs.readFileSync(workflowPath, 'utf8');
}

function jobBlock(source, name, nextName) {
  const start = source.indexOf(`  ${name}:`);
  const end = nextName ? source.indexOf(`  ${nextName}:`, start + 1) : source.length;
  assert.ok(start >= 0 && end > start, `${name} job block must exist`);
  return source.slice(start, end);
}

test('AI-index maintenance PR reporting uses PR-scoped write authority', () => {
  const source = readWorkflow();
  const receipt = jobBlock(source, 'receipt', 'maintenance');
  const report = jobBlock(source, 'report', null);

  for (const [name, block] of [['receipt', receipt], ['report', report]]) {
    assert.match(block, /permissions:\s*\n\s{6}pull-requests: write/, `${name} must use PR-scoped write authority`);
    assert.doesNotMatch(block, /issues: write/, `${name} must not request the broader issue-write permission for PR-only reporting`);
    assert.match(block, /issues\/\$ISSUE_NUMBER\/comments/, `${name} must keep using the documented PR issue-comment endpoint`);
    assert.doesNotMatch(block, /OPENROUTER|API_KEY|secrets\./i, `${name} reporting must remain provider-secret-free`);
  }
});

test('workflow-run provider concurrency is scoped to the resolved PR', () => {
  const source = readWorkflow();
  const maintenance = jobBlock(source, 'maintenance', 'report');

  assert.match(
    maintenance,
    /group: ai-index-content-maintenance-\$\{\{[^\n]*needs\.workflow_run_gate\.outputs\.pr_number[^\n]*\}\}/,
    'workflow_run maintenance must not collapse into a shared empty concurrency group',
  );
});
