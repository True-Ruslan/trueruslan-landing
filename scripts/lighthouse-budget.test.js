import test from 'node:test';
import assert from 'node:assert/strict';

import {evaluateLighthouseReport} from './lighthouse-budget.js';

function report(scores) {
  return {
    categories: Object.fromEntries(
      Object.entries(scores).map(([key, score]) => [key, {score}]),
    ),
  };
}

test('evaluateLighthouseReport accepts scores at configured budgets', () => {
  const result = evaluateLighthouseReport(report({
    performance: 0.85,
    accessibility: 0.95,
    'best-practices': 0.95,
    seo: 0.95,
  }));

  assert.equal(result.failures.length, 0);
  assert.equal(result.scores.performance, 85);
});

test('evaluateLighthouseReport reports every category below budget', () => {
  const result = evaluateLighthouseReport(report({
    performance: 0.72,
    accessibility: 0.90,
    'best-practices': 0.96,
    seo: 0.80,
  }));

  assert.equal(result.failures.length, 3);
  assert.match(result.failures.join('\n'), /Performance: 72 < 85/);
  assert.match(result.failures.join('\n'), /Accessibility: 90 < 95/);
  assert.match(result.failures.join('\n'), /SEO: 80 < 95/);
});
