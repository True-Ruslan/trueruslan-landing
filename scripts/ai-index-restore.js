import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

import {loadAiConfig} from './ai-config.js';
import {verifyAiIndex} from './ai-index-verify.js';

export const ACCEPTED_AI5_ARTIFACT_ID = 9283608793;
export const ACCEPTED_AI5_ARTIFACT_SHA256 = '71260072c273588c4b8a4ab53180b6dfc5c39be8612aee21f91721c7d2919e1f';
export const ACCEPTED_AI5_REPOSITORY = 'True-Ruslan/trueruslan-landing';

const REQUIRED_INDEX_FILES = Object.freeze([
  'chunks.json',
  'index-meta.json',
  'embeddings.bin',
]);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function artifactUrl() {
  return `https://api.github.com/repos/${ACCEPTED_AI5_REPOSITORY}/actions/artifacts/${ACCEPTED_AI5_ARTIFACT_ID}/zip`;
}

async function downloadAcceptedArtifact({token, fetchImpl}) {
  const response = await fetchImpl(artifactUrl(), {
    method: 'GET',
    redirect: 'follow',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'trueruslan-ai-index-restore',
    },
  });
  if (!response.ok) {
    throw new Error(`Accepted AI-5 artifact download failed with HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function extractArchive(archivePath, destination) {
  const result = spawnSync('unzip', ['-q', archivePath, '-d', destination], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`Accepted AI-5 artifact extraction failed with exit code ${String(result.status)}`);
  }
}

function copyAcceptedIndex({extractedRoot, rootDir}) {
  const sourceDir = path.join(extractedRoot, 'data', 'ai-index');
  const targetDir = path.join(rootDir, 'data', 'ai-index');

  for (const name of REQUIRED_INDEX_FILES) {
    if (!fs.statSync(path.join(sourceDir, name), {throwIfNoEntry: false})?.isFile()) {
      throw new Error(`Accepted AI-5 artifact is missing data/ai-index/${name}`);
    }
  }

  fs.rmSync(targetDir, {recursive: true, force: true});
  fs.mkdirSync(targetDir, {recursive: true});
  for (const name of REQUIRED_INDEX_FILES) {
    fs.copyFileSync(path.join(sourceDir, name), path.join(targetDir, name));
  }
}

export async function restoreAcceptedAiIndex({
  rootDir = ROOT,
  token = process.env.GITHUB_TOKEN,
  fetchImpl = globalThis.fetch,
} = {}) {
  const config = loadAiConfig(path.join(rootDir, 'data', 'ai-navigator.json'));
  if (config.mode === 'off') {
    return Object.freeze({
      mode: 'off',
      restored: false,
      providerAccess: false,
    });
  }

  if (!token || typeof token !== 'string' || !token.trim()) {
    throw new Error('GITHUB_TOKEN is required to restore the accepted AI-5 index');
  }
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');

  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-ai5-index-'));
  try {
    const archiveBytes = await downloadAcceptedArtifact({token: token.trim(), fetchImpl});
    const digest = sha256(archiveBytes);
    if (digest !== ACCEPTED_AI5_ARTIFACT_SHA256) {
      throw new Error(`Accepted AI-5 artifact digest mismatch: sha256:${digest}`);
    }

    const archivePath = path.join(temporaryRoot, 'accepted-ai5.zip');
    const extractedRoot = path.join(temporaryRoot, 'extracted');
    fs.mkdirSync(extractedRoot, {recursive: true});
    fs.writeFileSync(archivePath, archiveBytes);
    extractArchive(archivePath, extractedRoot);
    copyAcceptedIndex({extractedRoot, rootDir});

    const verified = verifyAiIndex({rootDir, config});
    return Object.freeze({
      mode: config.mode,
      restored: true,
      providerAccess: false,
      artifactId: ACCEPTED_AI5_ARTIFACT_ID,
      artifactDigest: `sha256:${ACCEPTED_AI5_ARTIFACT_SHA256}`,
      chunkCount: verified.chunkCount,
      embeddingModel: verified.embeddingModel,
      dimensions: verified.dimensions,
      corpusDigest: verified.corpusDigest,
      embeddingsDigest: verified.embeddingsDigest,
      sourceCommit: verified.sourceCommit,
    });
  } finally {
    fs.rmSync(temporaryRoot, {recursive: true, force: true});
  }
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
