import fs from 'node:fs';
import path from 'node:path';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

import chokidar from 'chokidar';
import express from 'express';
import serveStatic from 'serve-static';
import {parse, serialize} from 'parse5';
import * as utils from 'parse5-utils';
import {globSync} from 'glob';
import open from 'open';

import {debounce} from './debounce.js';
import {injectDarkThemeIntoHtml} from './dark-theme.js';

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(SCRIPTS_DIR, '..');

class DevServer {
  constructor(parameters = {}) {
    const {
      autoOpen = false,
      watchPattern = 'docs/**/*',
      port = 8000,
      serveIndexes = ['index.html'],
      serveDir = 'docs-html',
      cacheControl = false,
      ssePath = '/events',
      sseEventName = 'reload',
      sseEventMessage = 'rebuilt',
    } = parameters;

    this.config = {
      autoOpen,
      watchPattern,
      port,
      serveIndexes,
      serveDir: path.join(PROJECT_ROOT, serveDir),
      cacheControl,
      ssePath,
      sseEventName,
      sseEventMessage,
      sseScript: `
const events = new EventSource("${ssePath}");
events.addEventListener("${sseEventName}", () => window.location.reload());
`,
    };

    this.sseClients = new Set();
    this.configure();
  }

  configure() {
    this.app = express();
    this.app.use(serveStatic(this.config.serveDir, {
      index: this.config.serveIndexes,
      cacheControl: this.config.cacheControl,
    }));
    this.app.get(this.config.ssePath, this.handleSse.bind(this));

    this.injectSse();

    chokidar
      .watch(this.config.watchPattern, {ignored: /(^|[/\\])\../, cwd: PROJECT_ROOT})
      .on('all', debounce((event, changedPath) => {
        console.info(`change: ${event}, path: ${changedPath}`);
        try {
          this.rebuild(changedPath);
          this.injectSse();
          this.notifyClients();
        } catch (error) {
          console.error('failed building documentation:', error);
        }
      }, 500));
  }

  handleSse(_req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders?.();

    this.sseClients.add(res);
    res.on('close', () => this.sseClients.delete(res));
  }

  rebuild(changedPath = '') {
    const normalized = changedPath.replaceAll('\\', '/');
    const needsAssets = normalized.includes('assets/');

    console.info(needsAssets ? 'building documentation + assets' : 'building documentation (fast)');

    const script = needsAssets ? 'npm run build:docs' : 'npm run build:docs:fast';
    execSync(script, {cwd: PROJECT_ROOT, stdio: 'inherit'});
  }

  injectSse() {
    console.info('injecting sse into html');

    const pattern = path.join(this.config.serveDir, '**', '*.html');
    const htmlFiles = globSync(pattern, {nodir: true});

    for (const htmlPath of htmlFiles) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      const transformed = injectSseIntoHtml(
        injectDarkThemeIntoHtml(html),
        this.config.sseScript,
      );
      fs.writeFileSync(htmlPath, transformed, {encoding: 'utf8'});
    }
  }

  notifyClients() {
    const message = `event: ${this.config.sseEventName}\ndata: ${this.config.sseEventMessage}\n\n`;
    for (const client of this.sseClients) {
      client.write(message);
    }
  }

  listen() {
    this.app.listen(this.config.port, () => {
      console.info(`serving on: http://localhost:${this.config.port}`);
      if (this.config.autoOpen) {
        open(`http://localhost:${this.config.port}`);
      }
    });
  }
}

export function injectSseIntoHtml(html, sseScript) {
  if (html.includes('new EventSource')) {
    return html;
  }

  const parsed = parse(html);

  traverse(parsed, (node) => {
    if (node.nodeName !== 'head') {
      return;
    }

    const sseScriptNode = utils.createNode('script');
    utils.append(sseScriptNode, utils.createTextNode(sseScript));
    utils.append(node, sseScriptNode);
  });

  return serialize(parsed);
}

function traverse(node, callback) {
  callback(node);

  if (!node.childNodes) {
    return;
  }

  for (const childNode of node.childNodes) {
    traverse(childNode, callback);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const server = new DevServer();
  server.listen();
}
