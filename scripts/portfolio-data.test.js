import test from 'node:test';
import assert from 'node:assert/strict';

import {
  renderCurrentlyBuilding,
  renderEngineeringGraph,
  validatePortfolioData,
} from './portfolio-data.js';

const sample = {
  currentProjects: [
    {
      id: 'alpha',
      title: 'Alpha <Core>',
      status: 'ACTIVE',
      summary: 'Build & verify.',
      href: 'landing/projects/alpha.html',
      tags: ['Java', 'AI'],
    },
  ],
  graphTopics: [
    {
      id: 'backend',
      label: 'Backend',
      description: 'Systems & APIs',
      links: [{label: 'Alpha', href: 'landing/projects/alpha.html'}],
    },
  ],
};

test('validatePortfolioData accepts unique, well-formed project and topic ids', () => {
  assert.doesNotThrow(() => validatePortfolioData(sample));
});

test('validatePortfolioData rejects duplicate ids', () => {
  assert.throws(() => validatePortfolioData({
    ...sample,
    currentProjects: [sample.currentProjects[0], {...sample.currentProjects[0]}],
  }), /duplicate current project id/i);

  assert.throws(() => validatePortfolioData({
    ...sample,
    graphTopics: [sample.graphTopics[0], {...sample.graphTopics[0]}],
  }), /duplicate graph topic id/i);
});

test('validatePortfolioData rejects unsafe or incomplete links', () => {
  assert.throws(() => validatePortfolioData({
    ...sample,
    currentProjects: [{...sample.currentProjects[0], href: 'javascript:alert(1)'}],
  }), /href/i);
});

test('renderCurrentlyBuilding escapes content and preserves semantic links', () => {
  const html = renderCurrentlyBuilding(sample.currentProjects);

  assert.match(html, /Alpha &lt;Core&gt;/);
  assert.match(html, /Build &amp; verify\./);
  assert.match(html, /href="landing\/projects\/alpha\.html"/);
  assert.match(html, /ACTIVE/);
  assert.doesNotMatch(html, /<Core>/);
});

test('renderEngineeringGraph emits accessible topic controls and no-js links', () => {
  const html = renderEngineeringGraph(sample.graphTopics);

  assert.match(html, /data-tr-engineering-graph/);
  assert.match(html, /button[^>]+aria-pressed="true"/);
  assert.match(html, /data-tr-graph-topic="backend"/);
  assert.match(html, /Systems &amp; APIs/);
  assert.match(html, /href="landing\/projects\/alpha\.html"/);
  assert.match(html, /<noscript>/);
});
