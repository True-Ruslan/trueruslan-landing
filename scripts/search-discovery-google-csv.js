import {validateExternalSearchEvidence} from './search-discovery-external.js';

const REQUIRED_FILES = ['Диаграмма.csv', 'Запросы.csv', 'Страницы.csv'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function requireString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} must be a non-empty string`);
  return value.trim();
}

function requireFiles(files) {
  if (!files || typeof files !== 'object' || Array.isArray(files)) throw new Error('Google Search Console files must be an object');
  for (const filename of REQUIRED_FILES) {
    if (typeof files[filename] !== 'string') throw new Error(`Google Search Console export requires ${filename}`);
  }
  return files;
}

function parseCsv(text, label) {
  if (typeof text !== 'string') throw new Error(`${label} must be UTF-8 CSV text`);
  const input = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      if (field !== '') throw new Error(`${label} contains malformed CSV quoting`);
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error(`${label} contains an unterminated quoted field`);
  if (field !== '' || row.length > 0) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((cell) => cell !== ''));
}

function expectHeader(rows, firstColumn, label) {
  if (rows.length === 0) throw new Error(`${label} is empty`);
  const header = rows[0].map((cell) => cell.trim());
  if (header.length !== 5 || header[0] !== firstColumn || !['Kлики', 'Клики'].includes(header[1]) || header[2] !== 'Показы' || header[3] !== 'CTR' || header[4] !== 'Позиция') {
    throw new Error(`${label} has an unsupported Google Search Console CSV header`);
  }
}

function parseInteger(value, label) {
  if (!/^\d+$/.test(value.trim())) throw new Error(`${label} must be a non-negative integer`);
  return Number(value);
}

function parseCtr(value, label) {
  const normalized = value.trim();
  if (normalized === '') return undefined;
  if (!/^\d+(?:[.,]\d+)?%$/.test(normalized)) throw new Error(`${label} CTR must be a percent`);
  const percent = Number(normalized.slice(0, -1).replace(',', '.'));
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new Error(`${label} CTR must be between 0% and 100%`);
  return percent / 100;
}

function parsePosition(value, label) {
  const normalized = value.trim();
  if (normalized === '') return undefined;
  if (!/^\d+(?:[.,]\d+)?$/.test(normalized)) throw new Error(`${label} position must be a non-negative number`);
  const position = Number(normalized.replace(',', '.'));
  if (!Number.isFinite(position) || position < 0) throw new Error(`${label} position must be a non-negative number`);
  return position;
}

function parseMetricRows(text, {filename, firstColumn, dimension}) {
  const rows = parseCsv(text, filename);
  expectHeader(rows, firstColumn, filename);
  return rows.slice(1).map((cells, index) => {
    const label = `${filename} row ${index + 2}`;
    if (cells.length !== 5) throw new Error(`${label} must contain exactly five columns`);
    const value = requireString(cells[0], `${label} value`);
    const clicks = parseInteger(cells[1], `${label} clicks`);
    const impressions = parseInteger(cells[2], `${label} impressions`);
    const ctr = parseCtr(cells[3], label);
    const position = parsePosition(cells[4], label);
    const row = {dimension, value, clicks, impressions};
    if (ctr !== undefined) row.ctr = ctr;
    if (position !== undefined) row.position = position;
    return row;
  });
}

function parseWindow(text) {
  const rows = parseCsv(text, 'Диаграмма.csv');
  if (rows.length < 2) throw new Error('Диаграмма.csv must contain at least one dated row');
  const header = rows[0].map((cell) => cell.trim());
  if (header.length !== 5 || header[0] !== 'Дата' || !['Kлики', 'Клики'].includes(header[1]) || header[2] !== 'Показы' || header[3] !== 'CTR' || header[4] !== 'Позиция') {
    throw new Error('Диаграмма.csv has an unsupported Google Search Console CSV header');
  }

  const dates = rows.slice(1).map((cells, index) => {
    if (cells.length !== 5) throw new Error(`Диаграмма.csv row ${index + 2} must contain exactly five columns`);
    const date = cells[0].trim();
    if (!ISO_DATE.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
      throw new Error(`Диаграмма.csv row ${index + 2} date must be an ISO date`);
    }
    return date;
  }).sort();

  return {start: dates[0], end: dates.at(-1)};
}

export function normalizeGoogleSearchConsoleCsvExport({files, property, collectedAt} = {}) {
  const inputFiles = requireFiles(files);
  const window = parseWindow(inputFiles['Диаграмма.csv']);
  const queryRows = parseMetricRows(inputFiles['Запросы.csv'], {
    filename: 'Запросы.csv',
    firstColumn: 'Популярные запросы',
    dimension: 'query',
  });
  const pageRows = parseMetricRows(inputFiles['Страницы.csv'], {
    filename: 'Страницы.csv',
    firstColumn: 'Популярные страницы',
    dimension: 'page',
  });
  const rows = [...queryRows, ...pageRows];
  if (rows.length === 0) throw new Error('Google Search Console performance export contains no query or page rows');

  return validateExternalSearchEvidence({
    schemaVersion: 1,
    evidenceClass: 'external-search-observations',
    property: requireString(property, 'property'),
    collectedAt: requireString(collectedAt, 'collectedAt'),
    observations: [{
      source: 'google-search-console',
      collectionMethod: 'export',
      kind: 'performance',
      window,
      rows,
    }],
  }, {siteUrl: property});
}
