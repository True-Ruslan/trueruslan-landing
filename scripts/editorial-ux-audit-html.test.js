import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMarkdownMetrics } from './editorial-ux-audit/source.js';

test('raw HTML script content is excluded structurally from editorial prose metrics', () => {
  const markdown = `# Page\n\nVisible before <span>visible inside</span> visible after.\n\n<script>alert('ignored')</script>\n`;
  const metrics = extractMarkdownMetrics(markdown, '/about/');

  assert.match(metrics.__proseText, /Visible before visible inside visible after\./);
  assert.equal(metrics.__proseText.includes('alert'), false);
  assert.equal(metrics.__proseText.includes('script'), false);
});
