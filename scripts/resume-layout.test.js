import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CSS = fs.readFileSync(path.join(ROOT, 'docs/_assets/style/resume.css'), 'utf8');

test('resume timeline keeps the axis and markers on one horizontal coordinate', () => {
  assert.match(
    CSS,
    /\.tr-resume-timeline\s*\{[^}]*--tr-resume-axis-x:\s*7\.5px;/s,
    'timeline must own one shared axis coordinate',
  );
  assert.match(
    CSS,
    /\.tr-resume-timeline::before\s*\{[^}]*left:\s*var\(--tr-resume-axis-x\);[^}]*transform:\s*translateX\(-50%\);/s,
    'timeline line must be centered on the shared axis',
  );
  assert.match(
    CSS,
    /\.tr-resume-item::before\s*\{[^}]*left:\s*calc\(-1\.55rem \+ var\(--tr-resume-axis-x\)\);[^}]*transform:\s*translateX\(-50%\);/s,
    'timeline markers must be centered on the shared axis',
  );
});

test('resume job headings do not inherit Diplodoc anchor spacing', () => {
  assert.match(
    CSS,
    /\.tr-resume-item\s*>\s*h3\s*\{[^}]*margin:\s*0\s*!important;[^}]*padding-top:\s*0\s*!important;/s,
    'job headings must start at the item marker without section margin or anchor padding',
  );
});
