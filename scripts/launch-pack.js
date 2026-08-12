import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {loadDistributionReadiness} from './distribution-readiness.js';

const MODULE_PATH = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(MODULE_PATH), '..');
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'distribution-artifacts');
const CANONICAL_ORIGIN = 'https://trueruslan.ru';
const CHANNEL_ORDER = ['github', 'habr', 'telegram', 'direct'];
const CHANNELS = new Set(CHANNEL_ORDER);

function requireString(value, label, {maxLength = 1000} = {}) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string.`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new Error(`${label} is too long.`);
  return normalized;
}

function validateCanonicalUrl(value, label) {
  const normalized = requireString(value, label, {maxLength: 500});
  let url;
  try {
    url = new URL(normalized);
  } catch {
    throw new Error(`${label} must be an absolute canonical URL.`);
  }
  if (url.origin !== CANONICAL_ORIGIN || url.username || url.password || url.search || url.hash) {
    throw new Error(`${label} must use the exact canonical origin without credentials, query or fragment.`);
  }
  if (url.pathname.startsWith('/landing/') || /\.html(?:$|\/)/i.test(url.pathname)) {
    throw new Error(`${label} must use a clean canonical URL, not a legacy route.`);
  }
  if (url.pathname !== '/' && !url.pathname.endsWith('/')) {
    throw new Error(`${label} must use a directory-style clean canonical URL.`);
  }
  return url.href;
}

function validateTarget(target) {
  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    throw new Error('Launch target must be an object.');
  }
  const id = requireString(target.id, 'launch target id', {maxLength: 80});
  const priority = target.priority;
  if (!Number.isInteger(priority) || priority < 1) throw new Error(`Invalid launch target priority for ${id}.`);
  const channels = target.channels;
  if (!Array.isArray(channels) || channels.length === 0) throw new Error(`Launch target ${id} must expose channels.`);
  if (new Set(channels).size !== channels.length) throw new Error(`Launch target ${id} contains duplicate channels.`);
  for (const channel of channels) {
    if (!CHANNELS.has(channel)) throw new Error(`Launch target ${id} contains unsupported channel: ${channel}`);
  }
  return {
    id,
    priority,
    title: requireString(target.title, `title for ${id}`, {maxLength: 240}),
    displayTitle: requireString(target.displayTitle, `displayTitle for ${id}`, {maxLength: 160}),
    canonicalUrl: validateCanonicalUrl(target.canonicalUrl, `canonical URL for ${id}`),
    framing: requireString(target.framing, `framing for ${id}`, {maxLength: 500}),
    evidenceBoundary: requireString(target.evidenceBoundary, `evidence boundary for ${id}`, {maxLength: 700}),
    audiences: Array.isArray(target.audiences) ? [...target.audiences] : [],
    channels: [...channels],
  };
}

function draftText(target, channel) {
  switch (channel) {
    case 'github':
      return `${target.title}\n\n${target.framing}\n\n${target.canonicalUrl}`;
    case 'habr':
      return `${target.title}\n\n${target.framing}\n\n${target.canonicalUrl}`;
    case 'telegram':
      return `${target.title}\n\n${target.framing}\n\n${target.canonicalUrl}`;
    case 'direct':
      return `${target.framing}\n\n${target.canonicalUrl}`;
    default:
      throw new Error(`Unsupported launch channel: ${channel}`);
  }
}

export function buildLaunchPack({targets} = {}) {
  if (!Array.isArray(targets) || targets.length === 0) throw new Error('Launch pack requires canonical distribution targets.');
  const normalized = targets.map(validateTarget).sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id, 'en'));
  const ids = new Set();
  const priorities = new Set();
  for (const target of normalized) {
    if (ids.has(target.id)) throw new Error(`Duplicate launch target id: ${target.id}`);
    if (priorities.has(target.priority)) throw new Error(`Duplicate launch target priority: ${target.priority}`);
    ids.add(target.id);
    priorities.add(target.priority);
  }

  const drafts = [];
  for (const target of normalized) {
    for (const channel of CHANNEL_ORDER) {
      if (!target.channels.includes(channel)) continue;
      drafts.push({
        targetId: target.id,
        targetPriority: target.priority,
        channel,
        title: target.title,
        canonicalUrl: target.canonicalUrl,
        framing: target.framing,
        evidenceBoundary: target.evidenceBoundary,
        audiences: [...target.audiences],
        publicationState: 'not-published',
        text: draftText(target, channel),
      });
    }
  }

  return {
    schemaVersion: 1,
    status: 'prepared',
    publicationState: 'not-published',
    provenance: 'canonical-distribution-readiness',
    mode: 'manual-only',
    channels: CHANNEL_ORDER.filter((channel) => drafts.some((draft) => draft.channel === channel)),
    targetCount: normalized.length,
    draftCount: drafts.length,
    drafts,
  };
}

export function renderLaunchPackMarkdown(pack) {
  if (!pack || pack.status !== 'prepared' || pack.publicationState !== 'not-published') {
    throw new Error('Launch pack renderer accepts prepared, not-published packs only.');
  }
  const lines = [
    '# Controlled Launch Pack',
    '',
    `Status: \`${pack.status}\``,
    `Publication state: \`${pack.publicationState}\``,
    `Mode: \`${pack.mode}\``,
    '',
    'This artifact prepares manual copy only. It does not publish, schedule, authenticate to, or mutate any external channel.',
    'Use the draft as a starting point, review it immediately before posting, and keep the canonical URL unchanged.',
    '',
  ];

  let currentTarget = null;
  for (const draft of pack.drafts) {
    if (draft.targetId !== currentTarget) {
      currentTarget = draft.targetId;
      lines.push(`## ${draft.title}`, '', `Canonical URL: ${draft.canonicalUrl}`, `Evidence boundary: ${draft.evidenceBoundary}`, '');
    }
    lines.push(
      `### ${draft.channel}`,
      '',
      '```text',
      draft.text,
      '```',
      '',
      `Publication state: \`${draft.publicationState}\``,
      '',
    );
  }

  lines.push(
    '## Operator boundary',
    '',
    '- Publication remains a deliberate manual action outside this repository.',
    '- Do not add tracking query parameters to canonical URLs in this pack.',
    '- Do not mark a draft as published from repository tooling; record real external evidence only after an actual post exists.',
    '- Prepared copy is not evidence of reach, clicks, engagement, ranking, hiring, or product impact.',
    '',
  );
  return `${lines.join('\n')}\n`;
}

