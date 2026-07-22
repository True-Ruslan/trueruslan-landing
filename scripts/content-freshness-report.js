import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {analyzeContentFreshness, renderFreshnessMarkdown} from './content-freshness.js';
import {loadProjectEvidence} from './project-evidence.js';
import {loadProjectRegistry} from './project-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_PROJECTS_PATH = path.join(ROOT, 'data', 'projects.json');
const DEFAULT_EVIDENCE_PATH = path.join(ROOT, 'data', 'project-evidence.json');
const DEFAULT_HISTORY_DIR = path.join(ROOT, 'data', 'project-history');
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'quality-artifacts');

export function parseFreshnessReportArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === '--observations') {
      result.observationsPath = value;
      index += 1;
    } else if (arg === '--output-dir') {
      result.outputDir = value;
      index += 1;
    } else if (arg === '--max-age-days') {
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed < 1) throw new Error('--max-age-days must be a positive integer');
      result.maxVerifiedAgeDays = parsed;
      index += 1;
    } else if (arg === '--now') {
      result.now = value;
      index += 1;
    } else if (arg === '--projects') {
      result.projectsPath = value;
      index += 1;
    } else if (arg === '--evidence') {
      result.evidencePath = value;
      index += 1;
    } else if (arg === '--history-dir') {
      result.historyDir = value;
      index += 1;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return result;
}

function loadObservations(observationsPath) {
  if (!observationsPath) return {repositories: {}, links: {}};
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(observationsPath, 'utf8'));
  } catch (error) {
    throw new Error(`invalid observations input: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('invalid observations input: root must be an object');
  }
  if (parsed.repositories !== undefined && (!parsed.repositories || typeof parsed.repositories !== 'object' || Array.isArray(parsed.repositories))) {
    throw new Error('invalid observations input: repositories must be an object');
  }
  if (parsed.links !== undefined && (!parsed.links || typeof parsed.links !== 'object' || Array.isArray(parsed.links))) {
    throw new Error('invalid observations input: links must be an object');
  }
  return {
    ...parsed,
    repositories: parsed.repositories ?? {},
    links: parsed.links ?? {},
  };
}

function loadTimelines(projects, historyDir) {
  const timelines = {};
  for (const project of projects) {
    if (!project.timeline) continue;
    const timelinePath = path.join(historyDir, `${project.timeline}.json`);
    if (!fs.existsSync(timelinePath)) continue;
    timelines[project.timeline] = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
  }
  return timelines;
}

export function runFreshnessReport({
  projectsPath = DEFAULT_PROJECTS_PATH,
  evidencePath = DEFAULT_EVIDENCE_PATH,
  historyDir = DEFAULT_HISTORY_DIR,
  observationsPath,
  outputDir = DEFAULT_OUTPUT_DIR,
  now = new Date(),
  maxVerifiedAgeDays = 30,
} = {}) {
  const projects = loadProjectRegistry(projectsPath, {historyDir, requireTimelineFiles: true});
  const evidence = loadProjectEvidence(evidencePath, {projects});
  const timelines = loadTimelines(projects, historyDir);
  const observations = loadObservations(observationsPath);
  const report = analyzeContentFreshness({
    projects,
    evidence,
    timelines,
    observations,
    now,
    maxVerifiedAgeDays,
  });

  fs.mkdirSync(outputDir, {recursive: true});
  const jsonPath = path.join(outputDir, 'content-freshness-report.json');
  const markdownPath = path.join(outputDir, 'content-freshness-report.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  fs.writeFileSync(markdownPath, renderFreshnessMarkdown(report), 'utf8');

  return {report, jsonPath, markdownPath};
}

function main() {
  try {
    const args = parseFreshnessReportArgs(process.argv.slice(2));
    const result = runFreshnessReport(args);
    console.log(`Content Freshness Guard findings: ${result.report.summary.total}`);
    console.log(`JSON report: ${result.jsonPath}`);
    console.log(`Markdown report: ${result.markdownPath}`);
  } catch (error) {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
