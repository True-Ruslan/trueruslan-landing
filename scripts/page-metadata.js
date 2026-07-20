import fs from 'node:fs';
import path from 'node:path';

import {parse, serialize} from 'parse5';
import * as utils from 'parse5-utils';

function normalizeBaseUrl(siteUrl) {
  return `${siteUrl.trim().replace(/\/$/, '')}/`;
}

function getAttribute(node, name) {
  return node.attrs?.find((attr) => attr.name === name)?.value ?? null;
}

function isManagedHeadNode(node) {
  if (node.nodeName === 'title') return true;

  if (node.nodeName === 'meta') {
    const name = getAttribute(node, 'name');
    const property = getAttribute(node, 'property');
    return name === 'description'
      || ['og:title', 'og:description', 'og:image', 'og:type', 'og:url'].includes(property);
  }

  if (node.nodeName === 'link') {
    return (getAttribute(node, 'rel') || '').split(/\s+/).includes('canonical');
  }

  return false;
}

function appendMeta(head, attributes) {
  const node = utils.createNode('meta');
  for (const [name, value] of Object.entries(attributes)) {
    utils.setAttribute(node, name, value);
  }
  utils.append(head, node);
}

function appendLink(head, attributes) {
  const node = utils.createNode('link');
  for (const [name, value] of Object.entries(attributes)) {
    utils.setAttribute(node, name, value);
  }
  utils.append(head, node);
}

function traverse(node, callback) {
  callback(node);
  if (!node.childNodes) return;
  for (const child of node.childNodes) traverse(child, callback);
}

export function buildPageMetadata(route, metadata, siteUrl) {
  const base = normalizeBaseUrl(siteUrl);
  return {
    title: metadata.title,
    description: metadata.description,
    type: metadata.type || 'website',
    canonical: new URL(route === 'index.html' ? '' : route, base).href,
    image: new URL(metadata.image, base).href,
  };
}

export function applyPageMetadataToHtml(html, route, metadata, siteUrl) {
  const values = buildPageMetadata(route, metadata, siteUrl);
  const document = parse(html);
  let head = null;

  traverse(document, (node) => {
    if (node.nodeName === 'head' && !head) head = node;
  });

  if (!head) {
    throw new Error(`HTML for ${route} does not contain a <head>.`);
  }

  head.childNodes = (head.childNodes || []).filter((node) => !isManagedHeadNode(node));

  const title = utils.createNode('title');
  utils.append(title, utils.createTextNode(values.title));
  utils.append(head, title);

  appendMeta(head, {name: 'description', content: values.description});
  appendMeta(head, {property: 'og:title', content: values.title});
  appendMeta(head, {property: 'og:description', content: values.description});
  appendMeta(head, {property: 'og:image', content: values.image});
  appendMeta(head, {property: 'og:type', content: values.type});
  appendMeta(head, {property: 'og:url', content: values.canonical});
  appendLink(head, {rel: 'canonical', href: values.canonical});

  return serialize(document);
}

export function applyPageMetadataMap({outputDir, metadataMap, siteUrl}) {
  const applied = [];

  for (const [route, metadata] of Object.entries(metadataMap)) {
    const filePath = path.join(outputDir, route);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Metadata target was not generated: ${route}`);
    }

    const html = fs.readFileSync(filePath, 'utf8');
    const transformed = applyPageMetadataToHtml(html, route, metadata, siteUrl);
    fs.writeFileSync(filePath, transformed, 'utf8');
    applied.push(route);
  }

  return applied;
}
