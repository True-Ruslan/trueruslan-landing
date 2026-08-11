from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one match, found {count}')
    return text.replace(old, new, 1)


# 1. Refine the RED contract so dynamic manifest ownership, not a literal work-with-me string,
#    proves complete controlled-pair coverage.
path = 'scripts/portfolio-clarity-c6.test.js'
text = read(path)
text = replace_once(
    text,
    "  assert.match(browserSmoke, /work-with-me/);",
    "  assert.ok(manifest.some((pair) => pair.id === 'work-with-me'), 'canonical manifest must include work-with-me');\n  assert.match(browserSmoke, /generatedHtmlPathToPublicRoute/);",
    'C6 dynamic i18n contract',
)
write(path, text)

# 2. Remove the second hard-coded i18n route registry from the browser acceptance gate.
path = 'scripts/i18n-browser-smoke.cjs'
text = read(path)
old = """const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.I18N_SMOKE_PORT || 4191);
const SITE_PATH = '/trueruslan-landing';
const {chromium} = requireQualityTool('playwright', 'Minimal RU EN smoke tool');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright', 'Minimal RU EN smoke tool');

const PAIRS = [
  {id: 'home', ru: '/', en: '/en/'},
  {id: 'about', ru: '/about/', en: '/en/about/'},
  {id: 'resume', ru: '/resume/', en: '/en/resume/'},
  {id: 'projects', ru: '/projects/', en: '/en/projects/'},
  {id: 'now', ru: '/now/', en: '/en/now/'},
  {id: 'publications', ru: '/publications/', en: '/en/publications/'},
  {id: 'livingworld', ru: '/projects/livingworld/', en: '/en/projects/livingworld/'},
  {id: 'vlezet', ru: '/projects/vlezet/', en: '/en/projects/vlezet/'},
  {id: 'notchhub', ru: '/projects/notchhub/', en: '/en/projects/notchhub/'},
  {id: 'portfolio-platform', ru: '/projects/portfolio-platform/', en: '/en/projects/portfolio-platform/'},
  {id: 'note-ai-npcs', ru: '/notes/server-authoritative-ai-npcs/', en: '/en/notes/server-authoritative-ai-npcs/'},
  {id: 'note-llm-protocol-boundary', ru: '/notes/llm-output-is-a-protocol-boundary/', en: '/en/notes/llm-output-is-a-protocol-boundary/'},
];
"""
new = """const fs = require('node:fs');
const path = require('node:path');

const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.I18N_SMOKE_PORT || 4191);
const SITE_PATH = '/trueruslan-landing';
const {chromium} = requireQualityTool('playwright', 'Minimal RU EN smoke tool');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright', 'Minimal RU EN smoke tool');

function generatedHtmlPathToPublicRoute(value) {
  let normalized = String(value).replaceAll('\\\\', '/').replace(/^\\/+/, '');
  if (!normalized.endsWith('.html')) throw new Error(`unsupported i18n generated path: ${value}`);
  if (normalized === 'index.html') return '/';
  normalized = normalized.slice(0, -'.html'.length);
  if (normalized.startsWith('landing/')) normalized = normalized.slice('landing/'.length);
  if (normalized.endsWith('/index')) normalized = normalized.slice(0, -'/index'.length);
  return `/${normalized}/`.replace(/\\/{2,}/g, '/');
}

function loadControlledPairs() {
  const manifestPath = path.join(__dirname, '..', 'data', 'i18n.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(manifest) || manifest.length === 0) throw new Error('data/i18n.json must contain controlled pairs');
  return manifest.map(({id, ru, en}) => ({
    id,
    ru: generatedHtmlPathToPublicRoute(ru),
    en: generatedHtmlPathToPublicRoute(en),
  }));
}

const PAIRS = loadControlledPairs();
"""
text = replace_once(text, old, new, 'i18n browser canonical manifest')
write(path, text)

# 3. Reconcile canonical EN metadata with visible positioning/H1 semantics.
path = 'data/page-meta.json'
data = json.loads(read(path))
by_path = {entry['path']: entry for entry in data}
for required in ['en/index.html', 'en/resume.html']:
    if required not in by_path:
        raise SystemExit(f'page-meta missing required entry before C6: {required}')
if by_path['en/index.html']['title'] != 'Ruslan Nemykin — Backend Engineer':
    raise SystemExit('unexpected EN home title before C6')
if by_path['en/resume.html']['title'] != 'Resume — Ruslan Nemykin':
    raise SystemExit('unexpected EN resume title before C6')
by_path['en/index.html']['title'] = 'Ruslan Nemykin — Java Backend Engineer'
by_path['en/index.html']['kicker'] = 'JAVA BACKEND ENGINEER'
by_path['en/resume.html']['title'] = 'Experience — Ruslan Nemykin'
by_path['en/resume.html']['displayTitle'] = 'ENGINEERING EXPERIENCE'
write(path, json.dumps(data, ensure_ascii=False, indent=2) + '\n')

# 4. Extend metadata browser acceptance to the two key EN professional surfaces.
path = 'scripts/metadata-smoke.cjs'
text = read(path)
needle = "  {path: '/', title: 'Руслан Немыкин — Backend Engineer', card: 'home'},\n"
replacement = needle + "  {path: '/en/', title: 'Ruslan Nemykin — Java Backend Engineer', card: 'home-en'},\n  {path: '/en/resume/', title: 'Experience — Ruslan Nemykin', card: 'resume-en'},\n"
text = replace_once(text, needle, replacement, 'metadata smoke EN surfaces')
write(path, text)

# 5. Keep one Person identity, but make the Latin-name identity explicit.
path = 'scripts/seo.js'
text = read(path)
text = replace_once(
    text,
    "    name: 'Руслан Немыкин',\n",
    "    name: 'Руслан Немыкин',\n    alternateName: 'Ruslan Nemykin',\n",
    'Person alternateName',
)
write(path, text)

