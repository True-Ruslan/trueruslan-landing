import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_INDEX_TEMPLATE = path.join(ROOT, 'templates', 'photos-index.html');
const DEFAULT_ALBUM_TEMPLATE = path.join(ROOT, 'templates', 'photo-album.html');

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

export const PHOTO_CATEGORY_LABELS = Object.freeze({
  travel: 'Путешествия',
  'study-events': 'Учёба и события',
  people: 'Люди',
  everyday: 'Обычные моменты',
});

const ALBUM_MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const PHOTO_DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/;
const SAFE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RU_MONTHS = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];

function assertArray(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
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

  if (unsafe) throw new Error(`unsafe ${label}: ${value}`);
  return normalized;
}

function requireAssetFile(assetPath, {docsDir, requireFiles}, label) {
  if (!requireFiles) return;
  if (!docsDir) throw new Error('docsDir is required when requireFiles is true');
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
  if (!SAFE_ID_RE.test(id)) throw new Error(`unsafe photo id in album ${albumSlug}: ${id}`);
  if (seenPhotoIds.has(id)) throw new Error(`duplicate photo id in album ${albumSlug}: ${id}`);
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
  if (photo.width != null) assertPositiveInteger(photo.width, `album ${albumSlug} photo width`);
  if (photo.height != null) assertPositiveInteger(photo.height, `album ${albumSlug} photo height`);

  requireAssetFile(src, options, 'album photo');
  return {...clonePhoto(photo), id, src, alt, layout};
}

