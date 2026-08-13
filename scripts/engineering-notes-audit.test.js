import test from 'node:test';
import assert from 'node:assert/strict';

import {buildEngineeringNotesInventory, countGitHubEvidenceLinks, countWords} from './engineering-notes-audit.js';

test('countWords ignores fenced code while preserving prose and link text', () => {
  const markdown = `# Heading\n\nПолезный текст [про контракт](target.md).\n\n\`inline value\` остаётся смыслом.\n\n\`\`\`text\nignored code tokens here\n\`\`\``;
  const count = countWords(markdown);
  assert.ok(count >= 7 && count <= 12, `unexpected prose word count: ${count}`);
});

test('GitHub evidence counting accepts only the exact github.com host', () => {
  const markdown = [
    'https://github.com/True-Ruslan/example/pull/1',
    'https://github.com.evil.example/True-Ruslan/example/pull/2',
    'https://evil.example/github.com/True-Ruslan/example/pull/3',
  ].join('\n');
  assert.equal(countGitHubEvidenceLinks(markdown), 1);
});

test('Engineering Notes inventory covers every registered source with reproducible depth signals', () => {
  const audit = buildEngineeringNotesInventory();
  assert.equal(audit.noteCount, 16);
  assert.equal(audit.inventory.length, 16);
  assert.ok(audit.totals.sourceBytes > 0);
  assert.ok(audit.totals.wordCount > 0);
  assert.ok(audit.totals.headings > 0);

  for (const note of audit.inventory) {
    assert.ok(note.sourceBytes > 1000, `${note.slug}: source is unexpectedly tiny`);
    assert.ok(note.wordCount > 250, `${note.slug}: prose inventory is unexpectedly tiny`);
    assert.ok(note.headingCount >= 2, `${note.slug}: expected a sectioned note rather than an unstructured fragment`);
    assert.ok(note.relatedOut >= 1, `${note.slug}: Notes Registry must retain at least one explicit relation`);
  }
});

test('inventory surfaces the known high-overlap pairs for editorial review without declaring duplicates', () => {
  const audit = buildEngineeringNotesInventory();
  const pairs = new Set(audit.overlapCandidates.map(({left, right}) => [left, right].sort().join('|')));

  assert.ok(pairs.has(['source-tests-to-installed-acceptance', 'gametests-vs-installed-gameplay-acceptance'].sort().join('|')));
  assert.ok(pairs.has(['probabilistic-proposals-deterministic-authority', 'hybrid-cv-ai-recognition-boundaries'].sort().join('|')));
  assert.ok(pairs.has(['llm-output-is-a-protocol-boundary', 'probabilistic-proposals-deterministic-authority'].sort().join('|')));
});

test('inventory emits a compact machine-readable snapshot for the audit PR evidence', () => {
  const audit = buildEngineeringNotesInventory();
  const compact = {
    noteCount: audit.noteCount,
    totals: audit.totals,
    inventory: audit.inventory.map(({slug, readingMinutes, sourceBytes, wordCount, headingCount, markdownNoteLinks, projectLinks, githubEvidenceLinks, explicitFactMarkers, relatedOut, relatedIn}) => ({
      slug,
      readingMinutes,
      sourceBytes,
      wordCount,
      headingCount,
      markdownNoteLinks,
      projectLinks,
      githubEvidenceLinks,
      explicitFactMarkers,
      relatedOut,
      relatedIn,
    })),
    overlapCandidates: audit.overlapCandidates,
  };
  console.log(`ENGINEERING_NOTES_AUDIT_JSON=${JSON.stringify(compact)}`);
  assert.equal(compact.inventory.length, compact.noteCount);
});