path = 'scripts/seo.test.js'
text = read(path)
text = replace_once(
    text,
    "  assert.equal(schema.jobTitle, 'Backend Engineer / Java Developer');",
    "  assert.equal(schema.jobTitle, 'Backend Engineer / Java Developer');\n  assert.equal(schema.alternateName, 'Ruslan Nemykin');",
    'Person alternateName test',
)
write(path, text)

# 6. Inject the same Person JSON-LD into both canonical home surfaces when EN is enabled,
#    preserving the old boolean for existing fixtures and adding explicit targets.
path = 'scripts/copy-assets.js'
text = read(path)
old = """export function applyPersonSchemaToIndex(outputDir = OUTPUT_DIR, siteUrl = getSiteUrl()) {
  const indexPath = path.join(outputDir, 'index.html');
  if (!fs.existsSync(indexPath)) return false;
  const html = fs.readFileSync(indexPath, 'utf8');
  fs.writeFileSync(indexPath, injectPersonSchemaIntoHtml(html, siteUrl), 'utf8');
  return true;
}
"""
new = """function injectPersonSchemaTarget(outputDir, relativePath, siteUrl, {required = true} = {}) {
  const htmlPath = path.join(outputDir, ...relativePath.split('/'));
  let html;
  try {
    html = fs.readFileSync(htmlPath, 'utf8');
  } catch (error) {
    if (!required && error?.code === 'ENOENT') return false;
    if (error?.code === 'ENOENT') throw new Error(`Person schema target not found: ${relativePath}`);
    throw error;
  }
  fs.writeFileSync(htmlPath, injectPersonSchemaIntoHtml(html, siteUrl), 'utf8');
  return true;
}

export function applyPersonSchemaToHomes(outputDir = OUTPUT_DIR, siteUrl = getSiteUrl(), {includeEnglish = false} = {}) {
  const targets = [];
  if (injectPersonSchemaTarget(outputDir, 'index.html', siteUrl)) targets.push('index.html');
  if (includeEnglish && injectPersonSchemaTarget(outputDir, 'en/index.html', siteUrl)) targets.push('en/index.html');
  return targets;
}
"""
text = replace_once(text, old, new, 'Person schema home helper')
text = replace_once(
    text,
    "  const personSchemaInjected = applyPersonSchemaToIndex(outputDir, siteUrl);",
    "  const personSchemaTargets = applyPersonSchemaToHomes(outputDir, siteUrl, {includeEnglish: Boolean(i18nPairs)});\n  const personSchemaInjected = personSchemaTargets.includes('index.html');",
    'Person schema call',
)
text = replace_once(
    text,
    "    personSchemaInjected,\n    analytics,",
    "    personSchemaInjected,\n    personSchemaTargets,\n    analytics,",
    'Person schema result',
)
write(path, text)

path = 'scripts/copy-assets.test.js'
text = read(path)
text = replace_once(
    text,
    "  assert.equal(result.personSchemaInjected, true);",
    "  assert.equal(result.personSchemaInjected, true);\n  assert.deepEqual(result.personSchemaTargets, ['index.html']);",
    'copy-assets Person target assertion',
)
write(path, text)

# 7. Reconcile user-facing EN links and top-level discovery copy.
path = 'docs/en/resume.md'
text = read(path)
text = replace_once(
    text,
    '    <a href="../landing/contacts.html">Contact →</a>',
    '    <a href="mailto:hi@true-ruslan.ru">Email me →</a>',
    'EN Experience language-neutral contact',
)
text = replace_once(
    text,
    'I teach software module development and testing and conduct postgraduate research. External work is collected under [Publications](../landing/publications.html), while original engineering analysis lives in Engineering Notes.',
    'I teach software module development and testing and conduct postgraduate research. External work is collected under [Publications](publications.md), while original engineering analysis is available in [Engineering Notes (RU)](../landing/notes.md).',
    'EN Experience paired publications link',
)
write(path, text)

path = 'docs/en/about.md'
text = read(path)
text = replace_once(
    text,
    'For concrete roles and stack, see [Resume](resume.md). For shipped and experimental systems, start with [Projects](projects.md).',
    'For concrete roles and stack, see [Experience](resume.md). For shipped and experimental systems, start with [Projects](projects.md).',
    'EN About Experience label',
)
text = replace_once(
    text,
    'Technical reading is collected under Sources, published external work under Publications, and original engineering analysis under Engineering Notes.',
    'Technical reading is collected under [Sources (RU)](../landing/bibliography.md), published external work under [Publications](publications.md), and original engineering analysis under [Engineering Notes (RU)](../landing/notes.md).',
    'EN About explicit links',
)
write(path, text)

path = 'docs/en/projects.md'
text = read(path)
text = replace_once(
    text,
    'A short map of the work that best shows how I approach engineering: where authority lives, what counts as verified, and what changes after the first working prototype.',
    'A curated set of projects showing how I design backend, AI and product systems, make trade-offs, and move prototypes toward reliable software.',
    'EN Projects natural lead',
)
write(path, text)

path = 'docs/en/now.md'
text = read(path)
text = replace_once(
    text,
    'This is not a roadmap or a list of promises; it is a short snapshot of my current engineering focus.\n\nIf this page and a detailed case study differ, the project page remains the deeper context source and project status comes from the shared Project Registry.',
    'A short snapshot of what I am building, learning and writing about now.\n\nProject pages provide deeper context when a topic needs more detail; current project status stays consistent across the site.',
    'EN Now natural framing',
)
write(path, text)

print('C6 EN/SEO migration completed.')
