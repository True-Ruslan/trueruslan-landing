import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const SEVERITY_ORDER = new Map([
  ['critical', 0],
  ['high', 1],
  ['moderate', 2],
  ['low', 3],
  ['info', 4],
  ['unknown', 5],
]);

function advisoryIdFrom(value) {
  const haystack = `${value?.url || ''} ${value?.title || ''}`;
  const match = haystack.match(/GHSA-[0-9a-z-]+/i);
  if (match) return match[0].toUpperCase();
  if (value?.source !== undefined && value?.source !== null) return String(value.source);
  return value?.url || value?.title || 'unknown';
}

function normalizeFixAvailable(value) {
  if (value === true || value === false || value === null || value === undefined) return value ?? false;
  if (typeof value !== 'object') return String(value);
  return {
    name: value.name ?? null,
    version: value.version ?? null,
    isSemVerMajor: Boolean(value.isSemVerMajor),
  };
}

export function normalizeAudit({audit, auditExitCode, nodeVersion, npmVersion, explains = {}, generatedAt}) {
  if (!audit || typeof audit !== 'object') throw new TypeError('audit must be an object');
  if (!audit.metadata?.vulnerabilities || typeof audit.vulnerabilities !== 'object') {
    throw new Error('npm audit JSON is missing metadata.vulnerabilities or vulnerabilities');
  }

  const advisoryMap = new Map();
  const vulnerabilities = Object.entries(audit.vulnerabilities)
    .map(([packageName, record]) => {
      const advisoryIds = [];
      const viaPackages = [];

      for (const via of Array.isArray(record.via) ? record.via : []) {
        if (typeof via === 'string') {
          viaPackages.push(via);
          continue;
        }
        if (!via || typeof via !== 'object') continue;
        const id = advisoryIdFrom(via);
        advisoryIds.push(id);
        if (!advisoryMap.has(id)) {
          advisoryMap.set(id, {
            id,
            source: via.source ?? null,
            name: via.name ?? packageName,
            dependency: via.dependency ?? packageName,
            title: via.title ?? 'Untitled npm advisory',
            url: via.url ?? null,
            severity: via.severity ?? record.severity ?? 'unknown',
            range: via.range ?? record.range ?? null,
          });
        }
      }

      return {
        package: packageName,
        severity: record.severity ?? 'unknown',
        isDirect: Boolean(record.isDirect),
        range: record.range ?? null,
        nodes: Array.isArray(record.nodes) ? [...record.nodes].sort() : [],
        effects: Array.isArray(record.effects) ? [...record.effects].sort() : [],
        viaPackages: [...new Set(viaPackages)].sort(),
        advisoryIds: [...new Set(advisoryIds)].sort(),
        fixAvailable: normalizeFixAvailable(record.fixAvailable),
        explain: Array.isArray(explains[packageName]) ? explains[packageName] : [],
      };
    })
    .sort((left, right) => {
      const severity = (SEVERITY_ORDER.get(left.severity) ?? 99) - (SEVERITY_ORDER.get(right.severity) ?? 99);
      return severity || left.package.localeCompare(right.package);
    });

  const advisories = [...advisoryMap.values()].sort((left, right) => {
    const severity = (SEVERITY_ORDER.get(left.severity) ?? 99) - (SEVERITY_ORDER.get(right.severity) ?? 99);
    return severity || left.id.localeCompare(right.id);
  });

  return {
    generatedAt,
    nodeVersion,
    npmVersion,
    auditReportVersion: audit.auditReportVersion ?? null,
    auditExitCode,
    summary: {...audit.metadata.vulnerabilities},
    dependencySummary: {...(audit.metadata.dependencies || {})},
    advisories,
    vulnerabilities,
    policy: {
      automaticFixApplied: false,
      fixAvailabilityIsEvidenceOnly: true,
      lockfileMutated: false,
    },
  };
}

function formatFixAvailable(value) {
  if (value === false) return 'none reported';
  if (value === true) return 'reported by npm (unspecified)';
  if (!value || typeof value !== 'object') return String(value);
  const major = value.isSemVerMajor ? ', semver-major' : '';
  return `${value.name || 'package'}@${value.version || 'unknown'}${major}`;
}

