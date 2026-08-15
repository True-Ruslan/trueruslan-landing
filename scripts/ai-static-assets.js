import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {globSync} from 'glob';

import {loadAiConfig} from './ai-config.js';
import {verifyAiIndex} from './ai-index-verify.js';
import {normalizeSearchPageHtml} from './search-page.js';

const AI_SEARCH_RESOURCES = Object.freeze([
  '_assets/style/ai-search.css',
  '_assets/script/ai-retrieval.js',
  '_assets/script/ai-search.js',
]);
const AI_INDEX_ARTIFACTS = Object.freeze([
  ['chunks.json', 'ai/chunks.json'],
  ['index-meta.json', 'ai/index-meta.json'],
  ['embeddings.bin', 'ai/embeddings.bin'],
]);

function isEnabled(config) {
  return ['search', 'full'].includes(config?.mode);
}

function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.copyFileSync(source, target);
}

export function copyAiSearchResources({docsDir, outputDir, config}) {
  if (!isEnabled(config)) return [];
  const copied = [];
  for (const relative of AI_SEARCH_RESOURCES) {
    const source = path.join(docsDir, ...relative.split('/'));
    if (!fs.existsSync(source)) throw new Error(`AI search resource missing: ${relative}`);
    copyFile(source, path.join(outputDir, ...relative.split('/')));
    copied.push(relative);
  }
  return copied;
}

export function publishAiArtifacts({rootDir, outputDir, config}) {
  if (!isEnabled(config)) return {published: false, files: []};
  try {
    verifyAiIndex({rootDir, config});
  } catch (error) {
    throw new Error(`AI index unavailable or stale: ${error.message}`);
  }

  const sourceDir = path.join(rootDir, 'data', 'ai-index');
  const files = [];
  for (const [sourceName, publicRelative] of AI_INDEX_ARTIFACTS) {
    copyFile(
      path.join(sourceDir, sourceName),
      path.join(outputDir, ...publicRelative.split('/')),
    );
    files.push(publicRelative);
  }
  return {published: true, files};
}

export function normalizeAiSearchPages({outputDir, config}) {
  if (!isEnabled(config)) return 0;
  const htmlFiles = globSync(path.join(outputDir, '_search', '*', 'index.html'), {nodir: true});
  for (const htmlPath of htmlFiles) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const relativePath = path.relative(outputDir, htmlPath).replaceAll(path.sep, '/');
    fs.writeFileSync(
      htmlPath,
      normalizeSearchPageHtml(html, relativePath, {aiConfig: config}),
      'utf8',
    );
  }
  return htmlFiles.length;
}

export function applyAiSearchPostprocess({rootDir, docsDir, outputDir, config}) {
  if (!isEnabled(config)) {
    return {
      mode: config?.mode ?? 'off',
      resources: [],
      aiArtifacts: {published: false, files: []},
      normalizedSearchPages: 0,
    };
  }

  const resources = copyAiSearchResources({docsDir, outputDir, config});
  const aiArtifacts = publishAiArtifacts({rootDir, outputDir, config});
  const normalizedSearchPages = normalizeAiSearchPages({outputDir, config});
  return {mode: config.mode, resources, aiArtifacts, normalizedSearchPages};
}

function isMainModule() {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

function main() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const docsDir = path.join(rootDir, 'docs');
  const outputDir = path.join(rootDir, 'docs-html');
  const config = loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'));
  try {
    const report = applyAiSearchPostprocess({rootDir, docsDir, outputDir, config});
    if (!isEnabled(config)) {
      console.log('AI search postprocess: disabled.');
      return;
    }
    console.log(`AI search postprocess: ${report.mode}; resources=${report.resources.length}; artifacts=${report.aiArtifacts.files.length}; pages=${report.normalizedSearchPages}.`);
  } catch (error) {
    console.error(`AI search postprocess failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (isMainModule()) main();
