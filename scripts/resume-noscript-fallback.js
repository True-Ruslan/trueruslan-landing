import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUTPUT_DIR = path.join(__dirname, '..', 'docs-html');
const PDF_HREF = 'assets/documents/cv.pdf';

const TARGETS = Object.freeze([
  {path: 'landing/resume.html', locale: 'ru'},
  {path: 'en/resume.html', locale: 'en'},
]);

const COPY = Object.freeze({
  ru: {
    title: 'Резюме Руслана Немыкина',
    message: 'JavaScript отключён. Полная компактная версия резюме доступна в PDF.',
    action: 'Открыть PDF-резюме',
  },
  en: {
    title: 'Ruslan Nemykin — Resume',
    message: 'JavaScript is disabled. The complete compact resume is available as a PDF.',
    action: 'Open PDF resume',
  },
});

export function injectResumeNoscriptFallback(html, {locale = 'ru'} = {}) {
  const source = String(html);
  if (source.includes('data-tr-resume-fallback')) return source;
  if (!/<base\b[^>]*href=["'][^"']+["'][^>]*>/i.test(source)) {
    throw new Error('Generated resume page is missing a deployment base href');
  }
  if (!/<\/body>/i.test(source)) {
    throw new Error('Generated resume page is missing </body>');
  }

  const text = COPY[locale];
  if (!text) throw new Error(`Unsupported resume fallback locale: ${locale}`);

  const fallback = [
    '<noscript data-tr-resume-fallback>',
    '  <main class="tr-resume-noscript" aria-labelledby="tr-resume-noscript-title">',
    `    <h1 id="tr-resume-noscript-title">${text.title}</h1>`,
    `    <p>${text.message}</p>`,
    `    <p><a href="${PDF_HREF}">${text.action}</a></p>`,
    '  </main>',
    '</noscript>',
  ].join('\n');

  return source.replace(/<\/body>/i, `${fallback}\n</body>`);
}

export function applyResumeNoscriptFallback(outputDir = DEFAULT_OUTPUT_DIR) {
  const updated = [];

  for (const target of TARGETS) {
    const htmlPath = path.join(outputDir, target.path);
    let source;
    try {
      source = fs.readFileSync(htmlPath, 'utf8');
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new Error(`Generated resume page not found: ${target.path}`, {cause: error});
      }
      throw error;
    }

    const transformed = injectResumeNoscriptFallback(source, {locale: target.locale});
    if (transformed !== source) {
      fs.writeFileSync(htmlPath, transformed, 'utf8');
      updated.push(target.path);
    }
  }

  return updated;
}

function main() {
  try {
    const updated = applyResumeNoscriptFallback();
    console.log(`Injected ${updated.length} resume no-JS fallback page(s).`);
  } catch (error) {
    console.error(`Resume no-JS fallback failed: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
