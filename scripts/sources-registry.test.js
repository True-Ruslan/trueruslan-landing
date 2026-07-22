import test from 'node:test';
import assert from 'node:assert/strict';

async function loadSourcesModule() {
  try {
    return await import('./sources-registry.js');
  } catch (error) {
    assert.fail(`sources-registry module must load: ${error.code || error.message}`);
  }
}

test('Sources Registry module exports the canonical validation API', async () => {
  const module = await loadSourcesModule();

  assert.equal(typeof module.validateSourcesRegistry, 'function');
  assert.equal(typeof module.loadSourcesRegistry, 'function');
  assert.equal(typeof module.sortSources, 'function');
  assert.equal(typeof module.renderSourcesKnowledgeBase, 'function');
  assert.equal(typeof module.applySourcesKnowledgeBase, 'function');
  assert.ok(Array.isArray(module.SOURCE_TYPE_VALUES));
});
