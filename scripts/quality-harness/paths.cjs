const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const OUTPUT_DIR = path.join(ROOT, 'docs-html');
const TOOLS_DIR = path.join(ROOT, '.quality-tools', 'node_modules');
const ARTIFACTS_DIR = path.join(ROOT, 'quality-artifacts');

module.exports = {
  ROOT,
  OUTPUT_DIR,
  TOOLS_DIR,
  ARTIFACTS_DIR,
};
