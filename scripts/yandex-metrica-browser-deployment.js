import fs from 'node:fs';
import path from 'node:path';

import {normalizeMetricaCounterId} from './yandex-metrica-browser.js';

const REPRESENTATIVE_ROUTES = Object.freeze(['index.html', 'en/index.html']);
const CONTROLLER_PATTERN = /<script\b[^>]*data-tr-analytics=["']yandex-metrica-consent["'][^>]*>[\s\S]*?<\/script>/gi;
const STATIC_YANDEX_SCRIPT_PATTERN = /<script\b[^>]*\bsrc=["']https:\/\/mc\.yandex\.ru\//i;
const NOSCRIPT_YANDEX_PATTERN = /<noscript\b[^>]*>[\s\S]*?mc\.yandex\.ru[\s\S]*?<\/noscript>/i;

export function inspectMetricaBrowserHtml(html, {counterId} = {}) {
  const normalizedCounterId = normalizeMetricaCounterId(counterId);
  const controllers = html.match(CONTROLLER_PATTERN) ?? [];
  const errors = [];

  if (!normalizedCounterId) {
    if (controllers.length !== 0) errors.push('Expected no Yandex Metrica consent controller when browser analytics are disabled.');
    if (STATIC_YANDEX_SCRIPT_PATTERN.test(html)) errors.push('Static Yandex Metrica provider script is forbidden.');
    if (NOSCRIPT_YANDEX_PATTERN.test(html)) errors.push('Yandex Metrica noscript tracking is forbidden.');
    return {ok: errors.length === 0, controllerCount: controllers.length, errors};
  }

  if (controllers.length !== 1) errors.push('Expected exactly one Yandex Metrica consent controller.');
  if (STATIC_YANDEX_SCRIPT_PATTERN.test(html)) errors.push('Static Yandex Metrica provider script is forbidden before consent.');
  if (NOSCRIPT_YANDEX_PATTERN.test(html)) errors.push('Yandex Metrica noscript tracking is forbidden.');

  if (controllers.length === 1) {
    const controller = controllers[0];
    const counterAttribute = controller.match(/\bdata-tr-metrica-counter=["']([1-9][0-9]*)["']/i)?.[1] ?? null;
    if (counterAttribute !== normalizedCounterId) errors.push('Yandex Metrica controller counter does not match deployment configuration.');
    if (!controller.includes('https://mc.yandex.ru/metrika/tag.js')) errors.push('Dynamic Yandex Metrica provider source is missing.');
    if (!controller.includes('disableYaCounter')) errors.push('Official Yandex Metrica disable flag is missing.');
    if (!controller.includes('tr_privacy_consent_v1')) errors.push('Bounded first-party consent preference key is missing.');

    for (const option of [
      'clickmap:false',
      'trackLinks:false',
      'accurateTrackBounce:false',
      'webvisor:false',
      'trackHash:false',
      'sendTitle:false',
    ]) {
      if (!controller.replaceAll(' ', '').includes(option)) {
        errors.push(`Required privacy option is missing or expanded: ${option}`);
      }
    }

    for (const forbidden of ['reachGoal', 'userParams', 'ecommerce']) {
      if (controller.includes(forbidden)) errors.push(`Forbidden Yandex Metrica browser API surface detected: ${forbidden}`);
    }
  }

  return {ok: errors.length === 0, controllerCount: controllers.length, errors};
}

export function verifyMetricaBrowserArtifact(outputDir, {counterId} = {}) {
  const normalizedCounterId = normalizeMetricaCounterId(counterId);
  const routes = REPRESENTATIVE_ROUTES.map((route) => {
    const target = path.join(outputDir, ...route.split('/'));
    let html;
    try {
      html = fs.readFileSync(target, 'utf8');
    } catch (error) {
      return {
        route,
        ok: false,
        controllerCount: 0,
        errors: [`File not found or unreadable: ${error.code ?? error.message}`],
      };
    }
    return {route, ...inspectMetricaBrowserHtml(html, {counterId: normalizedCounterId})};
  });

  return {
    ok: routes.every(({ok}) => ok),
    enabled: Boolean(normalizedCounterId),
    provider: 'yandex-metrica',
    routes,
  };
}

export function writeMetricaBrowserDeploymentReport(result, reportPath) {
  fs.mkdirSync(path.dirname(reportPath), {recursive: true});
  fs.writeFileSync(reportPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}
