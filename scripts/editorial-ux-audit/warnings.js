const PROCESS_JARGON = [
  /\bacceptance identity\b/i,
  /\b(?:test|state|verification|acceptance) oracle\b/i,
  /\bfail-closed\b/i,
  /\bdurable reconciliation\b/i,
  /\bexact-head\b/i,
  /\bevidence boundary\b/i
];

export function buildWarnings(metrics) {
  const warnings = [];

  if (metrics.tier === 'tier1') {
    if (metrics.firstParagraphWords > 55) warnings.push({ code: 'FIRST_PARAGRAPH_LONG' });
    if (metrics.longestParagraphWords > 85) warnings.push({ code: 'PARAGRAPH_LONG' });
    if (PROCESS_JARGON.some((pattern) => pattern.test(metrics.__proseText ?? ''))) {
      warnings.push({ code: 'PROCESS_JARGON' });
    }
  } else if (metrics.tier === 'tier2') {
    if (metrics.firstParagraphWords > 70) warnings.push({ code: 'FIRST_PARAGRAPH_LONG' });
    if (metrics.longestParagraphWords > 110) warnings.push({ code: 'PARAGRAPH_LONG' });
  }

  if (!metrics.h1) warnings.push({ code: 'MISSING_H1' });
  return warnings;
}