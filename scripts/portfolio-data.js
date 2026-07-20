const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_RELATIVE_HREF = /^(?:\.\/|\.\.\/|landing\/|assets\/|_assets\/)[^\s]*$/;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function assertText(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function assertId(value, label) {
  assertText(value, label);
  if (!ID_PATTERN.test(value)) {
    throw new Error(`${label} must match ${ID_PATTERN}.`);
  }
}

function assertHref(value, label) {
  assertText(value, label);
  const isHttps = /^https:\/\//i.test(value);
  if (!isHttps && !SAFE_RELATIVE_HREF.test(value)) {
    throw new Error(`${label} href must be a safe relative path or https URL.`);
  }
}

export function validatePortfolioData(data) {
  if (!data || !Array.isArray(data.currentProjects) || !Array.isArray(data.graphTopics)) {
    throw new Error('Portfolio data must contain currentProjects and graphTopics arrays.');
  }

  const projectIds = new Set();
  for (const project of data.currentProjects) {
    assertId(project.id, 'Current project id');
    if (projectIds.has(project.id)) {
      throw new Error(`Duplicate current project id: ${project.id}`);
    }
    projectIds.add(project.id);
    assertText(project.title, `Project ${project.id} title`);
    assertText(project.status, `Project ${project.id} status`);
    assertText(project.summary, `Project ${project.id} summary`);
    assertHref(project.href, `Project ${project.id}`);
    if (!Array.isArray(project.tags) || !project.tags.length) {
      throw new Error(`Project ${project.id} tags must be a non-empty array.`);
    }
    project.tags.forEach((tag) => assertText(tag, `Project ${project.id} tag`));
  }

  const topicIds = new Set();
  for (const topic of data.graphTopics) {
    assertId(topic.id, 'Graph topic id');
    if (topicIds.has(topic.id)) {
      throw new Error(`Duplicate graph topic id: ${topic.id}`);
    }
    topicIds.add(topic.id);
    assertText(topic.label, `Graph topic ${topic.id} label`);
    assertText(topic.description, `Graph topic ${topic.id} description`);
    if (!Array.isArray(topic.links) || !topic.links.length) {
      throw new Error(`Graph topic ${topic.id} links must be a non-empty array.`);
    }
    for (const link of topic.links) {
      assertText(link.label, `Graph topic ${topic.id} link label`);
      assertHref(link.href, `Graph topic ${topic.id} link`);
    }
  }

  return data;
}

export function renderCurrentlyBuilding(projects) {
  return `<section class="tr-home-section tr-currently-building" aria-labelledby="currently-building-title">
  <div class="tr-home-section-head">
    <h2 id="currently-building-title">Currently building</h2>
    <p>То, что находится в активной разработке прямо сейчас — с честным статусом вместо декоративного “coming soon”.</p>
  </div>
  <div class="tr-currently-building__grid">
${projects.map((project, index) => `    <article class="tr-current-project" data-project="${escapeHtml(project.id)}">
      <div class="tr-current-project__top">
        <span class="tr-current-project__index">0${index + 1}</span>
        <span class="tr-current-project__status">${escapeHtml(project.status)}</span>
      </div>
      <h3><a href="${escapeHtml(project.href)}">${escapeHtml(project.title)}</a></h3>
      <p>${escapeHtml(project.summary)}</p>
      <div class="tr-current-project__tags" aria-label="Технологии">
        ${project.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
      </div>
      <a class="tr-current-project__cta" href="${escapeHtml(project.href)}">Открыть →</a>
    </article>`).join('\n')}
  </div>
</section>`;
}

function renderGraphLinks(topic) {
  return topic.links
    .map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)} →</a>`)
    .join('');
}

export function renderEngineeringGraph(topics) {
  const [first] = topics;
  const controls = topics.map((topic, index) => `        <button type="button" class="tr-engineering-node${index === 0 ? ' is-active' : ''}" data-tr-graph-topic="${escapeHtml(topic.id)}" aria-pressed="${index === 0 ? 'true' : 'false'}">
          <span>${escapeHtml(topic.label)}</span>
        </button>`).join('\n');

  const payload = escapeHtml(JSON.stringify(topics));
  const noScript = topics.map((topic) => `      <section><h3>${escapeHtml(topic.label)}</h3><p>${escapeHtml(topic.description)}</p><p>${renderGraphLinks(topic)}</p></section>`).join('\n');

  return `<section class="tr-home-section tr-engineering-graph" aria-labelledby="engineering-graph-title" data-tr-engineering-graph>
  <div class="tr-home-section-head">
    <h2 id="engineering-graph-title">Engineering Graph</h2>
    <p>Не список технологий, а карта связей между тем, чем я занимаюсь, что строю и какие инженерные решения исследую.</p>
  </div>
  <div class="tr-engineering-graph__surface">
    <div class="tr-engineering-graph__nodes" role="group" aria-label="Инженерные направления">
${controls}
    </div>
    <aside class="tr-engineering-graph__detail" aria-live="polite">
      <span class="tr-engineering-graph__label">SELECTED NODE</span>
      <h3 data-tr-graph-title>${escapeHtml(first.label)}</h3>
      <p data-tr-graph-description>${escapeHtml(first.description)}</p>
      <div class="tr-engineering-graph__links" data-tr-graph-links>${renderGraphLinks(first)}</div>
    </aside>
  </div>
  <script type="application/json" data-tr-engineering-graph-data>${payload}</script>
  <noscript>
    <div class="tr-engineering-graph__noscript">
${noScript}
    </div>
  </noscript>
</section>`;
}
