import {readGeneratedContentState} from './diplodoc-state.js';

const WORK_PAGES = Object.freeze([
  Object.freeze({path: 'landing/work-with-me.html', locale: 'ru'}),
  Object.freeze({path: 'en/work-with-me.html', locale: 'en'}),
]);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function removeBoundedCollaborationFallbacks(documentHtml) {
  return String(documentHtml).replace(
    /\s*<noscript\s+data-tr-collaboration-noscript="[^"]+">[\s\S]*?<\/noscript>/gi,
    '',
  );
}

export function injectWorkWithMeNoJavaScriptFallback(documentHtml, {locale}) {
  if (!['ru', 'en'].includes(locale)) throw new Error(`unsupported Work with me fallback locale: ${locale}`);
  const marker = `data-tr-work-with-me-fallback="${locale}"`;
  if (documentHtml.includes(marker)) return documentHtml;

  const generated = readGeneratedContentState(documentHtml, `Work with me ${locale} no-JS fallback`);
  if (!generated) throw new Error('Diplodoc state is missing for Work with me no-JS fallback.');
  const title = generated.state?.data?.title;
  if (typeof title !== 'string' || !title.trim()) {
    throw new Error('Diplodoc state is incomplete for Work with me no-JS fallback.');
  }

  const cleaned = removeBoundedCollaborationFallbacks(documentHtml);
  const rootPattern = /<div\s+id=["']root["']\s*>\s*<\/div>/i;
  if (!rootPattern.test(cleaned)) throw new Error(`Work with me ${locale} root host is missing.`);

  const fallback = `<noscript ${marker}><main class="tr-work-with-me-noscript" data-tr-work-with-me-semantic="true" lang="${locale}"><h1>${escapeHtml(title)}</h1>${generated.html}</main></noscript>`;
  return cleaned.replace(rootPattern, (rootHost) => `${rootHost}\n${fallback}`);
}

export function workWithMeNoJavaScriptTargets() {
  return WORK_PAGES.map((target) => ({...target}));
}
