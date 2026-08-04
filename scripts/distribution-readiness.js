import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const MODULE_PATH = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(MODULE_PATH), '..');
const DEFAULT_TARGETS_PATH = path.join(ROOT, 'data', 'distribution-targets.json');
const DEFAULT_PAGE_META_PATH = path.join(ROOT, 'data', 'page-meta.json');
const DEFAULT_EXTERNAL_LINKS_PATH = path.join(ROOT, 'data', 'external-links.json');
const DEFAULT_RUNBOOK_PATH = path.join(ROOT, 'docs', 'DISTRIBUTION.md');
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'distribution-artifacts');
const DEFAULT_SITE_URL = 'https://trueruslan.ru';

const ALLOWED_AUDIENCES = new Set(['recruiter', 'engineer', 'researcher', 'general']);
const ALLOWED_CHANNELS = new Set(['github', 'habr', 'telegram', 'direct']);
const ALLOWED_PROFILE_STATES = new Set(['verified', 'stale', 'unverified']);
const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function requireString(value, label, {maxLength = 500} = {}) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new Error(`${label} is too long.`);
  if (/[\r\n]/.test(normalized)) throw new Error(`${label} must remain single-line.`);
  return normalized;
}

function validateIsoDate(value, label) {
  const normalized = requireString(value, label, {maxLength: 10});
  if (!ISO_DATE_PATTERN.test(normalized)) throw new Error(`${label} must use YYYY-MM-DD.`);
  const parsed = new Date(`${normalized}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) {
    throw new Error(`${label} is not a real calendar date.`);
  }
  return normalized;
}

function validateHttpsUrl(value, label) {
  const normalized = requireString(value, label, {maxLength: 500});
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(`${label} must be an absolute URL.`);
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    throw new Error(`${label} must be a credential-free HTTPS URL.`);
  }
  return parsed.href;
}

function validateControlledList(value, label, allowed) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty array.`);
  }
  const normalized = value.map((entry) => requireString(entry, `${label} entry`, {maxLength: 40}));
  if (new Set(normalized).size !== normalized.length) throw new Error(`${label} contains duplicates.`);
  for (const entry of normalized) {
    if (!allowed.has(entry)) throw new Error(`${label} contains unsupported value: ${entry}`);
  }
  return normalized;
}

function normalizePageMeta(pageMeta) {
  if (!Array.isArray(pageMeta) || pageMeta.length === 0) {
    throw new Error('pageMeta must be a non-empty array.');
  }
  const byPath = new Map();
  for (const rawEntry of pageMeta) {
    const pagePath = requireString(rawEntry?.path, 'page metadata path', {maxLength: 240});
    if (byPath.has(pagePath)) throw new Error(`Duplicate page metadata path: ${pagePath}`);
    byPath.set(pagePath, {
      path: pagePath,
      title: requireString(rawEntry?.title, `page metadata title for ${pagePath}`, {maxLength: 240}),
      description: requireString(rawEntry?.description, `page metadata description for ${pagePath}`, {maxLength: 500}),
      displayTitle: requireString(rawEntry?.displayTitle, `page metadata displayTitle for ${pagePath}`, {maxLength: 160}),
    });
  }
  return byPath;
}

function canonicalUrl(siteUrl, pagePath) {
  const parsedOrigin = new URL(validateHttpsUrl(siteUrl, 'siteUrl'));
  if (parsedOrigin.origin !== DEFAULT_SITE_URL || parsedOrigin.pathname !== '/' || parsedOrigin.search || parsedOrigin.hash) {
    throw new Error(`siteUrl must match the canonical production origin ${DEFAULT_SITE_URL}.`);
  }
  if (pagePath === 'index.html') return `${parsedOrigin.origin}/`;
  if (pagePath.endsWith('/index.html')) return `${parsedOrigin.origin}/${pagePath.slice(0, -'index.html'.length)}`;
  return `${parsedOrigin.origin}/${pagePath}`;
}

