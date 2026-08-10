import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const targets = [
  ['docs/landing/projects/livingworld.md', 'livingworld', '## Коротко'],
  ['docs/landing/projects/notchhub.md', 'notchhub', '## Коротко'],
  ['docs/landing/projects/portfolio-platform.md', 'portfolio-platform', '## Коротко'],
  ['docs/landing/projects/vlezet.md', 'vlezet', '## Коротко'],
  ['docs/en/projects/livingworld.md', 'livingworld', '## At a glance'],
  ['docs/en/projects/notchhub.md', 'notchhub', '## At a glance'],
  ['docs/en/projects/portfolio-platform.md', 'portfolio-platform', '## At a glance'],
  ['docs/en/projects/vlezet.md', 'vlezet', '## At a glance'],
];

for (const [relativePath, slug, heading] of targets) {
  const filePath = path.join(root, relativePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const timeline = `<div data-tr-project-timeline="${slug}"></div>`;
  const timelineIndex = source.indexOf(timeline);
  if (timelineIndex === -1) continue;

  const summaryStart = source.indexOf(`${heading}\n\n<dl class="tr-project-glance" data-tr-project-glance="${slug}">`);
  if (summaryStart === -1) throw new Error(`Missing C3 summary in ${relativePath}`);
  const dlEnd = source.indexOf('</dl>', summaryStart);
  if (dlEnd === -1) throw new Error(`Missing C3 summary end in ${relativePath}`);
  const summaryEnd = dlEnd + '</dl>'.length;
  const block = `${source.slice(summaryStart, summaryEnd).trim()}\n\n`;

  if (summaryStart < timelineIndex) continue;

  let remainder = `${source.slice(0, summaryStart)}${source.slice(summaryEnd)}`;
  remainder = remainder.replace(/\n{3,}/g, '\n\n');
  const newTimelineIndex = remainder.indexOf(timeline);
  if (newTimelineIndex === -1) throw new Error(`Timeline disappeared in ${relativePath}`);
  const lineStart = remainder.lastIndexOf('\n', newTimelineIndex - 1) + 1;
  const updated = `${remainder.slice(0, lineStart)}${block}${remainder.slice(lineStart)}`;

  if (updated.indexOf(`data-tr-project-glance="${slug}"`) > updated.indexOf(timeline)) {
    throw new Error(`C3 summary still follows timeline in ${relativePath}`);
  }
  fs.writeFileSync(filePath, updated, 'utf8');
}

console.log('C3 flagship summaries precede timelines where timelines exist.');
