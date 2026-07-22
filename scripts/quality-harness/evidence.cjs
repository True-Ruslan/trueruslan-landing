const fs = require('node:fs');
const path = require('node:path');

const {ARTIFACTS_DIR} = require('./paths.cjs');

function ensureArtifactsDir() {
  fs.mkdirSync(ARTIFACTS_DIR, {recursive: true});
  return ARTIFACTS_DIR;
}

function artifactPath(name) {
  return path.join(ARTIFACTS_DIR, name);
}

function screenshotOptions(overrides = {}) {
  return {
    fullPage: true,
    animations: 'disabled',
    ...overrides,
  };
}

async function captureScreenshot(page, name, overrides = {}) {
  ensureArtifactsDir();
  await page.screenshot({
    ...screenshotOptions(overrides),
    path: artifactPath(name),
  });
}

function writeJsonArtifact(name, value) {
  ensureArtifactsDir();
  const target = artifactPath(name);
  fs.writeFileSync(target, JSON.stringify(value, null, 2));
  return target;
}

function writeTextArtifact(name, value) {
  ensureArtifactsDir();
  const target = artifactPath(name);
  fs.writeFileSync(target, String(value));
  return target;
}

module.exports = {
  ensureArtifactsDir,
  artifactPath,
  screenshotOptions,
  captureScreenshot,
  writeJsonArtifact,
  writeTextArtifact,
};
