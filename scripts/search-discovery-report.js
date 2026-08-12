import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadI18nManifest} from './i18n.js';
import {loadPageMeta} from './page-meta.js';
import {
  buildSearchDiscoveryReadiness,
  loadSearchDiscoveryPolicy,
  renderSearchDiscoveryMarkdown,
} from './search-discovery.js';

function parseArgs(argv) {
  const args = {outputDir: 'quality-artifacts', siteUrl: 'https://trueruslan.ru'};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--output-dir') args.outputDir = argv[++index];
    else if (value === '--site-url') args.siteUrl = argv[++index];
    else throw new Error(`Unknown search discovery report argument: ${value}`);
  }
  if (!args.outputDir) throw new Error('--output-dir requires a value');
  if (!args.siteUrl) throw new Error('--site-url requires a value');
  return args;
}

export function runSearchDiscoveryReport({outputDir, siteUrl}) {
  const report = buildSearchDiscoveryReadiness({
    policy: loadSearchDiscoveryPolicy(),
    pageMeta: loadPageMeta(),
    i18n: loadI18nManifest(),
    siteUrl,
  });

  fs.mkdirSync(outputDir, {recursive: true});
  const jsonPath = path.join(outputDir, 'search-discovery-readiness.json');
  const markdownPath = path.join(outputDir, 'search-discovery-readiness.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  fs.writeFileSync(markdownPath, renderSearchDiscoveryMarkdown(report), 'utf8');

  return {report, jsonPath, markdownPath};
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const {report, jsonPath, markdownPath} = runSearchDiscoveryReport(args);
  console.log(`P4.1A search discovery readiness: ${report.ready ? 'READY' : 'NOT READY'}`);
  console.log(`Strategic routes: ${report.summary.routes}; findings: ${report.summary.findings}`);
  console.log(`JSON report: ${jsonPath}`);
  console.log(`Markdown report: ${markdownPath}`);
  if (!report.ready) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    console.error(error.stack || error.message);
    process.exit(1);
  }
}
