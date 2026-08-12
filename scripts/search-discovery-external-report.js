import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadI18nManifest} from './i18n.js';
import {loadPageMeta} from './page-meta.js';
import {buildSearchDiscoveryReadiness, loadSearchDiscoveryPolicy} from './search-discovery.js';
import {
  buildExternalSearchEvidenceReport,
  renderExternalSearchEvidenceMarkdown,
} from './search-discovery-external.js';

function parseArgs(argv) {
  const args = {input: null, outputDir: 'quality-artifacts', siteUrl: 'https://trueruslan.ru'};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--input') args.input = argv[++index];
    else if (value === '--output-dir') args.outputDir = argv[++index];
    else if (value === '--site-url') args.siteUrl = argv[++index];
    else throw new Error(`Unknown external search evidence argument: ${value}`);
  }
  if (!args.input) throw new Error('--input is required and must point to an operator-supplied normalized JSON file');
  if (!args.outputDir) throw new Error('--output-dir requires a value');
  if (!args.siteUrl) throw new Error('--site-url requires a value');
  return args;
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function runExternalSearchEvidenceReport({input, outputDir, siteUrl}) {
  const inputBuffer = fs.readFileSync(input);
  let parsed;
  try {
    parsed = JSON.parse(inputBuffer.toString('utf8'));
  } catch (error) {
    throw new Error(`External search evidence input must be valid JSON: ${error.message}`);
  }

  const readiness = buildSearchDiscoveryReadiness({
    policy: loadSearchDiscoveryPolicy(),
    pageMeta: loadPageMeta(),
    i18n: loadI18nManifest(),
    siteUrl,
  });
  if (!readiness.ready) {
    throw new Error(`P4.1A repository readiness must be GREEN before external evidence review: ${JSON.stringify(readiness.findings)}`);
  }

  const report = buildExternalSearchEvidenceReport({
    input: parsed,
    strategicRoutes: readiness.routes,
    siteUrl,
  });
  report.generatedFrom = {
    inputFile: path.basename(input),
    inputSha256: sha256(inputBuffer),
    repositoryReadiness: {
      surfaces: readiness.summary.surfaces,
      routes: readiness.summary.routes,
      findings: readiness.summary.findings,
    },
  };

  fs.mkdirSync(outputDir, {recursive: true});
  const jsonPath = path.join(outputDir, 'search-discovery-external-evidence.json');
  const markdownPath = path.join(outputDir, 'search-discovery-external-evidence.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  fs.writeFileSync(markdownPath, renderExternalSearchEvidenceMarkdown(report), 'utf8');

  return {report, jsonPath, markdownPath};
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const {report, jsonPath, markdownPath} = runExternalSearchEvidenceReport(args);
  console.log('P4.1B external search evidence input: VALIDATED');
  console.log(`Sources: ${report.summary.sources}; observations: ${report.summary.observations}; findings: ${report.findings.length}`);
  console.log(`JSON report: ${jsonPath}`);
  console.log(`Markdown report: ${markdownPath}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    console.error(error.stack || error.message);
    process.exit(1);
  }
}
