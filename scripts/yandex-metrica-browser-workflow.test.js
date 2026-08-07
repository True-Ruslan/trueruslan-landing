import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesWorkflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'static.yml'), 'utf8');
const prWorkflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'build.yml'), 'utf8');

test('Pages build passes the repository Metrica counter only to the production build', () => {
  assert.match(pagesWorkflow, /Build docs[\s\S]*?TR_YANDEX_METRIKA_COUNTER_ID:\s*\$\{\{\s*vars\.YANDEX_METRIKA_COUNTER_ID\s*\}\}/);
  assert.doesNotMatch(prWorkflow, /YANDEX_METRIKA_COUNTER_ID/);
  assert.doesNotMatch(prWorkflow, /TR_YANDEX_METRIKA_COUNTER_ID/);
});

test('Pages verifies the final consent-controller artifact before upload', () => {
  assert.match(pagesWorkflow, /Verify generated Yandex Metrica consent state/);
  assert.match(pagesWorkflow, /verifyMetricaBrowserArtifact/);
  assert.match(pagesWorkflow, /writeMetricaBrowserDeploymentReport/);
  assert.match(pagesWorkflow, /metrica-browser-deployment-report\.json/);
  assert.match(pagesWorkflow, /Upload artifact/);
  assert.ok(
    pagesWorkflow.indexOf('Verify generated Yandex Metrica consent state') < pagesWorkflow.indexOf('- name: Upload artifact'),
    'Metrica artifact verification must run before Pages artifact upload',
  );
});

test('Pages browser deployment never receives the Metrica OAuth secret', () => {
  assert.doesNotMatch(pagesWorkflow, /YANDEX_METRIKA_OAUTH_TOKEN/);
  assert.doesNotMatch(pagesWorkflow, /secrets\.[A-Z0-9_]*METRIKA/i);
});
