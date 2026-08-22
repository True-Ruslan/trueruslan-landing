const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SEVERITY_ORDER = Object.freeze({error: 0, warning: 1, info: 2});

function toIsoDate(value, label) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new Error(`${label} must be a valid date`);
    return value.toISOString().slice(0, 10);
  }

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} must be a date string`);
  }

  const trimmed = value.trim();
  const date = new Date(ISO_DATE.test(trimmed) ? `${trimmed}T00:00:00Z` : trimmed);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} must be a valid date`);
  return date.toISOString().slice(0, 10);
}

function ageDays(fromDate, toDate) {
  const from = Date.parse(`${fromDate}T00:00:00Z`);
  const to = Date.parse(`${toDate}T00:00:00Z`);
  return Math.floor((to - from) / DAY_MS);
}

function maxDate(values) {
  const normalized = values.filter(Boolean).map((value) => toIsoDate(value, 'recorded date'));
  if (normalized.length === 0) return null;
  return normalized.sort().at(-1);
}

function createFinding({code, severity, project = null, message, action, details = {}}) {
  return {code, severity, project, message, action, details};
}

function sortFindings(findings) {
  return [...findings].sort((left, right) => {
    const severity = (SEVERITY_ORDER[left.severity] ?? 99) - (SEVERITY_ORDER[right.severity] ?? 99);
    if (severity !== 0) return severity;
    const project = String(left.project ?? '').localeCompare(String(right.project ?? ''), 'en');
    if (project !== 0) return project;
    const code = left.code.localeCompare(right.code, 'en');
    if (code !== 0) return code;
    return left.message.localeCompare(right.message, 'en');
  });
}

function summarize(findings) {
  const summary = {total: findings.length, info: 0, warning: 0, error: 0};
  for (const finding of findings) {
    if (Object.hasOwn(summary, finding.severity)) summary[finding.severity] += 1;
  }
  return summary;
}

function exactTimelineDates(entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => entry?.date)
    .filter((value) => typeof value === 'string' && ISO_DATE.test(value.trim()))
    .map((value) => value.trim());
}

function latestRecordedDate(snapshot, timelineEntries = []) {
  return maxDate([
    snapshot.lastVerified,
    ...(Array.isArray(snapshot.signals) ? snapshot.signals.map((signal) => signal.observedAt) : []),
    ...exactTimelineDates(timelineEntries),
  ]);
}

function latestSignalDate(snapshot) {
  return maxDate(Array.isArray(snapshot.signals) ? snapshot.signals.map((signal) => signal.observedAt) : []);
}

function analyzeEvidenceAge(snapshot, now, maxVerifiedAgeDays, findings) {
  if (!['verified', 'stale'].includes(snapshot.status) || !snapshot.lastVerified) return;
  const verifiedDate = toIsoDate(snapshot.lastVerified, `lastVerified for ${snapshot.project}`);
  const age = ageDays(verifiedDate, now);
  if (age <= maxVerifiedAgeDays) return;

  findings.push(createFinding({
    code: 'evidence-too-old',
    severity: snapshot.status === 'verified' ? 'warning' : 'info',
    project: snapshot.project,
    message: `Controlled evidence snapshot is ${age} days old.`,
    action: `Review project state and explicitly re-verify or keep/update the trust state; do not auto-promote verification.`,
    details: {
      lastVerified: verifiedDate,
      ageDays: age,
      thresholdDays: maxVerifiedAgeDays,
      trustState: snapshot.status,
    },
  }));
}

function analyzeEvidenceLinks(snapshot, observations, findings) {
  const links = observations?.links ?? {};
  for (const signal of snapshot.signals ?? []) {
    if (!signal.url) continue;
    const observation = links[signal.url];
    if (!observation || observation.status === 'ok') continue;

    findings.push(createFinding({
      code: 'evidence-link-unreachable',
      severity: 'error',
      project: snapshot.project,
      message: `Evidence link is not reachable: ${signal.label}.`,
      action: `Check the evidence URL and either repair the link or update the controlled snapshot with a valid bounded signal.`,
      details: {
        label: signal.label,
        url: signal.url,
        status: observation.status,
        ...(observation.httpStatus !== undefined ? {httpStatus: observation.httpStatus} : {}),
        ...(observation.error ? {error: observation.error} : {}),
      },
    }));
  }
}

function analyzeVerifiedSignalChronology(snapshot, findings) {
  if (snapshot.status !== 'verified' || !snapshot.lastVerified) return;
  const signalDate = latestSignalDate(snapshot);
  if (!signalDate || signalDate <= snapshot.lastVerified) return;

  findings.push(createFinding({
    code: 'verified-signal-after-check',
    severity: 'warning',
    project: snapshot.project,
    message: `A recorded evidence signal is newer than the verified snapshot date.`,
    action: `Review the newer signal and explicitly re-verify, mark stale, or keep the current state with updated bounded evidence.`,
    details: {
      lastVerified: snapshot.lastVerified,
      latestSignalDate: signalDate,
    },
  }));
}

