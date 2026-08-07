import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const specPath = path.join(ROOT, 'docs', 'keystone', 'specs', '2026-08-07-p3-6c-consent-gated-metrica.md');

function readSpec() {
  return fs.readFileSync(specPath, 'utf8');
}

test('P3.6C runbook separates Reports API evidence from browser collection', () => {
  const spec = readSpec();
  assert.match(spec, /P3\.6B.*Reports API/is);
  assert.match(spec, /P3\.6C.*browser/is);
  assert.match(spec, /Cloudflare Web Analytics.*remain|Cloudflare.*unchanged/is);
  assert.match(spec, /P3\.6.*remains.*open|P3\.6 MEASUREMENT.*NOT.*ACCEPTED/is);
});

test('P3.6C runbook records the explicit-consent privacy contract', () => {
  const spec = readSpec();
  for (const contract of [
    /no Yandex.*network.*before.*consent/is,
    /cookies.*after.*consent/is,
    /tr_privacy_consent_v1/,
    /disableYaCounter/,
    /webvisor.*false/is,
    /clickmap.*false/is,
    /trackLinks.*false/is,
    /accurateTrackBounce.*false/is,
    /trackHash.*false/is,
    /sendTitle.*false/is,
    /no.*custom events/is,
    /no.*user parameters/is,
    /no.*ecommerce/is,
    /no.*noscript/is,
    /withdraw|отозвать/i,
  ]) assert.match(spec, contract);
  assert.doesNotMatch(spec, /anonymous traffic|анонимн(?:ая|ую) статистик/i);
});

test('P3.6C runbook documents counter-side operator checks without browser OAuth', () => {
  const spec = readSpec();
  assert.match(spec, /YANDEX_METRIKA_COUNTER_ID/);
  assert.match(spec, /OAuth.*not.*browser|browser.*does not.*OAuth/is);
  assert.match(spec, /Do not store full IP|не сохранять полный IP/is);
  assert.match(spec, /automatic goals|автоматическ.*цел/i);
  assert.match(spec, /collect_first_party_data/);
  assert.match(spec, /measurement_enabled/);
  assert.match(spec, /use_in_benchmarks/);
  assert.match(spec, /provider cookies.*may.*persist|cookies.*могут.*сохран/is);
});
