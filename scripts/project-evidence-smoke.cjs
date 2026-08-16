const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {captureScreenshot, writeJsonArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.PROJECT_EVIDENCE_SMOKE_PORT || 4183);
const {chromium} = requireQualityTool('playwright', 'Project Evidence smoke tool');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright', 'Project Evidence smoke tool');

const PROJECTS = [
  {
    project: 'vlezet',
    route: '/projects/vlezet/',
    status: 'verified',
    label: 'ПРОВЕРЕНО',
    borderStyle: 'solid',
    signals: 14,
    stateCounts: {merged: 9, failed: 1, unavailable: 3, pending: 1},
    requiredText: [
      'M7.8B',
      'Automatic M7.8C recognition PR #42',
      'product-owner usefulness FAIL',
      'closed unmerged',
      'Real-fixture recognition R&D PR #44',
      'Hybrid proposal recovery R&D PR #45',
      'Assisted Tracing design gate PR #52 — closed unmerged',
      'M8.1 precision drawing PR #85',
      'M8.2 precision drawing and structural editing PR #87',
      'M8.2 post-merge truth reconciliation PR #88',
      'Testing Policy Phase A PR #89',
      'P0 IndexedDB persistence remediation PR #90',
      'P0 post-merge truth / M8.3 handoff PR #91',
      'M8.3 Precision Reference Calibration Draft PR #92',
      'TDD RED',
      'not product-owner accepted, merged or released',
    ],
    requiredHrefs: [
      'https://github.com/True-Ruslan/vlezet/pull/42',
      'https://github.com/True-Ruslan/vlezet/pull/44',
      'https://github.com/True-Ruslan/vlezet/pull/45',
      'https://github.com/True-Ruslan/vlezet/pull/52',
      'https://github.com/True-Ruslan/vlezet/pull/85',
      'https://github.com/True-Ruslan/vlezet/pull/87',
      'https://github.com/True-Ruslan/vlezet/pull/88',
      'https://github.com/True-Ruslan/vlezet/pull/89',
      'https://github.com/True-Ruslan/vlezet/pull/90',
      'https://github.com/True-Ruslan/vlezet/pull/91',
      'https://github.com/True-Ruslan/vlezet/pull/92',
    ],
  },
  {
    project: 'livingworld',
    route: '/projects/livingworld/',
    status: 'verified',
    label: 'ПРОВЕРЕНО',
    borderStyle: 'solid',
    signals: 26,
    stateCounts: {accepted: 2, failed: 2, merged: 18, published: 4},
    requiredText: [
      'PR #103',
      'PR #104',
      'PR #105',
      'PR #110',
      '0.2.0+1.21.1',
      '7 PASS / 0 FAIL',
      'VAI-M2-INST-005',
      'VAI-CONCUR-004',
      'Controlled Semantic Memory BELIEF admission PR #123',
      'PLAYER_TOLD BELIEF candidate extraction PR #125',
      'Causal NPC↔NPC social mutation PR #153',
      'Personality / social snapshot PR #155',
      'Personality/social dialogue integration PR #158',
      '0.3 dialogue integration state reconciliation PR #159',
      '0.3 release convergence contract PR #160',
      'Official 0.3.1+1.21.1 corrective release',
      '0.3.1 targeted Memory 2.0 recall correction PR #165',
      '0.3.1 installed corrective acceptance handoff PR #167',
      'Installed 0.3.1 VAI-PCM-MULTI-001 corrective canary',
      '0.3.2 targeted recall ranking correction PR #169',
      'Official 0.3.2+1.21.1 corrective release',
      '0.3.2 installed corrective test plan PR #171',
      'exact installed corrective VAI-PCM-MULTI-001 canary PENDING',
      'SYSTEM_OBSERVED',
      '0.4 stays blocked',
    ],
    requiredHrefs: [
      'https://github.com/True-Ruslan/villAIgence/pull/105',
      'https://github.com/True-Ruslan/villAIgence/pull/110',
      'https://github.com/True-Ruslan/villAIgence/pull/120',
      'https://github.com/True-Ruslan/villAIgence/pull/123',
      'https://github.com/True-Ruslan/villAIgence/pull/125',
      'https://github.com/True-Ruslan/villAIgence/pull/153',
      'https://github.com/True-Ruslan/villAIgence/pull/155',
      'https://github.com/True-Ruslan/villAIgence/pull/158',
      'https://github.com/True-Ruslan/villAIgence/pull/159',
      'https://github.com/True-Ruslan/villAIgence/pull/160',
      'https://github.com/True-Ruslan/villAIgence/releases/tag/0.3.1%2B1.21.1',
      'https://github.com/True-Ruslan/villAIgence/pull/165',
      'https://github.com/True-Ruslan/villAIgence/pull/167',
      'https://github.com/True-Ruslan/villAIgence/blob/1.21.1/docs/livingworld/VALIDATION_0.3.1_CORRECTIVE_INSTALLED.md',
      'https://github.com/True-Ruslan/villAIgence/pull/169',
      'https://github.com/True-Ruslan/villAIgence/releases/tag/0.3.2%2B1.21.1',
      'https://github.com/True-Ruslan/villAIgence/pull/171',
    ],
  },
  {
    project: 'node-zero',
    route: '/projects/node-zero/',
    status: 'stale',
    label: 'ТРЕБУЕТ ПЕРЕПРОВЕРКИ',
    borderStyle: 'dashed',
    signals: 3,
    stateCounts: {accepted: 1, pending: 1, unavailable: 1},
    requiredText: [
      'Unity production foundation acceptance',
      'Player foundation PR #9',
      'Stale-evidence review — no new private acceptance evidence',
    ],
  },
];