export function writeLaunchPack({outputDir = DEFAULT_OUTPUT_DIR, ...loadOptions} = {}) {
  const {targets} = loadDistributionReadiness(loadOptions);
  const pack = buildLaunchPack({targets});
  const markdown = renderLaunchPackMarkdown(pack);
  fs.mkdirSync(outputDir, {recursive: true});
  const jsonPath = path.join(outputDir, 'controlled-launch-pack.json');
  const markdownPath = path.join(outputDir, 'controlled-launch-pack.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(pack, null, 2)}\n`, 'utf8');
  fs.writeFileSync(markdownPath, markdown, 'utf8');
  return {pack, markdown, jsonPath, markdownPath};
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--output-dir') {
      const value = argv[index + 1];
      if (!value) throw new Error('--output-dir requires a value.');
      options.outputDir = path.resolve(value);
      index += 1;
      continue;
    }
    throw new Error(`Unknown launch pack argument: ${argument}`);
  }
  return options;
}

if (process.argv[1] && path.resolve(process.argv[1]) === MODULE_PATH) {
  try {
    const {pack, jsonPath, markdownPath} = writeLaunchPack(parseArgs(process.argv.slice(2)));
    console.log(`Controlled launch pack: ${pack.targetCount} targets, ${pack.draftCount} manual drafts.`);
    console.log(`Publication state: ${pack.publicationState}`);
    console.log(`JSON: ${jsonPath}`);
    console.log(`Markdown: ${markdownPath}`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
