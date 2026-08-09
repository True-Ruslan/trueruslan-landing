import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOW = path.join(ROOT, '.github', 'workflows', 'production-live.yml');
const SMOKE = path.join(ROOT, 'scripts', 'production-live-smoke.cjs');
const PLATFORM_SMOKE = path.join(ROOT, 'scripts', 'production-portfolio-platform-smoke.cjs');
const FLAGSHIP_SMOKE = path.join(ROOT, 'scripts', 'production-flagship-normalization-smoke.cjs');
const DEPLOYMENT_NOTE_SMOKE = path.join(ROOT, 'scripts', 'production-deployment-verification-note-smoke.cjs');
const ROUTES = path.join(ROOT, 'scripts', 'production-live-routes.cjs');

test('live production workflow is read-only, deployment-aware and artifact-producing', () => {
  assert.ok(fs.existsSync(WORKFLOW), 'missing live production workflow');
  const workflow = fs.readFileSync(WORKFLOW, 'utf8');

  assert.match(workflow, /^name: Production Live Smoke$/m);
  assert.match(workflow, /push:/);
  assert.match(workflow, /branches:\s*\n\s*- master/);
  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /workflows:\s*\n\s*- ['"]?Deploy static content to Pages['"]?/);
  assert.match(workflow, /types:\s*\n\s*- completed/);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /pull_request:/);
  for (const controlledPath of [
    '.github/workflows/production-live.yml',
    'scripts/production-live-smoke.cjs',
    'scripts/production-live-routes.cjs',
    'scripts/production-live-routes.test.js',
    'scripts/production-live-workflow.test.js',
    'scripts/production-portfolio-platform-smoke.cjs',
    'scripts/production-flagship-normalization-smoke.cjs',
    'scripts/production-deployment-verification-note-smoke.cjs',
  ]) {
    assert.ok(workflow.includes(controlledPath), `missing live-production PR path: ${controlledPath}`);
  }

  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /pages:\s*read/);
  assert.match(workflow, /deployments:\s*read/);
  assert.doesNotMatch(workflow, /contents:\s*write|issues:\s*write|deployments:\s*write|actions:\s*write/);
  assert.match(workflow, /actions\/github-script@[0-9a-f]{40}/i);
  assert.match(workflow, /GET \/repos\/\{owner\}\/\{repo\}\/deployments/);
  assert.match(workflow, /GET \/repos\/\{owner\}\/\{repo\}\/deployments\/\{deployment_id\}\/statuses/);
  assert.match(workflow, /github-pages/);
  assert.match(workflow, /deployment\.sha/);
  assert.match(workflow, /github\.event\.workflow_run\.head_sha/);
  assert.match(workflow, /github\.event\.workflow_run\.conclusion/);
  assert.match(workflow, /EXACT_DEPLOYMENT/);
  assert.match(workflow, /EXPECTED_SHA/);
  assert.match(workflow, /EXPECT_PROJECTED_PUBLIC_ROUTES:\s*true/);
  assert.doesNotMatch(workflow, /EXPECT_PROJECTED_PUBLIC_ROUTES:\s*\$\{\{ github\.event_name != 'pull_request' \}\}/);
  assert.match(workflow, /playwright@1\.61\.1/);
  assert.match(workflow, /install --with-deps chromium/);
  assert.match(workflow, /node scripts\/production-live-smoke\.cjs/);
  assert.match(workflow, /name: Run deployed portfolio platform smoke\s*\n\s*if: github\.event_name != 'pull_request'/);
  assert.match(workflow, /node scripts\/production-portfolio-platform-smoke\.cjs/);
  assert.match(workflow, /name: Run deployed flagship normalization smoke\s*\n\s*if: github\.event_name != 'pull_request'/);
  assert.match(workflow, /node scripts\/production-flagship-normalization-smoke\.cjs/);
  assert.match(workflow, /name: Run deployed P3\.4A Note smoke\s*\n\s*if: github\.event_name != 'pull_request'/);
  assert.match(workflow, /node scripts\/production-deployment-verification-note-smoke\.cjs/);
  assert.match(workflow, /actions\/upload-artifact@[0-9a-f]{40}/i);
  assert.match(workflow, /name:\s*production-live-evidence/);
  assert.match(workflow, /retention-days:\s*30/);
  assert.doesNotMatch(workflow, /\bgit\s+(?:commit|push)\b|npm\s+audit\s+fix/);
});

