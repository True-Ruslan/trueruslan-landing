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

export function parseMeasurementReportArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === '--input') {
      if (!value) throw new Error('--input requires a path');
      result.inputPath = value;
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

function loadMeasurementObservations(inputPath) {
  if (!inputPath) throw new Error('measurement observations input path is required');
  let raw;
  try {
    raw = fs.readFileSync(inputPath, 'utf8');
  } catch (error) {
    throw new Error(`measurement observations input cannot be read: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`measurement observations input is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function runMeasurementCheckpointReport({
  inputPath,
  outputDir = DEFAULT_OUTPUT_DIR,
  minimumObservationDays = 10,
} = {}) {
  const observations = loadMeasurementObservations(inputPath);
  const report = analyzeMeasurementCheckpoint(observations, {minimumObservationDays});

  fs.mkdirSync(outputDir, {recursive: true});
  const jsonPath = path.join(outputDir, 'measurement-checkpoint-report.json');
  const markdownPath = path.join(outputDir, 'measurement-checkpoint-report.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  fs.writeFileSync(markdownPath, renderMeasurementCheckpointMarkdown(report), 'utf8');

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
