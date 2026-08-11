import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {
  analyzeMeasurementCheckpoint,
  renderMeasurementCheckpointMarkdown,
} from './measurement-checkpoint.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'quality-artifacts');
const PRESENTATION_BASELINE_FIELDS = Object.freeze([
  'schemaVersion',
  'slice',
  'status',
  'measurementMode',
  'resetsCleanUrlMeasurement',
  'cleanUrlMigrationAt',
  'acceptedAt',
  'deployedSha',
  'pagesDeploymentId',
  'productionLiveRunId',
]);

export function parseMeasurementReportArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === '--input') {
      if (!value) throw new Error('--input requires a path');
      result.inputPath = value;
      index += 1;
    } else if (arg === '--presentation-baseline') {
      if (!value) throw new Error('--presentation-baseline requires a path');
      result.presentationBaselinePath = value;
      index += 1;
    } else if (arg === '--output-dir') {
      if (!value) throw new Error('--output-dir requires a path');
      result.outputDir = value;
      index += 1;
    } else if (arg === '--minimum-observation-days') {
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error('--minimum-observation-days must be a positive integer');
      }
      result.minimumObservationDays = parsed;
      index += 1;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return result;
}

function loadJsonFile(inputPath, label) {
  if (!inputPath) throw new Error(`${label} path is required`);
  let raw;
  try {
    raw = fs.readFileSync(inputPath, 'utf8');
  } catch (error) {
    throw new Error(`${label} cannot be read: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function loadMeasurementObservations(inputPath) {
  return loadJsonFile(inputPath, 'measurement observations input');
}

function requireIsoTimestamp(value, label) {
  if (typeof value !== 'string' || !value.trim() || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${label} must be an ISO timestamp`);
  }
  return value;
}

function requireProductionIdentity(value, label, pattern) {
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new Error(`${label} is invalid`);
  }
  return value;
}

export function loadPresentationBaseline(presentationBaselinePath) {
  const source = loadJsonFile(presentationBaselinePath, 'presentation baseline');
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new Error('presentation baseline must be an object');
  }

  const unknown = Object.keys(source).filter((key) => !PRESENTATION_BASELINE_FIELDS.includes(key));
  const missing = PRESENTATION_BASELINE_FIELDS.filter((key) => !Object.hasOwn(source, key));
  if (unknown.length || missing.length) {
    throw new Error(
      `presentation baseline schema mismatch; missing: ${missing.join(', ') || 'none'}; unsupported: ${unknown.join(', ') || 'none'}`,
    );
  }

  if (source.schemaVersion !== 1) throw new Error('presentation baseline schemaVersion must be 1');
  if (source.slice !== 'C7') throw new Error('presentation baseline slice must be C7');
  if (source.measurementMode !== 'context-only') {
    throw new Error('presentation baseline measurementMode must be context-only');
  }
  if (source.resetsCleanUrlMeasurement !== false) {
    throw new Error('presentation baseline must not reset clean URL measurement');
  }
  requireIsoTimestamp(source.cleanUrlMigrationAt, 'presentation baseline cleanUrlMigrationAt');

  if (!['pending-production-acceptance', 'production-accepted'].includes(source.status)) {
    throw new Error('presentation baseline status is unsupported');
  }

  const identityFields = ['acceptedAt', 'deployedSha', 'pagesDeploymentId', 'productionLiveRunId'];
  if (source.status === 'pending-production-acceptance') {
    for (const field of identityFields) {
      if (source[field] !== null) {
        throw new Error(`pending presentation baseline ${field} must be null`);
      }
    }
  } else {
    requireIsoTimestamp(source.acceptedAt, 'presentation baseline acceptedAt');
    requireProductionIdentity(source.deployedSha, 'presentation baseline deployedSha', /^[0-9a-f]{40}$/i);
    requireProductionIdentity(source.pagesDeploymentId, 'presentation baseline pagesDeploymentId', /^[1-9][0-9]*$/);
    requireProductionIdentity(source.productionLiveRunId, 'presentation baseline productionLiveRunId', /^[1-9][0-9]*$/);
  }

  return Object.freeze(Object.fromEntries(PRESENTATION_BASELINE_FIELDS.map((field) => [field, source[field]])));
}

function renderPresentationBaselineMarkdown(report) {
  const baseline = report.presentationBaseline;
  return [
    renderMeasurementCheckpointMarkdown(report).trimEnd(),
    '',
    '## Presentation baseline provenance',
    '',
    `Presentation baseline: **${baseline.slice} / ${baseline.status}**`,
    '',
    `Measurement mode: **${baseline.measurementMode}**. This context does not reset the clean-URL measurement boundary at \`${report.cleanUrlMigrationAt}\`.`,
    '',
    '- Presentation provenance is tracked repository context, not an operator observation.',
    '- It does not change readiness, evidence class, comparison windows, traffic sufficiency, or the human-review requirement.',
    '- It does not authorize an engagement, conversion, SEO, product-impact, or causal conclusion.',
    '',
  ].join('\n');
}

export function runMeasurementCheckpointReport({
  inputPath,
  presentationBaselinePath,
  outputDir = DEFAULT_OUTPUT_DIR,
  minimumObservationDays = 10,
} = {}) {
  const observations = loadMeasurementObservations(inputPath);
  const presentationBaseline = loadPresentationBaseline(presentationBaselinePath);
  const analyzed = analyzeMeasurementCheckpoint(observations, {minimumObservationDays});

  if (presentationBaseline.cleanUrlMigrationAt !== analyzed.cleanUrlMigrationAt) {
    throw new Error(
      `presentation baseline cleanUrlMigrationAt ${presentationBaseline.cleanUrlMigrationAt} does not match measurement boundary ${analyzed.cleanUrlMigrationAt}`,
    );
  }

  const report = Object.freeze({...analyzed, presentationBaseline});

  fs.mkdirSync(outputDir, {recursive: true});
  const jsonPath = path.join(outputDir, 'measurement-checkpoint-report.json');
  const markdownPath = path.join(outputDir, 'measurement-checkpoint-report.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  fs.writeFileSync(markdownPath, renderPresentationBaselineMarkdown(report), 'utf8');

  return {report, jsonPath, markdownPath};
}

function main() {
  try {
    const args = parseMeasurementReportArgs(process.argv.slice(2));
    const result = runMeasurementCheckpointReport(args);
    console.log(`Measurement checkpoint status: ${result.report.status}`);
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
