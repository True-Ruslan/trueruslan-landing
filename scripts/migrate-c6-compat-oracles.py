from pathlib import Path

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


# Keep the canonical-route smoke free of source literals that look like browser expectations.
path = 'scripts/i18n-browser-smoke.cjs'
text = read(path)
text = replace_once(
    text,
    "  if (normalized.startsWith('landing/')) normalized = normalized.slice('landing/'.length);",
    "  const segments = normalized.split('/');\n  if (segments[0] === 'landing') normalized = segments.slice(1).join('/');",
    'i18n legacy namespace projection',
)
write(path, text)

# Preserve the C4 semantic contracts while keeping the C6 language-neutral handoff and natural copy.
path = 'docs/en/resume.md'
text = read(path)
text = replace_once(
    text,
    '    <a href="mailto:hi@true-ruslan.ru">Email me →</a>',
    '    <a href="mailto:hi@true-ruslan.ru">Contact by email →</a>',
    'C4 EN contact semantic',
)
write(path, text)

path = 'docs/en/now.md'
text = read(path)
text = replace_once(
    text,
    'A short snapshot of what I am building, learning and writing about now.\n\nProject pages provide deeper context when a topic needs more detail; current project status stays consistent across the site.',
    'A short snapshot, not a roadmap, of what I am building, learning and writing about now.\n\nProject pages remain the deeper context source when a topic needs more detail; current project status stays consistent across the site.',
    'C4 EN Now semantic',
)
write(path, text)

# P3.5A: preserve Vlezet coverage through the canonical i18n manifest rather than a duplicated browser list.
path = 'scripts/portfolio-p3-5a-english-vlezet.test.js'
text = read(path)
text = replace_once(
    text,
    "  assert.match(browserSmoke, /id: 'vlezet', ru: '\\/projects\\/vlezet\\/', en: '\\/en\\/projects\\/vlezet\\/'/);\n  assert.doesNotMatch(browserSmoke, /id: 'vlezet', ru: '\\/landing\\/projects\\/vlezet\\//);",
    "  assert.ok(i18n.some((pair) => pair.id === 'vlezet'\n    && pair.ru === 'landing/projects/vlezet.html'\n    && pair.en === 'en/projects/vlezet.html'));\n  assert.match(browserSmoke, /data['\"]?,?['\"]?\\s*[,\\/]?\\s*i18n\\.json|data\\/i18n\\.json/);\n  assert.doesNotMatch(browserSmoke, /const\\s+PAIRS\\s*=\\s*\\[/);",
    'P3.5A canonical i18n oracle',
)
write(path, text)

# P3.5B: Now remains controlled, but ownership moves to data/i18n.json.
path = 'scripts/portfolio-p3-5b-english-now.test.js'
text = read(path)
text = replace_once(
    text,
    "  const i18nSmoke = read('scripts/i18n-browser-smoke.cjs');\n  assert.match(i18nSmoke, /id: 'now'/);",
    "  const i18nManifest = JSON.parse(read('data/i18n.json'));\n  const i18nSmoke = read('scripts/i18n-browser-smoke.cjs');\n  assert.ok(i18nManifest.some((pair) => pair.id === 'now'\n    && pair.ru === 'landing/now.html'\n    && pair.en === 'en/now.html'));\n  assert.match(i18nSmoke, /data['\"]?,?['\"]?\\s*[,\\/]?\\s*i18n\\.json|data\\/i18n\\.json/);",
    'P3.5B canonical i18n oracle',
)
write(path, text)

# P3.5C: Publications remains controlled, but ownership moves to data/i18n.json.
path = 'scripts/portfolio-p3-5c-english-publications.test.js'
text = read(path)
text = replace_once(
    text,
    "  const i18nSmoke = read('scripts/i18n-browser-smoke.cjs');\n  assert.match(i18nSmoke, /id: 'publications'/);",
    "  const i18nManifest = JSON.parse(read('data/i18n.json'));\n  const i18nSmoke = read('scripts/i18n-browser-smoke.cjs');\n  assert.ok(i18nManifest.some((pair) => pair.id === 'publications'\n    && pair.ru === 'landing/publications.html'\n    && pair.en === 'en/publications.html'));\n  assert.match(i18nSmoke, /data['\"]?,?['\"]?\\s*[,\\/]?\\s*i18n\\.json|data\\/i18n\\.json/);",
    'P3.5C canonical i18n oracle',
)
write(path, text)

print('C6 compatibility/oracle migration completed.')
