import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

test('resume surfaces reflect the August 2026 professional profile', () => {
  const ru = readText('docs/landing/resume.md');
  const en = readText('docs/en/resume.md');
  const aboutRu = readText('docs/landing/about.md');
  const aboutEn = readText('docs/en/about.md');
  const home = readText('docs/index.md');
  const pageMeta = readJson('data/page-meta.json');

  assert.match(ru, /более чем 5-летним|5\+\s*лет/i);
  assert.match(ru, /QWEP/);
  assert.match(ru, /Рунет Бизнес Системы/);
  assert.match(ru, /Bell Integrator/);
  assert.match(ru, /Java 11–25/);
  assert.match(ru, /корпоративн(?:ый|ого) MCP-сервер/i);
  assert.doesNotMatch(ru, /3\+\s*год|MarketDB|Java 8–21/i);

  assert.match(en, /more than 5 years|5\+ years/i);
  assert.match(en, /QWEP/);
  assert.match(en, /Runet Business Systems/);
  assert.match(en, /Bell Integrator/);
  assert.match(en, /Java 11–25/);
  assert.match(en, /corporate MCP server/i);
  assert.doesNotMatch(en, /3\+ years|MarketDB|Java 8–21/i);

  assert.match(aboutRu, /Java 21–25/);
  assert.match(aboutRu, /ClickHouse/);
  assert.match(aboutEn, /Java 21–25/);
  assert.match(aboutEn, /ClickHouse/);
  assert.match(home, /JAVA 11–25/);
  assert.doesNotMatch(home, /JAVA 8–21/);

  const ruMeta = pageMeta.find((entry) => entry.path === 'landing/resume.html');
  const enMeta = pageMeta.find((entry) => entry.path === 'en/resume.html');
  assert.ok(ruMeta, 'missing Russian resume metadata');
  assert.ok(enMeta, 'missing English resume metadata');
  assert.match(ruMeta.description, /5\+|более 5/i);
  assert.match(enMeta.description, /5\+|more than 5/i);
});

test('downloadable CV is a complete and passive PDF asset', () => {
  const pdfPath = path.join(ROOT, 'docs/assets/documents/cv.pdf');
  const pdf = fs.readFileSync(pdfPath);
  const latin1 = pdf.toString('latin1');
  const trailer = latin1.slice(-4096);

  assert.ok(pdf.length > 20_000, `expected a complete resume PDF, got ${pdf.length} bytes`);
  assert.match(latin1.slice(0, 16), /^%PDF-\d\.\d/, 'CV must start with a PDF header');
  assert.match(trailer, /%%EOF\s*$/, 'CV must end with a PDF EOF marker');
  assert.doesNotMatch(
    latin1,
    /\/(?:JavaScript|JS|Launch|EmbeddedFile)\b/,
    'CV must not contain active or embedded payloads',
  );
});
