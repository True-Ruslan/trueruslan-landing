import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const workflowPath = '.github/workflows/ai-index-content-maintenance.yml';

test('owner same-repository synchronize can wake trusted AI maintenance without executing PR code', () => {
  const source = fs.readFileSync(workflowPath, 'utf8');

  assert.match(source, /^\s{2}pull_request_target:\s*\n\s{4}types: \[edited, synchronize\]$/m);
  assert.match(source, /github\.event_name == 'pull_request_target'/);
  assert.match(source, /github\.event\.pull_request\.user\.login == github\.repository_owner/);
  assert.match(source, /github\.event\.pull_request\.head\.repo\.full_name == github\.repository/);
  assert.match(source, /startsWith\(github\.event\.pull_request\.body, '\/refresh-ai-index '\)/);
  assert.doesNotMatch(source, /allow-unsafe-pr-checkout:\s*true/);

  const maintenance = source.slice(source.indexOf('  maintenance:'), source.indexOf('  report:'));
  assert.match(maintenance, /environment: ai5-provider-acceptance/);
  assert.match(maintenance, /permissions:\s*\n\s{6}contents: read\s*\n\s{6}pull-requests: read/);
  assert.doesNotMatch(maintenance, /contents:\s*write|issues:\s*write|pull-requests:\s*write/);
  assert.match(maintenance, /name: Checkout trusted workflow commit[\s\S]*?ref: \$\{\{ github\.sha \}\}/);
  assert.match(maintenance, /Reject executable or authority changes/);
  assert.match(maintenance, /find candidate\/docs candidate\/data -type l/);
});
