import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  PHOTO_CATEGORIES,
  PHOTO_LAYOUTS,
  applyPhotoIndexPage,
  groupPublishedAlbumsByYear,
  renderLegacyPhotosBridge,
  renderPhotoAlbumPage,
  renderPhotoIndexContent,
  validatePhotoAlbums,
  validatePhotoArchive,
  writePhotoStories,
} from './photo-stories.js';

const validPhoto = {
  id: 'photo-1',
  src: 'assets/images/photos/albums/karelia-2026/01.jpg',
  alt: 'Ладожское озеро между скалами',
  layout: 'wide',
};

const validAlbum = {
  slug: 'karelia-2026',
  title: 'Карелия',
  date: '2026-07',
  year: 2026,
  places: ['Сортавала'],
  category: 'travel',
  summary: 'Несколько дней среди скал, воды и северного леса.',
  cover: 'assets/images/photos/albums/karelia-2026/cover.jpg',
  published: true,
  photos: [validPhoto],
};

const validArchive = {
  id: 'semihatov',
  src: 'assets/images/Semihatov.jpg',
  alt: 'А. М. Семихатов',
  title: 'Конференции и встречи',
  order: 1,
};

const threeArchiveItems = [
  validArchive,
  {...validArchive, id: 'magister', src: 'assets/images/magister.jpg', title: 'Защита магистерской', order: 2},
  {...validArchive, id: 'avatar', src: 'assets/images/avatar.png', title: 'Из личного архива', order: 3},
];

const generatedPhotoPage = `<!doctype html>
<html lang="ru">
<head><title>Фотографии</title></head>
<body>
  <header data-test-shared-header></header>
  <aside data-test-sidebar><a href="photos.html" aria-current="page">Фото</a></aside>
  <main><article><h1>Фотографии</h1><p>Intro</p><div data-tr-photo-placeholder></div></article></main>
</body>
</html>`;

test('photo registries expose only the approved categories and layout types', () => {
  assert.deepEqual([...PHOTO_CATEGORIES], ['travel', 'study-events', 'people', 'everyday']);
  assert.deepEqual([...PHOTO_LAYOUTS], ['wide', 'portrait', 'pair', 'triptych', 'standard']);
});

test('validatePhotoAlbums accepts an empty registry until real stories exist', () => {
  assert.deepEqual(validatePhotoAlbums([], {requireFiles: false}), []);
});

test('validatePhotoAlbums rejects duplicate slugs', () => {
  assert.throws(
    () => validatePhotoAlbums([validAlbum, {...validAlbum}], {requireFiles: false}),
    /duplicate album slug/i,
  );
});

test('validatePhotoAlbums rejects duplicate photo ids inside one album', () => {
  assert.throws(
    () => validatePhotoAlbums([
      {...validAlbum, photos: [validPhoto, {...validPhoto}]},
    ], {requireFiles: false}),
    /duplicate photo id/i,
  );
});

test('validatePhotoAlbums rejects unknown categories and layouts', () => {
  assert.throws(
    () => validatePhotoAlbums([{...validAlbum, category: 'random'}], {requireFiles: false}),
    /unknown photo category/i,
  );
  assert.throws(
    () => validatePhotoAlbums([
      {...validAlbum, photos: [{...validPhoto, layout: 'masonry'}]},
    ], {requireFiles: false}),
    /unknown photo layout/i,
  );
});

test('validatePhotoAlbums rejects published albums without photos', () => {
  assert.throws(
    () => validatePhotoAlbums([{...validAlbum, photos: []}], {requireFiles: false}),
    /published album.*without photos/i,
  );
});

test('validatePhotoAlbums rejects blank alt text and unsafe asset paths', () => {
  assert.throws(
    () => validatePhotoAlbums([
      {...validAlbum, photos: [{...validPhoto, alt: '   '}]},
    ], {requireFiles: false}),
    /photo alt/i,
  );
  assert.throws(
    () => validatePhotoAlbums([{...validAlbum, cover: '../private.jpg'}], {requireFiles: false}),
    /unsafe.*cover/i,
  );
  assert.throws(
    () => validatePhotoAlbums([
      {...validAlbum, photos: [{...validPhoto, src: 'https://example.com/photo.jpg'}]},
    ], {requireFiles: false}),
    /unsafe.*photo.*src/i,
  );
});

test('validatePhotoAlbums verifies referenced image files when requested', () => {
  const docsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-photo-docs-'));
  assert.throws(
    () => validatePhotoAlbums([validAlbum], {docsDir, requireFiles: true}),
    /missing album cover/i,
  );
});

test('validatePhotoArchive validates ids, safe paths, alt text and deterministic order', () => {
  const result = validatePhotoArchive([
    {...validArchive, id: 'avatar', src: 'assets/images/avatar.png', order: 3},
    validArchive,
    {...validArchive, id: 'magister', src: 'assets/images/magister.jpg', order: 2},
  ], {requireFiles: false});
  assert.deepEqual(result.map((item) => item.id), ['semihatov', 'magister', 'avatar']);

  assert.throws(
    () => validatePhotoArchive([validArchive, {...validArchive}], {requireFiles: false}),
    /duplicate archive photo id/i,
  );
  assert.throws(
    () => validatePhotoArchive([{...validArchive, alt: ''}], {requireFiles: false}),
    /archive photo alt/i,
  );
  assert.throws(
    () => validatePhotoArchive([{...validArchive, src: '../../secret.jpg'}], {requireFiles: false}),
    /unsafe archive photo src/i,
  );
});

