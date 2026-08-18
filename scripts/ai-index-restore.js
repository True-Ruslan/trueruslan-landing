import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadAiConfig} from './ai-config.js';
import {verifyAiIndex} from './ai-index-verify.js';

export const ACCEPTED_AI5_SOURCE = 'data/ai-index-accepted/ai5';
export const ACCEPTED_AI5_FILE_DIGESTS = Object.freeze({
  'chunks.json': '1249ed898193d1a05bda632b1328a860909887a1700092ba38e612ac7e6ac17a',
  'index-meta.json': 'ad301d88071b2a57fe68df07cd98cdd9596ecc1ccc832453fc692af4d92f718d',
  'embeddings.bin': 'aaf2c7ba86a53f0ff040e63c2c75decbf538a84d6c54c1da0e44f124b199510a',
});

const REQUIRED_INDEX_FILES = Object.freeze(Object.keys(ACCEPTED_AI5_FILE_DIGESTS));
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function verifyDurableSource({rootDir}) {
  const sourceDir = path.join(rootDir, ...ACCEPTED_AI5_SOURCE.split('/'));
  for (const name of REQUIRED_INDEX_FILES) {
    const sourcePath = path.join(sourceDir, name);
    if (!fs.statSync(sourcePath, {throwIfNoEntry: false})?.isFile()) {
      throw new Error(`Accepted AI-5 durable source is missing ${ACCEPTED_AI5_SOURCE}/${name}`);
    }
    const digest = sha256(fs.readFileSync(sourcePath));
    const expected = ACCEPTED_AI5_FILE_DIGESTS[name];
    if (digest !== expected) {
      throw new Error(`Accepted AI-5 durable source digest mismatch for ${name}: sha256:${digest}`);
    }
  }
  return sourceDir;
}

function copyAcceptedIndex({rootDir}) {
  const sourceDir = verifyDurableSource({rootDir});
  const targetDir = path.join(rootDir, 'data', 'ai-index');

  fs.rmSync(targetDir, {recursive: true, force: true});
  fs.mkdirSync(targetDir, {recursive: true});
  for (const name of REQUIRED_INDEX_FILES) {
    fs.copyFileSync(path.join(sourceDir, name), path.join(targetDir, name));
  }
}

export async function restoreAcceptedAiIndex({rootDir = ROOT} = {}) {
  const config = loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'));
  if (config.mode === 'off') {
    return Object.freeze({
      mode: 'off',
      restored: false,
      providerAccess: false,
    });
  }

  copyAcceptedIndex({rootDir});
  const verified = verifyAiIndex({rootDir, config});
  return Object.freeze({
    mode: config.mode,
    restored: true,
    providerAccess: false,
    source: 'repository',
    sourcePath: ACCEPTED_AI5_SOURCE,
    sourceFileDigests: Object.freeze(
      Object.fromEntries(
        Object.entries(ACCEPTED_AI5_FILE_DIGESTS).map(([name, digest]) => [name, `sha256:${digest}`]),
      ),
    ),
    chunkCount: verified.chunkCount,
    embeddingModel: verified.embeddingModel,
    dimensions: verified.dimensions,
    corpusDigest: verified.corpusDigest,
    embeddingsDigest: verified.embeddingsDigest,
    sourceCommit: verified.sourceCommit,
  });
}

function isMainModule() {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  try {
    const report = await restoreAcceptedAiIndex();
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
