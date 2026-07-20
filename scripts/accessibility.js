import {parse, serialize} from 'parse5';

function getAttribute(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name) ?? null;
}

function setAttribute(node, name, value) {
  const existing = getAttribute(node, name);
  if (existing) {
    existing.value = value;
    return;
  }

  node.attrs ??= [];
  node.attrs.push({name, value});
}

function hasClass(node, className) {
  const classAttribute = getAttribute(node, 'class');
  if (!classAttribute) {
    return false;
  }

  return classAttribute.value.split(/\s+/).includes(className);
}

export function fixGeneratedAccessibilityHtml(html) {
  const document = parse(html);

  function visit(node) {
    if (
      node.tagName === 'a'
      && getAttribute(node, 'aria-hidden')?.value === 'true'
      && (hasClass(node, 'yfm-anchor') || hasClass(node, 'yfm-clipboard-anchor'))
    ) {
      setAttribute(node, 'tabindex', '-1');
    }

    for (const child of node.childNodes ?? []) {
      visit(child);
    }
  }

  visit(document);
  return serialize(document);
}
