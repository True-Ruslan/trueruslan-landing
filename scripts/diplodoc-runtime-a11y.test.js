import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, '..', 'docs', '_assets', 'script', 'diplodoc-runtime-a11y.js'), 'utf8');
const sandbox = {setTimeout, clearTimeout};
sandbox.globalThis = sandbox;
vm.runInNewContext(source, sandbox, {filename: 'diplodoc-runtime-a11y.js'});
const runtimeA11y = sandbox.TrueRuslanDiplodocA11y;

function button(classes, attributes = {}, textContent = '') {
  const attrs = new Map(Object.entries(attributes));
  return {
    classList: {contains: (name) => classes.includes(name)},
    textContent,
    getAttribute: (name) => attrs.get(name) || '',
    setAttribute: (name, value) => attrs.set(name, value),
    attrs,
  };
}

test('getCodeButtonLabel maps Diplodoc code controls to accessible Russian labels', () => {
  assert.equal(runtimeA11y.getCodeButtonLabel(button(['yfm-code-button', 'yfm-clipboard-button'])), 'Копировать код');
  assert.equal(runtimeA11y.getCodeButtonLabel(button(['yfm-code-button', 'yfm-wrapping-button'])), 'Переключить перенос строк кода');
  assert.equal(runtimeA11y.getCodeButtonLabel(button(['yfm-code-button'])), null);
});

test('repairCodeButtons labels only unnamed known Diplodoc controls', () => {
  const copy = button(['yfm-code-button', 'yfm-clipboard-button']);
  const wrap = button(['yfm-code-button', 'yfm-wrapping-button']);
  const alreadyNamed = button(['yfm-code-button', 'yfm-clipboard-button'], {'aria-label': 'Copy'});
  const document = {querySelectorAll: () => [copy, wrap, alreadyNamed]};

  assert.equal(runtimeA11y.repairCodeButtons(document), 2);
  assert.equal(copy.attrs.get('aria-label'), 'Копировать код');
  assert.equal(wrap.attrs.get('aria-label'), 'Переключить перенос строк кода');
  assert.equal(alreadyNamed.attrs.get('aria-label'), 'Copy');
});
