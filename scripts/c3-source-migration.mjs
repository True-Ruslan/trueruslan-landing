import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const problemMarker = '<!-- case-study:problem -->';

const summaries = [
  {
    path: 'docs/landing/projects/livingworld.md',
    slug: 'livingworld',
    locale: 'ru',
    fields: [
      ['Моя роль', 'Архитектура server-authoritative AI/NPC системы, Memory 2.0, provider boundaries и release engineering.'],
      ['Стек', 'Java 21 · Fabric · Minecraft 1.21.1 · Voice/STT/TTS · Memory 2.0'],
      ['Задача', 'Сделать убедительных AI-NPC, не передавая модели власть над состоянием мира, памятью или действиями.'],
      ['Результат', 'Официальный 0.2.0+1.21.1 с bounded installed Memory 2.0 acceptance; следующие semantic-memory изменения остаются отдельными срезами.'],
    ],
  },
  {
    path: 'docs/landing/projects/notchhub.md',
    slug: 'notchhub',
    locale: 'ru',
    fields: [
      ['Моя роль', 'Solo product engineering: native macOS architecture, interaction model, performance, security и release boundary.'],
      ['Стек', 'Swift 6 · SwiftUI · AppKit · macOS · XCTest'],
      ['Задача', 'Превратить область вокруг челки MacBook в полезный always-on интерфейс без тяжёлого runtime и широких разрешений.'],
      ['Результат', 'Принята основа 0.1.0 — Personal build; следующий interaction milestone развивается отдельно и не считается завершённым автоматически.'],
    ],
  },
  {
    path: 'docs/landing/projects/portfolio-platform.md',
    slug: 'portfolio-platform',
    locale: 'ru',
    fields: [
      ['Моя роль', 'Product, architecture и quality ownership всего static-first портфолио и knowledge layer.'],
      ['Стек', 'Diplodoc · Node.js · Playwright · GitHub Actions · GitHub Pages'],
      ['Задача', 'Показывать инженерное мышление и доказательства без превращения сайта в тяжёлое приложение или набор дублирующихся источников истины.'],
      ['Результат', 'Production static-first платформа с registry-backed контентом, clean URLs, RU/EN и deployment-bound browser verification.'],
    ],
  },
  {
    path: 'docs/landing/projects/vlezet.md',
    slug: 'vlezet',
    locale: 'ru',
    fields: [
      ['Моя роль', 'Product/domain architecture: geometry authority, editing model, recognition boundaries и acceptance strategy.'],
      ['Стек', 'TypeScript · Next.js · Geometry · Computer vision · Three.js'],
      ['Задача', 'Сделать план квартиры точным и редактируемым, а распознавание — полезной подсказкой без права незаметно менять authoritative geometry.'],
      ['Результат', 'M7.8B остаётся принятой границей; автоматический следующий путь не прошёл usefulness acceptance, поэтому текущая bounded direction — Assisted Tracing.'],
    ],
  },
  {
    path: 'docs/en/projects/livingworld.md',
    slug: 'livingworld',
    locale: 'en',
    fields: [
      ['My contribution', 'Architecture for the server-authoritative AI/NPC system, Memory 2.0, provider boundaries and release engineering.'],
      ['Stack', 'Java 21 · Fabric · Minecraft 1.21.1 · Voice/STT/TTS · Memory 2.0'],
      ['Challenge', 'Make AI-driven NPCs convincing without giving the model authority over world state, memory or actions.'],
      ['Result', 'Official 0.2.0+1.21.1 with bounded installed Memory 2.0 acceptance; later semantic-memory work remains a separate boundary.'],
    ],
  },
  {
    path: 'docs/en/projects/notchhub.md',
    slug: 'notchhub',
    locale: 'en',
    fields: [
      ['My contribution', 'Solo product engineering across native macOS architecture, interaction, performance, security and release boundaries.'],
      ['Stack', 'Swift 6 · SwiftUI · AppKit · macOS · XCTest'],
      ['Challenge', 'Turn the MacBook notch area into a useful always-on surface without a heavy runtime or broad permissions.'],
      ['Result', 'The 0.1.0 — Personal build foundation is accepted; the next interaction milestone remains separate work rather than inherited acceptance.'],
    ],
  },
  {
    path: 'docs/en/projects/portfolio-platform.md',
    slug: 'portfolio-platform',
    locale: 'en',
    fields: [
      ['My contribution', 'Product, architecture and quality ownership for the static-first portfolio and knowledge layer.'],
      ['Stack', 'Diplodoc · Node.js · Playwright · GitHub Actions · GitHub Pages'],
      ['Challenge', 'Expose engineering decisions and evidence without turning the site into a heavy application or duplicating mutable truth.'],
      ['Result', 'A production static-first platform with registry-backed content, clean URLs, RU/EN and deployment-bound browser verification.'],
    ],
  },
  {
    path: 'docs/en/projects/vlezet.md',
    slug: 'vlezet',
    locale: 'en',
    fields: [
      ['My contribution', 'Product and domain architecture for geometry authority, editing, recognition boundaries and acceptance strategy.'],
      ['Stack', 'TypeScript · Next.js · Geometry · Computer vision · Three.js'],
      ['Challenge', 'Keep an apartment plan precise and editable while recognition stays assistance rather than an authority that silently rewrites geometry.'],
      ['Result', 'M7.8B remains the accepted boundary; the automatic follow-up path failed usefulness acceptance, so Assisted Tracing is the current bounded direction.'],
    ],
  },
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, 'utf8');
}

