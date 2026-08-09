import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  applyCollaborationPages,
  applyContextualCollaborationCtas,
  loadCollaboration,
} from './collaboration.js';
import {loadI18nManifest} from './i18n.js';
import {
  injectWorkWithMeNoJavaScriptFallback,
  workWithMeNoJavaScriptTargets,
} from './work-with-me-noscript.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function readRequiredGeneratedPage(filePath, targetPath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`generated Work with me page not found: ${targetPath}`);
    throw error;
  }
}

function applyWorkWithMeNoJavaScriptFallbacks(outputDir) {
  const updated = [];
  for (const target of workWithMeNoJavaScriptTargets()) {
    const filePath = path.join(outputDir, ...target.path.split('/'));
    const current = readRequiredGeneratedPage(filePath, target.path);
    const next = injectWorkWithMeNoJavaScriptFallback(current, {locale: target.locale});
    fs.writeFileSync(filePath, next, 'utf8');
    updated.push(target.path);
  }
  return updated;
}

export function postprocessCollaboration({
  outputDir = path.join(ROOT, 'docs-html'),
  collaboration = loadCollaboration(),
  i18nPairs = loadI18nManifest(),
} = {}) {
  const pages = applyCollaborationPages(outputDir, collaboration);
  const noJavaScriptPages = applyWorkWithMeNoJavaScriptFallbacks(outputDir);
  const contextualCtas = applyContextualCollaborationCtas(outputDir, collaboration, i18nPairs);
  return {pages, noJavaScriptPages, contextualCtas};
}

function isCli() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isCli()) {
  const result = postprocessCollaboration();
  console.log(`Collaboration pages: ${result.pages.length}`);
  console.log(`Work with me semantic no-JS pages: ${result.noJavaScriptPages.length}`);
  console.log(`Contextual collaboration CTA targets: ${result.contextualCtas.length}`);
}
