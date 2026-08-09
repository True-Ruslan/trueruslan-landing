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

function sanitizeSemanticContent(contentHtml) {
  return String(contentHtml).replace(
    /<a\s+[^>]*class="[^"]*\byfm-anchor\b[^"]*"[^>]*>[\s\S]*?<\/a>/gi,
    '',
  );
}

function renderNoJavaScriptStyle() {
  return `<style data-tr-work-with-me-noscript-style>
#root{display:none!important}
.tr-work-with-me-noscript{box-sizing:border-box;max-width:860px;margin:0 auto;padding:24px 20px 56px;color:inherit;font:inherit}
.tr-work-with-me-noscript h1{margin:0 0 24px;font-size:clamp(2rem,8vw,3rem);line-height:1.05}
.tr-work-with-me-noscript h2{margin:36px 0 14px;line-height:1.2}
.tr-work-with-me-noscript p,.tr-work-with-me-noscript li{line-height:1.55}
.tr-work-with-me-noscript .tr-collaboration-availability,.tr-work-with-me-noscript .tr-collaboration-handoff{max-width:none}
@media(max-width:640px){.tr-work-with-me-noscript{padding:18px 14px 40px}.tr-work-with-me-noscript h2{margin-top:28px}}
</style>`;
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

  const semanticContent = sanitizeSemanticContent(generated.html);
  const fallback = `<noscript ${marker}>${renderNoJavaScriptStyle()}<main class="tr-work-with-me-noscript" data-tr-work-with-me-semantic="true" lang="${locale}"><h1>${escapeHtml(title)}</h1>${semanticContent}</main></noscript>`;
  return cleaned.replace(rootPattern, (rootHost) => `${rootHost}\n${fallback}`);
}

export function workWithMeNoJavaScriptTargets() {
  return WORK_PAGES.map((target) => ({...target}));
}
