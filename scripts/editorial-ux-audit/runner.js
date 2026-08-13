import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseSitemapRoutes, counterpartRoute } from './core.js';
import { extractPageMetrics } from './dom.js';
import { buildWarnings } from './warnings.js';

function generatedFile(siteDir, route) {
  if (route === '/') return join(siteDir, 'index.html');
  return join(siteDir, route.replace(/^\//u, ''), 'index.html');
}

export async function auditSite({ siteDir, siteUrl }) {
  const sitemap = await readFile(join(siteDir, 'sitemap.xml'), 'utf8');
  const routes = parseSitemapRoutes(sitemap, siteUrl);
  const knownRoutes = new Set(routes);
  const pages = [];

  for (const route of routes) {
    let html;
    try {
      html = await readFile(generatedFile(siteDir, route), 'utf8');
    } catch (error) {
      if (error?.code === 'ENOENT') {
        throw new Error(`Missing canonical route ${route} in generated site`);
      }
      throw error;
    }

    const metrics = extractPageMetrics(html, route);
    const counterpart = counterpartRoute(route);
    const warnings = buildWarnings(metrics);
    const { __proseText, ...publicMetrics } = metrics;

    pages.push({
      ...publicMetrics,
      counterpartRoute: counterpart,
      counterpartPresent: counterpart ? knownRoutes.has(counterpart) : false,
      warnings
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    siteUrl: new URL(siteUrl).origin,
    routeCount: pages.length,
    pages
  };
}

export function renderMarkdownReport(report) {
  return `# Editorial & UX Audit\n\nRoutes: ${report.routeCount}\n`;
}