test('baseline live smoke remains safe for PR execution against the projected current production contract', () => {
  assert.ok(fs.existsSync(SMOKE), 'missing baseline live production smoke script');
  const source = fs.readFileSync(SMOKE, 'utf8');

  assert.doesNotMatch(
    source,
    /PORTFOLIO_PLATFORM_URL|VILLAIGENCE_URL|VLEZET_URL|DEPLOYMENT_VERIFICATION_NOTE_URL|flagship-normalization-production-summary/,
  );
  assert.match(source, /EXPECT_PROJECTED_PUBLIC_ROUTES/);
  assert.match(source, /ACTIVE_NOTE_URL/);
  assert.match(source, /Production live smoke passed/);
});

test('deployment-only platform smoke covers new RU EN clean routes, homepage and search', () => {
  assert.ok(fs.existsSync(PLATFORM_SMOKE), 'missing deployment-only platform smoke script');
  assert.ok(fs.existsSync(ROUTES), 'missing live production route contract');
  const platformSource = fs.readFileSync(PLATFORM_SMOKE, 'utf8');
  const source = `${fs.readFileSync(ROUTES, 'utf8')}\n${platformSource}`;

  for (const marker of [
    'projects/portfolio-platform/',
    'en/projects/portfolio-platform/',
    'data-home-flagship="portfolio-platform"',
    'TrueRuslan Landing static-first',
    'Production Live Smoke #58',
    'portfolio-platform-production-summary.json',
    'main.dc-doc-page__content',
  ]) {
    assert.ok(source.includes(marker), `missing deployed platform smoke marker: ${marker}`);
  }

  assert.doesNotMatch(platformSource, /page\.locator\(['"]main['"]\)\.innerText/);
  assert.match(platformSource, /documentContent\.waitFor\(\{state: 'visible', timeout: 10000\}\)/);
  assert.match(source, /EXPECTED_DEPLOYED_SHA/);
  assert.match(source, /link\[rel="canonical"\]/);
  assert.match(source, /link\[rel="alternate"\]/);
  assert.match(source, /page\.screenshot/);
});

test('deployment-only flagship smoke covers current RU and EN VillAIgence and Vlezet boundaries', () => {
  assert.ok(fs.existsSync(FLAGSHIP_SMOKE), 'missing deployment-only flagship normalization smoke script');
  assert.ok(fs.existsSync(ROUTES), 'missing live production route contract');
  const flagshipSource = fs.readFileSync(FLAGSHIP_SMOKE, 'utf8');
  const source = `${fs.readFileSync(ROUTES, 'utf8')}\n${flagshipSource}`;

  for (const marker of [
    'projects/livingworld/',
    'projects/vlezet/',
    'en/projects/livingworld/',
    'en/projects/vlezet/',
    'main.dc-doc-page__content',
    'data/project-evidence.json',
    'Current official release',
    'Installed 0.2.0 result',
    'PR #123',
    'PR #125',
    'M7.8B',
    'Automatic M7.8C result',
    'Next acceptance boundary',
    'PR #42',
    'PR #44',
    'PR #45',
    'PR #52',
    'Assisted Tracing',
    'flagship-normalization-production-summary.json',
    'flagship-normalization-${slug}-${locale}.png',
  ]) {
    assert.ok(source.includes(marker), `missing deployed flagship smoke marker: ${marker}`);
  }

  assert.doesNotMatch(flagshipSource, /Current published candidate/);
  assert.doesNotMatch(flagshipSource, /product-owner retest/);
  assert.doesNotMatch(flagshipSource, /0\.1\.23\+1\.21\.1/);
  assert.doesNotMatch(flagshipSource, /page\.locator\(['"]main['"]\)\.innerText/);
  assert.match(flagshipSource, /documentContent\.waitFor\(\{state: 'visible', timeout: 10000\}\)/);
  assert.match(flagshipSource, /data-project-status/);
  assert.match(flagshipSource, /data-project-evidence/);
  assert.match(flagshipSource, /tr-project-timeline__item--current/);
  assert.match(source, /EXPECTED_DEPLOYED_SHA/);
  assert.match(source, /link\[rel="canonical"\]/);
  assert.match(source, /link\[rel="alternate"\]/);
  assert.match(source, /page\.screenshot/);
});

test('deployment-only P3.4A Note smoke covers route content feed and generated search', () => {
  assert.ok(fs.existsSync(DEPLOYMENT_NOTE_SMOKE), 'missing deployment-only P3.4A Note smoke');
  assert.ok(fs.existsSync(ROUTES), 'missing live production route contract');
  const noteSource = fs.readFileSync(DEPLOYMENT_NOTE_SMOKE, 'utf8');
  const source = `${fs.readFileSync(ROUTES, 'utf8')}\n${noteSource}`;

  for (const marker of [
    'notes/deployment-success-is-not-production-verification/',
    'Почему успешный deployment ещё не означает production verification',
    'main.dc-doc-page__content',
    'repository readiness',
    'generated artifact',
    'GitHub Pages deployment',
    'Production Live Smoke',
    'exact deployed SHA',
    'PR #119',
    'PR #120',
    'search-engine observation',
    'deployment production verification',
    'deployment-verification-note-production-summary.json',
  ]) {
    assert.ok(source.includes(marker), `missing deployed P3.4A smoke marker: ${marker}`);
  }

  assert.doesNotMatch(noteSource, /page\.locator\(['"]main['"]\)\.innerText/);
  assert.match(noteSource, /documentContent\.waitFor\(\{state: 'visible', timeout: 10000\}\)/);
  assert.match(source, /EXPECTED_DEPLOYED_SHA/);
  assert.match(source, /link\[rel="canonical"\]/);
  assert.match(source, /meta\[property="og:url"\]/);
  assert.match(source, /feed\.xml/);
  assert.match(source, /page\.screenshot/);
});

test('live production smoke covers domain, projected routes, legacy compatibility, feed, search and link policy', () => {
  assert.ok(fs.existsSync(SMOKE), 'missing live production smoke script');
  assert.ok(fs.existsSync(ROUTES), 'missing live production route contract');
  const source = `${fs.readFileSync(ROUTES, 'utf8')}\n${fs.readFileSync(SMOKE, 'utf8')}`;

  for (const marker of [
    'https://trueruslan.ru/',
    'https://www.trueruslan.ru/',
    "const NOTE_PATH = 'notes/restart-persistence-is-a-product-contract/'",
    "const LEGACY_NOTE_DIRECTORY_PATH = 'landing/notes/restart-persistence-is-a-product-contract/'",
    'restart-persistence-is-a-product-contract.html',
    'feed.xml',
    '_search/ru/',
    'persistence contract',
    'static.cloudflareinsights.com/beacon.min.js',
    'true-ruslan.github.io/trueruslan-landing',
    'link[rel="canonical"]',
    'meta[property="og:url"]',
    'target',
    'noopener',
    'noreferrer',
  ]) {
    assert.ok(source.includes(marker), `missing live smoke marker: ${marker}`);
  }

  assert.match(source, /production-artifacts/);
  assert.match(source, /EXPECTED_DEPLOYED_SHA/);
  assert.match(source, /EXPECT_PROJECTED_PUBLIC_ROUTES/);
  assert.match(source, /page\.screenshot/);
  assert.match(source, /writeFileSync/);
  assert.match(source, /queryPreserved/);
  assert.match(source, /fragmentPreserved/);
});
