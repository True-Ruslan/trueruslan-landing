import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const ACCENTS = {
  cyan: [76, 201, 240],
  violet: [139, 92, 246],
  green: [74, 222, 128],
};

const FONT = {
  ' ': ['00000','00000','00000','00000','00000','00000','00000'],
  A: ['01110','10001','10001','11111','10001','10001','10001'],
  B: ['11110','10001','10001','11110','10001','10001','11110'],
  C: ['01111','10000','10000','10000','10000','10000','01111'],
  D: ['11110','10001','10001','10001','10001','10001','11110'],
  E: ['11111','10000','10000','11110','10000','10000','11111'],
  F: ['11111','10000','10000','11110','10000','10000','10000'],
  G: ['01111','10000','10000','10111','10001','10001','01111'],
  H: ['10001','10001','10001','11111','10001','10001','10001'],
  I: ['11111','00100','00100','00100','00100','00100','11111'],
  J: ['00111','00010','00010','00010','10010','10010','01100'],
  K: ['10001','10010','10100','11000','10100','10010','10001'],
  L: ['10000','10000','10000','10000','10000','10000','11111'],
  M: ['10001','11011','10101','10101','10001','10001','10001'],
  N: ['10001','11001','10101','10011','10001','10001','10001'],
  O: ['01110','10001','10001','10001','10001','10001','01110'],
  P: ['11110','10001','10001','11110','10000','10000','10000'],
  Q: ['01110','10001','10001','10001','10101','10010','01101'],
  R: ['11110','10001','10001','11110','10100','10010','10001'],
  S: ['01111','10000','10000','01110','00001','00001','11110'],
  T: ['11111','00100','00100','00100','00100','00100','00100'],
  U: ['10001','10001','10001','10001','10001','10001','01110'],
  V: ['10001','10001','10001','10001','10001','01010','00100'],
  W: ['10001','10001','10001','10101','10101','10101','01010'],
  X: ['10001','10001','01010','00100','01010','10001','10001'],
  Y: ['10001','10001','01010','00100','00100','00100','00100'],
  Z: ['11111','00001','00010','00100','01000','10000','11111'],
  '0': ['01110','10001','10011','10101','11001','10001','01110'],
  '1': ['00100','01100','00100','00100','00100','00100','01110'],
  '2': ['01110','10001','00001','00010','00100','01000','11111'],
  '3': ['11110','00001','00001','01110','00001','00001','11110'],
  '4': ['00010','00110','01010','10010','11111','00010','00010'],
  '5': ['11111','10000','10000','11110','00001','00001','11110'],
  '6': ['01110','10000','10000','11110','10001','10001','01110'],
  '7': ['11111','00001','00010','00100','01000','01000','01000'],
  '8': ['01110','10001','10001','01110','10001','10001','01110'],
  '9': ['01110','10001','10001','01111','00001','00001','01110'],
  '-': ['00000','00000','00000','11111','00000','00000','00000'],
  '/': ['00001','00010','00100','01000','10000','00000','00000'],
  ':': ['00000','00100','00100','00000','00100','00100','00000'],
  '.': ['00000','00000','00000','00000','00000','00110','00110'],
  '_': ['00000','00000','00000','00000','00000','00000','11111'],
  '+': ['00000','00100','00100','11111','00100','00100','00000'],
  '&': ['01100','10010','10100','01000','10101','10010','01101'],
};

function clamp(value, min = 0, max = 255) {
  return Math.max(min, Math.min(max, value));
}

function mix(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function setPixel(canvas, x, y, color) {
  if (x < 0 || y < 0 || x >= OG_WIDTH || y >= OG_HEIGHT) return;
  const offset = (y * OG_WIDTH + x) * 3;
  canvas[offset] = color[0];
  canvas[offset + 1] = color[1];
  canvas[offset + 2] = color[2];
}

function blendPixel(canvas, x, y, color, alpha) {
  if (x < 0 || y < 0 || x >= OG_WIDTH || y >= OG_HEIGHT || alpha <= 0) return;
  const offset = (y * OG_WIDTH + x) * 3;
  canvas[offset] = clamp(Math.round(canvas[offset] * (1 - alpha) + color[0] * alpha));
  canvas[offset + 1] = clamp(Math.round(canvas[offset + 1] * (1 - alpha) + color[1] * alpha));
  canvas[offset + 2] = clamp(Math.round(canvas[offset + 2] * (1 - alpha) + color[2] * alpha));
}

function fillRect(canvas, x, y, width, height, color, alpha = 1) {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(OG_WIDTH, Math.ceil(x + width));
  const y1 = Math.min(OG_HEIGHT, Math.ceil(y + height));
  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      if (alpha === 1) setPixel(canvas, px, py, color);
      else blendPixel(canvas, px, py, color, alpha);
    }
  }
}

