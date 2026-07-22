const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');

const {TOOLS_DIR} = require('./paths.cjs');

function requireQualityTool(name, label = 'Quality tool') {
  const toolPath = path.join(TOOLS_DIR, ...name.split('/'));
  try {
    return require(toolPath);
  } catch (error) {
    throw new Error(`${label} ${name} is not installed in .quality-tools: ${error.message}`);
  }
}

function findChrome() {
  const explicit = process.env.CHROME_PATH;
  if (explicit && fs.existsSync(explicit)) return explicit;

  for (const command of ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser']) {
    try {
      const resolved = execFileSync('which', [command], {encoding: 'utf8'}).trim();
      if (resolved) return resolved;
    } catch {
      // Try the next known executable.
    }
  }

  throw new Error('Chrome/Chromium executable was not found on the CI runner.');
}

async function launchChromium(chromium, options = {}) {
  const {
    channel = 'chrome',
    executablePath,
    headless = true,
    args = ['--no-sandbox'],
    ...rest
  } = options;

  try {
    return await chromium.launch({channel, headless, args, ...rest});
  } catch {
    const resolvedExecutable = executablePath || findChrome();
    return chromium.launch({executablePath: resolvedExecutable, headless, args, ...rest});
  }
}

module.exports = {
  requireQualityTool,
  findChrome,
  launchChromium,
};
