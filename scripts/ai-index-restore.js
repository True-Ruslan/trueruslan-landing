import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadAiConfig} from './ai-config.js';
import {verifyAiIndex} from './ai-index-verify.js';

export const ACCEPTED_AI5_SOURCE = 'data/ai-index-accepted/ai5';
export const ACCEPTED_AI5_FILE_DIGESTS = Object.freeze({
  'chunks.json': '95b4f2347c9206ea782c31f6c87048bc5073dc1e666f1e1e22be1f12595c393a',
  'index-meta.json': 'e3d79fcf3042b17ff7ab9f933e371fa65b272ac9e72b3dcb8bc121a04955d113',
  'embeddings.bin': '5928142dacccc18c69a8d3df7e3ecbb6202138595bd6c85059f41817a7665e67',
});

const REQUIRED_INDEX_FILES = Object.freeze(Object.keys(ACCEPTED_AI5_FILE_DIGESTS));
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function readVerifiedDurableSource({rootDir}) {
  const sourceDir = path.join(rootDir, ...ACCEPTED_AI5_SOURCE.split('/'));
  const verifiedFiles = new Map();

  for (const name of REQUIRED_INDEX_FILES) {
    const sourcePath = path.join(sourceDir, name);
    let bytes;
    try {
      bytes = fs.readFileSync(sourcePath);
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new Error(`Accepted AI-5 durable source is missing ${ACCEPTED_AI5_SOURCE}/${name}`);
      }
      throw error;
    }

    const digest = sha256(bytes);
    const expected = ACCEPTED_AI5_FILE_DIGESTS[name];
    if (digest !== expected) {
      throw new Error(`Accepted AI-5 durable source digest mismatch for ${name}: sha256:${digest}`);
    }
    verifiedFiles.set(name, bytes);
  }

  return verifiedFiles;
}

function copyAcceptedIndex({rootDir}) {
  const verifiedFiles = readVerifiedDurableSource({rootDir});
  const targetDir = path.join(rootDir, 'data', 'ai-index');

  fs.rmSync(targetDir, {recursive: true, force: true});
  fs.mkdirSync(targetDir, {recursive: true});
  for (const [name, bytes] of verifiedFiles) {
    fs.writeFileSync(path.join(targetDir, name), bytes);
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