export function renderMarkdown(report) {
  const summary = report.summary || {};
  const total = Number(summary.total || 0);
  const summaryText = ['critical', 'high', 'moderate', 'low', 'info']
    .map((severity) => `${Number(summary[severity] || 0)} ${severity}`)
    .join(', ');

  const lines = [
    '# Dependency Audit Evidence',
    '',
    `Generated: \`${report.generatedAt}\``,
    `Node: \`${report.nodeVersion}\``,
    `npm: \`${report.npmVersion}\``,
    `Audit exit code: \`${report.auditExitCode}\``,
    `Findings: **${total}** (${summaryText})`,
    '',
    '> Fix availability is evidence only. No automatic fix, lockfile mutation, commit or push was performed.',
    '',
    '## Advisories',
    '',
  ];

  if (!report.advisories.length) {
    lines.push('No advisories reported.', '');
  } else {
    for (const advisory of report.advisories) {
      const link = advisory.url ? ` — ${advisory.url}` : '';
      lines.push(`- **${advisory.id}** · ${advisory.severity} · ${advisory.title}${link}`);
      lines.push(`  - package: \`${advisory.name}\`; range: \`${advisory.range ?? 'unknown'}\``);
    }
    lines.push('');
  }

  lines.push('## Vulnerable package records', '');
  if (!report.vulnerabilities.length) {
    lines.push('No vulnerable package records.', '');
  }

  for (const item of report.vulnerabilities) {
    lines.push(`### ${item.package} — ${item.severity}`);
    lines.push('');
    lines.push(`- direct: \`${item.isDirect}\``);
    lines.push(`- affected range: \`${item.range ?? 'unknown'}\``);
    lines.push(`- installed nodes: ${item.nodes.length ? item.nodes.map((value) => `\`${value}\``).join(', ') : 'none reported'}`);
    lines.push(`- advisory IDs: ${item.advisoryIds.length ? item.advisoryIds.map((value) => `\`${value}\``).join(', ') : 'transitive package record'}`);
    lines.push(`- via packages: ${item.viaPackages.length ? item.viaPackages.map((value) => `\`${value}\``).join(', ') : 'none'}`);
    lines.push(`- effects: ${item.effects.length ? item.effects.map((value) => `\`${value}\``).join(', ') : 'none'}`);
    lines.push(`- fix available: ${formatFixAvailable(item.fixAvailable)}`);
    lines.push('- npm explain evidence:');
    lines.push('```json');
    lines.push(JSON.stringify(item.explain, null, 2));
    lines.push('```', '');
  }

  return `${lines.join('\n').trim()}\n`;
}

function parseArgs(argv) {
  const result = {outputDir: 'quality-artifacts'};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--output-dir') {
      result.outputDir = argv[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argv[index]}`);
  }
  return result;
}

function runJsonCommand(command, args, {acceptedExitCodes = [0]} = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: process.env,
  });
  if (result.error) throw result.error;
  const exitCode = result.status ?? 1;
  if (!acceptedExitCodes.includes(exitCode)) {
    throw new Error(`${command} ${args.join(' ')} failed with exit ${exitCode}: ${result.stderr || 'no stderr'}`);
  }
  const stdout = (result.stdout || '').trim();
  if (!stdout) throw new Error(`${command} ${args.join(' ')} returned empty JSON output`);
  try {
    return {value: JSON.parse(stdout), exitCode, stderr: result.stderr || ''};
  } catch (error) {
    throw new Error(`${command} ${args.join(' ')} returned malformed JSON: ${error.message}`);
  }
}

function collectExplain(packageName) {
  const result = spawnSync('npm', ['explain', packageName, '--json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: process.env,
  });
  if (result.error) {
    return [{error: result.error.message, exitCode: result.status ?? null}];
  }
  const stdout = (result.stdout || '').trim();
  if (!stdout) {
    return [{error: (result.stderr || 'npm explain returned no output').trim(), exitCode: result.status ?? null}];
  }
  try {
    const parsed = JSON.parse(stdout);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    return [{error: `malformed npm explain JSON: ${error.message}`, exitCode: result.status ?? null, raw: stdout.slice(0, 4000)}];
  }
}

export function collectDependencyAudit({outputDir}) {
  const auditResult = runJsonCommand('npm', ['audit', '--json'], {acceptedExitCodes: [0, 1]});
  const npmVersionResult = spawnSync('npm', ['--version'], {encoding: 'utf8', env: process.env});
  if (npmVersionResult.error || npmVersionResult.status !== 0) {
    throw npmVersionResult.error || new Error(`npm --version failed with exit ${npmVersionResult.status}`);
  }

  const packageNames = Object.keys(auditResult.value.vulnerabilities || {}).sort();
  const explains = Object.fromEntries(packageNames.map((packageName) => [packageName, collectExplain(packageName)]));
  const report = normalizeAudit({
    audit: auditResult.value,
    auditExitCode: auditResult.exitCode,
    nodeVersion: process.version,
    npmVersion: npmVersionResult.stdout.trim(),
    explains,
    generatedAt: new Date().toISOString(),
  });

  fs.mkdirSync(outputDir, {recursive: true});
  fs.writeFileSync(path.join(outputDir, 'npm-audit-raw.json'), `${JSON.stringify(auditResult.value, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'dependency-audit-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'dependency-audit-report.md'), renderMarkdown(report));
  return report;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    const {outputDir} = parseArgs(process.argv.slice(2));
    const report = collectDependencyAudit({outputDir});
    const summary = report.summary;
    console.log(`Dependency audit evidence generated: ${summary.total} total (${summary.high} high, ${summary.moderate} moderate, ${summary.critical} critical).`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exit(1);
  }
}
