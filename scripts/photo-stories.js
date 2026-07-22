import fs from 'node:fs';
import path from 'node:path';

export const PHOTO_CATEGORIES = Object.freeze([
  'travel',
  'study-events',
  'people',
  'everyday',
]);

export const PHOTO_LAYOUTS = Object.freeze([
  'wide',
  'portrait',
  'pair',
  'triptych',
  'standard',
]);

const ALBUM_MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const PHOTO_DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/;
const SAFE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }
}

function assertNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value.trim();
}

function assertPositiveInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
}

function normalizeAssetPath(value, label) {
  const assetPath = assertNonEmptyString(value, label).replaceAll('\\', '/');
  const normalized = path.posix.normalize(assetPath);
  const unsafe =
    normalized !== assetPath ||
    normalized.startsWith('../') ||
    normalized.startsWith('/') ||
    normalized.includes('/../') ||
    !normalized.startsWith('assets/') ||
    /^[a-z][a-z\d+.-]*:/i.test(normalized);

  if (unsafe) {
    throw new Error(`unsafe ${label}: ${value}`);
  }
  return normalized;
}

function requireAssetFile(assetPath, {docsDir, requireFiles}, label) {
  if (!requireFiles) return;
  if (!docsDir) {
    throw new Error('docsDir is required when requireFiles is true');
  }
  const resolvedDocsDir = path.resolve(docsDir);
  const absolutePath = path.resolve(resolvedDocsDir, assetPath);
  if (!absolutePath.startsWith(`${resolvedDocsDir}${path.sep}`)) {
    throw new Error(`unsafe ${label}: ${assetPath}`);
  }
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    throw new Error(`missing ${label}: ${assetPath}`);
  }
}

function clonePhoto(photo) {
  return {
    ...photo,
    ...(photo.caption == null ? {} : {caption: String(photo.caption)}),
    ...(photo.place == null ? {} : {place: String(photo.place)}),
  };
}

function validatePhoto(photo, albumSlug, seenPhotoIds, options) {
  if (!photo || typeof photo !== 'object' || Array.isArray(photo)) {
    throw new Error(`album ${albumSlug} photo must be an object`);
  }

  const id = assertNonEmptyString(photo.id, `album ${albumSlug} photo id`);
  if (!SAFE_ID_RE.test(id)) {
    throw new Error(`unsafe photo id in album ${albumSlug}: ${id}`);
  }
  if (seenPhotoIds.has(id)) {
    throw new Error(`duplicate photo id in album ${albumSlug}: ${id}`);
  }
  seenPhotoIds.add(id);

  const src = normalizeAssetPath(photo.src, `album ${albumSlug} photo src`);
  const alt = assertNonEmptyString(photo.alt, `album ${albumSlug} photo alt`);
  const layout = photo.layout ?? 'standard';
  if (!PHOTO_LAYOUTS.includes(layout)) {
    throw new Error(`unknown photo layout in album ${albumSlug}: ${layout}`);
  }
  if (photo.date != null && !PHOTO_DATE_RE.test(photo.date)) {
    throw new Error(`invalid photo date in album ${albumSlug}: ${photo.date}`);
  }

  requireAssetFile(src, options, 'album photo');

  return {
    ...clonePhoto(photo),
    id,
    src,
    alt,
    layout,
  };
}

