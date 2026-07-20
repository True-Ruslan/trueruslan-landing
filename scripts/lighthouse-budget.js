import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const DEFAULT_BUDGETS = {
  performance: 85,
  accessibility: 95,
  'best-practices': 95,
  seo: 95,
};

const LABELS = {
  performance: 'Performance',
  accessibility: 'Accessibility',
  'best-practices': 'Best Practices',
  seo: 'SEO',
};

export function evaluateLighthouseReport(report, budgets = DEFAULT_BUDGETS) {
  const scores = {};
  const failures = [];

  for (const [category, minimum] of Object.entries(budgets)) {
    const rawScore = report?.categories?.[category]?.score;
    const score = Number.isFinite(rawScore) ? Math.round(rawScore * 100) : 0;
    scores[category] = score;

    if (score < minimum) {
      failures.push(`${LABELS[category] ?? category}: ${score} < ${minimum}`);
    }
  }

  return {scores, failures};
}

function main() {
  const reportPath = process.argv[2];
  if (!reportPath) {
    console.error('Usage: node scripts/lighthouse-budget.js <lighthouse-report.json>');
    process.exit(2);
  }

  const absolutePath = path.resolve(reportPath);
  const report = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  const result = evaluateLighthouseReport(report);

  console.log('Lighthouse scores:');
  for (const [category, score] of Object.entries(result.scores)) {
    console.log(`- ${LABELS[category] ?? category}: ${score}`);
  }

  if (result.failures.length) {
    console.error(`Quality budget failed:\n${result.failures.map((failure) => `- ${failure}`).join('\n')}`);
    process.exit(1);
  }

  console.log('Lighthouse quality budget passed.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