function analyzeRepositoryDrift(project, snapshot, observations, findings, timelineEntries = []) {
  const observation = observations?.repositories?.[project.slug];
  if (!observation) return;

  const recorded = latestRecordedDate(snapshot, timelineEntries);
  if (!recorded) return;

  if (observation.pushedAt) {
    const activityDate = toIsoDate(observation.pushedAt, `repository pushedAt for ${project.slug}`);
    if (activityDate > recorded) {
      findings.push(createFinding({
        code: 'repository-drift',
        severity: 'warning',
        project: project.slug,
        message: `Repository activity is newer than the latest recorded controlled evidence.`,
        action: `Inspect repository changes since ${recorded} and decide whether project registry, timeline, or evidence snapshot needs a manual update.`,
        details: {
          repositoryUrl: observation.url ?? project.links?.github ?? null,
          lastRecordedDate: recorded,
          repositoryActivityDate: activityDate,
        },
      }));
    }
  }

  const release = observation.latestRelease;
  if (project.status === 'release-candidate' && release?.publishedAt) {
    const releaseDate = toIsoDate(release.publishedAt, `latest release for ${project.slug}`);
    if (releaseDate > recorded) {
      findings.push(createFinding({
        code: 'release-candidate-has-new-release',
        severity: 'warning',
        project: project.slug,
        message: `A release newer than controlled evidence exists while registry status is still release-candidate.`,
        action: `Review the published release and manually decide whether registry lifecycle/status and evidence should change.`,
        details: {
          tagName: release.tagName ?? null,
          releaseDate,
          releaseUrl: release.url ?? null,
          registryStatus: project.status,
          lastRecordedDate: recorded,
        },
      }));
    }
  }
}

function analyzeTimeline(project, timelines, findings) {
  if (!project.timeline) return;
  const entries = timelines?.[project.timeline];
  if (!Array.isArray(entries)) {
    findings.push(createFinding({
      code: 'timeline-missing',
      severity: 'error',
      project: project.slug,
      message: `Referenced project timeline is missing from freshness input.`,
      action: `Restore the timeline data or fix the registry timeline reference.`,
      details: {timeline: project.timeline},
    }));
    return;
  }

  const currentCount = entries.filter((entry) => entry?.state === 'current').length;
  if (currentCount !== 1) {
    findings.push(createFinding({
      code: 'timeline-current-count',
      severity: 'error',
      project: project.slug,
      message: `Project timeline must contain exactly one current entry; found ${currentCount}.`,
      action: `Review structured timeline states and keep exactly one current milestone.`,
      details: {timeline: project.timeline, currentCount},
    }));
  }
}

export function analyzeContentFreshness({
  projects,
  evidence,
  timelines = {},
  observations = {repositories: {}, links: {}},
  now = new Date(),
  maxVerifiedAgeDays = 30,
} = {}) {
  if (!Array.isArray(projects)) throw new Error('projects must be an array');
  if (!Array.isArray(evidence)) throw new Error('evidence must be an array');
  if (!Number.isInteger(maxVerifiedAgeDays) || maxVerifiedAgeDays < 1) {
    throw new Error('maxVerifiedAgeDays must be a positive integer');
  }

  const generatedAt = toIsoDate(now, 'now');
  const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
  const findings = [];

  for (const project of projects) analyzeTimeline(project, timelines, findings);

  for (const snapshot of evidence) {
    const project = projectBySlug.get(snapshot.project);
    if (!project) continue;
    const timelineEntries = project.timeline ? timelines?.[project.timeline] ?? [] : [];
    analyzeEvidenceAge(snapshot, generatedAt, maxVerifiedAgeDays, findings);
    analyzeEvidenceLinks(snapshot, observations, findings);
    analyzeVerifiedSignalChronology(snapshot, findings);
    analyzeRepositoryDrift(project, snapshot, observations, findings, timelineEntries);
  }

  const ordered = sortFindings(findings);
  return {
    generatedAt,
    maxVerifiedAgeDays,
    summary: summarize(ordered),
    findings: ordered,
  };
}

function markdownDetails(details) {
  const entries = Object.entries(details ?? {}).filter(([, value]) => value !== null && value !== undefined);
  if (entries.length === 0) return '';
  return entries.map(([key, value]) => `  - ${key}: \`${String(value)}\``).join('\n');
}

export function renderFreshnessMarkdown(report) {
  const lines = [
    '<!-- content-freshness-guard -->',
    '# Content Freshness Guard',
    '',
    `Generated: \`${report.generatedAt}\``,
    `Findings: **${report.summary.total}** (errors ${report.summary.error}, warnings ${report.summary.warning}, info ${report.summary.info})`,
    '',
  ];

  if (report.findings.length === 0) {
    lines.push('No freshness findings. Controlled public state was not modified.');
    return `${lines.join('\n')}\n`;
  }

  for (const finding of report.findings) {
    const project = finding.project ? ` — \`${finding.project}\`` : '';
    lines.push(`## ${finding.severity.toUpperCase()} · \`${finding.code}\`${project}`);
    lines.push('');
    lines.push(finding.message);
    lines.push('');
    lines.push(`**Action:** ${finding.action}`);
    const details = markdownDetails(finding.details);
    if (details) {
      lines.push('');
      lines.push('**Details:**');
      lines.push(details);
    }
    lines.push('');
  }

  lines.push('> This report is maintenance evidence only. It never changes canonical project/evidence registries or promotes a project to `verified`.');
  return `${lines.join('\n')}\n`;
}
