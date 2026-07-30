import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {normalizeAnalyticsToken} from './analytics.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_REPORT_PATH = path.join(ROOT, 'analytics-deployment-contract.json');
const MODES = new Set(['auto', 'required', 'disabled']);
const EXPECTATIONS = new Set(['enabled', 'disabled']);
const ANALYTICS_MARKER = 'cloudflare-web-analytics';
const CLOUDFLARE_BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js';
const DEFAULT_ARTIFACT_ROUTES = Object.freeze(['index.html', 'en/index.html']);

export function resolveAnalyticsDeployment({mode = 'auto', token} = {}) {
  const normalizedMode = String(mode || 'auto').trim().toLowerCase();
  if (!MODES.has(normalizedMode)) {
    throw new Error(`invalid analytics deployment mode: ${mode}`);
  }

  if (normalizedMode === 'disabled') {
    return Object.freeze({
      mode: normalizedMode,
      enabled: false,
      expectation: 'disabled',
      reason: 'forced-disabled',
    });
  }

  const normalizedToken = normalizeAnalyticsToken(token);
  if (!normalizedToken) {
    if (normalizedMode === 'required') {
      throw new Error('analytics token is required for required deployment mode');
    }
    return Object.freeze({
      mode: normalizedMode,
      enabled: false,
      expectation: 'disabled',
      reason: 'token-not-configured',
    });
  }

  return Object.freeze({
    mode: normalizedMode,
    enabled: true,
    expectation: 'enabled',
    reason: 'configured-token',
  });
}

