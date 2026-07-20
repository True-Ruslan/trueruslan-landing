import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  renderCurrentlyBuilding,
  renderEngineeringGraph,
  validatePortfolioData,
} from './portfolio-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_TEMPLATE = path.join(ROOT, 'templates', 'index.html');
const DEFAULT_OUTPUT = path.join(ROOT, 'docs-html', 'index.html');
const DEFAULT_PORTFOLIO_DATA = path.join(ROOT, 'data', 'portfolio.json');

export function renderStandaloneHome(template, siteUrl, portfolioData = null) {
  const normalizedSiteUrl = siteUrl.trim().replace(/\/$/, '');
  if (!normalizedSiteUrl) {
    throw new Error('siteUrl is required to render the standalone homepage.');
  }

  let html = template.replaceAll('{{SITE_URL}}', normalizedSiteUrl);
  const requiresPortfolioData = html.includes('{{CURRENTLY_BUILDING}}') || html.includes('{{ENGINEERING_GRAPH}}');

  if (requiresPortfolioData) {
    if (!portfolioData) {
      throw new Error('portfolioData is required when the homepage template contains portfolio placeholders.');
    }
    validatePortfolioData(portfolioData);
    html = html
      .replaceAll('{{CURRENTLY_BUILDING}}', renderCurrentlyBuilding(portfolioData.currentProjects))
      .replaceAll('{{ENGINEERING_GRAPH}}', renderEngineeringGraph(portfolioData.graphTopics));
  }

  return html;
}

export function writeStandaloneHome({
  templatePath = DEFAULT_TEMPLATE,
  outputPath = DEFAULT_OUTPUT,
  portfolioDataPath = DEFAULT_PORTFOLIO_DATA,
  siteUrl,
} = {}) {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Standalone homepage template not found: ${templatePath}`);
  }
  if (!fs.existsSync(portfolioDataPath)) {
    throw new Error(`Portfolio data not found: ${portfolioDataPath}`);
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  const portfolioData = JSON.parse(fs.readFileSync(portfolioDataPath, 'utf8'));
  const html = renderStandaloneHome(template, siteUrl, portfolioData);
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, html, 'utf8');
  return outputPath;
}
