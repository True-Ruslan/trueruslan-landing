import test from 'node:test';
import assert from 'node:assert/strict';

import {
  injectEngineeringGraph,
  renderEngineeringGraphFallback,
  resolveEngineeringGraphProjects,
  validateEngineeringGraph,
} from './engineering-graph.js';

const graph = {
  filters: [{id: 'backend', label: 'Backend'}],
  nodes: [
    {id:'java',label:'Java',kind:'technology',description:'Language',column:1,row:1,tags:['backend']},
    {id:'system',label:'Backend Systems',kind:'domain',description:'Systems',column:2,row:2,tags:['backend'],href:'resume.html'},
  ],
  edges: [{from:'java',to:'system',label:'builds'}],
};

const projectRegistry = [{
  slug: 'livingworld',
  name: 'LivingWorld',
  summary: 'Canonical project summary.',
  href: 'landing/projects/livingworld.html',
}];

test('validateEngineeringGraph accepts a connected graph', () => {
  assert.deepEqual(validateEngineeringGraph(graph), graph);
});

test('validateEngineeringGraph rejects duplicate ids, invalid kind and unsafe href', () => {
  assert.throws(
    () => validateEngineeringGraph({...graph, nodes:[graph.nodes[0], {...graph.nodes[0]}]}),
    /Duplicate engineering graph node id/,
  );
  assert.throws(
    () => validateEngineeringGraph({...graph, nodes:[graph.nodes[0], {...graph.nodes[1], kind:'person'}]}),
    /Unsupported engineering graph node kind/,
  );
  assert.throws(
    () => validateEngineeringGraph({...graph, nodes:[graph.nodes[0], {...graph.nodes[1], href:'../escape.html'}]}),
    /Unsafe engineering graph href/,
  );
});

test('validateEngineeringGraph rejects missing endpoints, self edges, duplicates and orphans', () => {
  assert.throws(
    () => validateEngineeringGraph({...graph, edges:[{from:'java',to:'missing',label:'bad'}]}),
    /missing node/,
  );
  assert.throws(
    () => validateEngineeringGraph({...graph, edges:[{from:'java',to:'java',label:'bad'}]}),
    /self-edge/,
  );
  assert.throws(
    () => validateEngineeringGraph({...graph, edges:[graph.edges[0], graph.edges[0]]}),
    /Duplicate engineering graph edge/,
  );
  const orphanGraph = {
    ...graph,
    nodes:[...graph.nodes, {id:'orphan',label:'Orphan',kind:'note',description:'None',column:3,row:3,tags:['backend']}],
  };
  assert.throws(() => validateEngineeringGraph(orphanGraph), /Orphan engineering graph node/);
});

test('resolveEngineeringGraphProjects derives project identity and href from canonical registry', () => {
  const raw = {
    filters: graph.filters,
    nodes: [
      graph.nodes[0],
      {id:'livingworld',kind:'project',projectRef:'livingworld',column:2,row:2,tags:['backend']},
    ],
    edges: [{from:'java',to:'livingworld',label:'used in'}],
  };
  const resolved = resolveEngineeringGraphProjects(raw, projectRegistry);
  const project = resolved.nodes[1];

  assert.equal(project.label, 'LivingWorld');
  assert.equal(project.description, 'Canonical project summary.');
  assert.equal(project.href, 'landing/projects/livingworld.html');
  assert.equal(validateEngineeringGraph(resolved).nodes[1].href, 'landing/projects/livingworld.html');
});

test('resolveEngineeringGraphProjects rejects unknown refs and duplicated identity fields', () => {
  const base = {
    filters: graph.filters,
    nodes: [graph.nodes[0], {id:'livingworld',kind:'project',projectRef:'livingworld',column:2,row:2,tags:['backend']}],
    edges: [{from:'java',to:'livingworld',label:'used in'}],
  };
  assert.throws(
    () => resolveEngineeringGraphProjects(base, []),
    /unknown project/,
  );
  assert.throws(
    () => resolveEngineeringGraphProjects({...base, nodes:[graph.nodes[0], {...base.nodes[1], label:'Duplicate'}]}, projectRegistry),
    /duplicates canonical registry identity fields/,
  );
});

test('renderEngineeringGraphFallback is deterministic and escapes content', () => {
  const dangerous = validateEngineeringGraph({
    filters: graph.filters,
    nodes: [
      {...graph.nodes[0], label:'Java <Core>'},
      graph.nodes[1],
    ],
    edges: graph.edges,
  });
  const first = renderEngineeringGraphFallback(dangerous);
  const second = renderEngineeringGraphFallback(dangerous);
  assert.equal(first, second);
  assert.match(first, /Java &lt;Core&gt;/);
  assert.match(first, /href="resume\.html"/);
});

test('injectEngineeringGraph adds fallback and escaped JSON idempotently for rendered DOM', () => {
  const validated = validateEngineeringGraph(graph);
  const source = '<!doctype html><html><head><title>Map</title></head><body><div data-tr-engineering-graph-root></div></body></html>';
  const once = injectEngineeringGraph(source, validated);
  const twice = injectEngineeringGraph(once, validated);

  assert.equal(once, twice);
  assert.match(once, /data-tr-engineering-graph-build="ready"/);
  assert.match(once, /data-tr-engineering-graph-fallback/);
  assert.match(once, /data-tr-engineering-graph-data/);
  assert.equal((once.match(/data-tr-engineering-graph-data/g) ?? []).length, 1);
});

test('injectEngineeringGraph patches the real non-static Diplodoc state payload', () => {
  const validated = validateEngineeringGraph(graph);
  const state = {
    data: {
      html: '<h1>Engineering Map</h1><p>engineering-map-build-slot</p><h2>How to read</h2>',
    },
  };
  const encodedState = JSON.stringify(state)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  const source = `<!doctype html><html><head><title>Map</title></head><body><script id="diplodoc-state" type="application/json">${encodedState}</script></body></html>`;

  const once = injectEngineeringGraph(source, validated);
  const twice = injectEngineeringGraph(once, validated);

  assert.equal(once, twice);
  assert.doesNotMatch(once, /<p>engineering-map-build-slot<\/p>/);
  assert.match(once, /data-tr-engineering-graph-root/);
  assert.match(once, /data-tr-engineering-graph-fallback/);
  assert.match(once, /data-tr-engineering-graph-data/);
  assert.match(once, /Backend Systems/);
});