export function validateDistributionTargets(rawTargets, {pageMeta} = {}) {
  if (!Array.isArray(rawTargets) || rawTargets.length === 0) {
    throw new Error('Distribution target registry must be a non-empty array.');
  }
  const pages = normalizePageMeta(pageMeta);
  const ids = new Set();
  const pagePaths = new Set();
  const priorities = new Set();

  const targets = rawTargets.map((rawTarget) => {
    for (const duplicateField of ['title', 'description', 'url', 'canonicalUrl']) {
      if (Object.hasOwn(rawTarget ?? {}, duplicateField)) {
        throw new Error(`Distribution target must derive ${duplicateField} from page metadata.`);
      }
    }

    const id = requireString(rawTarget?.id, 'distribution target id', {maxLength: 80});
    if (!ID_PATTERN.test(id)) throw new Error(`Unsafe distribution target id: ${id}`);
    if (ids.has(id)) throw new Error(`Duplicate distribution target id: ${id}`);
    ids.add(id);

    const pagePath = requireString(rawTarget?.pagePath, `pagePath for ${id}`, {maxLength: 240});
    if (!pages.has(pagePath)) throw new Error(`Unknown page metadata path for ${id}: ${pagePath}`);
    if (pagePaths.has(pagePath)) throw new Error(`Duplicate distribution pagePath: ${pagePath}`);
    pagePaths.add(pagePath);

    const priority = rawTarget?.priority;
    if (!Number.isInteger(priority) || priority < 1) throw new Error(`Invalid priority for ${id}.`);
    if (priorities.has(priority)) throw new Error(`Duplicate distribution priority: ${priority}`);
    priorities.add(priority);

    return {
      id,
      pagePath,
      priority,
      audiences: validateControlledList(rawTarget?.audiences, `audiences for ${id}`, ALLOWED_AUDIENCES),
      channels: validateControlledList(rawTarget?.channels, `channels for ${id}`, ALLOWED_CHANNELS),
      framing: requireString(rawTarget?.framing, `framing for ${id}`, {maxLength: 320}),
      evidenceBoundary: requireString(rawTarget?.evidenceBoundary, `evidenceBoundary for ${id}`, {maxLength: 500}),
    };
  }).sort((left, right) => left.priority - right.priority || left.id.localeCompare(right.id));

  const expectedPriorities = Array.from({length: targets.length}, (_, index) => index + 1);
  if (targets.some((target, index) => target.priority !== expectedPriorities[index])) {
    throw new Error('Distribution priorities must be contiguous from 1.');
  }
  return targets;
}

export function resolveDistributionTargets(targets, pageMeta, siteUrl = DEFAULT_SITE_URL) {
  const pages = normalizePageMeta(pageMeta);
  return targets.map((target) => {
    const page = pages.get(target.pagePath);
    if (!page) throw new Error(`Missing page metadata for ${target.pagePath}`);
    const resolvedUrl = canonicalUrl(siteUrl, target.pagePath);
    const parsedResolvedUrl = new URL(resolvedUrl);
    if (parsedResolvedUrl.hostname !== 'trueruslan.ru' || parsedResolvedUrl.search || parsedResolvedUrl.hash) {
      throw new Error(`Distribution URL must remain on the exact canonical host: ${resolvedUrl}`);
    }
    return {
      ...target,
      title: page.title,
      description: page.description,
      displayTitle: page.displayTitle,
      canonicalUrl: resolvedUrl,
    };
  });
}

export function validateExternalProfileAudit(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('External link registry must be a non-empty array.');
  }
  const ids = new Set();
  const profiles = [];

  for (const rawEntry of entries) {
    const category = requireString(rawEntry?.category, 'external link category', {maxLength: 60});
    if (category !== 'profile') continue;

    const id = requireString(rawEntry?.id, 'external profile id', {maxLength: 80});
    if (!ID_PATTERN.test(id)) throw new Error(`Unsafe external profile id: ${id}`);
    if (ids.has(id)) throw new Error(`Duplicate external profile id: ${id}`);
    ids.add(id);

    const distributionState = requireString(rawEntry?.distributionState, `distributionState for ${id}`, {maxLength: 20});
    if (!ALLOWED_PROFILE_STATES.has(distributionState)) {
      throw new Error(`Unsupported distributionState for ${id}: ${distributionState}`);
    }

    profiles.push({
      id,
      name: requireString(rawEntry?.name, `name for ${id}`, {maxLength: 120}),
      category,
      url: validateHttpsUrl(rawEntry?.url, `url for ${id}`),
      distributionState,
      lastVerified: validateIsoDate(rawEntry?.lastVerified, `lastVerified for ${id}`),
      verificationScope: requireString(rawEntry?.verificationScope, `verificationScope for ${id}`, {maxLength: 500}),
      requiredAction: requireString(rawEntry?.requiredAction, `requiredAction for ${id}`, {maxLength: 500}),
    });
  }

  if (profiles.length === 0) throw new Error('External link registry contains no audited profiles.');
  return profiles.sort((left, right) => left.name.localeCompare(right.name, 'en'));
}

function markdownList(values) {
  return values.map((value) => `\`${value}\``).join(', ');
}

