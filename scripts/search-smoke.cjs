const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {createScenarioPage} = require('./quality-harness/browser.cjs');
const {installPageDiagnostics} = require('./quality-harness/diagnostics.cjs');
const {assertNoHorizontalOverflow, blockingAxeViolations} = require('./quality-harness/assertions.cjs');
const {captureScreenshot, writeJsonArtifact, writeTextArtifact} = require('./quality-harness/evidence.cjs');
const {VIEWPORTS} = require('./quality-harness/scenarios.cjs');

const PORT = Number(process.env.SEARCH_SMOKE_PORT || 4174);
const {chromium} = requireQualityTool('playwright');
const {default: AxeBuilder} = requireQualityTool('@axe-core/playwright');

async function assertBackControl(page, baseUrl, name) {
  const back = page.locator('[data-tr-search-back="true"]');
  if (await back.count() !== 1) throw new Error(`${name}: expected exactly one search back control`);
  await back.waitFor({state: 'visible', timeout: 5000});

  const label = (await back.innerText()).trim();
  if (label !== 'Назад') throw new Error(`${name}: unexpected search back label: ${label}`);

  const href = await back.getAttribute('href');
  const expectedHome = new URL('../../', page.url());
  const actualHome = new URL(href, page.url());
  if (actualHome.origin !== new URL(baseUrl).origin || actualHome.pathname !== expectedHome.pathname) {
    throw new Error(`${name}: search back fallback mismatch: ${actualHome.href}`);
  }

  const box = await back.boundingBox();
  if (!box || box.width < 40 || box.height < 40) {
    throw new Error(`${name}: search back target is smaller than 40x40`);
  }
}

