import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  PHOTO_CATEGORIES,
  PHOTO_LAYOUTS,
  groupPublishedAlbumsByYear,
  validatePhotoAlbums,
  validatePhotoArchive,
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