export function validatePhotoAlbums(albums, options = {}) {
  const settings = {
    docsDir: options.docsDir,
    requireFiles: options.requireFiles ?? true,
  };
  assertArray(albums, 'photo albums registry');

  const seenSlugs = new Set();
  return albums.map((album, albumIndex) => {
    if (!album || typeof album !== 'object' || Array.isArray(album)) {
      throw new Error(`photo album at index ${albumIndex} must be an object`);
    }

    const slug = assertNonEmptyString(album.slug, 'album slug');
    if (!SAFE_SLUG_RE.test(slug)) {
      throw new Error(`unsafe album slug: ${slug}`);
    }
    if (seenSlugs.has(slug)) {
      throw new Error(`duplicate album slug: ${slug}`);
    }
    seenSlugs.add(slug);

    const title = assertNonEmptyString(album.title, `album ${slug} title`);
    const date = assertNonEmptyString(album.date, `album ${slug} date`);
    if (!ALBUM_MONTH_RE.test(date)) {
      throw new Error(`invalid album date for ${slug}: ${date}`);
    }
    assertPositiveInteger(album.year, `album ${slug} year`);
    const dateYear = Number(date.slice(0, 4));
    if (album.year !== dateYear) {
      throw new Error(`album ${slug} year must match date`);
    }

    const category = assertNonEmptyString(album.category, `album ${slug} category`);
    if (!PHOTO_CATEGORIES.includes(category)) {
      throw new Error(`unknown photo category for ${slug}: ${category}`);
    }

    const summary = assertNonEmptyString(album.summary, `album ${slug} summary`);
    const cover = normalizeAssetPath(album.cover, `album ${slug} cover`);
    requireAssetFile(cover, settings, 'album cover');

    if (typeof album.published !== 'boolean') {
      throw new Error(`album ${slug} published must be boolean`);
    }
    assertArray(album.photos, `album ${slug} photos`);
    if (album.published && album.photos.length === 0) {
      throw new Error(`published album ${slug} without photos`);
    }

    const places = album.places ?? [];
    assertArray(places, `album ${slug} places`);
    const normalizedPlaces = places.map((place, index) =>
      assertNonEmptyString(place, `album ${slug} place ${index + 1}`),
    );

    const seenPhotoIds = new Set();
    const photos = album.photos.map((photo) =>
      validatePhoto(photo, slug, seenPhotoIds, settings),
    );

    return {
      ...album,
      slug,
      title,
      date,
      year: album.year,
      places: normalizedPlaces,
      category,
      summary,
      cover,
      published: album.published,
      photos,
    };
  });
}

export function validatePhotoArchive(items, options = {}) {
  const settings = {
    docsDir: options.docsDir,
    requireFiles: options.requireFiles ?? true,
  };
  assertArray(items, 'photo archive registry');
  const seenIds = new Set();

  const validated = items.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`archive photo at index ${index} must be an object`);
    }
    const id = assertNonEmptyString(item.id, 'archive photo id');
    if (!SAFE_ID_RE.test(id)) {
      throw new Error(`unsafe archive photo id: ${id}`);
    }
    if (seenIds.has(id)) {
      throw new Error(`duplicate archive photo id: ${id}`);
    }
    seenIds.add(id);

    const src = normalizeAssetPath(item.src, 'archive photo src');
    const alt = assertNonEmptyString(item.alt, 'archive photo alt');
    const title = assertNonEmptyString(item.title, 'archive photo title');
    const order = item.order ?? index + 1;
    assertPositiveInteger(order, `archive photo ${id} order`);
    if (item.date != null && !PHOTO_DATE_RE.test(item.date) && !/^\d{4}$/.test(item.date)) {
      throw new Error(`invalid archive photo date for ${id}: ${item.date}`);
    }
    requireAssetFile(src, settings, 'archive photo');

    return {
      ...item,
      id,
      src,
      alt,
      title,
      order,
    };
  });

  return validated.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function groupPublishedAlbumsByYear(albums) {
  assertArray(albums, 'photo albums');
  const published = albums
    .filter((album) => album.published)
    .toSorted((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

  const groups = [];
  for (const album of published) {
    let group = groups.at(-1);
    if (!group || group.year !== album.year) {
      group = {year: album.year, albums: []};
      groups.push(group);
    }
    group.albums.push(album);
  }
  return groups;
}

export function loadPhotoContent({
  rootDir = process.cwd(),
  dataDir = path.join(rootDir, 'data'),
  docsDir = path.join(rootDir, 'docs'),
  requireFiles = true,
} = {}) {
  const albumsPath = path.join(dataDir, 'photo-albums.json');
  const archivePath = path.join(dataDir, 'photo-archive.json');
  const albums = JSON.parse(fs.readFileSync(albumsPath, 'utf8'));
  const archive = JSON.parse(fs.readFileSync(archivePath, 'utf8'));

  return {
    albums: validatePhotoAlbums(albums, {docsDir, requireFiles}),
    archive: validatePhotoArchive(archive, {docsDir, requireFiles}),
  };
}
