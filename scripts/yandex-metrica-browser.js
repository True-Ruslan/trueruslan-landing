import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {globSync} from 'glob';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_METRICA_BROWSER_POLICY_PATH = path.join(ROOT_DIR, 'data', 'yandex-metrica-browser.json');

const POLICY_FIELDS = Object.freeze([
  'provider',
  'measurement',
  'activation',
  'providerCookies',
  'consentStorage',
  'sessionReplay',
  'clickMap',
  'linkTracking',
  'accurateBounce',
  'trackHash',
  'sendTitle',
  'customEvents',
  'userParameters',
  'ecommerce',
  'noscriptTracking',
]);

const POLICY_FIELD_SET = new Set(POLICY_FIELDS);
const FORBIDDEN_FLAGS = Object.freeze([
  'sessionReplay',
  'clickMap',
  'linkTracking',
  'accurateBounce',
  'trackHash',
  'sendTitle',
  'customEvents',
  'userParameters',
  'ecommerce',
  'noscriptTracking',
]);

const METRICA_MARKER = 'data-tr-analytics="yandex-metrica-consent"';
const METRICA_TAG_SRC = 'https://mc.yandex.ru/metrika/tag.js';
const CONSENT_STORAGE_KEY = 'tr_privacy_consent_v1';

export function validateMetricaBrowserPolicy(policy) {
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) {
    throw new Error('Yandex Metrica browser policy must be an object');
  }

  for (const key of Object.keys(policy)) {
    if (!POLICY_FIELD_SET.has(key)) {
      throw new Error(`unknown Yandex Metrica browser policy field: ${key}`);
    }
  }

  for (const field of POLICY_FIELDS) {
    if (!(field in policy)) {
      throw new Error(`Yandex Metrica browser policy is missing required field: ${field}`);
    }
  }

  if (policy.provider !== 'yandex-metrica') {
    throw new Error(`unsupported Yandex Metrica browser provider: ${policy.provider}`);
  }
  if (policy.measurement !== 'aggregate-traffic') {
    throw new Error(`unsupported Yandex Metrica browser measurement: ${policy.measurement}`);
  }
  if (policy.activation !== 'explicit-consent-required') {
    throw new Error('explicit consent is required for Yandex Metrica browser analytics');
  }
  if (policy.providerCookies !== 'after-consent-only') {
    throw new Error('provider cookies must be allowed only after consent');
  }
  if (policy.consentStorage !== 'first-party-preference-only') {
    throw new Error('consent storage must be first-party preference only');
  }

  for (const field of FORBIDDEN_FLAGS) {
    if (policy[field] !== false) {
      throw new Error(`${field} is forbidden by the Yandex Metrica browser privacy policy`);
    }
  }

  return Object.freeze({...policy});
}

export function loadMetricaBrowserPolicy(policyPath = DEFAULT_METRICA_BROWSER_POLICY_PATH) {
  const source = fs.readFileSync(policyPath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    throw new Error(`invalid Yandex Metrica browser policy JSON: ${error.message}`);
  }
  return validateMetricaBrowserPolicy(parsed);
}

export function normalizeMetricaCounterId(counterId) {
  if (counterId === undefined || counterId === null) return null;
  const normalized = String(counterId).trim();
  if (!normalized) return null;
  if (!/^[1-9][0-9]*$/.test(normalized)) {
    throw new Error('Yandex Metrica counter ID must be a positive decimal identifier');
  }
  return normalized;
}

