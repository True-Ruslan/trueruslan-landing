const TIER1 = new Set([
  '/', '/landing/projects/', '/landing/resume/', '/landing/work-with-me/',
  '/landing/about/', '/landing/now/', '/landing/materials/', '/landing/contacts/',
  '/en/projects/', '/en/resume/', '/en/work-with-me/', '/en/about/', '/en/now/'
]);

const TIER2 = new Set([
  '/landing/publications/', '/landing/engineering-map/', '/landing/notes/',
  '/landing/bibliography/', '/landing/photos/', '/en/publications/'
]);

export const normalizeRoute = (value) => {
  if (!value || value === '/') return '/';
  return `${value.replace(/\/+$/u, '')}/`;
};

export function parseSitemapRoutes(xml, siteUrl) {
  const origin = new URL(siteUrl).origin;
  const routes = [];
  const seen = new Set();

  for (const match of xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
    let url;
    try {
      url = new URL(match[1].trim().replaceAll('&amp;', '&'));
    } catch {
      continue;
    }
    if (url.origin !== origin) continue;
    const route = normalizeRoute(url.pathname);
    if (!seen.has(route)) {
      seen.add(route);
      routes.push(route);
    }
  }

  if (!routes.length) throw new Error('No canonical routes found in sitemap');
  return routes;
}

export function classifyRoute(pathname) {
  const route = normalizeRoute(pathname);
  if (TIER1.has(route)) return 'tier1';
  if (/^\/(?:landing|en)\/notes\/[^/]+\/$/.test(route)) return 'tier3';
  if (
    TIER2.has(route)
    || /^\/(?:landing|en)\/projects\/[^/]+\/$/.test(route)
    || route.startsWith('/_search/')
  ) return 'tier2';
  return 'tier3';
}

export function counterpartRoute(route) {
  if (route.startsWith('/landing/')) return `/en/${route.slice('/landing/'.length)}`;
  if (route.startsWith('/en/')) return `/landing/${route.slice('/en/'.length)}`;
  return null;
}
