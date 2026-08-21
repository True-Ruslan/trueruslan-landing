import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadDistributionReadiness} from './distribution-readiness.js';

const MODULE_PATH = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(MODULE_PATH), '..');
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'distribution-artifacts');
const CANONICAL_ORIGIN = 'https://trueruslan.ru';
const MAX_RAW_BYTES = 64 * 1024;
const MAX_PUBLICATIONS = 38;
const PUBLICATION_HOSTS = new Map([
  ['github', 'github.com'],
  ['habr', 'habr.com'],
  ['telegram', 't.me'],
]);
const TOP_LEVEL_KEYS = new Set(['schemaVersion', 'observedAt', 'publications']);
const PUBLICATION_KEYS = new Set(['targetId', 'channel', 'canonicalUrl', 'publicationUrl', 'publishedAt']);

function requirePlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value;
}

function requireExactKeys(value, allowedKeys, label) {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) throw new Error(`${label} contains unsupported field: ${key}`);
  }
}

function requireString(value, label, {maxLength = 1000} = {}) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string.`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new Error(`${label} is too long.`);
  if (/[\r\n]/.test(normalized)) throw new Error(`${label} must remain single-line.`);
  return normalized;
}

function parseTimestamp(value, label) {
  const normalized = requireString(value, label, {maxLength: 40});
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) throw new Error(`${label} must be a valid timestamp.`);
  const iso = new Date(timestamp).toISOString();
  if (normalized !== iso) throw new Error(`${label} must use canonical ISO-8601 UTC format.`);
  return {iso, timestamp};
}

function validateTargetCanonicalUrl(value, targetId) {
  const normalized = requireString(value, `canonicalUrl for target ${targetId}`, {maxLength: 500});
  let url;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error(`canonicalUrl for target ${targetId} must be an absolute URL.`);
  }
  if (
    url.origin !== CANONICAL_ORIGIN ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash ||
    !url.pathname.startsWith('/')
  ) {
    throw new Error(`canonicalUrl for target ${targetId} must remain on the canonical production origin ${CANONICAL_ORIGIN}.`);
  }
  if (url.pathname !== '/' && !url.pathname.endsWith('/')) {
    throw new Error(`canonicalUrl for target ${targetId} must use a directory-style clean URL.`);
  }
  if (url.pathname.startsWith('/landing/') || /\.html(?:$|\/)/.test(url.pathname)) {
    throw new Error(`canonicalUrl for target ${targetId} must not use a legacy public identity.`);
  }
  return url.href;
}

function validateCanonicalUrl(value, target) {
  const normalized = requireString(value, `canonicalUrl for ${target.id}`, {maxLength: 500});
  if (normalized !== target.canonicalUrl) {
    throw new Error(`canonicalUrl for ${target.id} must exactly match canonical distribution readiness.`);
  }
  return normalized;
}

function validatePublicationUrl(value, channel) {
  const normalized = requireString(value, `publicationUrl for ${channel}`, {maxLength: 1000});
  let url;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error(`publicationUrl for ${channel} must be an absolute HTTPS URL.`);
  }

  const expectedHost = PUBLICATION_HOSTS.get(channel);
  if (!expectedHost) throw new Error(`${channel} cannot be used as public publication evidence.`);
  if (url.protocol !== 'https:' || url.username || url.password || url.port) {
    throw new Error(`publicationUrl for ${channel} must be a credential-free HTTPS URL without a non-default port.`);
  }
  if (url.hostname !== expectedHost) {
    throw new Error(`publicationUrl host for ${channel} must be ${expectedHost}.`);
  }
  if (url.search || url.hash) {
    throw new Error(`publicationUrl for ${channel} must not contain query, tracking parameters or fragments.`);
  }
  if (!url.pathname || url.pathname === '/') {
    throw new Error(`publicationUrl for ${channel} must identify a concrete public publication/profile path.`);
  }
  return url.href;
}

function normalizeTargets(targets) {
  if (!Array.isArray(targets) || targets.length === 0) throw new Error('Canonical distribution targets are required.');
  const byId = new Map();
  for (const target of targets) {
    requirePlainObject(target, 'distribution target');
    const id = requireString(target.id, 'distribution target id', {maxLength: 80});
    if (byId.has(id)) throw new Error(`Duplicate distribution target id: ${id}`);
    if (!Number.isInteger(target.priority) || target.priority < 1) throw new Error(`Invalid distribution priority for ${id}.`);
    if (!Array.isArray(target.channels) || target.channels.length === 0) {
      throw new Error(`Distribution target ${id} must expose channels.`);
    }
    const channels = target.channels.map((channel) => requireString(channel, `channel for ${id}`, {maxLength: 40}));
    if (new Set(channels).size !== channels.length) throw new Error(`Distribution target ${id} contains duplicate channels.`);
    byId.set(id, {
      id,
      priority: target.priority,
      canonicalUrl: validateTargetCanonicalUrl(target.canonicalUrl, id),
      title: requireString(target.title, `title for ${id}`, {maxLength: 240}),
      evidenceBoundary: requireString(target.evidenceBoundary, `evidenceBoundary for ${id}`, {maxLength: 500}),
      channels,
    });
  }
  return byId;
}

export function normalizePublicationReceipt({input, targets, now = new Date()} = {}) {
  requirePlainObject(input, 'publication receipt input');
  requireExactKeys(input, TOP_LEVEL_KEYS, 'publication receipt input');
  if (input.schemaVersion !== 1) throw new Error('publication receipt schemaVersion must be 1.');
  if (!Array.isArray(input.publications) || input.publications.length === 0) {
    throw new Error('publication receipt must contain at least one publication observation.');
  }
  if (input.publications.length > MAX_PUBLICATIONS) {
    throw new Error(`publication receipt may contain at most ${MAX_PUBLICATIONS} observations.`);
  }

  const nowTimestamp = now instanceof Date ? now.getTime() : Number.NaN;
  if (!Number.isFinite(nowTimestamp)) throw new Error('now must be a valid Date.');

  const observed = parseTimestamp(input.observedAt, 'observedAt');
  if (observed.timestamp > nowTimestamp) throw new Error('observedAt cannot be in the future.');

  const targetsById = normalizeTargets(targets);
  const seen = new Set();
  const publications = input.publications.map((rawPublication, index) => {
    requirePlainObject(rawPublication, `publication[${index}]`);
    requireExactKeys(rawPublication, PUBLICATION_KEYS, `publication[${index}]`);

    const targetId = requireString(rawPublication.targetId, `targetId for publication[${index}]`, {maxLength: 80});
    const target = targetsById.get(targetId);
    if (!target) throw new Error(`Unknown canonical distribution target: ${targetId}`);

    const channel = requireString(rawPublication.channel, `channel for ${targetId}`, {maxLength: 40});
    if (channel === 'direct') throw new Error('direct sharing cannot be counted as public publication evidence.');
    if (!target.channels.includes(channel)) throw new Error(`Channel ${channel} is not allowed for target ${targetId}.`);
    if (!PUBLICATION_HOSTS.has(channel)) throw new Error(`Unsupported public publication channel: ${channel}`);

    const key = `${targetId}:${channel}`;
    if (seen.has(key)) throw new Error(`Duplicate publication observation for ${key}.`);
    seen.add(key);

    const published = parseTimestamp(rawPublication.publishedAt, `publishedAt for ${key}`);
    if (published.timestamp > observed.timestamp) {
      throw new Error(`publishedAt for ${key} cannot be after observedAt.`);
    }

    return {
      targetId,
      targetPriority: target.priority,
      channel,
      title: target.title,
      canonicalUrl: validateCanonicalUrl(rawPublication.canonicalUrl, target),
      publicationUrl: validatePublicationUrl(rawPublication.publicationUrl, channel),
      publishedAt: published.iso,
      publicationState: 'operator-reported-published',
      verificationState: 'operator-supplied-not-independently-fetched',
      evidenceBoundary: target.evidenceBoundary,
    };
  });

  publications.sort((left, right) =>
    left.targetPriority - right.targetPriority || left.channel.localeCompare(right.channel, 'en'),
  );

  return {
    schemaVersion: 1,
    evidenceClass: 'operator-supplied-publication-receipt',
    verificationState: 'operator-supplied-not-independently-fetched',
    stateImpact: 'none',
    observedAt: observed.iso,
    observationCount: publications.length,
    publications,
  };
}

export function renderPublicationReceiptMarkdown(receipt) {
  requirePlainObject(receipt, 'publication receipt');
  if (receipt.evidenceClass !== 'operator-supplied-publication-receipt') {
    throw new Error('Unsupported publication receipt evidence class.');
  }
  if (receipt.verificationState !== 'operator-supplied-not-independently-fetched' || receipt.stateImpact !== 'none') {
    throw new Error('Publication receipt must preserve the operator-supplied, no-state-impact boundary.');
  }

  const lines = [
    '# Controlled Launch Publication Receipt',
    '',
    `Evidence class: \`${receipt.evidenceClass}\``,
    `Verification state: \`${receipt.verificationState}\``,
    `State impact: \`${receipt.stateImpact}\``,
    `Observed at: \`${receipt.observedAt}\``,
  ];
  if (receipt.sourceSha256) lines.push(`SHA-256 provenance: \`${receipt.sourceSha256}\``);
  lines.push('', `Observations: **${receipt.observationCount}**`, '');

  for (const publication of receipt.publications) {
    lines.push(
      `## ${publication.title} — ${publication.channel}`,
      '',
      `- Target: \`${publication.targetId}\``,
      `- Canonical URL: ${publication.canonicalUrl}`,
      `- Publication URL: ${publication.publicationUrl}`,
      `- Published at: \`${publication.publishedAt}\``,
      `- Publication state: \`${publication.publicationState}\``,
      `- Verification state: \`${publication.verificationState}\``,
      `- Evidence boundary: ${publication.evidenceBoundary}`,
      '',
    );
  }

  lines.push(
    '## Evidence boundary',
    '',
    'This receipt records operator-supplied publication URLs only. It does not independently fetch or authenticate the external post and does not prove reach, clicks, engagement, ranking, SEO impact, hiring or product impact.',
    'It does not complete P4.1B or P3.6, and it does not open P4.1C automatically. Search Console/Webmaster and measurement evidence remain separate authenticated/operator-reviewed evidence classes.',
    '',
  );
  return `${lines.join('\n')}\n`;
}

