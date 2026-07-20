import path from 'node:path';

import {parse, serialize} from 'parse5';

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name) ?? null;
}

function normalizeBundleReference(value) {
  return value.replace(/^(?:\.\.\/)+(_bundle\/)/, '$1');
}

export function normalizeSearchPageHtml(html, pageRelativePath) {
  const document = parse(html);
  const searchDirectory = path.posix.dirname(pageRelativePath.replaceAll('\\', '/'));
  const seenScripts = new Set();

  function visit(node) {
    if (node.tagName === 'link') {
      const href = getAttribute(node, 'href');
      if (href) {
        href.value = normalizeBundleReference(href.value);
      }
    }

    if (node.tagName === 'script') {
      const src = getAttribute(node, 'src');
      if (src) {
        let normalized = normalizeBundleReference(src.value);
        if (/^[^/]+-resources\.js$/.test(normalized)) {
          normalized = `${searchDirectory}/${normalized}`;
        }
        src.value = normalized;

        if (seenScripts.has(normalized)) {
          return false;
        }
        seenScripts.add(normalized);
      }
    }

    if (node.childNodes) {
      node.childNodes = node.childNodes.filter((child) => visit(child));
      for (const child of node.childNodes) {
        child.parentNode = node;
      }
    }

    return true;
  }

  visit(document);
  return serialize(document);
}
