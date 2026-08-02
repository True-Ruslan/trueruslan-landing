const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {artifactPath, ensureArtifactsDir, writeJsonArtifact} = require('./quality-harness/evidence.cjs');

const PORT = Number(process.env.NODE_ZERO_DIAGRAM_SMOKE_PORT || 4185);
const {chromium} = requireQualityTool('playwright', 'NODE ZERO diagram smoke');

const TARGETS = Object.freeze({
  primary: [244, 247, 251],
  secondaryArchitecture: [156, 169, 184],
  secondaryFlow: [156, 171, 188],
  cyan: [76, 201, 240],
  violet: [139, 92, 246],
  green: [74, 222, 128],
  surface: [17, 21, 28],
});

const DIAGRAMS = Object.freeze([
  {
    name: 'architecture',
    alt: 'NODE ZERO vertical-slice architecture',
    width: 1200,
    height: 720,
    targets: {
      primary: {rgb: TARGETS.primary, minimum: 500},
      secondary: {rgb: TARGETS.secondaryArchitecture, minimum: 500},
      cyan: {rgb: TARGETS.cyan, minimum: 300},
      violet: {rgb: TARGETS.violet, minimum: 300},
      green: {rgb: TARGETS.green, minimum: 200},
      surface: {rgb: TARGETS.surface, minimum: 5000},
    },
  },
  {
    name: 'system-flow',
    alt: 'NODE ZERO gameplay and system-state flow',
    width: 1200,
    height: 620,
    targets: {
      primary: {rgb: TARGETS.primary, minimum: 300},
      secondary: {rgb: TARGETS.secondaryFlow, minimum: 300},
      cyan: {rgb: TARGETS.cyan, minimum: 200},
      violet: {rgb: TARGETS.violet, minimum: 200},
      green: {rgb: TARGETS.green, minimum: 200},
      surface: {rgb: TARGETS.surface, minimum: 5000},
    },
  },
]);

async function sampleDiagram(page, imageLocator, diagram) {
  const source = await imageLocator.evaluate((image) => image.currentSrc || image.src);
  const result = await page.evaluate(async ({sourceUrl, width, height, targets}) => {
    const image = new Image();
    image.src = sourceUrl;
    await new Promise((resolve, reject) => {
      if (image.complete && image.naturalWidth > 0) {
        resolve();
        return;
      }
      image.addEventListener('load', resolve, {once: true});
      image.addEventListener('error', () => reject(new Error(`Unable to load ${sourceUrl}`)), {once: true});
    });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', {willReadFrequently: true});
    context.drawImage(image, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height).data;
    const tolerance = 10;
    const counts = {};

    for (const [name, target] of Object.entries(targets)) {
      let count = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (
          Math.abs(pixels[index] - target.rgb[0]) <= tolerance
          && Math.abs(pixels[index + 1] - target.rgb[1]) <= tolerance
          && Math.abs(pixels[index + 2] - target.rgb[2]) <= tolerance
          && pixels[index + 3] >= 245
        ) {
          count += 1;
        }
      }
      counts[name] = count;
    }

    return {
      sourceUrl,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      sampledWidth: width,
      sampledHeight: height,
      counts,
    };
  }, {
    sourceUrl: source,
    width: diagram.width,
    height: diagram.height,
    targets: diagram.targets,
  });

  for (const [name, target] of Object.entries(diagram.targets)) {
    const actual = result.counts[name] || 0;
    if (actual < target.minimum) {
      throw new Error(`${diagram.name}: ${name} paint has ${actual} sampled pixels; expected at least ${target.minimum}`);
    }
  }

  return result;
}

async function main() {
  ensureArtifactsDir();
  const server = await startStaticServer({port: PORT});
  let browser;
  try {
    browser = await launchChromium(chromium);
    const page = await browser.newPage({viewport: {width: 1440, height: 1100}, colorScheme: 'dark'});
    const response = await page.goto(`${server.baseUrl}/landing/projects/node-zero.html`, {waitUntil: 'networkidle'});
    if (!response?.ok()) throw new Error(`NODE ZERO page returned HTTP ${response?.status() ?? 'none'}`);

    const results = [];
    for (const diagram of DIAGRAMS) {
      const image = page.getByAltText(diagram.alt, {exact: true});
      await image.waitFor({state: 'visible'});
      await image.scrollIntoViewIfNeeded();
      await page.waitForFunction((alt) => {
        const candidate = [...document.images].find((item) => item.alt === alt);
        return Boolean(candidate?.complete && candidate.naturalWidth > 0);
      }, diagram.alt);

      const sampled = await sampleDiagram(page, image, diagram);
      await image.screenshot({path: artifactPath(`node-zero-${diagram.name}.png`), animations: 'disabled'});
      results.push({name: diagram.name, ...sampled});
    }

    writeJsonArtifact('node-zero-diagrams-summary.json', results);
    console.log(`NODE ZERO diagram smoke passed for ${results.length} diagram(s).`);
  } finally {
    if (browser) await browser.close();
    await server.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
