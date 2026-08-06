import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SMOKE = path.join(ROOT, 'scripts', 'production-passive-pdf-semantic-completeness-note-smoke.cjs');

test('P3.4E production smoke reads bounded resume DOM text after a visible hero gate', () => {
  const source = fs.readFileSync(SMOKE, 'utf8');

  assert.match(source, /const resumeHero = page\.locator\('\.tr-resume-hero'\)\.first\(\)/);
  assert.match(source, /await resumeHero\.waitFor\(\{state: 'visible', timeout: 10000\}\)/);
  assert.match(source, /const resumeDocument = page\.locator\(DOCUMENT_CONTENT_SELECTOR\)\.first\(\)/);
  assert.match(source, /await resumeDocument\.waitFor\(\{state: 'visible', timeout: 10000\}\)/);
  assert.match(source, /const resumeHeroText = \(await resumeHero\.textContent\(\)\) \|\| ''/);
  assert.match(source, /const resumeDocumentText = \(await resumeDocument\.textContent\(\)\) \|\| ''/);
  assert.match(source, /const resumeText = `\$\{resumeHeroText\}\\n\$\{resumeDocumentText\}`/);

  assert.doesNotMatch(source, /const resumeBody = page\.locator\('body'\)/);
  assert.doesNotMatch(source, /resumeBody\.innerText\(\)/);
  assert.doesNotMatch(source, /resumeHero\.innerText\(\)/);

  for (const marker of [
    "'Java Backend Engineer'",
    "'Руслан Немыкин'",
    "'QWEP'",
    "'Java 21–25'",
    "'Spring Boot 3.5–4'",
    "contentType.toLowerCase().includes('application/pdf')",
    "signature === '%PDF-'",
    "crypto.createHash('sha256')",
  ]) {
    assert.ok(source.includes(marker), `P3.4E smoke lost required assertion: ${marker}`);
  }
});
