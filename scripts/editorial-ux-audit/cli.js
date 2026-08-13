import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { auditSite } from './runner.js';
import { renderMarkdownReport, withTotals } from './report.js';

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!['--site-dir', '--output-dir', '--site-url'].includes(flag) || !value) {
      throw new Error('Required arguments: --site-dir, --output-dir, --site-url');
    }
    options[flag.slice(2)] = value;
  }
  if (!options['site-dir'] || !options['output-dir'] || !options['site-url']) {
    throw new Error('Required arguments: --site-dir, --output-dir, --site-url');
  }
  return options;
}

export async function runCli(args) {
  const options = parseArgs(args);
  const report = withTotals(await auditSite({
    siteDir: options['site-dir'],
    siteUrl: options['site-url']
  }));

  await mkdir(options['output-dir'], { recursive: true });
  const jsonPath = join(options['output-dir'], 'editorial-ux-audit.json');
  const markdownPath = join(options['output-dir'], 'editorial-ux-audit.md');
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(markdownPath, renderMarkdownReport(report), 'utf8');

  return { exitCode: 0, report, jsonPath, markdownPath };
}
