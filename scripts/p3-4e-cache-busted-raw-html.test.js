import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SMOKE = path.join(ROOT, 'scripts', 'production-passive-pdf-semantic-completeness-note-smoke.cjs');

test('P3.4E raw resume verification bypasses stale CDN HTML with the exact deployed SHA', () => {
  const source = fs.readFileSync(SMOKE, 'utf8');

  assert.match(source, /function withEvidenceQuery\(value, deployedSha\)/);
  assert.match(source, /searchParams\.set\('tr_evidence_sha', deployedSha\)/);
  assert.match(source, /const rawResumeUrl = withEvidenceQuery\(RESUME_URL, EXPECTED_DEPLOYED_SHA\)/);
  assert.match(source, /context\.request\.get\(rawResumeUrl, \{/);
  assert.match(source, /'cache-control': 'no-cache'/);
  assert.match(source, /pragma: 'no-cache'/);
  assert.match(source, /rawRequested: rawResumeUrl/);
  assert.match(source, /rawResumeHtml\.includes\('<noscript data-tr-resume-fallback>'\)/);
  assert.match(source, /rawResumeHtml\.includes\('assets\/documents\/cv\.pdf'\)/);

  assert.doesNotMatch(source, /context\.request\.get\(RESUME_URL, \{timeout: 30000\}\)/);
  assert.doesNotMatch(source, /searchParams\.set\([^)]*Date\.now/);

  for (const marker of [
    "contentType.toLowerCase().includes('application/pdf')",
    "signature === '%PDF-'",
    "crypto.createHash('sha256')",
  ]) {
    assert.ok(source.includes(marker), `P3.4E smoke lost PDF assertion: ${marker}`);
  }
});
