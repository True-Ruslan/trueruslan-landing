import {parse, serialize} from 'parse5';
import * as utils from 'parse5-utils';

export const DARK_THEME_MARKER = "sessionStorage.setItem('theme', 'dark')";

export const DARK_THEME_SCRIPT = `
try { ${DARK_THEME_MARKER}; } catch (_) {}
document.documentElement.style.colorScheme = 'dark';
for (const el of document.querySelectorAll('.g-root')) {
  el.classList.remove('g-root_theme_light');
  el.classList.add('g-root_theme_dark');
}
`;

export function injectDarkThemeIntoHtml(html) {
  if (html.includes(DARK_THEME_MARKER)) {
    return html;
  }

  const withDarkBody = html.replaceAll(
    'class="g-root g-root_theme_light"',
    'class="g-root g-root_theme_dark"',
  );

  const parsed = parse(withDarkBody);

  traverse(parsed, (node) => {
    if (node.nodeName === 'head') {
      const meta = utils.createNode('meta');
      utils.setAttribute(meta, 'name', 'color-scheme');
      utils.setAttribute(meta, 'content', 'dark');
      utils.append(node, meta);
      return;
    }

    if (node.nodeName === 'body') {
      const scriptNode = utils.createNode('script');
      utils.append(scriptNode, utils.createTextNode(DARK_THEME_SCRIPT));
      node.childNodes?.unshift(scriptNode);
    }
  });

  return serialize(parsed);
}

function traverse(node, callback) {
  callback(node);

  if (!node.childNodes) {
    return;
  }

  for (const childNode of node.childNodes) {
    traverse(childNode, callback);
  }
}