function renderSummary({slug, locale, fields}) {
  const heading = locale === 'ru' ? '## Коротко' : '## At a glance';
  const statusTerm = locale === 'ru' ? 'Статус' : 'Status';
  const rows = [
    ...fields.map(([term, value]) => `<dt>${term}</dt>\n<dd>${value}</dd>`),
    [`${statusTerm}`, `<span data-tr-project-status="${slug}"></span>`],
  ];
  const body = rows.map(([term, value]) => `<dt>${term}</dt>\n<dd>${value}</dd>`).join('\n');
  return `${heading}\n\n<dl class="tr-project-glance" data-tr-project-glance="${slug}">\n${body}\n</dl>\n\n`;
}

function removeLegacyStatus(source, slug) {
  const patterns = [
    new RegExp(`\\n\\*\\*Текущий статус:\\*\\* <span data-tr-project-status="${slug}"><\\/span>\\n`, 'i'),
    new RegExp(`\\n\\*\\*Current status:\\*\\* <span data-tr-project-status="${slug}"><\\/span>\\n`, 'i'),
    new RegExp(`\\n<span data-tr-project-status="${slug}"><\\/span>\\n`, 'i'),
  ];
  let updated = source;
  let removed = 0;
  for (const pattern of patterns) {
    if (pattern.test(updated)) {
      updated = updated.replace(pattern, '\n');
      removed += 1;
    }
  }
  if (removed !== 1) {
    throw new Error(`Expected exactly one legacy status surface for ${slug}, removed ${removed}`);
  }
  return updated;
}

for (const config of summaries) {
  let source = read(config.path);
  if (source.includes(`data-tr-project-glance="${config.slug}"`)) {
    throw new Error(`C3 glance already exists in ${config.path}`);
  }
  source = removeLegacyStatus(source, config.slug);
  const markerIndex = source.indexOf(problemMarker);
  if (markerIndex === -1) throw new Error(`Missing problem marker in ${config.path}`);
  source = `${source.slice(0, markerIndex)}${renderSummary(config)}${source.slice(markerIndex)}`;
  write(config.path, source);
}

