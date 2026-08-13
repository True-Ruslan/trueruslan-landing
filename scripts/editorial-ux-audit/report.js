export function withTotals(report) {
  const totals = { tier1: 0, tier2: 0, tier3: 0, warnings: 0, warningCodes: {} };
  for (const page of report.pages) {
    totals[page.tier] += 1;
    for (const warning of page.warnings) {
      totals.warnings += 1;
      totals.warningCodes[warning.code] = (totals.warningCodes[warning.code] ?? 0) + 1;
    }
  }
  return { ...report, totals };
}

export function renderMarkdownReport(report) {
  const warningEntries = Object.entries(report.totals.warningCodes).sort(([a], [b]) => a.localeCompare(b));
  const lines = [
    '# Editorial & UX Audit',
    '',
    `Generated: ${report.generatedAt}`,
    `Site: ${report.siteUrl}`,
    `Routes: ${report.routeCount}`,
    '',
    '## Route tiers',
    '',
    `- tier1: ${report.totals.tier1}`,
    `- tier2: ${report.totals.tier2}`,
    `- tier3: ${report.totals.tier3}`,
    '',
    '## Warnings',
    '',
    `Warnings: ${report.totals.warnings}`,
    ...(warningEntries.length ? warningEntries.map(([code, count]) => `- ${code}: ${count}`) : ['- none: 0']),
    '',
    '## Routes',
    '',
    '| Route | Tier | Words | First paragraph | Longest paragraph | Warnings |',
    '|---|---|---:|---:|---:|---|'
  ];
  for (const page of report.pages) {
    const warnings = page.warnings.map((warning) => warning.code).join(', ') || '—';
    lines.push(`| ${page.route} | ${page.tier} | ${page.wordCount} | ${page.firstParagraphWords} | ${page.longestParagraphWords} | ${warnings} |`);
  }
  return `${lines.join('\n')}\n`;
}
