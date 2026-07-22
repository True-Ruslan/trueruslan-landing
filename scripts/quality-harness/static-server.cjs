const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const express = require('express');

const {OUTPUT_DIR} = require('./paths.cjs');

const COMPRESSIBLE_EXTENSIONS = new Set(['.html', '.css', '.js', '.json', '.svg', '.xml', '.txt']);

function resolveStaticFile(outputDir, requestUrl, baseUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, baseUrl).pathname);
  } catch {
    return null;
  }

  if (pathname.endsWith('/')) pathname += 'index.html';

  let candidate = path.resolve(outputDir, `.${pathname}`);
  const insideOutput = candidate === outputDir || candidate.startsWith(`${outputDir}${path.sep}`);
  if (!insideOutput) return null;

  if (!fs.existsSync(candidate) && !path.extname(candidate)) {
    const htmlCandidate = `${candidate}.html`;
    if (fs.existsSync(htmlCandidate)) candidate = htmlCandidate;
  }

  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) return null;
  return candidate;
}

async function startStaticServer({port, gzip = false, outputDir = OUTPUT_DIR, host = '127.0.0.1'} = {}) {
  if (!fs.existsSync(outputDir)) {
    throw new Error(`${path.relative(process.cwd(), outputDir) || outputDir} does not exist. Run npm run build:docs first.`);
  }

  const app = express();
  app.disable('x-powered-by');

  let baseUrl = `http://${host}:${port ?? 0}`;

  if (gzip) {
    app.use((req, res, next) => {
      const accepted = req.headers['accept-encoding'] || '';
      if (!accepted.includes('gzip')) return next();

      const filePath = resolveStaticFile(outputDir, req.originalUrl || req.url, baseUrl);
      if (!filePath || !COMPRESSIBLE_EXTENSIONS.has(path.extname(filePath).toLowerCase())) return next();

      res.type(path.extname(filePath));
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');

      const stream = fs.createReadStream(filePath);
      stream.on('error', next);
      stream.pipe(zlib.createGzip({level: 6})).pipe(res);
    });
  }

  app.use(express.static(outputDir, {extensions: ['html'], fallthrough: false}));

  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(port ?? 0, host, () => resolve(listener));
    listener.on('error', reject);
  });

  const address = server.address();
  const actualPort = typeof address === 'object' && address ? address.port : port;
  baseUrl = `http://${host}:${actualPort}`;

  const stop = () => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });

  return {server, baseUrl, stop};
}

module.exports = {
  startStaticServer,
};