test('groupPublishedAlbumsByYear sorts published albums newest-first and groups by year', () => {
  const albums = [
    {...validAlbum, slug: 'old', title: 'Old', date: '2024-05', year: 2024},
    {...validAlbum, slug: 'draft', title: 'Draft', date: '2027-01', year: 2027, published: false},
    {...validAlbum, slug: 'newer', title: 'Newer', date: '2026-09', year: 2026},
    validAlbum,
  ];

  const groups = groupPublishedAlbumsByYear(albums);
  assert.deepEqual(groups.map((group) => group.year), [2026, 2024]);
  assert.deepEqual(groups[0].albums.map((album) => album.slug), ['newer', 'karelia-2026']);
});

test('renderPhotoIndexContent renders archive-only content without a second page shell', () => {
  const html = renderPhotoIndexContent({
    albums: [],
    archive: threeArchiveItems,
  });

  assert.match(html, /data-tr-photo-page="index"/);
  assert.match(html, /Из архива/);
  assert.match(html, /Полноценные фотоистории появятся здесь/);
  assert.equal((html.match(/data-tr-photo-archive-item/g) ?? []).length, 3);
  assert.doesNotMatch(html, /data-tr-photo-album-card/);
  assert.doesNotMatch(html, /data-tr-photo-filter/);
  assert.doesNotMatch(html, /<h1\b/);
  assert.doesNotMatch(html, /tr-site-header|tr-site-nav|tr-photo-index-hero/);
  assert.match(html, /href="\.\.\/assets\/images\/Semihatov\.jpg"/);
});

test('renderPhotoIndexContent renders year groups, category filters and canonical album links newest-first', () => {
  const newer = {...validAlbum, slug: 'autumn-2026', title: 'Осень', date: '2026-09'};
  const html = renderPhotoIndexContent({
    albums: [validAlbum, newer],
    archive: threeArchiveItems,
  });

  assert.match(html, /data-tr-photo-filter/);
  assert.equal((html.match(/data-tr-photo-album-card/g) ?? []).length, 2);
  assert.ok(html.indexOf('Осень') < html.indexOf('Карелия'));
  assert.match(html, /href="\.\.\/photos\/autumn-2026\/"/);
  assert.match(html, /2026/);
});

test('applyPhotoIndexPage preserves the generated Diplodoc shell and injects one photo index', () => {
  const html = applyPhotoIndexPage(generatedPhotoPage, {
    albums: [],
    archive: threeArchiveItems,
    siteUrl: 'https://example.test',
  });

  assert.match(html, /data-test-shared-header/);
  assert.match(html, /data-test-sidebar/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((html.match(/data-tr-photo-page="index"/g) ?? []).length, 1);
  assert.match(html, /data-tr-photo-lightbox-root/);
  assert.match(html, /photo-stories\.css/);
  assert.match(html, /photo-stories\.js/);
  assert.doesNotMatch(html, /data-tr-photo-placeholder/);
  assert.doesNotMatch(html, /tr-site-header|tr-site-nav|tr-photo-index-hero/);
});

test('renderPhotoAlbumPage renders cinematic hero, semantic photo anchor and editorial layout', () => {
  const html = renderPhotoAlbumPage(validAlbum, {
    siteUrl: 'https://example.test',
    previous: null,
    next: null,
  });

  assert.match(html, /data-tr-photo-page="album"/);
  assert.match(html, /tr-photo-album-hero/);
  assert.match(html, /Карелия/);
  assert.match(html, /Сортавала/);
  assert.match(html, /id="photo-1"/);
  assert.match(html, /data-tr-photo-layout="wide"/);
  assert.match(html, /data-tr-photo-lightbox/);
});

test('renderLegacyPhotosBridge redirects the old photo index to the canonical Diplodoc page', () => {
  const html = renderLegacyPhotosBridge('../landing/photos.html');
  assert.match(html, /http-equiv="refresh" content="0;url=\.\.\/landing\/photos\.html"/);
  assert.match(html, /rel="canonical" href="\.\.\/landing\/photos\.html"/);
  assert.match(html, /href="\.\.\/landing\/photos\.html"/);
  assert.match(html, /Открыть фотоархив/);
});

test('writePhotoStories enhances the canonical index, writes albums and preserves the old route as a bridge', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-photo-output-'));
  fs.mkdirSync(path.join(outputDir, 'landing'), {recursive: true});
  fs.writeFileSync(path.join(outputDir, 'landing', 'photos.html'), generatedPhotoPage, 'utf8');

  const result = writePhotoStories({
    outputDir,
    albums: [validAlbum],
    archive: threeArchiveItems,
    siteUrl: 'https://example.test',
  });

  assert.deepEqual(result.routes, ['landing/photos.html', 'photos/karelia-2026/']);
  assert.equal(result.indexPath, path.join(outputDir, 'landing', 'photos.html'));
  assert.equal(result.legacyPath, path.join(outputDir, 'photos', 'index.html'));
  assert.ok(fs.existsSync(path.join(outputDir, 'photos', 'index.html')));
  assert.ok(fs.existsSync(path.join(outputDir, 'photos', 'karelia-2026', 'index.html')));
  assert.match(fs.readFileSync(path.join(outputDir, 'landing', 'photos.html'), 'utf8'), /data-tr-photo-page="index"/);
  assert.match(fs.readFileSync(path.join(outputDir, 'photos', 'index.html'), 'utf8'), /landing\/photos\.html/);
  assert.match(fs.readFileSync(path.join(outputDir, 'photos', 'karelia-2026', 'index.html'), 'utf8'), /Карелия/);
});