async function assertSearchControlVisuals(page, name) {
  const field = page.locator('.tr-search-input-shell').first();
  const input = page.locator('.tr-search-input').first();
  const button = page.locator('.tr-search-button').first();
  const buttonText = button.locator('.g-button__text').first();

  await Promise.all([
    field.waitFor({state: 'visible', timeout: 5000}),
    input.waitFor({state: 'visible', timeout: 5000}),
    button.waitFor({state: 'visible', timeout: 5000}),
    buttonText.waitFor({state: 'visible', timeout: 5000}),
  ]);

  const idle = await page.evaluate(() => {
    const field = document.querySelector('.tr-search-input-shell');
    const input = document.querySelector('.tr-search-input');
    const button = document.querySelector('.tr-search-button');
    const text = button?.querySelector('.g-button__text');
    if (!field || !input || !button || !text) return null;

    const fieldStyle = getComputedStyle(field);
    const inputStyle = getComputedStyle(input);
    const buttonStyle = getComputedStyle(button);
    const buttonBefore = getComputedStyle(button, '::before');
    const buttonAfter = getComputedStyle(button, '::after');
    const fieldBefore = getComputedStyle(field, '::before');
    const fieldAfter = getComputedStyle(field, '::after');
    const buttonRect = button.getBoundingClientRect();
    const textRect = text.getBoundingClientRect();

    return {
      fieldBorderWidth: fieldStyle.borderTopWidth,
      inputBorderWidths: [
        inputStyle.borderTopWidth,
        inputStyle.borderRightWidth,
        inputStyle.borderBottomWidth,
        inputStyle.borderLeftWidth,
      ],
      inputBoxShadow: inputStyle.boxShadow,
      inputOutlineStyle: inputStyle.outlineStyle,
      buttonDisplay: buttonStyle.display,
      buttonAlignItems: buttonStyle.alignItems,
      buttonJustifyContent: buttonStyle.justifyContent,
      buttonBackdropFilter: buttonStyle.backdropFilter || buttonStyle.webkitBackdropFilter,
      buttonFilter: buttonStyle.filter,
      buttonBefore: {
        content: buttonBefore.content,
        backgroundImage: buttonBefore.backgroundImage,
        boxShadow: buttonBefore.boxShadow,
      },
      buttonAfter: {
        content: buttonAfter.content,
        backgroundImage: buttonAfter.backgroundImage,
        boxShadow: buttonAfter.boxShadow,
      },
      fieldBefore: {
        content: fieldBefore.content,
        backgroundImage: fieldBefore.backgroundImage,
        boxShadow: fieldBefore.boxShadow,
      },
      fieldAfter: {
        content: fieldAfter.content,
        backgroundImage: fieldAfter.backgroundImage,
        boxShadow: fieldAfter.boxShadow,
      },
      centerDeltaX: Math.abs((buttonRect.left + buttonRect.width / 2) - (textRect.left + textRect.width / 2)),
      centerDeltaY: Math.abs((buttonRect.top + buttonRect.height / 2) - (textRect.top + textRect.height / 2)),
    };
  });

  if (!idle) throw new Error(`${name}: search control metrics unavailable`);
  if (idle.fieldBorderWidth !== '1px') {
    throw new Error(`${name}: search field must own the single visible 1px border, got ${idle.fieldBorderWidth}`);
  }
  if (idle.inputBorderWidths.some((width) => width !== '0px')) {
    throw new Error(`${name}: search input must not draw an inner border: ${idle.inputBorderWidths.join(', ')}`);
  }
  if (idle.inputBoxShadow !== 'none') {
    throw new Error(`${name}: search input must not draw an inner shadow: ${idle.inputBoxShadow}`);
  }
  if (!idle.buttonDisplay.includes('flex') || idle.buttonAlignItems !== 'center' || idle.buttonJustifyContent !== 'center') {
    throw new Error(`${name}: search button is not flex-centered: ${JSON.stringify(idle)}`);
  }
  if (idle.centerDeltaX > 1 || idle.centerDeltaY > 1) {
    throw new Error(`${name}: search button text is off-center by ${idle.centerDeltaX.toFixed(2)}px/${idle.centerDeltaY.toFixed(2)}px`);
  }
  if (!['none', ''].includes(idle.buttonBackdropFilter) || idle.buttonFilter !== 'none') {
    throw new Error(`${name}: search button uses a blur/filter that can cause shimmer: ${JSON.stringify(idle)}`);
  }

  const pseudoIsNeutral = (pseudo) => {
    const contentNeutral = ['none', 'normal', '""'].includes(pseudo.content);
    return contentNeutral && pseudo.backgroundImage === 'none' && pseudo.boxShadow === 'none';
  };
  if (![idle.buttonBefore, idle.buttonAfter, idle.fieldBefore].every(pseudoIsNeutral)) {
    throw new Error(`${name}: inherited pseudo-elements still draw duplicate/ripple layers: ${JSON.stringify(idle)}`);
  }
  if (!idle.fieldAfter.content.includes('/')
    || !idle.fieldAfter.content.includes('⌘K')
    || idle.fieldAfter.backgroundImage !== 'none'
    || idle.fieldAfter.boxShadow !== 'none') {
    throw new Error(`${name}: search shortcut hint is not the only intentional field pseudo-element: ${JSON.stringify(idle)}`);
  }

  await input.focus();
  const focused = await page.evaluate(() => {
    const field = document.querySelector('.tr-search-input-shell');
    const input = document.querySelector('.tr-search-input');
    if (!field || !input) return null;
    const fieldStyle = getComputedStyle(field);
    const inputStyle = getComputedStyle(input);
    return {
      fieldBorderColor: fieldStyle.borderTopColor,
      fieldBoxShadow: fieldStyle.boxShadow,
      inputOutlineStyle: inputStyle.outlineStyle,
      inputBoxShadow: inputStyle.boxShadow,
    };
  });
  if (!focused || focused.inputOutlineStyle !== 'none' || focused.inputBoxShadow !== 'none') {
    throw new Error(`${name}: focused search input still draws a second contour: ${JSON.stringify(focused)}`);
  }
}

