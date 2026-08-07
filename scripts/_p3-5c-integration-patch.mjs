import fs from 'node:fs';

function replaceOnce(file, from, to, label) {
  let text = fs.readFileSync(file, 'utf8');
  const first = text.indexOf(from);
  if (first < 0) throw new Error(`${file}: missing anchor ${label}`);
  if (text.indexOf(from, first + from.length) >= 0) throw new Error(`${file}: ambiguous anchor ${label}`);
  text = text.slice(0, first) + to + text.slice(first + from.length);
  fs.writeFileSync(file, text, 'utf8');
}

const metaPath = 'data/page-meta.json';
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
if (meta.some(({path}) => path === 'en/publications.html')) throw new Error('English Publications metadata already exists');
meta.push({
  path: 'en/publications.html',
  card: 'publications-en',
  title: 'Publications — Ruslan Nemykin',
  description: 'Published work by Ruslan Nemykin: technical articles and externally verifiable publications with canonical source links.',
  displayTitle: 'PUBLICATIONS',
  kicker: 'PUBLISHED WORK',
  tags: ['ARTICLES', 'RESEARCH', 'TALKS'],
  accent: 'cyan',
});
fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');

replaceOnce(
  'docs/toc.yaml',
  '      - name: Now\n        href: ./en/now.md\n      - name: VillAIgence',
  '      - name: Now\n        href: ./en/now.md\n      - name: Publications\n        href: ./en/publications.md\n      - name: VillAIgence',
  'English TOC Publications',
);

replaceOnce(
  'scripts/copy-assets.js',
  `  const publicationShowcaseTarget = publications
    ? applyPublicationsShowcase(outputDir, publications, {
      projectLabels: new Map(projects.map(({slug, name}) => [slug, name])),
      noteLabels: new Map(notes.map(({slug, title}) => [slug, title])),
    })
    : null;`,
  `  const publicationProjectLabels = new Map(projects.map(({slug, name}) => [slug, name]));
  const publicationNoteLabels = new Map(notes.map(({slug, title}) => [slug, title]));
  const publicationShowcaseTarget = publications
    ? applyPublicationsShowcase(outputDir, publications, {
      locale: 'ru',
      projectLabels: publicationProjectLabels,
      noteLabels: publicationNoteLabels,
    })
    : null;
  const publicationShowcaseEnTarget = publications && i18nPairs
    ? applyPublicationsShowcase(outputDir, publications, {
      target: 'en/publications.html',
      locale: 'en',
      projectLabels: publicationProjectLabels,
      noteLabels: publicationNoteLabels,
    })
    : null;`,
  'localized Publications showcase build wiring',
);
replaceOnce(
  'scripts/copy-assets.js',
  '    publicationShowcaseTarget,\n    sourcesKnowledgeBaseTarget,',
  '    publicationShowcaseTarget,\n    publicationShowcaseEnTarget,\n    sourcesKnowledgeBaseTarget,',
  'localized Publications result',
);
replaceOnce(
  'scripts/copy-assets.js',
  '    if (result.publicationShowcaseTarget) console.log(`Publications showcase injected: ${result.publicationShowcaseTarget}`);\n    if (result.sourcesKnowledgeBaseTarget)',
  '    if (result.publicationShowcaseTarget) console.log(`Publications showcase injected: ${result.publicationShowcaseTarget}`);\n    if (result.publicationShowcaseEnTarget) console.log(`English Publications showcase injected: ${result.publicationShowcaseEnTarget}`);\n    if (result.sourcesKnowledgeBaseTarget)',
  'localized Publications logging',
);

replaceOnce(
  'templates/index.en.html',
  '        <a href="landing/now.html">Now (RU)</a>\n        <a href="landing/engineering-map.html">Map (RU)</a>',
  '        <a href="en/now.html">Now</a>\n        <a href="en/publications.html">Publications</a>\n        <a href="landing/engineering-map.html">Map (RU)</a>',
  'English header Now/Publications',
);
replaceOnce(
  'templates/index.en.html',
  '          <p>The live `/now` snapshot currently remains in Russian and records active product, learning and writing priorities without promoting pending work.</p>',
  '          <p>The live `/now` snapshot is published in English from the same canonical current-work data and keeps active product, learning and writing priorities separate from pending acceptance.</p>',
  'English current-focus framing',
);
replaceOnce(
  'templates/index.en.html',
  '        <a class="tr-home-now tr-home-now--link" href="landing/now.html">',
  '        <a class="tr-home-now tr-home-now--link" href="en/now.html">',
  'English current-focus route',
);
replaceOnce(
  'templates/index.en.html',
  '          <span class="tr-home-now__cta">Open Russian page →</span>',
  '          <span class="tr-home-now__cta">Open /now →</span>',
  'English current-focus CTA',
);
replaceOnce(
  'templates/index.en.html',
  '          <a class="tr-home-card" href="landing/publications.html"><span class="tr-home-card-index">PUBLICATIONS / RU</span><div><h3>Publications</h3><p>Externally published and presented work remains available in the complete Russian catalogue.</p><span class="tr-home-card-cta">Open Russian page →</span></div></a>',
  '          <a class="tr-home-card" href="en/publications.html"><span class="tr-home-card-index">PUBLICATIONS</span><div><h3>Publications</h3><p>Externally published work with original titles, English summaries and canonical source links.</p><span class="tr-home-card-cta">Browse publications →</span></div></a>',
  'English Publications card',
);

for (const [file, required] of [
  ['data/page-meta.json', 'en/publications.html'],
  ['docs/toc.yaml', './en/publications.md'],
  ['scripts/copy-assets.js', "target: 'en/publications.html'"],
  ['templates/index.en.html', 'href="en/publications.html">Publications</a>'],
]) {
  if (!fs.readFileSync(file, 'utf8').includes(required)) throw new Error(`${file}: missing P3.5C integration marker ${required}`);
}

fs.rmSync('scripts/_p3-5c-integration-patch.mjs');
fs.rmSync('.github/workflows/_p3-5c-integration-patch.yml');
