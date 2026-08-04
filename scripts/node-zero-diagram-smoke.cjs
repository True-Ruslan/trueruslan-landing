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
    path: '/assets/diagrams/node-zero-architecture.svg',
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
    path: '/assets/diagrams/node-zero-system-flow.svg',
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

async function mountDiagram(page, sourceUrl, diagram) {
  await page.evaluate(({source, width, height}) => {
    document.body.replaceChildren();
    Object.assign(document.documentElement.style, {
      background: '#090B10',
      colorScheme: 'dark',
    });
    Object.assign(document.body.style, {
      margin: '0',
      padding: '24px',
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'start center',
      background: '#090B10',
    });

    const image = document.createElement('img');
    image.id = 'node-zero-diagram-under-test';
    image.src = source;
    image.alt = '';
    image.width = width;
    image.height = height;
    image.style.display = 'block';
    image.style.width = `${width}px`;
    image.style.height = `${height}px`;
    image.style.maxWidth = 'none';
    document.body.append(image);
  }, {source: sourceUrl, width: diagram.width, height: diagram.height});

  const image = page.locator('#node-zero-diagram-under-test');
  await image.waitFor({state: 'visible'});
  await page.waitForFunction(() => {
    const candidate = document.querySelector('#node-zero-diagram-under-test');
    return Boolean(candidate?.complete && candidate.naturalWidth > 0);
  });
  return image;
}

async function sampleDiagram(page, sourceUrl, diagram) {
  const result = await page.evaluate(async ({source, width, height, targets}) => {
    const image = new Image();
    image.src = source;
    await new Promise((resolve, reject) => {
      if (image.complete && image.naturalWidth > 0) {
        resolve();
        return;
      }
      image.addEventListener('load', resolve, {once: true});
      image.addEventListener('error', () => reject(new Error(`Unable to load ${source}`)), {once: true});
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
      sourceUrl: source,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      sampledWidth: width,
      sampledHeight: height,
      counts,
    };
  }, {
    source: sourceUrl,
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
    const page = await browser.newPage({viewport: {width: 1280, height: 900}, colorScheme: 'dark'});

    const pageResponse = await page.goto(`${server.baseUrl}/landing/projects/node-zero/`, {waitUntil: 'networkidle'});
    if (!pageResponse?.ok()) throw new Error(`NODE ZERO page returned HTTP ${pageResponse?.status() ?? 'none'}`);

    const results = [];
    for (const diagram of DIAGRAMS) {
      const sourceUrl = `${server.baseUrl}${diagram.path}`;
      const assetResponse = await page.request.get(sourceUrl);
      if (!assetResponse.ok()) throw new Error(`${diagram.name}: asset returned HTTP ${assetResponse.status()}`);
      if (!String(assetResponse.headers()['content-type'] || '').includes('image/svg+xml')) {
        throw new Error(`${diagram.name}: unexpected content type ${assetResponse.headers()['content-type'] || 'none'}`);
      }

      const image = await mountDiagram(page, sourceUrl, diagram);
      const sampled = await sampleDiagram(page, sourceUrl, diagram);
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
