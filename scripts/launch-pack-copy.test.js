import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {writeLaunchPack} from './launch-pack.js';

test('home first-wave copy uses a concise technical hook without clickbait or evidence inflation', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launch-pack-copy-'));
  try {
    const {pack} = writeLaunchPack({outputDir});
    const home = pack.firstWave.drafts.find((draft) => draft.targetId === 'home');

    assert.ok(home);
    assert.equal(home.channel, 'telegram');
    assert.equal(home.publicationState, 'not-published');
    assert.match(home.text, /^GitHub, Habr, резюме, проекты и заметки/);
    assert.match(home.text, /distributed system без service discovery/i);
    assert.match(home.text, /\n\nПофиксил\./);
    assert.match(home.text, /единый entry point/i);
    assert.match(home.text, /static-first/i);
    assert.match(home.text, /\bCI\b/);
    assert.match(home.text, /слегка overengineered/i);
    assert.ok(home.text.length <= 850, `home first-wave copy is too long: ${home.text.length}`);
    assert.equal(home.text.split(home.canonicalUrl).length - 1, 1);
    assert.doesNotMatch(home.text, /utm_|published|опубликован|охват|клик|CTR|SEO|гарантирован/i);
    assert.doesNotMatch(home.text, /\p{Extended_Pictographic}/u);
  } finally {
    fs.rmSync(outputDir, {recursive: true, force: true});
  }
});