function consentControllerHtml(counterId) {
  return `<style data-tr-metrica-consent-style>
.tr-metrica-consent{position:fixed;z-index:2147483000;left:16px;bottom:16px;display:flex;align-items:center;gap:8px;max-width:min(520px,calc(100vw - 32px));box-sizing:border-box;padding:8px 10px;border:1px solid color-mix(in srgb,currentColor 16%,transparent);border-radius:11px;background:color-mix(in srgb,Canvas 94%,transparent);color:CanvasText;box-shadow:0 6px 18px rgba(0,0,0,.13);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);font:12px/1.2 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.tr-metrica-consent[hidden]{display:none}.tr-metrica-consent__text{margin:0;white-space:nowrap}.tr-metrica-consent__actions{display:flex;align-items:center;gap:6px;margin-left:auto}.tr-metrica-consent button{font:inherit;cursor:pointer}.tr-metrica-consent button[data-tr-consent]{min-height:32px;padding:5px 9px;border:1px solid color-mix(in srgb,currentColor 20%,transparent);border-radius:8px;background:transparent;color:inherit;font-weight:600;opacity:.82}.tr-metrica-consent button[data-tr-consent]:hover,.tr-metrica-consent button[data-tr-consent]:focus-visible{opacity:1;background:color-mix(in srgb,currentColor 7%,transparent)}@media(max-width:360px){.tr-metrica-consent{left:10px;bottom:10px;gap:6px;max-width:calc(100vw - 20px);padding:7px 8px;flex-wrap:wrap}.tr-metrica-consent__actions{gap:5px}.tr-metrica-consent button[data-tr-consent]{min-height:30px;padding:4px 8px}}@media(prefers-reduced-motion:reduce){.tr-metrica-consent{scroll-behavior:auto}}
</style><script ${METRICA_MARKER} data-tr-metrica-counter="${counterId}">(function(){
'use strict';
var counterId=${counterId};
var storageKey='${CONSENT_STORAGE_KEY}';
var disableKey='disableYaCounter'+counterId;
var tagSrc='${METRICA_TAG_SRC}';
var loaded=false;
var root=null;
var locale=(location.pathname==='/en'||location.pathname.indexOf('/en/')===0)?'en':'ru';
var copy=locale==='en'?{prompt:'Analytics cookies?',allow:'Allow',deny:'Refuse'}:{prompt:'Cookies для статистики?',allow:'Разрешить',deny:'Не разрешать'};
function readChoice(){try{var value=localStorage.getItem(storageKey);return value==='granted'||value==='denied'?value:null}catch(_error){return null}}
function writeChoice(value){try{localStorage.setItem(storageKey,value);return true}catch(_error){return false}}
function setDisabled(value){window[disableKey]=value}
function ensureYm(){if(typeof window.ym!=='function'){var queue=function(){(queue.a=queue.a||[]).push(arguments)};queue.l=Date.now();window.ym=queue}}
function loadMetrica(){if(loaded)return;loaded=true;setDisabled(false);ensureYm();window.ym(counterId,'init',{clickmap:false,trackLinks:false,accurateTrackBounce:false,webvisor:false,trackHash:false,sendTitle:false});var script=document.createElement('script');script.async=true;script.src=tagSrc;script.setAttribute('data-tr-metrica-provider','yandex-metrica');script.onerror=function(){loaded=false};document.head.appendChild(script)}
function hidePrompt(){if(root){root.remove();root=null}}
function showPrompt(){if(root)root.hidden=false}
function choose(value){if(value==='granted'){if(!writeChoice('granted')){setDisabled(true);showPrompt();return}hidePrompt();loadMetrica();return}setDisabled(true);if(!writeChoice('denied')){showPrompt();return}hidePrompt()}
function buildUi(){root=document.createElement('section');root.className='tr-metrica-consent';root.setAttribute('data-tr-metrica-consent-dialog','');root.setAttribute('role','dialog');root.setAttribute('aria-label',copy.prompt);var text=document.createElement('p');text.className='tr-metrica-consent__text';text.textContent=copy.prompt;var actions=document.createElement('div');actions.className='tr-metrica-consent__actions';var deny=document.createElement('button');deny.type='button';deny.setAttribute('data-tr-consent','denied');deny.textContent=copy.deny;deny.addEventListener('click',function(){choose('denied')});var allow=document.createElement('button');allow.type='button';allow.setAttribute('data-tr-consent','granted');allow.textContent=copy.allow;allow.addEventListener('click',function(){choose('granted')});actions.appendChild(deny);actions.appendChild(allow);root.appendChild(text);root.appendChild(actions);document.body.appendChild(root)}
function start(){buildUi();var choice=readChoice();if(choice==='granted'){hidePrompt();loadMetrica();return}setDisabled(true);if(choice==='denied'){hidePrompt();return}showPrompt()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();</script>`;
}

export function injectConsentGatedMetricaIntoHtml(html, policy, counterId) {
  validateMetricaBrowserPolicy(policy);
  const normalizedCounterId = normalizeMetricaCounterId(counterId);
  if (!normalizedCounterId) return html;
  if (html.includes(METRICA_MARKER)) return html;
  if (!/<\/body>/i.test(html)) {
    throw new Error('generated HTML body not found for Yandex Metrica consent injection');
  }
  return html.replace(/<\/body>/i, `${consentControllerHtml(normalizedCounterId)}</body>`);
}

export function applyConsentGatedMetrica(outputDir, policy, counterId) {
  const validatedPolicy = validateMetricaBrowserPolicy(policy);
  const normalizedCounterId = normalizeMetricaCounterId(counterId);
  const summary = {
    enabled: Boolean(normalizedCounterId),
    provider: validatedPolicy.provider,
    updated: [],
  };
  if (!normalizedCounterId) return summary;
  if (!fs.existsSync(outputDir)) {
    throw new Error(`Yandex Metrica output directory not found: ${outputDir}`);
  }

  const htmlFiles = globSync(path.join(outputDir, '**', '*.html'), {nodir: true}).sort();
  for (const htmlPath of htmlFiles) {
    const source = fs.readFileSync(htmlPath, 'utf8');
    const updated = injectConsentGatedMetricaIntoHtml(source, validatedPolicy, normalizedCounterId);
    if (updated === source) continue;
    fs.writeFileSync(htmlPath, updated, 'utf8');
    summary.updated.push(path.relative(outputDir, htmlPath).replaceAll(path.sep, '/'));
  }
  summary.updated.sort();
  return summary;
}