export function renderDistributionRunbook({targets, profiles}) {
  const lines = [
    '# Distribution Readiness',
    '',
    '> Generated from `data/distribution-targets.json`, `data/page-meta.json` and `data/external-links.json`. Do not edit manually.',
    '',
    '## Canonical share targets',
    '',
  ];

  for (const target of targets) {
    lines.push(
      `### ${target.priority}. ${target.title}`,
      '',
      `- ID: \`${target.id}\``,
      `- Canonical URL: ${target.canonicalUrl}`,
      `- Audiences: ${markdownList(target.audiences)}`,
      `- Channels: ${markdownList(target.channels)}`,
      `- Framing: ${target.framing}`,
      `- Evidence boundary: ${target.evidenceBoundary}`,
      '- [ ] Post-update verification',
      '',
    );
  }

  lines.push('## External profile audit', '');
  for (const profile of profiles) {
    lines.push(
      `### ${profile.name} — ${profile.distributionState}`,
      '',
      `- ID: \`${profile.id}\``,
      `- URL: ${profile.url}`,
      `- Last verified: ${profile.lastVerified}`,
      `- Verification scope: ${profile.verificationScope}`,
      `- Required action: ${profile.requiredAction}`,
      '- [ ] Post-update verification',
      '',
    );
  }

  lines.push(
    '## Operator boundary',
    '',
    '- Use only the canonical URLs rendered above.',
    '- Keep every claim inside its recorded evidence boundary.',
    '- Update a public profile deliberately, then verify the rendered backlink.',
    '- Record new profile evidence before changing `verified`, `stale` or `unverified` state.',
    '',
  );
  return `${lines.join('\n')}\n`;
}

export function buildDistributionSummary({targets, profiles}) {
  const profileStateCounts = Object.fromEntries(
    [...ALLOWED_PROFILE_STATES].map((state) => [state, profiles.filter((profile) => profile.distributionState === state).length]),
  );
  return {
    schemaVersion: 1,
    canonicalOrigin: DEFAULT_SITE_URL,
    targetCount: targets.length,
    profileCount: profiles.length,
    profileStateCounts,
    targets,
    profiles,
  };
}

export function loadDistributionReadiness({
  targetsPath = DEFAULT_TARGETS_PATH,
  pageMetaPath = DEFAULT_PAGE_META_PATH,
  externalLinksPath = DEFAULT_EXTERNAL_LINKS_PATH,
  siteUrl = DEFAULT_SITE_URL,
} = {}) {
  const rawTargets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
  const pageMeta = JSON.parse(fs.readFileSync(pageMetaPath, 'utf8'));
  const externalLinks = JSON.parse(fs.readFileSync(externalLinksPath, 'utf8'));
  const targets = resolveDistributionTargets(
    validateDistributionTargets(rawTargets, {pageMeta}),
    pageMeta,
    siteUrl,
  );
  const profiles = validateExternalProfileAudit(externalLinks);
  return {targets, profiles};
}

export function writeDistributionArtifacts({
  outputDir = DEFAULT_OUTPUT_DIR,
  runbookPath = DEFAULT_RUNBOOK_PATH,
  checkRunbook = false,
  ...loadOptions
} = {}) {
  const {targets, profiles} = loadDistributionReadiness(loadOptions);
  const runbook = renderDistributionRunbook({targets, profiles});
  const summary = buildDistributionSummary({targets, profiles});

  fs.mkdirSync(outputDir, {recursive: true});
  fs.writeFileSync(path.join(outputDir, 'distribution-readiness.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'distribution-checklist.md'), runbook, 'utf8');

  if (checkRunbook) {
    if (!fs.existsSync(runbookPath)) throw new Error(`Tracked distribution runbook is missing: ${runbookPath}`);
    const tracked = fs.readFileSync(runbookPath, 'utf8');
    if (tracked !== runbook) throw new Error('Tracked distribution runbook differs from deterministic registry output.');
  }

  return {targets, profiles, summary, runbook, outputDir};
}

function parseArgs(argv) {
  const options = {checkRunbook: false};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--check-runbook') {
      options.checkRunbook = true;
      continue;
    }
    if (argument === '--output-dir') {
      const value = argv[index + 1];
      if (!value) throw new Error('--output-dir requires a value.');
      options.outputDir = path.resolve(value);
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

if (process.argv[1] && path.resolve(process.argv[1]) === MODULE_PATH) {
  try {
    const result = writeDistributionArtifacts(parseArgs(process.argv.slice(2)));
    console.log(`Distribution readiness: ${result.targets.length} targets, ${result.profiles.length} profiles.`);
    console.log(`Profile states: ${JSON.stringify(result.summary.profileStateCounts)}`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
