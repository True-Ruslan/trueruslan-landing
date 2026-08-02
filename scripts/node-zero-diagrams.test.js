import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const diagramPaths = [
  path.join(root, 'docs', 'assets', 'diagrams', 'node-zero-architecture.svg'),
  path.join(root, 'docs', 'assets', 'diagrams', 'node-zero-system-flow.svg'),
];

test('NODE ZERO diagrams keep critical paint in SVG presentation attributes', () => {
  for (const diagramPath of diagramPaths) {
    const svg = fs.readFileSync(diagramPath, 'utf8');

    assert.doesNotMatch(svg, /<style\b/i, `${path.basename(diagramPath)} must not depend on embedded CSS`);
    assert.doesNotMatch(svg, /\bclass=/i, `${path.basename(diagramPath)} must not depend on class-based SVG paint`);
    assert.match(svg, /<title\b/i);
    assert.match(svg, /<desc\b/i);
    assert.match(svg, /fill="#f4f7fb"/i, `${path.basename(diagramPath)} must carry visible primary text paint`);
    assert.match(svg, /fill="#9ca(?:9b8|bbc)"/i, `${path.basename(diagramPath)} must carry visible secondary text paint`);
    assert.match(svg, /stroke="#4cc9f0"/i, `${path.basename(diagramPath)} must carry cyan flow paint`);
    assert.match(svg, /stroke="#8b5cf6"/i, `${path.basename(diagramPath)} must carry violet control paint`);
  }
});