async function assertEvidence(page, expected, prefix) {
  const root = page.locator(`[data-project-evidence="${expected.project}"]`);
  if (await root.count() !== 1) throw new Error(`${prefix}: expected exactly one ${expected.project} evidence root`);
  if (!(await root.isVisible())) throw new Error(`${prefix}: ${expected.project} evidence root is not visible`);

  if (await root.getAttribute('data-evidence-status') !== expected.status) {
    throw new Error(`${prefix}: ${expected.project} trust status does not match ${expected.status}`);
  }
  const text = await root.textContent();
  if (!text?.includes(expected.label)) throw new Error(`${prefix}: ${expected.project} trust label is missing`);
  if (!text?.includes('Что подтверждает:')) throw new Error(`${prefix}: ${expected.project} bounded evidence scope is missing`);
  for (const requiredText of expected.requiredText || []) {
    if (!text?.includes(requiredText)) throw new Error(`${prefix}: ${expected.project} evidence text is missing ${requiredText}`);
  }

  if (expected.status !== 'verified') {
    if (await root.getAttribute('class').then((value) => value?.includes('tr-project-evidence--verified'))) {
      throw new Error(`${prefix}: ${expected.project} carries verified styling class`);
    }
  }

  const trustTreatment = await root.evaluate((element) => {
    const style = getComputedStyle(element);
    return {borderLeftStyle: style.borderLeftStyle, borderLeftWidth: style.borderLeftWidth};
  });
  if (trustTreatment.borderLeftStyle !== expected.borderStyle || Number.parseFloat(trustTreatment.borderLeftWidth) < 4) {
    throw new Error(`${prefix}: expected ${expected.borderStyle} >=4px trust border, got ${trustTreatment.borderLeftStyle} ${trustTreatment.borderLeftWidth}`);
  }

  const links = root.locator('a[href]');
  const renderedHrefs = [];
  for (let index = 0; index < await links.count(); index += 1) {
    const href = await links.nth(index).getAttribute('href');
    if (!href?.startsWith('https://')) throw new Error(`${prefix}: unsafe evidence link ${href}`);
    renderedHrefs.push(href);
  }
  for (const requiredHref of expected.requiredHrefs || []) {
    if (!renderedHrefs.includes(requiredHref)) {
      throw new Error(`${prefix}: ${expected.project} evidence link is missing ${requiredHref}`);
    }
  }

  const signalCount = await root.locator('[data-evidence-kind]').count();
  if (expected.signals !== undefined && signalCount !== expected.signals) {
    throw new Error(`${prefix}: expected ${expected.signals} evidence signals, got ${signalCount}`);
  }

  const renderedStateCounts = {};
  if (expected.stateCounts) {
    const renderedStates = await root.locator('.tr-project-evidence__signal-state').evaluateAll((nodes) => nodes.map((node) => node.textContent || ''));
    for (const [state, expectedCount] of Object.entries(expected.stateCounts)) {
      const count = renderedStates.filter((value) => value.includes(state)).length;
      renderedStateCounts[state] = count;
      if (count !== expectedCount) throw new Error(`${prefix}: expected state ${state} ${expectedCount} time(s), got ${count}`);
    }
  }

  return {
    signals: signalCount,
    stateCounts: renderedStateCounts,
    status: expected.status,
    trustBorder: trustTreatment,
  };
}

