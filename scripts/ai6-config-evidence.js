import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

function sha256(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8');
  return `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`;
}

function sortJson(value) {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortJson(value[key])]),
    );
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(sortJson(value));
}

function cleanWorkerOrigin(workerBaseUrl) {
  if (typeof workerBaseUrl !== 'string' || !workerBaseUrl.trim()) {
    throw new Error('AI6_SEARCH_WORKER_BASE_URL is required');
  }
  const url = new URL(workerBaseUrl.trim());
  if (url.protocol !== 'https:'
    || url.username
    || url.password
    || url.search
    || url.hash
    || (url.pathname !== '/' && url.pathname !== '')) {
    throw new Error('AI-6 Worker base URL must be a clean HTTPS origin');
  }
  return url.origin;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

export function buildAi6ConfigEvidence({publicConfig, workerBaseUrl}) {
  if (!publicConfig || typeof publicConfig !== 'object' || Array.isArray(publicConfig)) {
    throw new Error('AI-6 public config must be an object');
  }
  if (publicConfig.mode !== 'off' || publicConfig.workerBaseUrl !== '') {
    throw new Error('AI-6 config evidence requires the public OFF rollback baseline');
  }

  const workerOrigin = cleanWorkerOrigin(workerBaseUrl);
  const rollbackConfig = cloneJson(publicConfig);
  const candidateConfig = {
    ...cloneJson(publicConfig),
    mode: 'search',
    workerBaseUrl: workerOrigin,
  };

  const publicConfigDigest = sha256(canonicalJson(publicConfig));
  const candidateConfigDigest = sha256(canonicalJson(candidateConfig));
  const rollbackConfigDigest = sha256(canonicalJson(rollbackConfig));
  if (rollbackConfigDigest !== publicConfigDigest) {
    throw new Error('AI-6 rollback config must exactly reproduce the public OFF baseline');
  }

  const candidate = Object.freeze({
    schemaVersion: 1,
    evidenceClass: 'ai6-search-candidate-config',
    mode: 'search',
    workerBaseUrlDigest: sha256(workerOrigin),
    configDigest: candidateConfigDigest,
    publicBaselineDigest: publicConfigDigest,
    sanitized: true,
  });
  const rollback = Object.freeze({
    schemaVersion: 1,
    evidenceClass: 'ai6-off-rollback-config',
    mode: 'off',
    workerBaseUrl: '',
    configDigest: rollbackConfigDigest,
    config: rollbackConfig,
  });

  return Object.freeze({
    candidate,
    rollback,
    manifest: Object.freeze({
      schemaVersion: 1,
      evidenceClass: 'ai6-search-config-pair',
      publicConfigUnchanged: true,
      candidateConfigDigest,
      rollbackConfigDigest,
      candidateWorkerBaseUrlDigest: candidate.workerBaseUrlDigest,
      rollbackMatchesPublicBaseline: true,
    }),
  });
}

function parseOutputDir(argv) {
  const index = argv.indexOf('--output-dir');
  if (index < 0 || !argv[index + 1]) throw new Error('AI-6 config evidence requires --output-dir <path>');
  return path.resolve(argv[index + 1]);
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function isMainModule() {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

async function runCli() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  try {
    const outputDir = parseOutputDir(process.argv.slice(2));
    const publicConfigPath = path.join(rootDir, 'data', 'ai-navigator.json');
    const publicConfig = JSON.parse(fs.readFileSync(publicConfigPath, 'utf8'));
    const evidence = buildAi6ConfigEvidence({
      publicConfig,
      workerBaseUrl: process.env.AI6_SEARCH_WORKER_BASE_URL,
    });

    fs.mkdirSync(outputDir, {recursive: true});
    writeJson(path.join(outputDir, 'ai6-candidate-search-config.json'), evidence.candidate);
    writeJson(path.join(outputDir, 'ai6-rollback-off-config.json'), evidence.rollback);
    process.stdout.write(`${JSON.stringify(evidence.manifest, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

if (isMainModule()) await runCli();