export function writePublicationReceipt({
  inputPath,
  outputDir = DEFAULT_OUTPUT_DIR,
  targets,
  now = new Date(),
  ...loadOptions
} = {}) {
  if (!inputPath) throw new Error('writePublicationReceipt requires an explicit inputPath.');
  const resolvedInputPath = path.resolve(inputPath);
  const rawBytes = fs.readFileSync(resolvedInputPath);
  if (rawBytes.length > MAX_RAW_BYTES) {
    throw new Error(`Publication receipt input is too large; maximum is ${MAX_RAW_BYTES} bytes (64 KiB).`);
  }
  const raw = rawBytes.toString('utf8');
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    throw new Error('Publication receipt input must be valid JSON.');
  }

  const canonicalTargets = targets ?? loadDistributionReadiness(loadOptions).targets;
  const receipt = normalizePublicationReceipt({input, targets: canonicalTargets, now});
  receipt.sourceSha256 = crypto.createHash('sha256').update(rawBytes).digest('hex');
  const markdown = renderPublicationReceiptMarkdown(receipt);

  fs.mkdirSync(outputDir, {recursive: true});
  const jsonPath = path.join(outputDir, 'controlled-launch-publication-receipt.json');
  const markdownPath = path.join(outputDir, 'controlled-launch-publication-receipt.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  fs.writeFileSync(markdownPath, markdown, 'utf8');
  return {receipt, markdown, jsonPath, markdownPath};
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--input') {
      const value = argv[index + 1];
      if (!value) throw new Error('--input requires a value.');
      options.inputPath = path.resolve(value);
      index += 1;
      continue;
    }
    if (argument === '--output-dir') {
      const value = argv[index + 1];
      if (!value) throw new Error('--output-dir requires a value.');
      options.outputDir = path.resolve(value);
      index += 1;
      continue;
    }
    throw new Error(`Unknown launch publication receipt argument: ${argument}`);
  }
  if (!options.inputPath) throw new Error('--input is required.');
  return options;
}

if (process.argv[1] && path.resolve(process.argv[1]) === MODULE_PATH) {
  try {
    const {receipt, jsonPath, markdownPath} = writePublicationReceipt(parseArgs(process.argv.slice(2)));
    console.log(`Controlled launch publication receipt: ${receipt.observationCount} operator-supplied observations.`);
    console.log(`Verification state: ${receipt.verificationState}; state impact: ${receipt.stateImpact}.`);
    console.log(`JSON: ${jsonPath}`);
    console.log(`Markdown: ${markdownPath}`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