export function validatePhotoAlbums(albums, options = {}) {
  const settings = {docsDir: options.docsDir, requireFiles: options.requireFiles ?? true};
  assertArray(albums, 'photo albums registry');
  const seenSlugs = new Set();

  return albums.map((album, albumIndex) => {
    if (!album || typeof album !== 'object' || Array.isArray(album)) {
      throw new Error(`photo album at index ${albumIndex} must be an object`);
    }

    const slug = assertNonEmptyString(album.slug, 'album slug');
    if (!SAFE_SLUG_RE.test(slug)) throw new Error(`unsafe album slug: ${slug}`);
    if (seenSlugs.has(slug)) throw new Error(`duplicate album slug: ${slug}`);
    seenSlugs.add(slug);

    const title = assertNonEmptyString(album.title, `album ${slug} title`);
    const date = assertNonEmptyString(album.date, `album ${slug} date`);
    if (!ALBUM_MONTH_RE.test(date)) throw new Error(`invalid album date for ${slug}: ${date}`);
    assertPositiveInteger(album.year, `album ${slug} year`);
    if (album.year !== Number(date.slice(0, 4))) throw new Error(`album ${slug} year must match date`);

    const category = assertNonEmptyString(album.category, `album ${slug} category`);
    if (!PHOTO_CATEGORIES.includes(category)) {
      throw new Error(`unknown photo category for ${slug}: ${category}`);
    }

    const summary = assertNonEmptyString(album.summary, `album ${slug} summary`);
    const cover = normalizeAssetPath(album.cover, `album ${slug} cover`);
    requireAssetFile(cover, settings, 'album cover');

    if (typeof album.published !== 'boolean') throw new Error(`album ${slug} published must be boolean`);
    assertArray(album.photos, `album ${slug} photos`);
    if (album.published && album.photos.length === 0) throw new Error(`published album ${slug} without photos`);

    const places = album.places ?? [];
    assertArray(places, `album ${slug} places`);
    const normalizedPlaces = places.map((place, index) =>
      assertNonEmptyString(place, `album ${slug} place ${index + 1}`),
    );

    const seenPhotoIds = new Set();
    const photos = album.photos.map((photo) => validatePhoto(photo, slug, seenPhotoIds, settings));

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
  const settings = {docsDir: options.docsDir, requireFiles: options.requireFiles ?? true};
  assertArray(items, 'photo archive registry');
  const seenIds = new Set();

  const validated = items.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`archive photo at index ${index} must be an object`);
    }
    const id = assertNonEmptyString(item.id, 'archive photo id');
    if (!SAFE_ID_RE.test(id)) throw new Error(`unsafe archive photo id: ${id}`);
    if (seenIds.has(id)) throw new Error(`duplicate archive photo id: ${id}`);
    seenIds.add(id);

    const src = normalizeAssetPath(item.src, 'archive photo src');
    const alt = assertNonEmptyString(item.alt, 'archive photo alt');
    const title = assertNonEmptyString(item.title, 'archive photo title');
    const order = item.order ?? index + 1;
    assertPositiveInteger(order, `archive photo ${id} order`);
    if (item.date != null && !PHOTO_DATE_RE.test(item.date) && !/^\d{4}$/.test(item.date)) {
      throw new Error(`invalid archive photo date for ${id}: ${item.date}`);
    }
    if (item.width != null) assertPositiveInteger(item.width, `archive photo ${id} width`);
    if (item.height != null) assertPositiveInteger(item.height, `archive photo ${id} height`);
    requireAssetFile(src, settings, 'archive photo');

    return {...item, id, src, alt, title, order};
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
  const albums = JSON.parse(fs.readFileSync(path.join(dataDir, 'photo-albums.json'), 'utf8'));
  const archive = JSON.parse(fs.readFileSync(path.join(dataDir, 'photo-archive.json'), 'utf8'));
  return {
    albums: validatePhotoAlbums(albums, {docsDir, requireFiles}),
    archive: validatePhotoArchive(archive, {docsDir, requireFiles}),
  };
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function stripTrailingSlash(value) {
  return String(value).replace(/\/+$/, '');
}

function applyTemplate(template, replacements) {
  let result = template;
  for (const [token, value] of Object.entries(replacements)) {
    result = result.replaceAll(`{{${token}}}`, String(value));
  }
  const unresolved = result.match(/{{[A-Z_]+}}/g);
  if (unresolved) throw new Error(`unresolved photo template token: ${unresolved[0]}`);
  return result;
}

function loadTemplate(templatePath) {
  return fs.readFileSync(templatePath, 'utf8');
}

function formatAlbumDate(date) {
  const [year, month] = date.split('-').map(Number);
  return `${RU_MONTHS[month - 1]} ${year}`;
}

function renderHeader(prefix, photosHref) {
  return `<header class="tr-site-header">
    <div class="tr-site-header__inner">
      <a class="tr-site-brand" href="${prefix}index.html" aria-label="TrueRuslan — главная">TRUERUSLAN_</a>
      <nav class="tr-site-nav" aria-label="Основная навигация">
        <a href="${prefix}landing/projects.html">Проекты</a>
        <a href="${prefix}landing/now.html">Сейчас</a>
        <a href="${prefix}landing/engineering-map.html">Map</a>
        <a href="${prefix}landing/notes.html">Notes</a>
        <a href="${photosHref}" aria-current="page">Фото</a>
        <a href="${prefix}landing/about.html">Обо мне</a>
        <a href="${prefix}landing/resume.html">Резюме</a>
        <a href="${prefix}_search/ru/index.html">Поиск</a>
      </nav>
      <a class="tr-site-github" href="https://github.com/True-Ruslan" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
    </div>
  </header>`;
}

function renderFooter() {
  return `<footer class="tr-site-footer"><div class="tr-site-footer__inner"><span>Руслан Немыкин · Backend Engineer</span><span>Личный сайт о работе, проектах, заметках и жизни вне кода</span></div></footer>`;
}

function renderLightboxShell() {
  return `<div class="tr-photo-lightbox" data-tr-photo-lightbox-root hidden>
    <div class="tr-photo-lightbox__backdrop" data-tr-photo-lightbox-close></div>
    <div class="tr-photo-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Просмотр фотографии" tabindex="-1">
      <button class="tr-photo-lightbox__close" type="button" data-tr-photo-lightbox-close aria-label="Закрыть просмотр">×</button>
      <button class="tr-photo-lightbox__nav tr-photo-lightbox__nav--prev" type="button" data-tr-photo-lightbox-prev aria-label="Предыдущая фотография">←</button>
      <figure class="tr-photo-lightbox__figure">
        <img class="tr-photo-lightbox__image" data-tr-photo-lightbox-image alt="">
        <figcaption class="tr-photo-lightbox__caption">
          <span data-tr-photo-lightbox-counter></span>
          <strong data-tr-photo-lightbox-title></strong>
          <span data-tr-photo-lightbox-meta></span>
          <span data-tr-photo-lightbox-text></span>
        </figcaption>
      </figure>
      <button class="tr-photo-lightbox__nav tr-photo-lightbox__nav--next" type="button" data-tr-photo-lightbox-next aria-label="Следующая фотография">→</button>
    </div>
  </div>`;
}

function imageDimensions(item) {
  const width = Number.isInteger(item.width) && item.width > 0 ? ` width="${item.width}"` : '';
  const height = Number.isInteger(item.height) && item.height > 0 ? ` height="${item.height}"` : '';
  return `${width}${height}`;
}

function renderArchiveItem(item) {
  const caption = item.caption ? `<p>${escapeHtml(item.caption)}</p>` : '';
  const meta = item.date ? `<span class="tr-photo-archive-card__meta">${escapeHtml(item.date)}</span>` : '';
  return `<figure class="tr-photo-archive-card" id="archive-${escapeHtml(item.id)}" data-tr-photo-archive-item>
    <a class="tr-photo-archive-card__image" href="../${escapeHtml(item.src)}" data-tr-photo-lightbox data-tr-photo-group="archive" data-photo-id="archive-${escapeHtml(item.id)}" data-photo-title="${escapeHtml(item.title)}" data-photo-caption="${escapeHtml(item.caption ?? '')}" data-photo-meta="${escapeHtml(item.date ?? '')}">
      <img src="../${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async"${imageDimensions(item)}>
    </a>
    <figcaption><div><strong>${escapeHtml(item.title)}</strong>${meta}</div>${caption}</figcaption>
  </figure>`;
}

function renderAlbumCard(album) {
  const places = album.places?.length ? album.places.join(' · ') : '';
  return `<article class="tr-photo-album-card" data-tr-photo-album-card data-category="${escapeHtml(album.category)}">
    <a class="tr-photo-album-card__link" href="${escapeHtml(album.slug)}/">
      <div class="tr-photo-album-card__media">
        <img src="../${escapeHtml(album.cover)}" alt="" loading="lazy" decoding="async">
        <span class="tr-photo-album-card__count">${album.photos.length} фото</span>
      </div>
      <div class="tr-photo-album-card__body">
        <span class="tr-photo-album-card__category">${escapeHtml(PHOTO_CATEGORY_LABELS[album.category])}</span>
        <h3>${escapeHtml(album.title)}</h3>
        <p class="tr-photo-album-card__meta">${escapeHtml([places, formatAlbumDate(album.date)].filter(Boolean).join(' · '))}</p>
        <p>${escapeHtml(album.summary)}</p>
        <span class="tr-photo-album-card__cta">Открыть историю →</span>
      </div>
    </a>
  </article>`;
}

function renderFilters(albums) {
  const present = PHOTO_CATEGORIES.filter((category) => albums.some((album) => album.published && album.category === category));
  if (present.length === 0) return '';
  return `<div class="tr-photo-filters" aria-label="Фильтр фотоисторий" data-tr-photo-filters>
    <button type="button" class="tr-photo-filter is-active" data-tr-photo-filter="all" aria-pressed="true">Все</button>
    ${present.map((category) => `<button type="button" class="tr-photo-filter" data-tr-photo-filter="${category}" aria-pressed="false">${escapeHtml(PHOTO_CATEGORY_LABELS[category])}</button>`).join('\n    ')}
  </div>`;
}

function renderYears(albums) {
  const groups = groupPublishedAlbumsByYear(albums);
  if (groups.length === 0) {
    return `<section class="tr-photo-empty" aria-labelledby="photo-stories-title">
      <span class="tr-photo-empty__index">STORIES / SOON</span>
      <div><h2 id="photo-stories-title">Истории</h2><p>Полноценные фотоистории появятся здесь, когда у меня будет серия кадров, которую действительно хочется сохранить целиком. Заполнять раздел демонстрационными альбомами только ради сетки я не хочу.</p></div>
    </section>`;
  }
  return groups.map((group) => `<section class="tr-photo-year" data-tr-photo-year="${group.year}" aria-labelledby="photo-year-${group.year}">
    <div class="tr-photo-year__head"><span>${group.year}</span><h2 id="photo-year-${group.year}">${group.year}</h2></div>
    <div class="tr-photo-album-grid">${group.albums.map(renderAlbumCard).join('\n')}</div>
  </section>`).join('\n');
}

export function renderPhotoIndexPage({albums = [], archive = [], siteUrl, templatePath = DEFAULT_INDEX_TEMPLATE}) {
  const validatedAlbums = validatePhotoAlbums(albums, {requireFiles: false});
  const validatedArchive = validatePhotoArchive(archive, {requireFiles: false});
  const cleanSiteUrl = stripTrailingSlash(siteUrl);
  const title = 'Фотографии — Руслан Немыкин';
  const description = 'Личный визуальный архив Руслана Немыкина: фотоистории о поездках, учёбе, событиях, людях и обычных моментах вне кода.';
  const content = `<div class="tr-photo-shell">
    <section class="tr-photo-index-hero" aria-labelledby="photo-title">
      <p class="tr-photo-eyebrow">VISUAL ARCHIVE · STORIES · MOMENTS</p>
      <h1 id="photo-title">Фотографии</h1>
      <p class="tr-photo-index-hero__lead">Здесь я сохраняю не всё подряд, а небольшие визуальные истории — поездки, события, людей и обычные моменты, к которым самому хочется потом вернуться.</p>
      ${renderFilters(validatedAlbums)}
    </section>
    <div class="tr-photo-chronology" data-tr-photo-chronology>${renderYears(validatedAlbums)}</div>
    <section class="tr-photo-archive" aria-labelledby="photo-archive-title">
      <div class="tr-photo-section-head"><div><span class="tr-photo-section-kicker">FROM THE ARCHIVE</span><h2 id="photo-archive-title">Из архива</h2></div><p>Несколько отдельных кадров, которые остались здесь ещё с ранней версии сайта. Я не стал искусственно превращать их в альбомы.</p></div>
      <div class="tr-photo-archive-grid">${validatedArchive.map(renderArchiveItem).join('\n')}</div>
    </section>
  </div>`;

  return applyTemplate(loadTemplate(templatePath), {
    TITLE: escapeHtml(title),
    DESCRIPTION: escapeHtml(description),
    CANONICAL: `${cleanSiteUrl}/photos/`,
    OG_IMAGE: `${cleanSiteUrl}/assets/images/avatar.png`,
    HEADER: renderHeader('../', './'),
    CONTENT: content,
    LIGHTBOX: renderLightboxShell(),
    FOOTER: renderFooter(),
  });
}

function renderAlbumPhoto(photo, album) {
  const captionParts = [photo.place, photo.date].filter(Boolean);
  const caption = photo.caption || captionParts.length
    ? `<figcaption>${captionParts.length ? `<span class="tr-photo-frame__meta">${escapeHtml(captionParts.join(' · '))}</span>` : ''}${photo.caption ? `<p>${escapeHtml(photo.caption)}</p>` : ''}</figcaption>`
    : '';
  return `<figure class="tr-photo-frame tr-photo-frame--${escapeHtml(photo.layout)}" id="${escapeHtml(photo.id)}" data-tr-photo-layout="${escapeHtml(photo.layout)}">
    <a class="tr-photo-frame__link" href="../../${escapeHtml(photo.src)}" data-tr-photo-lightbox data-tr-photo-group="album-${escapeHtml(album.slug)}" data-photo-id="${escapeHtml(photo.id)}" data-photo-title="${escapeHtml(album.title)}" data-photo-caption="${escapeHtml(photo.caption ?? '')}" data-photo-meta="${escapeHtml(captionParts.join(' · '))}">
      <img src="../../${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt)}" loading="lazy" decoding="async"${imageDimensions(photo)}>
    </a>${caption}
  </figure>`;
}

function renderStoryNavigation(previous, next) {
  if (!previous && !next) return '';
  return `<nav class="tr-photo-story-nav" aria-label="Соседние фотоистории">
    ${previous ? `<a class="tr-photo-story-nav__item tr-photo-story-nav__item--prev" href="../${escapeHtml(previous.slug)}/"><span>← Предыдущая</span><strong>${escapeHtml(previous.title)}</strong></a>` : '<span></span>'}
    ${next ? `<a class="tr-photo-story-nav__item tr-photo-story-nav__item--next" href="../${escapeHtml(next.slug)}/"><span>Следующая →</span><strong>${escapeHtml(next.title)}</strong></a>` : '<span></span>'}
  </nav>`;
}

export function renderPhotoAlbumPage(album, {siteUrl, previous = null, next = null, templatePath = DEFAULT_ALBUM_TEMPLATE} = {}) {
  const [validated] = validatePhotoAlbums([album], {requireFiles: false});
  const cleanSiteUrl = stripTrailingSlash(siteUrl);
  const places = validated.places.join(' · ');
  const meta = [places, formatAlbumDate(validated.date), `${validated.photos.length} фото`].filter(Boolean).join(' · ');
  const title = `${validated.title} — Фотоистория Руслана Немыкина`;
  const description = validated.summary;
  const content = `<article class="tr-photo-story">
    <section class="tr-photo-album-hero" aria-labelledby="album-title">
      <img class="tr-photo-album-hero__image" src="../../${escapeHtml(validated.cover)}" alt="" fetchpriority="high" decoding="async">
      <div class="tr-photo-album-hero__veil"></div>
      <div class="tr-photo-album-hero__content">
        <a class="tr-photo-back" href="../">← Все истории</a>
        <span class="tr-photo-album-hero__category">${escapeHtml(PHOTO_CATEGORY_LABELS[validated.category])}</span>
        <h1 id="album-title">${escapeHtml(validated.title)}</h1>
        <p class="tr-photo-album-hero__meta">${escapeHtml(meta)}</p>
        <p class="tr-photo-album-hero__summary">${escapeHtml(validated.summary)}</p>
        <a class="tr-photo-scroll-cue" href="#photo-story">Смотреть историю <span aria-hidden="true">↓</span></a>
      </div>
    </section>
    <section class="tr-photo-story-body" id="photo-story" aria-label="Фотографии истории ${escapeHtml(validated.title)}">
      <div class="tr-photo-editorial">${validated.photos.map((photo) => renderAlbumPhoto(photo, validated)).join('\n')}</div>
      ${renderStoryNavigation(previous, next)}
      <div class="tr-photo-story-end"><a href="../">← Вернуться в фотоархив</a></div>
    </section>
  </article>`;

  return applyTemplate(loadTemplate(templatePath), {
    TITLE: escapeHtml(title),
    DESCRIPTION: escapeHtml(description),
    CANONICAL: `${cleanSiteUrl}/photos/${validated.slug}/`,
    OG_IMAGE: `${cleanSiteUrl}/${validated.cover}`,
    SLUG: escapeHtml(validated.slug),
    HEADER: renderHeader('../../', '../'),
    CONTENT: content,
    LIGHTBOX: renderLightboxShell(),
    FOOTER: renderFooter(),
  });
}

export function renderLegacyPhotosBridge(target = '../photos/') {
  const safeTarget = escapeHtml(target);
  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0;url=${safeTarget}"><title>Фотографии — Руслан Немыкин</title><link rel="canonical" href="${safeTarget}"></head>
<body><main><h1>Фотографии</h1><p>Раздел переехал в новый фотоархив.</p><p><a href="${safeTarget}">Открыть фотоархив</a></p></main></body></html>`;
}

export function writePhotoStories({
  outputDir,
  albums,
  archive,
  siteUrl,
  indexTemplatePath = DEFAULT_INDEX_TEMPLATE,
  albumTemplatePath = DEFAULT_ALBUM_TEMPLATE,
} = {}) {
  if (!outputDir) throw new Error('outputDir is required to write photo stories');
  const validatedAlbums = validatePhotoAlbums(albums, {requireFiles: false});
  const validatedArchive = validatePhotoArchive(archive, {requireFiles: false});
  const published = validatedAlbums
    .filter((album) => album.published)
    .toSorted((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

  const indexPath = path.join(outputDir, 'photos', 'index.html');
  fs.mkdirSync(path.dirname(indexPath), {recursive: true});
  fs.writeFileSync(indexPath, renderPhotoIndexPage({albums: validatedAlbums, archive: validatedArchive, siteUrl, templatePath: indexTemplatePath}), 'utf8');

  const albumRoutes = [];
  for (const [index, album] of published.entries()) {
    const albumPath = path.join(outputDir, 'photos', album.slug, 'index.html');
    fs.mkdirSync(path.dirname(albumPath), {recursive: true});
    fs.writeFileSync(albumPath, renderPhotoAlbumPage(album, {
      siteUrl,
      previous: published[index + 1] ?? null,
      next: published[index - 1] ?? null,
      templatePath: albumTemplatePath,
    }), 'utf8');
    albumRoutes.push(`photos/${album.slug}/`);
  }

  const legacyPath = path.join(outputDir, 'landing', 'photos.html');
  fs.mkdirSync(path.dirname(legacyPath), {recursive: true});
  fs.writeFileSync(legacyPath, renderLegacyPhotosBridge('../photos/'), 'utf8');

  return {
    routes: ['photos/', ...albumRoutes],
    albumRoutes,
    indexPath,
    legacyPath,
  };
}
