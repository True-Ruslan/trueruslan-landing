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
const FIRST_WAVE_SPECS = [
  {
    targetId: 'home',
    channel: 'telegram',
    text: (canonicalUrl) =>
      `GitHub, Habr, резюме, проекты и заметки в какой-то момент стали distributed system без service discovery.\n\nПофиксил.\n\nСобрал trueruslan.ru в единый entry point для всего, чем занимаюсь как backend-инженер:\n— /projects/ — инженерные кейсы: задача, роль, ограничения, решения и что реально проверено;\n— /notes/ — backend, reliability, AI systems и release engineering;\n— /publications/ — статьи и исследования;\n— /resume/ — web-CV, чтобы не заниматься distributed tracing по моим профилям.\n\nПод капотом — static-first, GitHub Pages, CI quality gates, clean URLs и AI Navigator. Для личного сайта слегка overengineered. Именно поэтому мне нравится.\n\nЕсли хочется быстро посмотреть, что я строю и как подхожу к инженерным задачам:\n${canonicalUrl}`,
  },
  {
    targetId: 'projects',
    channel: 'telegram',
    text: (canonicalUrl) =>
      `В разделе с проектами — не просто список технологий, а отдельные инженерные кейсы: задача, моя роль, ограничения, принятые решения и то, чем подтверждён результат.\n\n${canonicalUrl}`,
  },
  {
    targetId: 'engineering-notes',
    channel: 'telegram',
    text: (canonicalUrl) =>
      `Собираю практические заметки по backend, reliability, AI systems и release engineering в одном месте. Стараюсь держать формат коротким: проблема → решение → границы применимости.\n\n${canonicalUrl}`,
  },
];

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

function buildFirstWave(targets) {
  const byId = new Map(targets.map((target) => [target.id, target]));
  const drafts = [];

  for (const spec of FIRST_WAVE_SPECS) {
    const target = byId.get(spec.targetId);
    if (!target) continue;
    if (!target.channels.includes(spec.channel)) {
      throw new Error(`First-wave channel ${spec.channel} is not allowed for launch target ${target.id}.`);
    }
    const text = requireString(spec.text(target.canonicalUrl), `first-wave text for ${target.id}`, {maxLength: 1200});
    if (!text.includes(target.canonicalUrl)) {
      throw new Error(`First-wave text for ${target.id} must contain its canonical URL.`);
    }
    drafts.push({
      sequence: drafts.length + 1,
      targetId: target.id,
      targetPriority: target.priority,
      channel: spec.channel,
      title: target.title,
      canonicalUrl: target.canonicalUrl,
      evidenceBoundary: target.evidenceBoundary,
      audiences: [...target.audiences],
      publicationState: 'not-published',
      text,
    });
  }

  return {
    status: 'prepared',
    publicationState: 'not-published',
    mode: 'manual-only',
    strategy: 'small-channel-native-wave',
    draftCount: drafts.length,
    drafts,
  };
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
    firstWave: buildFirstWave(normalized),
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

  if (pack.firstWave?.drafts?.length) {
    lines.push(
      '## Recommended first wave',
      '',
      'A small channel-native sequence to launch deliberately before considering the full draft reserve. Every item remains `not-published` until a real external post exists.',
      '',
    );
    for (const draft of pack.firstWave.drafts) {
      lines.push(
        `### ${draft.sequence}. ${draft.title} — ${draft.channel}`,
        '',
        '```text',
        draft.text,
        '```',
        '',
        `Publication state: \`${draft.publicationState}\``,
        '',
      );
    }
    lines.push('## Full draft reserve', '');
  }

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
    console.log(`Recommended first wave: ${pack.firstWave.draftCount} manual drafts; publication state: ${pack.firstWave.publicationState}.`);
    console.log(`Publication state: ${pack.publicationState}`);
    console.log(`JSON: ${jsonPath}`);
    console.log(`Markdown: ${markdownPath}`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
