import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_TEMPLATE = path.join(ROOT, 'templates', 'index.html');
const DEFAULT_OUTPUT = path.join(ROOT, 'docs-html', 'index.html');

export function renderStandaloneHome(template, siteUrl) {
  const normalizedSiteUrl = siteUrl.trim().replace(/\/$/, '');
  if (!normalizedSiteUrl) {
    throw new Error('siteUrl is required to render the standalone homepage.');
  }

  return template.replaceAll('{{SITE_URL}}', normalizedSiteUrl);
}

export function writeStandaloneHome({
  templatePath = DEFAULT_TEMPLATE,
  outputPath = DEFAULT_OUTPUT,
  siteUrl,
} = {}) {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Standalone homepage template not found: ${templatePath}`);
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const html = renderStandaloneHome(template, siteUrl);
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, html, 'utf8');
  return outputPath;
}
