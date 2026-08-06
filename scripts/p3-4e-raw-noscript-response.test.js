import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SMOKE = path.join(ROOT, 'scripts', 'production-passive-pdf-semantic-completeness-note-smoke.cjs');

test('P3.4E production smoke verifies no-JS fallback from the raw exact deployed HTML response', () => {
  const source = fs.readFileSync(SMOKE, 'utf8');

  assert.match(source, /const rawResumeUrl = withEvidenceQuery\(RESUME_URL, EXPECTED_DEPLOYED_SHA\)/);
  assert.match(source, /const rawResumeResponse = await context\.request\.get\(rawResumeUrl, \{/);
  assert.match(source, /'cache-control': 'no-cache'/);
  assert.match(source, /pragma: 'no-cache'/);
  assert.match(source, /assert\(rawResumeResponse\.ok\(\), `raw resume returned HTTP/);
  assert.match(source, /const rawResumeHtml = await rawResumeResponse\.text\(\)/);
  assert.match(source, /rawResumeHtml\.includes\('<noscript data-tr-resume-fallback>'\)/);
  assert.match(source, /rawResumeHtml\.includes\('assets\/documents\/cv\.pdf'\)/);
  assert.match(source, /writeText\('passive-pdf-resume-raw\.html', rawResumeHtml\)/);

  assert.match(source, /resumeHtml\.includes\('data-tr-resume-pdf'\)/);
  assert.doesNotMatch(source, /resumeHtml\.includes\('<noscript data-tr-resume-fallback>'\)/);
  assert.doesNotMatch(source, /resumeHtml\.includes\('assets\/documents\/cv\.pdf'\)/);

  for (const marker of [
    "contentType.toLowerCase().includes('application/pdf')",
    "signature === '%PDF-'",
    "crypto.createHash('sha256')",
  ]) {
    assert.ok(source.includes(marker), `P3.4E smoke lost PDF assertion: ${marker}`);
  }
});
