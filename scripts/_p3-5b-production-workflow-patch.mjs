import fs from 'node:fs';

const path = '.github/workflows/production-live.yml';
let text = fs.readFileSync(path, 'utf8');

function replaceOnce(from, to, label) {
  const first = text.indexOf(from);
  if (first < 0) throw new Error(`missing workflow anchor: ${label}`);
  if (text.indexOf(from, first + from.length) >= 0) throw new Error(`ambiguous workflow anchor: ${label}`);
  text = text.slice(0, first) + to + text.slice(first + from.length);
}

replaceOnce(
  "      - 'scripts/production-flagship-normalization-smoke.cjs'\n      - 'scripts/production-deployment-verification-note-smoke.cjs'",
  "      - 'scripts/production-flagship-normalization-smoke.cjs'\n      - 'scripts/production-p3-5b-english-now-smoke.cjs'\n      - 'scripts/production-deployment-verification-note-smoke.cjs'",
  'PR path trigger',
);
replaceOnce(
  "      - name: Run deployed P3.4A Note smoke",
  "      - name: Run deployed P3.5B English Now smoke\n        if: github.event_name != 'pull_request'\n        env:\n          EXPECTED_DEPLOYED_SHA: ${{ steps.pages.outputs.deployed_sha }}\n        run: node scripts/production-p3-5b-english-now-smoke.cjs\n\n      - name: Run deployed P3.4A Note smoke",
  'deployment smoke step',
);

if (!text.includes('production-p3-5b-english-now-smoke.cjs')) throw new Error('P3.5B production smoke wiring missing');
fs.writeFileSync(path, text, 'utf8');
fs.rmSync('scripts/_p3-5b-production-workflow-patch.mjs');
fs.rmSync('.github/workflows/_p3-5b-production-workflow-patch.yml');
