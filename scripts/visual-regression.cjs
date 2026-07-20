const fs = require('node:fs');
const path = require('node:path');

const {decodeBaselineSample} = require('./visual-baseline.cjs');

const ROOT = path.resolve(__dirname, '..');
const TOOLS_DIR = path.join(ROOT, '.quality-tools', 'node_modules');
const ARTIFACTS_DIR = path.join(ROOT, 'quality-artifacts');
const BASELINE_PATH = path.join(ROOT, 'tests', 'visual-baselines.json');

function requireTool(name) {
  try {
    return require(path.join(TOOLS_DIR, ...name.split('/')));
  } catch (error) {
    throw new Error(`Visual regression tool ${name} is not installed in .quality-tools: ${error.message}`);
  }
}

const {PNG} = requireTool('pngjs');

function sampleRgb(png, sampleSize) {
  const sampled = Buffer.alloc(sampleSize * sampleSize * 3);
  let offset = 0;

  for (let sampleY = 0; sampleY < sampleSize; sampleY += 1) {
    const y = Math.min(png.height - 1, Math.floor((sampleY + 0.5) * png.height / sampleSize));
    for (let sampleX = 0; sampleX < sampleSize; sampleX += 1) {
      const x = Math.min(png.width - 1, Math.floor((sampleX + 0.5) * png.width / sampleSize));
      const source = (png.width * y + x) * 4;
      sampled[offset++] = png.data[source];
      sampled[offset++] = png.data[source + 1];
      sampled[offset++] = png.data[source + 2];
    }
  }

  return sampled;
}

function dimensionDelta(actual, expected) {
  return Math.abs(actual - expected) / Math.max(1, expected);
}

function compareSample(actual, expected) {
  if (actual.length !== expected.length) {
    throw new Error(`Cannot compare visual samples with different lengths: ${actual.length} vs ${expected.length}.`);
  }

  let totalDelta = 0;
  let maxDelta = 0;

  for (let index = 0; index < actual.length; index += 1) {
    const delta = Math.abs(actual[index] - expected[index]);
    totalDelta += delta;
    maxDelta = Math.max(maxDelta, delta);
  }

  return {
    meanChannelDelta: totalDelta / actual.length,
    maxChannelDelta: maxDelta,
  };
}

function writeDiffPreview(name, actual, expected, sampleSize) {
  const diff = new PNG({width: sampleSize, height: sampleSize});

  for (let pixel = 0; pixel < sampleSize * sampleSize; pixel += 1) {
    const source = pixel * 3;
    const target = pixel * 4;
    diff.data[target] = Math.abs(actual[source] - expected[source]);
    diff.data[target + 1] = Math.abs(actual[source + 1] - expected[source + 1]);
    diff.data[target + 2] = Math.abs(actual[source + 2] - expected[source + 2]);
    diff.data[target + 3] = 255;
  }

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, `visual-diff-${name}`),
    PNG.sync.write(diff),
  );
}

function main() {
  const config = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  const failures = [];
  const results = [];
  const expectedSampleLength = config.sampleSize * config.sampleSize * 3;

  for (const [name, baseline] of Object.entries(config.baselines)) {
    const screenshotPath = path.join(ARTIFACTS_DIR, name);
    if (!fs.existsSync(screenshotPath)) {
      failures.push(`${name}: screenshot missing`);
      continue;
    }

    const png = PNG.sync.read(fs.readFileSync(screenshotPath));
    const actual = sampleRgb(png, config.sampleSize);
    let expected;

    try {
      expected = decodeBaselineSample(baseline, expectedSampleLength);
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
      continue;
    }

    const widthDelta = dimensionDelta(png.width, baseline.width);
    const heightDelta = dimensionDelta(png.height, baseline.height);
    const comparison = compareSample(actual, expected);

    const result = {
      name,
      actual: {width: png.width, height: png.height},
      baseline: {width: baseline.width, height: baseline.height},
      widthDeltaRatio: widthDelta,
      heightDeltaRatio: heightDelta,
      ...comparison,
    };
    results.push(result);

    const dimensionFailed = widthDelta > config.maxDimensionDeltaRatio
      || heightDelta > config.maxDimensionDeltaRatio;
    const visualFailed = comparison.meanChannelDelta > config.maxMeanChannelDelta;

    if (dimensionFailed || visualFailed) {
      writeDiffPreview(name, actual, expected, config.sampleSize);
      failures.push(
        `${name}: dimensions ${png.width}x${png.height} vs ${baseline.width}x${baseline.height}; `
        + `mean channel delta ${comparison.meanChannelDelta.toFixed(2)} (max ${config.maxMeanChannelDelta})`,
      );
    }
  }

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'visual-regression-summary.json'),
    JSON.stringify({config, results, failures}, null, 2),
  );

  for (const result of results) {
    console.log(
      `${result.name}: ${result.actual.width}x${result.actual.height}, mean channel delta ${result.meanChannelDelta.toFixed(2)}`,
    );
  }

  if (failures.length) {
    throw new Error(`Visual regression failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  }

  console.log(`Visual regression passed for ${results.length} screenshot(s).`);
}

try {
  main();
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}
