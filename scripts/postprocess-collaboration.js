import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  applyCollaborationPages,
  applyContextualCollaborationCtas,
  loadCollaboration,
} from './collaboration.js';
import {loadI18nManifest} from './i18n.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

export function postprocessCollaboration({
  outputDir = path.join(ROOT, 'docs-html'),
  collaboration = loadCollaboration(),
  i18nPairs = loadI18nManifest(),
} = {}) {
  const pages = applyCollaborationPages(outputDir, collaboration);
  const contextualCtas = applyContextualCollaborationCtas(outputDir, collaboration, i18nPairs);
  return {pages, contextualCtas};
}

function isCli() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isCli()) {
  const result = postprocessCollaboration();
  console.log(`Collaboration pages: ${result.pages.length}`);
  console.log(`Contextual collaboration CTA targets: ${result.contextualCtas.length}`);
}
