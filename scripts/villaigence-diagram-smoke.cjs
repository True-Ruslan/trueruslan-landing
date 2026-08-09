const {requireQualityTool, launchChromium} = require('./quality-harness/tools.cjs');
const {startStaticServer} = require('./quality-harness/static-server.cjs');
const {artifactPath, ensureArtifactsDir, writeJsonArtifact} = require('./quality-harness/evidence.cjs');

const PORT = Number(process.env.VILLAIGENCE_DIAGRAM_SMOKE_PORT || 4188);
const {chromium} = requireQualityTool('playwright', 'VillAIgence diagram smoke');
const SOURCE_PATH = '/assets/diagrams/villaigence-authority-and-acceptance.svg';
const TARGETS = {
  cyan: {rgb: [103, 232, 249], minimum: 200},
  violet: {rgb: [167, 139, 250], minimum: 200},
  green: {rgb: [52, 211, 153], minimum: 100},
  background: {rgb: [7, 13, 24], minimum: 5000},
};

async function main() {
  ensureArtifactsDir();
  const server = await startStaticServer({port: PORT});
  let browser;
  try {
    browser = await launchChromium(chromium);
    const page = await browser.newPage({viewport: {width: 1280, height: 840}, colorScheme: 'dark'});
    const projectResponse = await page.goto(`${server.baseUrl}/projects/livingworld/`, {waitUntil: 'networkidle'});
    if (!projectResponse?.ok()) throw new Error(`VillAIgence page returned HTTP ${projectResponse?.status() ?? 'none'}`);

    const sourceUrl = `${server.baseUrl}${SOURCE_PATH}`;
    const response = await page.request.get(sourceUrl);
    if (!response.ok()) throw new Error(`VillAIgence diagram returned HTTP ${response.status()}`);
    if (!String(response.headers()['content-type'] || '').includes('image/svg+xml')) {
      throw new Error(`VillAIgence diagram content type is ${response.headers()['content-type'] || 'missing'}`);
    }

    await page.evaluate((source) => {
      document.body.replaceChildren();
      Object.assign(document.body.style, {margin: '0', padding: '20px', background: '#070D18'});
      const image = document.createElement('img');
      image.id = 'villaigence-diagram-under-test';
      image.src = source;
      image.alt = '';
      image.width = 1200;
      image.height = 760;
      image.style.display = 'block';
      document.body.append(image);
    }, sourceUrl);

    const image = page.locator('#villaigence-diagram-under-test');
    await image.waitFor({state: 'visible'});
    await page.waitForFunction(() => {
      const node = document.querySelector('#villaigence-diagram-under-test');
      return Boolean(node?.complete && node.naturalWidth === 1200 && node.naturalHeight === 760);
    });

    const sampled = await page.evaluate(async ({source, targets}) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 760;
      const context = canvas.getContext('2d', {willReadFrequently: true});
      context.drawImage(image, 0, 0, 1200, 760);
      const pixels = context.getImageData(0, 0, 1200, 760).data;
      const counts = {};
      for (const [name, target] of Object.entries(targets)) {
        let count = 0;
        for (let index = 0; index < pixels.length; index += 4) {
          if (
            Math.abs(pixels[index] - target.rgb[0]) <= 10
            && Math.abs(pixels[index + 1] - target.rgb[1]) <= 10
            && Math.abs(pixels[index + 2] - target.rgb[2]) <= 10
            && pixels[index + 3] >= 245
          ) count += 1;
        }
        counts[name] = count;
      }
      return {naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, counts};
    }, {source: sourceUrl, targets: TARGETS});

    for (const [name, target] of Object.entries(TARGETS)) {
      if ((sampled.counts[name] || 0) < target.minimum) {
        throw new Error(`${name} paint has ${sampled.counts[name] || 0} pixels; expected at least ${target.minimum}`);
      }
    }

    await image.screenshot({path: artifactPath('villaigence-authority-and-acceptance.png'), animations: 'disabled'});
    writeJsonArtifact('villaigence-diagram-summary.json', sampled);
    console.log(`VillAIgence diagram smoke passed: ${JSON.stringify(sampled)}`);
  } finally {
    if (browser) await browser.close();
    await server.stop();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