function drawBackground(canvas, accent) {
  const top = [9, 11, 16];
  const bottom = [13, 17, 24];
  for (let y = 0; y < OG_HEIGHT; y += 1) {
    const t = y / (OG_HEIGHT - 1);
    const rowColor = [mix(top[0], bottom[0], t), mix(top[1], bottom[1], t), mix(top[2], bottom[2], t)];
    fillRect(canvas, 0, y, OG_WIDTH, 1, rowColor);
  }

  for (let x = 0; x < OG_WIDTH; x += 48) fillRect(canvas, x, 0, 1, OG_HEIGHT, [52, 62, 75], 0.18);
  for (let y = 0; y < OG_HEIGHT; y += 48) fillRect(canvas, 0, y, OG_WIDTH, 1, [52, 62, 75], 0.18);

  const glowX = 970;
  const glowY = 120;
  const radius = 360;
  for (let y = Math.max(0, glowY - radius); y < Math.min(OG_HEIGHT, glowY + radius); y += 2) {
    for (let x = Math.max(0, glowX - radius); x < Math.min(OG_WIDTH, glowX + radius); x += 2) {
      const distance = Math.hypot(x - glowX, y - glowY);
      if (distance >= radius) continue;
      const alpha = Math.pow(1 - distance / radius, 2) * 0.2;
      fillRect(canvas, x, y, 2, 2, accent, alpha);
    }
  }

  fillRect(canvas, 52, 52, 8, OG_HEIGHT - 104, accent, 0.9);
  fillRect(canvas, 80, 70, OG_WIDTH - 160, 1, [156, 169, 184], 0.22);
  fillRect(canvas, 80, OG_HEIGHT - 78, OG_WIDTH - 160, 1, [156, 169, 184], 0.22);
}

function glyphWidth(scale) {
  return 6 * scale;
}

function measureText(text, scale) {
  return text.length ? text.length * glyphWidth(scale) - scale : 0;
}

function drawText(canvas, text, x, y, scale, color) {
  let cursor = x;
  for (const rawChar of text) {
    const char = rawChar.toUpperCase();
    const glyph = FONT[char] ?? FONT[' '];
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        if (glyph[row][col] === '1') {
          fillRect(canvas, cursor + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cursor += glyphWidth(scale);
  }
  return cursor;
}

function wrapText(text, maxChars) {
  const words = text.trim().split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function drawPill(canvas, text, x, y, accent) {
  const scale = 3;
  const width = measureText(text, scale) + 32;
  const height = 38;
  fillRect(canvas, x, y, width, height, [17, 23, 32], 0.96);
  fillRect(canvas, x, y, width, 1, accent, 0.5);
  fillRect(canvas, x, y + height - 1, width, 1, accent, 0.28);
  fillRect(canvas, x, y, 1, height, accent, 0.34);
  fillRect(canvas, x + width - 1, y, 1, height, accent, 0.34);
  drawText(canvas, text, x + 16, y + 9, scale, [190, 204, 219]);
  return width;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function encodePng(canvas) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(OG_WIDTH, 0);
  ihdr.writeUInt32BE(OG_HEIGHT, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const scanlines = Buffer.alloc(OG_HEIGHT * (1 + OG_WIDTH * 3));
  for (let y = 0; y < OG_HEIGHT; y += 1) {
    const target = y * (1 + OG_WIDTH * 3);
    scanlines[target] = 0;
    canvas.copy(scanlines, target + 1, y * OG_WIDTH * 3, (y + 1) * OG_WIDTH * 3);
  }

  const compressed = zlib.deflateSync(scanlines, {level: 9});
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

export function readPngDimensions(buffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature) || buffer.toString('ascii', 12, 16) !== 'IHDR') {
    throw new Error('Invalid PNG buffer.');
  }
  return {width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20)};
}

export function renderOgPng(card) {
  const accent = ACCENTS[card.accent];
  if (!accent) throw new Error(`Unsupported OpenGraph accent: ${card.accent}`);

  const canvas = Buffer.alloc(OG_WIDTH * OG_HEIGHT * 3);
  drawBackground(canvas, accent);

  drawText(canvas, 'TRUERUSLAN_', 82, 92, 4, accent);
  drawText(canvas, card.kicker, 82, 148, 3, [139, 153, 170]);

  const titleScale = card.displayTitle.length <= 18 ? 11 : card.displayTitle.length <= 28 ? 9 : 7;
  const maxChars = Math.max(12, Math.floor(1010 / glyphWidth(titleScale)));
  const lines = wrapText(card.displayTitle, maxChars);
  const lineHeight = 7 * titleScale + 24;
  let titleY = 220;
  for (const line of lines) {
    drawText(canvas, line, 82, titleY, titleScale, [244, 247, 251]);
    titleY += lineHeight;
  }

  let tagX = 82;
  const tagY = 490;
  for (const tag of card.tags) {
    const width = drawPill(canvas, tag, tagX, tagY, accent);
    tagX += width + 14;
  }

  drawText(canvas, 'ENGINEERING PORTFOLIO', 82, 570, 3, [102, 116, 134]);
  const marker = card.card.toUpperCase().replaceAll('-', '/');
  const markerWidth = measureText(marker, 3);
  drawText(canvas, marker, OG_WIDTH - 82 - markerWidth, 570, 3, accent);

  return encodePng(canvas);
}

export function writeOgCards(outputDir, entries) {
  const targetDir = path.join(outputDir, 'assets', 'og');
  fs.mkdirSync(targetDir, {recursive: true});
  const written = [];

  for (const entry of entries) {
    const buffer = renderOgPng(entry);
    const dimensions = readPngDimensions(buffer);
    if (dimensions.width !== OG_WIDTH || dimensions.height !== OG_HEIGHT) {
      throw new Error(`Invalid OpenGraph dimensions for ${entry.card}: ${dimensions.width}x${dimensions.height}`);
    }
    const target = path.join(targetDir, `${entry.card}.png`);
    fs.writeFileSync(target, buffer);
    written.push(target);
  }

  return written;
}
