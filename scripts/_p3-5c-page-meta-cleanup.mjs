import {execFileSync} from 'node:child_process';
import fs from 'node:fs';

const path = 'data/page-meta.json';
const base = execFileSync('git', ['show', 'origin/master:data/page-meta.json'], {encoding: 'utf8'});
const marker = '\n]\n';
if (!base.endsWith(marker)) throw new Error('master page-meta.json closing marker changed');
if (base.includes('"path": "en/publications.html"')) throw new Error('master already contains English Publications metadata');

const entry = `,
  {
    "path": "en/publications.html",
    "card": "publications-en",
    "title": "Publications — Ruslan Nemykin",
    "description": "Published work by Ruslan Nemykin: technical articles and externally verifiable publications with canonical source links.",
    "displayTitle": "PUBLICATIONS",
    "kicker": "PUBLISHED WORK",
    "tags": ["ARTICLES", "RESEARCH", "TALKS"],
    "accent": "cyan"
  }`;

const cleaned = `${base.slice(0, -marker.length)}${entry}${marker}`;
JSON.parse(cleaned);
fs.writeFileSync(path, cleaned, 'utf8');
fs.rmSync('scripts/_p3-5c-page-meta-cleanup.mjs');
fs.rmSync('.github/workflows/_p3-5c-page-meta-cleanup.yml');