export function writeAnalyticsDeploymentContract(result, reportPath = DEFAULT_REPORT_PATH) {
  fs.mkdirSync(path.dirname(reportPath), {recursive: true});
  fs.writeFileSync(reportPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}

function decodeHtmlAttribute(value) {
  return String(value)
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&#x22;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readAttribute(tag, attributeName) {
  const name = escapeRegExp(attributeName);
  const match = tag.match(new RegExp(`\\s${name}(?:\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+)))?`, 'i'));
  if (!match) return {present: false, value: null};
  return {
    present: true,
    value: match[1] ?? match[2] ?? match[3] ?? '',
  };
}

function findOwnedAnalyticsScripts(html) {
  const scripts = [];
  for (const match of String(html).matchAll(/<script\b[^>]*>/gi)) {
    const tag = match[0];
    const owner = readAttribute(tag, 'data-tr-analytics');
    if (owner.present && decodeHtmlAttribute(owner.value) === ANALYTICS_MARKER) scripts.push(tag);
  }
  return scripts;
}

export function inspectAnalyticsHtml(html, {expectation, token} = {}) {
  const normalizedExpectation = String(expectation || '').trim().toLowerCase();
  if (!EXPECTATIONS.has(normalizedExpectation)) {
    throw new Error(`invalid analytics expectation: ${expectation}`);
  }

  const scripts = findOwnedAnalyticsScripts(html);
  const errors = [];

  if (normalizedExpectation === 'disabled') {
    if (scripts.length !== 0) errors.push(`Expected no analytics beacon, found ${scripts.length}.`);
    return {ok: errors.length === 0, beaconCount: scripts.length, errors};
  }

  const expectedToken = normalizeAnalyticsToken(token);
  if (!expectedToken) throw new Error('analytics token is required for enabled verification');

  if (scripts.length !== 1) {
    errors.push(`Expected exactly one analytics beacon, found ${scripts.length}.`);
    return {ok: false, beaconCount: scripts.length, errors};
  }

  const script = scripts[0];
  const src = readAttribute(script, 'src');
  const type = readAttribute(script, 'type');
  const defer = readAttribute(script, 'defer');
  const configAttribute = readAttribute(script, 'data-cf-beacon');

  if (!src.present || decodeHtmlAttribute(src.value) !== CLOUDFLARE_BEACON_SRC) {
    errors.push('Analytics beacon source is invalid.');
  }
  if (!type.present || decodeHtmlAttribute(type.value) !== 'module') {
    errors.push('Analytics beacon type must be module.');
  }
  if (!defer.present) errors.push('Analytics beacon must include defer.');
  if (!configAttribute.present) {
    errors.push('Analytics beacon configuration is missing.');
  } else {
    try {
      const config = JSON.parse(decodeHtmlAttribute(configAttribute.value));
      if (!config || typeof config !== 'object' || Array.isArray(config)) {
        errors.push('Analytics beacon configuration must be an object.');
      } else {
        const keys = Object.keys(config).sort();
        if (keys.length !== 2 || keys[0] !== 'spa' || keys[1] !== 'token') {
          errors.push('Analytics beacon configuration contains unexpected fields.');
        }
        let embeddedToken = null;
        try {
          embeddedToken = normalizeAnalyticsToken(config.token);
        } catch {
          errors.push('Analytics beacon token is invalid.');
        }
        if (embeddedToken && embeddedToken !== expectedToken) {
          errors.push('Analytics beacon token does not match configured deployment token.');
        }
        if (config.spa !== false) errors.push('Analytics beacon must use spa=false.');
      }
    } catch {
      errors.push('Analytics beacon configuration is not valid JSON.');
    }
  }

  return {ok: errors.length === 0, beaconCount: scripts.length, errors};
}

export function verifyAnalyticsArtifact(outputDir, {
  expectation,
  token,
  routes = DEFAULT_ARTIFACT_ROUTES,
} = {}) {
  const normalizedExpectation = String(expectation || '').trim().toLowerCase();
  if (!EXPECTATIONS.has(normalizedExpectation)) {
    throw new Error(`invalid analytics expectation: ${expectation}`);
  }

  const routeResults = routes.map((route) => {
    const normalizedRoute = String(route).replaceAll('\\', '/').replace(/^\/+/, '');
    const target = path.resolve(outputDir, ...normalizedRoute.split('/'));
    const root = path.resolve(outputDir);
    if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
      return {route: normalizedRoute, ok: false, beaconCount: 0, errors: ['Unsafe artifact route.']};
    }
    if (!fs.existsSync(target)) {
      return {route: normalizedRoute, ok: false, beaconCount: 0, errors: ['Artifact file not found.']};
    }
    try {
      return {
        route: normalizedRoute,
        ...inspectAnalyticsHtml(fs.readFileSync(target, 'utf8'), {
          expectation: normalizedExpectation,
          token,
        }),
      };
    } catch (error) {
      return {route: normalizedRoute, ok: false, beaconCount: 0, errors: [error.message]};
    }
  });

  return {
    ok: routeResults.every((entry) => entry.ok),
    expectation: normalizedExpectation,
    routes: routeResults,
  };
}

function appendWorkflowFile(filePath, line) {
  if (!filePath) return;
  fs.appendFileSync(filePath, `${line}\n`, 'utf8');
}

function main() {
  const mode = process.env.ANALYTICS_DEPLOYMENT_MODE || 'auto';
  const rawToken = process.env.ANALYTICS_SITE_TOKEN ?? '';
  if (String(rawToken).trim()) console.log(`::add-mask::${String(rawToken).trim()}`);

  const result = resolveAnalyticsDeployment({mode, token: rawToken});
  const reportPath = process.env.ANALYTICS_DEPLOYMENT_REPORT_PATH || DEFAULT_REPORT_PATH;
  writeAnalyticsDeploymentContract(result, reportPath);

  appendWorkflowFile(process.env.GITHUB_ENV, `ANALYTICS_EXPECTATION=${result.expectation}`);
  appendWorkflowFile(
    process.env.GITHUB_ENV,
    `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN=${result.enabled ? String(rawToken).trim() : ''}`,
  );
  appendWorkflowFile(process.env.GITHUB_OUTPUT, `analytics_expectation=${result.expectation}`);

  console.log(
    `Analytics deployment: mode=${result.mode} expectation=${result.expectation} reason=${result.reason}`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    console.error(`Analytics deployment preflight failed: ${error.message}`);
    process.exit(1);
  }
}
