const {writeJsonArtifact} = require('./evidence.cjs');

async function measureHorizontalOverflow(page) {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const documentWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
    return {
      viewportWidth,
      documentWidth,
      overflow: Math.max(0, documentWidth - viewportWidth),
    };
  });
}

async function assertNoHorizontalOverflow(page, label, tolerance = 2) {
  const result = await measureHorizontalOverflow(page);
  if (result.overflow > tolerance) {
    throw new Error(
      `${label}: horizontal overflow ${result.overflow}px `
      + `(${result.documentWidth}px > ${result.viewportWidth}px)`,
    );
  }
  return result;
}

async function measureHorizontalScroll(page) {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const scrollWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
    window.scrollTo(10000, window.scrollY);
    const maxScrollX = window.scrollX;
    window.scrollTo(0, window.scrollY);
    return {viewportWidth, scrollWidth, maxScrollX};
  });
}

function blockingAxeViolations(axeResult, impacts = ['serious', 'critical']) {
  const allowed = new Set(impacts);
  return (axeResult?.violations || []).filter((violation) => allowed.has(violation.impact));
}

async function assertNoBlockingAxe({
  page,
  label,
  AxeBuilder,
  include,
  exclude,
  artifactName,
  impacts = ['serious', 'critical'],
}) {
  let builder = new AxeBuilder({page});
  if (include) builder = builder.include(include);
  if (exclude) builder = builder.exclude(exclude);

  const result = await builder.analyze();
  const blocking = blockingAxeViolations(result, impacts);

  if (artifactName) {
    writeJsonArtifact(artifactName, {violations: result.violations});
  }

  if (blocking.length) {
    const details = blocking
      .map((violation) => `${violation.id} (${violation.impact}): ${violation.help}`)
      .join('; ');
    throw new Error(`${label}: accessibility violations: ${details}`);
  }

  return {violations: result.violations, blocking};
}

module.exports = {
  measureHorizontalOverflow,
  assertNoHorizontalOverflow,
  measureHorizontalScroll,
  blockingAxeViolations,
  assertNoBlockingAxe,
};