async function assertSameOriginBackNavigation(page, baseUrl) {
  const sourcePath = '/landing/projects.html';
  const sourceUrl = `${baseUrl}${sourcePath}`;
  const searchUrl = `${baseUrl}/_search/ru/index.html`;

  const sourceResponse = await page.goto(sourceUrl, {waitUntil: 'networkidle'});
  if (!sourceResponse?.ok()) throw new Error('search back: source page unavailable');
  await page.evaluate((target) => window.location.assign(target), searchUrl);
  await page.waitForURL(searchUrl);
  await page.locator('[data-tr-search-back="true"]').waitFor({state: 'visible'});
  await page.locator('[data-tr-search-back="true"]').click();
  await page.waitForURL(sourceUrl);
}

async function runScenario(browser, baseUrl, name, viewport) {
  const runtime = await createScenarioPage(browser, {viewport, colorScheme: 'dark'});
  const {page} = runtime;
  const diagnostics = installPageDiagnostics(page, {
    baseUrl,
    ignoredRequestFailureReasons: ['ERR_ABORTED'],
  });

  try {
    const response = await page.goto(`${baseUrl}/_search/ru/index.html`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`${name}: search navigation HTTP ${response?.status() ?? 'none'}`);

    await page.waitForTimeout(700);
    await captureScreenshot(page, `search-${name}.png`);

    const rootHtml = await page.locator('#root').innerHTML().catch(() => '');
    writeTextArtifact(`search-${name}-root.html`, rootHtml);

    const bodyText = (await page.locator('body').innerText()).trim();
    if (!bodyText) throw new Error(`${name}: generated search page rendered an empty body`);

    const searchInput = page.locator('.dc-search-page__search-field input, input[placeholder="Поиск"], input.tr-search-input').first();
    await searchInput.waitFor({state: 'visible', timeout: 5000});

    const marker = await page.locator('html').getAttribute('data-tr-search-enhanced');
    if (marker !== 'true') {
      throw new Error(`${name}: progressive search enhancement marker missing; pageErrors=${diagnostics.pageErrors.join(' | ') || 'none'}`);
    }

    await assertBackControl(page, baseUrl, name);
    await assertSearchControlVisuals(page, name);

    const stylesheetCount = await page.locator('link[href$="_assets/style/search.css"]').count();
    const scriptCount = await page.locator('script[src$="_assets/script/search-ui.js"]').count();
    if (stylesheetCount !== 1 || scriptCount !== 1) {
      throw new Error(`${name}: branded search resources missing or duplicated (${stylesheetCount} css, ${scriptCount} js)`);
    }

    await page.locator('body').click({position: {x: 4, y: 4}}).catch(() => {});
    await page.keyboard.press('/');
    const focused = await searchInput.evaluate((input) => document.activeElement === input);
    if (!focused) throw new Error(`${name}: / keyboard shortcut did not focus search input`);

    const overflow = (await assertNoHorizontalOverflow(page, name)).overflow;

    const axe = await new AxeBuilder({page}).analyze();
    const serious = blockingAxeViolations(axe);
    if (serious.length) throw new Error(`${name}: Axe serious/critical violations: ${serious.map((item) => item.id).join(', ')}`);

    if (name === 'desktop') await assertSameOriginBackNavigation(page, baseUrl);
    diagnostics.assertClean(name);

    return {
      name,
      bodyLength: bodyText.length,
      rootHtmlLength: rootHtml.length,
      overflow,
      seriousAxeViolations: serious.length,
      enhanced: marker === 'true',
      backNavigation: true,
      controlVisuals: true,
    };
  } finally {
    await runtime.close();
  }
}

async function main() {
  const serverRuntime = await startStaticServer({port: PORT});
  let browser;

  try {
    browser = await launchChromium(chromium);
    const results = [];
    results.push(await runScenario(browser, serverRuntime.baseUrl, 'desktop', {width: 1280, height: 900}));
    results.push(await runScenario(browser, serverRuntime.baseUrl, 'mobile', VIEWPORTS.mobile));
    writeJsonArtifact('search-summary.json', results);
    console.log(`Generated local-search browser smoke passed for ${results.length} scenario(s).`);
  } finally {
    if (browser) await browser.close();
    await serverRuntime.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