const platformPath = 'docs/landing/projects/portfolio-platform.md';
let platform = read(platformPath);
const staleRoutes = `\`\`\`text\n/\n/landing/projects/\n/landing/projects/portfolio-platform/\n/landing/resume/\n/landing/notes/\n/en/\n/en/projects/portfolio-platform/\n/_search/ru/\n\`\`\``;
const canonicalRoutes = `\`\`\`text\n/\n/projects/\n/projects/portfolio-platform/\n/resume/\n/notes/\n/en/\n/en/projects/portfolio-platform/\n/_search/ru/\n\`\`\``;
if (!platform.includes(staleRoutes)) throw new Error('Expected stale canonical-route example block was not found');
platform = platform.replace(staleRoutes, canonicalRoutes);
write(platformPath, platform);

const cssPath = 'docs/_assets/style/custom.css';
let css = read(cssPath);
if (css.includes('/* Portfolio Clarity C3 */')) throw new Error('C3 CSS already exists');
css += `\n\n/* Portfolio Clarity C3 */\n.tr-project-index-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));\n  gap: 1rem;\n  margin: 1rem 0 1.5rem;\n}\n\n.tr-project-index-card {\n  min-width: 0;\n  padding: 1.1rem;\n  border: 1px solid var(--tr-border);\n  border-radius: var(--tr-radius);\n  background: linear-gradient(145deg, rgba(23, 28, 36, .9), rgba(17, 21, 28, .82));\n}\n\n.tr-project-index-card--selected {\n  border-color: var(--tr-border-strong);\n}\n\n.tr-project-index-card--commercial {\n  max-width: 52rem;\n  margin: 1rem 0 1.5rem;\n}\n\n.tr-project-index-grid--compact {\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));\n}\n\n.tr-project-index-card--compact {\n  padding: .95rem 1rem;\n}\n\n.tr-project-index-card h3 {\n  margin-top: .2rem;\n  margin-bottom: .55rem;\n}\n\n.tr-project-index-card p {\n  margin: 0 0 .85rem;\n  color: var(--tr-muted);\n}\n\n.tr-project-index-card__meta {\n  min-height: 1.7rem;\n  margin-bottom: .35rem;\n}\n\n.tr-project-index-card__tags {\n  display: flex;\n  flex-wrap: wrap;\n  gap: .4rem;\n  margin: .8rem 0 .9rem;\n  padding: 0;\n  list-style: none;\n}\n\n.tr-project-index-card__tags li {\n  padding: .22rem .5rem;\n  border: 1px solid var(--tr-border);\n  border-radius: 999px;\n  color: var(--tr-muted);\n  font-size: .78rem;\n}\n\n.tr-project-index-card__cta {\n  display: inline-flex;\n  align-items: center;\n  font-weight: 650;\n}\n\n.tr-project-glance {\n  display: grid;\n  grid-template-columns: minmax(8rem, .7fr) minmax(0, 2fr);\n  gap: 0;\n  margin: 1rem 0 1.75rem;\n  border: 1px solid var(--tr-border);\n  border-radius: var(--tr-radius);\n  overflow: hidden;\n  background: rgba(17, 21, 28, .66);\n}\n\n.tr-project-glance dt,\n.tr-project-glance dd {\n  min-width: 0;\n  margin: 0;\n  padding: .72rem .9rem;\n  border-bottom: 1px solid var(--tr-border);\n}\n\n.tr-project-glance dt {\n  color: var(--tr-muted);\n  font-size: .8rem;\n  font-weight: 700;\n  letter-spacing: .04em;\n  text-transform: uppercase;\n}\n\n.tr-project-glance dd {\n  overflow-wrap: anywhere;\n}\n\n.tr-project-glance dt:last-of-type,\n.tr-project-glance dd:last-of-type {\n  border-bottom: 0;\n}\n\n@media (max-width: 720px) {\n  .tr-project-glance {\n    grid-template-columns: 1fr;\n  }\n\n  .tr-project-glance dt {\n    padding-bottom: .2rem;\n    border-bottom: 0;\n  }\n\n  .tr-project-glance dd {\n    padding-top: .2rem;\n  }\n}\n`;
write(cssPath, css);

console.log(`Migrated ${summaries.length} flagship summaries and appended C3 styles.`);
