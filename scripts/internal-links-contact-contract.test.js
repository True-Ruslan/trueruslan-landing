import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const linkPolicyPath = path.join(ROOT, 'scripts', 'link-policy.js');
const runtimeLinkPolicyPath = path.join(ROOT, 'docs', '_assets', 'script', 'link-policy-runtime.js');
const CONTACT_EMAIL = 'nemykin@true-ruslan.ru';

function mockAnchor(href, attributes = {}) {
  const attrs = new Map(Object.entries({href, ...attributes}));
  return {
    href,
    getAttribute(name) {
      return attrs.has(name) ? attrs.get(name) : null;
    },
    setAttribute(name, value) {
      attrs.set(name, value);
    },
    removeAttribute(name) {
      attrs.delete(name);
    },
  };
}

test('build-time link policy opens only external web resources in a new tab', async () => {
  const {applyLinkPolicy} = await import(pathToFileURL(linkPolicyPath));
  const input = '<html><head></head><body><main>'
    + '<a href="/projects/">Relative internal</a>'
    + '<a href="https://trueruslan.ru/about/" target="_blank" rel="noopener noreferrer">Absolute internal</a>'
    + '<a href="https://www.trueruslan.ru/contacts/" target="_blank">WWW internal</a>'
    + '<a href="https://github.com/True-Ruslan">GitHub</a>'
    + '<a href="https://habr.com/ru/users/TrueRuslan/">Habr</a>'
    + '<a href="mailto:nemykin@true-ruslan.ru">Mail</a>'
    + '</main></body></html>';

  const output = applyLinkPolicy(input);
  assert.doesNotMatch(output, /href="\/projects\/"[^>]*target="_blank"/);
  assert.doesNotMatch(output, /href="https:\/\/trueruslan\.ru\/about\/"[^>]*target="_blank"/);
  assert.doesNotMatch(output, /href="https:\/\/www\.trueruslan\.ru\/contacts\/"[^>]*target="_blank"/);
  assert.match(output, /href="https:\/\/github\.com\/True-Ruslan"[^>]*target="_blank"/);
  assert.match(output, /href="https:\/\/habr\.com\/ru\/users\/TrueRuslan\/"[^>]*target="_blank"/);
  assert.doesNotMatch(output, /href="mailto:nemykin@true-ruslan\.ru"[^>]*target=/);
});

test('runtime link policy classifies same-site links as current-tab and repairs stale targets', async () => {
  delete globalThis.TrueRuslanLinkPolicy;
  await import(`${pathToFileURL(runtimeLinkPolicyPath).href}?contract=${Date.now()}`);
  const policy = globalThis.TrueRuslanLinkPolicy;
  assert.ok(policy, 'runtime link policy must expose its contract');

  assert.equal(policy.shouldOpenInNewContext('/projects/'), false);
  assert.equal(policy.shouldOpenInNewContext('https://trueruslan.ru/about/'), false);
  assert.equal(policy.shouldOpenInNewContext('https://www.trueruslan.ru/contacts/'), false);
  assert.equal(policy.shouldOpenInNewContext('https://github.com/True-Ruslan'), true);

  const internal = mockAnchor('https://trueruslan.ru/projects/', {target: '_blank', rel: 'noopener noreferrer'});
  assert.equal(policy.normalizeAnchor(internal), true);
  assert.equal(internal.getAttribute('target'), null, 'internal link target must be removed');
});

test('public contact and collaboration email use the canonical true-ruslan mailbox', () => {
  const contacts = fs.readFileSync(path.join(ROOT, 'docs', 'landing', 'contacts.md'), 'utf8');
  const collaboration = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'collaboration.json'), 'utf8'));

  assert.match(contacts, new RegExp(`mailto:${CONTACT_EMAIL.replace('.', '\\.')}`));
  assert.match(contacts, new RegExp(CONTACT_EMAIL.replace('.', '\\.')));
  assert.equal(collaboration.contact.email, CONTACT_EMAIL);
  assert.doesNotMatch(contacts, /contact@trueruslan\.ru|ruslan\.nemikin@gmail\.com/i);
});