async function runEnhanced(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: VIEWPORTS.mobile, colorScheme: 'dark', reducedMotion: 'reduce'});
  const {page} = runtime;
  const results = {};

  try {
    for (const expected of PROJECTS) {
      const pageErrors = [];
      page.removeAllListeners('pageerror');
      page.on('pageerror', (error) => pageErrors.push(error.message));
      const response = await page.goto(`${baseUrl}${expected.route}`, {waitUntil: 'networkidle'});
      if (!response?.ok()) throw new Error(`enhanced:${expected.project}: navigation HTTP ${response?.status() ?? 'none'}`);
      await page.waitForSelector(`[data-project-evidence="${expected.project}"]`, {timeout: 5000});

      const evidence = await assertEvidence(page, expected, `enhanced:${expected.project}`);
      const overflow = (await assertNoHorizontalOverflow(page, `enhanced:${expected.project}:mobile`)).overflow;
      const axe = await new AxeBuilder({page}).include(`[data-project-evidence="${expected.project}"]`).analyze();
      const serious = blockingAxeViolations(axe);
      if (serious.length) throw new Error(`enhanced:${expected.project}: Axe serious/critical violations: ${serious.map((violation) => violation.id).join(', ')}`);
      if (pageErrors.length) throw new Error(`enhanced:${expected.project}: page errors: ${pageErrors.join('; ')}`);

      await captureScreenshot(page, `project-evidence-${expected.project}-mobile.png`);
      results[expected.project] = {...evidence, overflow, seriousAxeViolations: serious.length};
    }
    return results;
  } finally {
    await runtime.close();
  }
}

async function runNoJavaScript(browser, baseUrl) {
  const runtime = await createScenarioPage(browser, {viewport: {width: 1280, height: 800}, colorScheme: 'dark', javaScriptEnabled: false});
  const {page} = runtime;
  const results = {};

  try {
    for (const expected of PROJECTS) {
      const response = await page.goto(`${baseUrl}${expected.route}`, {waitUntil: 'load'});
      if (!response?.ok()) throw new Error(`no-js:${expected.project}: navigation HTTP ${response?.status() ?? 'none'}`);
      const evidence = await assertEvidence(page, expected, `no-js:${expected.project}`);
      const overflow = (await assertNoHorizontalOverflow(page, `no-js:${expected.project}:desktop`)).overflow;
      results[expected.project] = {...evidence, overflow};
    }
    return results;
  } finally {
    await runtime.close();
  }
}

async function main() {
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;
  try {
    browser = await launchChromium(chromium);
    const summary = {
      enhanced: await runEnhanced(browser, serverRuntime.baseUrl),
      noJavaScript: await runNoJavaScript(browser, serverRuntime.baseUrl),
    };
    writeJsonArtifact('project-evidence-summary.json', summary);
    console.log(`Project Evidence browser smoke passed: ${JSON.stringify(summary)}`);
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
