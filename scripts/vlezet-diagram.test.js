import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIAGRAM = path.join(ROOT, 'docs', 'assets', 'diagrams', 'vlezet-recognition-authority.svg');

test('Vlezet authority diagram keeps semantic and production-safe SVG paint', () => {
  const svg = fs.readFileSync(DIAGRAM, 'utf8');

  assert.doesNotMatch(svg, /<style\b/i, 'Vlezet diagram must not depend on embedded CSS');
  assert.doesNotMatch(svg, /\bclass=/i, 'Vlezet diagram must not depend on class-based critical paint');
  assert.match(svg, /<title\b[^>]*>[^<]*Vlezet/i);
  assert.match(svg, /<desc\b/i);
  assert.match(svg, /VlezetDocument/);
  assert.match(svg, /Recognition Draft/);
  assert.match(svg, /explicit Apply/);
  assert.match(svg, /fill="#F4F7FB"/i);
  assert.match(svg, /stroke="#4CC9F0"/i);
  assert.match(svg, /stroke="#8B5CF6"/i);
  assert.match(svg, /stroke="#4ADE80"/i);
});
