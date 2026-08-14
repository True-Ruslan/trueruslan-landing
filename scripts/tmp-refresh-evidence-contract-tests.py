from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def replace_test(path: str, old_title: str, new_block: str) -> None:
    file_path = ROOT / path
    text = file_path.read_text()
    start_marker = f"test('{old_title}'"
    start = text.find(start_marker)
    assert start >= 0, f"{path}: missing test {old_title!r}"
    next_start = text.find("\ntest('", start + len(start_marker))
    end = len(text) if next_start < 0 else next_start + 1
    updated = text[:start] + new_block.rstrip() + "\n" + text[end:]
    file_path.write_text(updated)


def main() -> None:
    replace_test(
        'scripts/content-freshness-reconciliation-2026-08-11.test.js',
        'current reconciliation records the Vlezet M8.2 draft boundary without lifecycle promotion',
        r'''test('current reconciliation records accepted Vlezet M8.2 while preserving pre-production lifecycle', () => {
  const registry = project('vlezet');
  const current = currentTimeline('vlezet');
  const next = nextTimeline('vlezet');
  const controlled = snapshot('vlezet');

  assert.equal(registry.status, 'pre-production');
  assert.equal(registry.statusLabel, 'ACTIVE DEVELOPMENT');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-14');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Accepted editor slice' && /M8\.2.*accepted.*merged/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Active product slice' && /M8\.2 complete/i.test(entry.value) && /testing-policy.*coverage.*M8\.3/i.test(entry.value)));

  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/52').state, 'unavailable');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/85').state, 'merged');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/87').state, 'merged');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/87').observedAt, '2026-08-13');
  assert.equal(signal('vlezet', 'https://github.com/True-Ruslan/vlezet/pull/88').state, 'merged');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /M8\.2.*accepted.*merged/i);
  assert.match(current[0].description, /product-owner.*gate|product-owner.*accepted/i);
  assert.match(next[0].title, /testing-policy.*coverage.*M8\.3/i);
  assert.match(next[0].description, /testing-policy.*coverage.*M8\.3/i);
});''',
    )
    replace_test(
        'scripts/content-freshness-reconciliation-2026-08-11.test.js',
        'current reconciliation advances VillAIgence source convergence without expanding installed acceptance',
        r'''test('current reconciliation records VillAIgence 0.3.1 publication without inventing installed acceptance', () => {
  const registry = project('livingworld');
  const current = currentTimeline('livingworld');
  const next = nextTimeline('livingworld');
  const controlled = snapshot('livingworld');

  assert.equal(registry.status, 'release-candidate');
  assert.equal(registry.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-14');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Current official release' && entry.value === '0.3.1+1.21.1'));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Installed 0.2.0 result' && entry.value === '7 PASS / 0 FAIL'));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Current 0.3.1 acceptance' && /automated.*PASS.*VAI-PCM-MULTI-001.*PENDING/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Latest merged source capability' && /0\.3\.1.*Memory 2\.0.*recall/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Active development slice' && /VAI-PCM-MULTI-001.*pending/i.test(entry.value) && /do not start 0\.4/i.test(entry.value)));

  for (const number of [125, 153, 155, 158, 159, 160, 165, 167]) {
    assert.equal(signal('livingworld', `https://github.com/True-Ruslan/villAIgence/pull/${number}`).state, 'merged');
  }
  assert.equal(signal('livingworld', 'https://github.com/True-Ruslan/villAIgence/releases/tag/0.3.1%2B1.21.1').state, 'published');
  assert.equal(signal('livingworld', 'https://github.com/True-Ruslan/villAIgence/pull/167').observedAt, '2026-08-14');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /0\.3\.1.*corrective release.*installed canary pending/i);
  assert.match(current[0].description, /release-candidate.*ACCEPTANCE IN PROGRESS/i);
  assert.match(current[0].description, /no installed-acceptance|canary.*pending/i);
  assert.match(next[0].title, /VAI-PCM-MULTI-001.*canary/i);
  assert.match(next[0].description, /f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f/);
  assert.match(next[0].description, /Only real installed PASS evidence/i);
});''',
    )
    replace_test(
        'scripts/content-freshness-reconciliation-2026-08-11.test.js',
        'current reconciliation preserves C7 history while advancing the Portfolio Platform production baseline',
        r'''test('current reconciliation preserves C7 history while recording the N6 production baseline', () => {
  const registry = project('portfolio-platform');
  const current = currentTimeline('portfolio-platform');
  const next = nextTimeline('portfolio-platform');
  const controlled = snapshot('portfolio-platform');

  assert.equal(registry.status, 'production');
  assert.equal(controlled.status, 'verified');
  assert.equal(controlled.lastVerified, '2026-08-14');
  assert.ok(controlled.versions.some((entry) => entry.label === 'Portfolio Clarity redesign' && /C7/.test(entry.value) && /production accepted/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Current production baseline' && /f0e489d75f5bcb1f64057e1046faad877bf3f952/.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Measurement checkpoint' && /P3\.6.*NEXT.*WAITING/i.test(entry.value)));
  assert.ok(controlled.versions.some((entry) => entry.label === 'Search Discovery' && /P4\.1A READY.*P4\.1B IN PROGRESS.*SPARSE PRE-LAUNCH BASELINE.*not-published.*P4\.1C WAITING/i.test(entry.value)));
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/198').state, 'merged');
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/234').state, 'merged');
  assert.equal(signal('portfolio-platform', 'https://github.com/True-Ruslan/trueruslan-landing/pull/237').state, 'merged');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /N6.*editorial UX.*production accepted/i);
  assert.match(current[0].description, /f0e489d75f5bcb1f64057e1046faad877bf3f952/);
  assert.match(current[0].description, /not-published/i);
  assert.match(current[0].description, /no SEO, engagement or causal impact claim/i);
  assert.match(next[0].title, /Controlled manual launch.*real search.*measurement evidence/i);
  assert.match(next[0].description, /10-target \/ 38-draft/i);
  assert.match(next[0].description, /Search Console.*Yandex Webmaster/i);
});''',
    )

    replace_test(
        'scripts/current-project-evidence-state.test.js',
        'Vlezet evidence reflects current M8.2 draft without promoting lifecycle or acceptance',
        r'''test('Vlezet evidence records accepted M8.2 while preserving pre-production lifecycle', () => {
  const entry = snapshot('vlezet');
  assert.equal(entry.status, 'verified');
  assert.equal(entry.lastVerified, '2026-08-14');
  assert.equal(project('vlezet').status, 'pre-production');
  assert.equal(project('vlezet').statusLabel, 'ACTIVE DEVELOPMENT');
  assert.match(version(entry, 'Accepted editor slice'), /M8\.2.*product-owner accepted.*merged/i);
  assert.match(version(entry, 'Active product slice'), /M8\.2 complete/i);
  assert.match(version(entry, 'Active product slice'), /testing-policy.*coverage.*M8\.3/i);

  const pr = signal(entry, 'M8.2 precision drawing and structural editing PR #87');
  assert.ok(pr);
  assert.equal(pr.state, 'merged');
  assert.equal(pr.observedAt, '2026-08-13');
  assert.match(pr.scope, /product-owner acceptance/i);
  assert.match(pr.scope, /e323e331a435ae356b91decbdea80dde95028d8a/);
  assert.match(pr.scope, /Post-merge CI #5097.*CodeQL/i);
  assert.match(pr.scope, /pre-production/i);

  const reconciliation = signal(entry, 'M8.2 post-merge truth reconciliation PR #88');
  assert.ok(reconciliation);
  assert.equal(reconciliation.state, 'merged');
  assert.match(reconciliation.scope, /testing-policy.*coverage audit/i);

  assert.equal(current(vlezetTimeline).length, 1);
  assert.match(current(vlezetTimeline)[0].title, /M8\.2.*accepted.*merged/i);
  assert.equal(next(vlezetTimeline).length, 1);
  assert.match(next(vlezetTimeline)[0].title, /testing-policy.*coverage.*M8\.3/i);
});''',
    )
    replace_test(
        'scripts/current-project-evidence-state.test.js',
        'VillAIgence evidence advances source convergence while keeping 0.2.0 installed release immutable',
        r'''test('VillAIgence evidence records 0.3.1 release while keeping installed acceptance explicit and pending', () => {
  const entry = snapshot('livingworld');
  assert.equal(entry.status, 'verified');
  assert.equal(entry.lastVerified, '2026-08-14');
  assert.equal(project('livingworld').status, 'release-candidate');
  assert.equal(project('livingworld').statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(version(entry, 'Current official release'), '0.3.1+1.21.1');
  assert.equal(version(entry, 'Installed 0.2.0 result'), '7 PASS / 0 FAIL');
  assert.match(version(entry, 'Current 0.3.1 acceptance'), /automated release gates PASS.*VAI-PCM-MULTI-001.*PENDING/i);
  assert.match(version(entry, 'Active development slice'), /VAI-PCM-MULTI-001.*pending/i);
  assert.match(version(entry, 'Active development slice'), /do not start 0\.4/i);

  const corrective = signal(entry, '0.3.1 targeted Memory 2.0 recall correction PR #165');
  const handoff = signal(entry, '0.3.1 installed corrective acceptance handoff PR #167');
  const release = signal(entry, 'Official 0.3.1+1.21.1 corrective release');
  assert.ok(corrective && handoff && release);
  assert.equal(corrective.state, 'merged');
  assert.equal(handoff.state, 'merged');
  assert.equal(handoff.observedAt, '2026-08-14');
  assert.equal(release.state, 'published');
  assert.match(release.scope, /bc7c68ac2f3a4f761aa3b03a2f5c1fe1201745ab/);
  assert.match(release.scope, /f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f/);
  assert.match(release.scope, /installed corrective.*pending/i);

  assert.equal(current(villTimeline).length, 1);
  assert.match(current(villTimeline)[0].title, /0\.3\.1.*installed canary pending/i);
  assert.equal(next(villTimeline).length, 1);
  assert.match(next(villTimeline)[0].title, /VAI-PCM-MULTI-001.*canary/i);
});''',
    )
    replace_test(
        'scripts/current-project-evidence-state.test.js',
        'Portfolio Platform evidence records current production master without claiming external outcomes',
        r'''test('Portfolio Platform evidence records N6 production baseline without claiming external outcomes', () => {
  const entry = snapshot('portfolio-platform');
  assert.equal(entry.status, 'verified');
  assert.equal(entry.lastVerified, '2026-08-14');
  assert.equal(project('portfolio-platform').status, 'production');
  assert.equal(project('portfolio-platform').statusLabel, 'PRODUCTION');
  assert.equal(version(entry, 'Measurement checkpoint'), 'P3.6 — NEXT / WAITING FOR EXTERNAL EVIDENCE');
  assert.match(version(entry, 'Current production baseline'), /f0e489d75f5bcb1f64057e1046faad877bf3f952/);
  assert.match(version(entry, 'Search Discovery'), /P4\.1A READY.*P4\.1B IN PROGRESS.*SPARSE PRE-LAUNCH BASELINE.*not-published.*P4\.1C WAITING/i);

  const verifier = signal(entry, 'N6 production verifier correction PR #234');
  const reconciliation = signal(entry, 'N6 durable state reconciliation PR #237');
  assert.ok(verifier && reconciliation);
  assert.equal(verifier.state, 'merged');
  assert.equal(reconciliation.state, 'merged');
  assert.match(verifier.scope, /635b4a0760765a515277ad8abcbb1500bf646027/);
  assert.match(verifier.scope, /Work with me smoke/i);
  assert.match(reconciliation.scope, /f0e489d75f5bcb1f64057e1046faad877bf3f952/);
  assert.match(reconciliation.scope, /not-published/i);

  assert.equal(current(portfolioTimeline).length, 1);
  assert.match(current(portfolioTimeline)[0].title, /N6.*editorial UX.*production accepted/i);
  assert.equal(next(portfolioTimeline).length, 1);
  assert.match(next(portfolioTimeline)[0].title, /Controlled manual launch.*real search.*measurement evidence/i);
});''',
    )
    replace_test(
        'scripts/current-project-evidence-state.test.js',
        'freshness reconciliation preserves lifecycle and external-evidence boundaries',
        r'''test('freshness reconciliation preserves lifecycle and external-evidence boundaries', () => {
  assert.deepEqual(
    ['vlezet', 'livingworld', 'portfolio-platform'].map((slug) => [slug, project(slug).status, project(slug).statusLabel]),
    [
      ['vlezet', 'pre-production', 'ACTIVE DEVELOPMENT'],
      ['livingworld', 'release-candidate', 'ACCEPTANCE IN PROGRESS'],
      ['portfolio-platform', 'production', 'PRODUCTION'],
    ],
  );

  const portfolio = snapshot('portfolio-platform');
  const allPortfolioText = JSON.stringify(portfolio);
  assert.match(allPortfolioText, /P3\.6[^"\\]*NEXT \/ WAITING FOR EXTERNAL EVIDENCE/i);
  assert.match(allPortfolioText, /P4\.1B IN PROGRESS \/ SPARSE PRE-LAUNCH BASELINE/i);
  assert.match(allPortfolioText, /controlled launch not-published/i);
  assert.match(allPortfolioText, /P4\.1C WAITING/i);

  const livingworld = snapshot('livingworld');
  assert.equal(version(livingworld, 'Current official release'), '0.3.1+1.21.1');
  assert.equal(version(livingworld, 'Installed 0.2.0 result'), '7 PASS / 0 FAIL');
  assert.match(version(livingworld, 'Current 0.3.1 acceptance'), /PENDING/i);
  assert.match(version(livingworld, 'Active development slice'), /do not start 0\.4/i);
});

test('Node Zero freshness review keeps stale trust state without inventing acceptance', () => {
  const entry = snapshot('node-zero');
  assert.ok(entry);
  assert.equal(entry.status, 'stale');
  assert.equal(entry.lastVerified, '2026-08-14');
  const review = signal(entry, 'Stale-evidence review — no new private acceptance evidence');
  assert.ok(review);
  assert.equal(review.kind, 'manual');
  assert.equal(review.mode, 'manual');
  assert.equal(review.state, 'unavailable');
  assert.equal(review.observedAt, '2026-08-14');
  assert.match(review.scope, /remains stale \/ REVIEW REQUIRED/i);
  assert.match(review.scope, /no lifecycle, version or acceptance claim is promoted/i);
  assert.match(review.scope, /July production-foundation acceptance remains the last positive executable evidence/i);
});''',
    )

    replace_test(
        'scripts/flagship-normalization.test.js',
        'Vlezet preserves M7.8B history while M8.1 is accepted and M8.2 remains the pending product boundary',
        r'''test('Vlezet preserves recognition history while M8.2 is accepted and quality audit is next', () => {
  const evidence = evidenceMap().get('vlezet');
  assert.equal(evidence.lastVerified, '2026-08-14');
  assert.ok(evidence.versions.some(({label, value}) => label === 'Accepted recognition slice' && value === 'M7.8B'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Automatic M7.8C result' && /FAIL.*closed unmerged/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Accepted editor slice' && /M8\.2.*accepted.*merged/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Active product slice' && /M8\.2 complete/i.test(value) && /testing-policy.*coverage.*M8\.3/i.test(value)));

  const failed = findSignal(evidence, 'Automatic M7.8C');
  assert.equal(failed.state, 'failed');
  assertIncludesAll(failed.scope, ['closed unmerged', 'product-owner', 'M7.8B'], 'Vlezet automatic M7.8C failure scope');

  const benchmark = findSignal(evidence, 'Real-fixture recognition R&D');
  assert.equal(benchmark.state, 'unavailable');
  assertIncludesAll(benchmark.scope, ['closed unmerged', 'R&D evidence', 'not product-owner accepted'], 'Vlezet real-fixture R&D scope');

  const assisted = findSignal(evidence, 'Assisted Tracing design gate');
  assert.equal(assisted.state, 'unavailable');
  assertIncludesAll(assisted.scope, ['closed unmerged', 'superseded', 'historical design/R&D evidence'], 'Vlezet Assisted Tracing historical scope');

  const m82 = findSignal(evidence, 'M8.2 precision drawing and structural editing PR #87');
  assert.equal(m82.state, 'merged');
  assert.match(m82.scope, /product-owner acceptance/i);
  assert.match(m82.scope, /e323e331a435ae356b91decbdea80dde95028d8a/);
  assert.match(m82.scope, /pre-production/i);

  const reconciliation = findSignal(evidence, 'M8.2 post-merge truth reconciliation PR #88');
  assert.equal(reconciliation.state, 'merged');
  assert.match(reconciliation.scope, /testing-policy.*coverage audit/i);

  const history = readJson('data/project-history/vlezet.json');
  assert.equal(history.filter(({state}) => state === 'current').length, 1);
  assert.equal(history.filter(({state}) => state === 'next').length, 1);
  assert.match(history.find(({state}) => state === 'current').title, /M8\.2.*accepted.*merged/i);
  assert.match(history.find(({state}) => state === 'next').title, /testing-policy.*coverage.*M8\.3/i);
});''',
    )
    replace_test(
        'scripts/flagship-normalization.test.js',
        'VillAIgence preserves official 0.2 installed acceptance while later source capability advances independently',
        r'''test('VillAIgence records official 0.3.1 while installed acceptance remains an explicit separate boundary', () => {
  const evidence = evidenceMap().get('livingworld');
  assert.equal(evidence.lastVerified, '2026-08-14');
  assert.ok(evidence.versions.some(({label, value}) => label === 'Current official release' && value === '0.3.1+1.21.1'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Current 0.3.1 acceptance' && /VAI-PCM-MULTI-001.*PENDING/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Installed 0.2.0 result' && value === '7 PASS / 0 FAIL'));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Deferred installed boundaries' && value.includes('VAI-M2-INST-005') && value.includes('VAI-CONCUR-004')));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Controlled semantic boundary' && /BELIEF.*FACT.*SYSTEM_OBSERVED/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Latest merged source capability' && /0\.3\.1.*Memory 2\.0.*recall/i.test(value)));
  assert.ok(evidence.versions.some(({label, value}) => label === 'Active development slice' && /VAI-PCM-MULTI-001.*pending/i.test(value) && /do not start 0\.4/i.test(value)));

  const oldRelease = findSignal(evidence, 'Official 0.2.0+1.21.1');
  assert.equal(oldRelease.state, 'published');
  assertIncludesAll(oldRelease.scope, ['7 PASS / 0 FAIL', 'VAI-M2-INST-005', 'VAI-CONCUR-004'], 'VillAIgence 0.2 release scope');

  const installed = findSignal(evidence, 'Installed 0.2.0 clean-world');
  assert.equal(installed.state, 'accepted');
  assert.match(installed.scope, /(?:7 PASS \/ 0 FAIL|seven required[\s\S]*0 FAIL)/i);

  const corrective = findSignal(evidence, '0.3.1 targeted Memory 2.0 recall correction PR #165');
  const handoff = findSignal(evidence, '0.3.1 installed corrective acceptance handoff PR #167');
  const currentRelease = findSignal(evidence, 'Official 0.3.1+1.21.1 corrective release');
  assert.equal(corrective.state, 'merged');
  assert.equal(handoff.state, 'merged');
  assert.equal(currentRelease.state, 'published');
  assert.match(currentRelease.scope, /f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f/);
  assert.match(currentRelease.scope, /installed corrective.*pending/i);

  const history = readJson('data/project-history/livingworld.json');
  assert.equal(history.filter(({state}) => state === 'current').length, 1);
  assert.equal(history.filter(({state}) => state === 'next').length, 1);
  assert.match(history.find(({state}) => state === 'current').title, /0\.3\.1.*installed canary pending/i);
  assert.match(history.find(({state}) => state === 'next').title, /VAI-PCM-MULTI-001.*canary/i);
});''',
    )

    replace_test(
        'scripts/portfolio-platform-case-study.test.js',
        'portfolio platform evidence preserves C7 acceptance while current production advances and P3.6 stays open',
        r'''test('portfolio platform evidence preserves C7 acceptance while N6 advances production and P3.6 stays open', () => {
  const evidence = readJson(files.evidence);
  const snapshot = evidence.find(({project}) => project === 'portfolio-platform');

  assert.ok(snapshot, 'portfolio-platform evidence snapshot must exist');
  assert.equal(snapshot.status, 'verified');
  assert.equal(snapshot.lastVerified, '2026-08-14');
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Public route model' && value.includes('directory')));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Hosting' && value === 'GitHub Pages'));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Analytics' && /Cloudflare.*Yandex Metrica/i.test(value)));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Portfolio Clarity redesign' && /C7.*production accepted/i.test(value)));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Measurement checkpoint' && /P3\.6.*NEXT.*WAITING/i.test(value)));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Current production baseline' && /f0e489d75f5bcb1f64057e1046faad877bf3f952/.test(value)));
  assert.ok(snapshot.versions.some(({label, value}) => label === 'Search Discovery' && /P4\.1B IN PROGRESS.*SPARSE PRE-LAUNCH BASELINE.*not-published/i.test(value)));

  const p36c = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/pull/158');
  assert.ok(p36c, 'missing historical P3.6C implementation evidence');
  assert.equal(p36c.state, 'merged');
  assert.match(p36c.scope, /P3\.6 measurement remains open/i);

  const c7 = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/pull/198');
  assert.ok(c7, 'missing C7 feature evidence');
  assert.equal(c7.state, 'merged');
  assert.match(c7.scope, /134043fa2bb5f6612266a04eab2853f71b207328/);

  const verifier = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/pull/234');
  const reconciliation = snapshot.signals.find(({url}) => url === 'https://github.com/True-Ruslan/trueruslan-landing/pull/237');
  assert.ok(verifier && reconciliation, 'missing N6 exact production evidence');
  assert.equal(verifier.state, 'merged');
  assert.equal(reconciliation.state, 'merged');
  assert.match(verifier.scope, /635b4a0760765a515277ad8abcbb1500bf646027/);
  assert.match(verifier.scope, /Pages #255.*Production Live #564\/#565.*CodeQL #1662/i);
  assert.match(reconciliation.scope, /f0e489d75f5bcb1f64057e1046faad877bf3f952/);
  assert.match(reconciliation.scope, /not-published/i);
  assert.match(reconciliation.scope, /P4\.1B.*in progress.*P4\.1C\/P3\.6.*evidence gated/i);
});''',
    )
    replace_test(
        'scripts/portfolio-platform-case-study.test.js',
        'portfolio platform history keeps C7 historical, one current production baseline and one external-evidence next state',
        r'''test('portfolio platform history keeps C7 historical, N6 current and manual launch next', () => {
  const history = readJson(files.history);
  const current = history.filter(({state}) => state === 'current');
  const next = history.filter(({state}) => state === 'next');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.ok(history.some(({state, title}) => state === 'past' && /clean URL/i.test(title)));
  assert.ok(history.some(({state, title}) => state === 'past' && /P3\.2|case study/i.test(title)));
  assert.ok(history.some(({state, title, description}) => state === 'past' && /C7.*production baseline/i.test(title) && /134043fa2bb5f6612266a04eab2853f71b207328/.test(description)));
  assert.match(current[0].title, /N6.*editorial UX.*production accepted/i);
  assert.match(current[0].description, /f0e489d75f5bcb1f64057e1046faad877bf3f952/);
  assert.match(current[0].description, /not-published/i);
  assert.match(next[0].title, /Controlled manual launch.*real search.*measurement evidence/i);
  assert.match(next[0].description, /10-target \/ 38-draft/i);
  assert.match(next[0].description, /Search Console.*Yandex Webmaster/i);
  assert.match(next[0].description, /P4\.1C and P3\.6 remain evidence-gated/i);
});''',
    )

    replace_test(
        'scripts/product-evidence-reconciliation.test.js',
        'freshness reconciliation records current truth without promoting lifecycle, installed acceptance or measurement boundaries',
        r'''test('freshness reconciliation records current truth without promoting lifecycle, installed acceptance or measurement boundaries', () => {
  const projects = readJson('data/projects.json');
  const evidence = readJson('data/project-evidence.json');
  const vlezetHistory = readJson('data/project-history/vlezet.json');
  const livingworldHistory = readJson('data/project-history/livingworld.json');
  const portfolioHistory = readJson('data/project-history/portfolio-platform.json');

  const vlezetProject = findProject(projects, 'vlezet');
  const livingworldProject = findProject(projects, 'livingworld');
  const portfolioProject = findProject(projects, 'portfolio-platform');
  const vlezetEvidence = findEvidence(evidence, 'vlezet');
  const livingworldEvidence = findEvidence(evidence, 'livingworld');
  const portfolioEvidence = findEvidence(evidence, 'portfolio-platform');

  assert.equal(vlezetProject.status, 'pre-production');
  assert.equal(vlezetProject.statusLabel, 'ACTIVE DEVELOPMENT');
  assert.equal(vlezetEvidence.lastVerified, '2026-08-14');
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Accepted recognition slice' && value === 'M7.8B'));
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Accepted editor slice' && /M8\.2.*accepted.*merged/i.test(value)));
  assert.ok(vlezetEvidence.versions.some(({label, value}) => label === 'Active product slice' && /M8\.2 complete.*testing-policy.*coverage.*M8\.3/i.test(value)));
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/42').state, 'failed');
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/52').state, 'unavailable');
  const vlezetAccepted = signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/87');
  assert.equal(vlezetAccepted.state, 'merged');
  assert.equal(vlezetAccepted.observedAt, '2026-08-13');
  assert.match(vlezetAccepted.scope, /product-owner acceptance/i);
  assert.match(vlezetAccepted.scope, /e323e331a435ae356b91decbdea80dde95028d8a/);
  assert.equal(signal(vlezetEvidence, 'https://github.com/True-Ruslan/vlezet/pull/88').state, 'merged');
  assert.match(timelineEntry(vlezetHistory, 'vlezet', 'current').title, /M8\.2.*accepted.*merged/i);
  assert.match(timelineEntry(vlezetHistory, 'vlezet', 'next').title, /testing-policy.*coverage.*M8\.3/i);

  assert.equal(livingworldProject.status, 'release-candidate');
  assert.equal(livingworldProject.statusLabel, 'ACCEPTANCE IN PROGRESS');
  assert.equal(livingworldEvidence.lastVerified, '2026-08-14');
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Current official release' && value === '0.3.1+1.21.1'));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Current 0.3.1 acceptance' && /VAI-PCM-MULTI-001.*PENDING/i.test(value)));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Installed 0.2.0 result' && /7 PASS \/ 0 FAIL/.test(value)));
  assert.ok(livingworldEvidence.versions.some(({label, value}) => label === 'Deferred installed boundaries' && /VAI-M2-INST-005.*VAI-CONCUR-004/.test(value)));
  assert.equal(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/releases/tag/0.3.1%2B1.21.1').state, 'published');
  assert.equal(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/165').state, 'merged');
  assert.equal(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/167').state, 'merged');
  assert.match(signal(livingworldEvidence, 'https://github.com/True-Ruslan/villAIgence/pull/167').scope, /No installed PASS is claimed/i);
  assert.match(timelineEntry(livingworldHistory, 'livingworld', 'current').title, /0\.3\.1.*installed canary pending/i);
  assert.match(timelineEntry(livingworldHistory, 'livingworld', 'next').title, /VAI-PCM-MULTI-001.*canary/i);

  assert.equal(portfolioProject.status, 'production');
  assert.equal(portfolioProject.statusLabel, 'PRODUCTION');
  assert.equal(portfolioEvidence.lastVerified, '2026-08-14');
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Portfolio Clarity redesign' && /C7.*production accepted/i.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Measurement checkpoint' && /P3\.6.*NEXT.*WAITING/i.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Current production baseline' && /f0e489d75f5bcb1f64057e1046faad877bf3f952/.test(value)));
  assert.ok(portfolioEvidence.versions.some(({label, value}) => label === 'Search Discovery' && /P4\.1B IN PROGRESS.*SPARSE PRE-LAUNCH BASELINE.*not-published/i.test(value)));
  assert.equal(signal(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/pull/234').state, 'merged');
  assert.equal(signal(portfolioEvidence, 'https://github.com/True-Ruslan/trueruslan-landing/pull/237').state, 'merged');
  assert.match(timelineEntry(portfolioHistory, 'portfolio-platform', 'current').title, /N6.*editorial UX.*production accepted/i);
  assert.match(timelineEntry(portfolioHistory, 'portfolio-platform', 'next').title, /Controlled manual launch.*real search.*measurement evidence/i);

  const projectState = readText('docs/PROJECT_STATE.md');
  const roadmap = readText('docs/ROADMAP.md');
  const changelog = readText('docs/CHANGELOG.md');
  assert.match(projectState, /P3\.6.*NEXT \/ WAITING/is);
  assert.match(roadmap, /P3\.6.*NEXT \/ WAITING/is);
  assert.match(changelog, /P3\.6.*NEXT \/ WAITING/is);
  for (const source of [projectState, roadmap, changelog]) {
    assert.doesNotMatch(source, /P3\.6\s*(?:—|-|:)\s*(?:ACCEPTED|COMPLETED)/i);
  }
});''',
    )

    replace_test(
        'scripts/villaigence-flagship.test.js',
        'VillAIgence timeline keeps installed release and merged source work historical while 0.3 release convergence is current',
        r'''test('VillAIgence timeline keeps installed 0.2 historical while 0.3.1 corrective acceptance is current', () => {
  const history = readJson(HISTORY_PATH);
  const current = history.filter(({state}) => state === 'current');
  const next = history.filter(({state}) => state === 'next');
  const release = history.find(({evidence}) => evidence === 'https://github.com/True-Ruslan/villAIgence/pull/120');
  const convergence = history.find(({evidence}) => evidence === 'https://github.com/True-Ruslan/villAIgence/pull/160');

  assert.equal(current.length, 1);
  assert.equal(next.length, 1);
  assert.match(current[0].title, /0\.3\.1.*corrective release.*installed canary pending/i);
  assert.match(current[0].description, /release-candidate \/ ACCEPTANCE IN PROGRESS/i);
  assert.match(current[0].description, /no installed-acceptance or 0\.4 claim/i);
  assert.equal(current[0].evidence, 'https://github.com/True-Ruslan/villAIgence/pull/167');
  assert.equal(release.state, 'past');
  assert.equal(release.version, '0.2.0+1.21.1');
  assert.match(release.description, /7 PASS \/ 0 FAIL/);
  assert.equal(convergence.state, 'past');
  assert.match(convergence.description, /publication was skipped/i);
  assert.match(next[0].title, /VAI-PCM-MULTI-001.*canary/i);
  assert.match(next[0].description, /f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f/);
  assert.match(next[0].description, /Only real installed PASS evidence/i);
  assert.match(next[0].description, /unblock 0\.4/i);
});''',
    )
    replace_test(
        'scripts/villaigence-flagship.test.js',
        'VillAIgence evidence separates official release, installed acceptance and merged 0.3 source convergence',
        r'''test('VillAIgence evidence separates official 0.3.1 release from pending installed corrective acceptance', () => {
  const evidence = readJson(EVIDENCE_PATH).find(({project}) => project === 'livingworld');

  assert.ok(evidence, 'livingworld evidence snapshot must remain present');
  assert.equal(evidence.lastVerified, '2026-08-14');

  const versions = new Map(evidence.versions.map(({label, value}) => [label, value]));
  assert.equal(versions.get('Current official release'), '0.3.1+1.21.1');
  assert.equal(versions.get('Installed 0.2.0 result'), '7 PASS / 0 FAIL');
  assert.match(versions.get('Current 0.3.1 acceptance'), /automated release gates PASS.*VAI-PCM-MULTI-001.*PENDING/i);
  assert.match(versions.get('Deferred installed boundaries'), /VAI-M2-INST-005.*VAI-CONCUR-004/);
  assert.match(versions.get('Controlled semantic boundary'), /BELIEF.*FACT.*SYSTEM_OBSERVED/i);
  assert.match(versions.get('Latest merged source capability'), /0\.3\.1.*Memory 2\.0.*recall/i);
  assert.match(versions.get('Active development slice'), /VAI-PCM-MULTI-001.*pending/i);
  assert.match(versions.get('Active development slice'), /do not start 0\.4/i);

  const installed = evidence.signals.find(({label}) => label.includes('Installed 0.2.0 clean-world'));
  assert.ok(installed, 'missing historical installed 0.2 acceptance evidence');
  assert.equal(installed.state, 'accepted');
  assert.match(installed.scope, /(?:7 PASS \/ 0 FAIL|seven required[\s\S]*0 FAIL)/i);
  assert.match(installed.scope, /NOT TESTED/);

  const release = evidence.signals.find(({label}) => label === 'Official 0.3.1+1.21.1 corrective release');
  assert.ok(release, 'missing 0.3.1 release evidence');
  assert.equal(release.kind, 'release');
  assert.equal(release.state, 'published');
  assert.match(release.scope, /bc7c68ac2f3a4f761aa3b03a2f5c1fe1201745ab/);
  assert.match(release.scope, /f7f40b920c6f72a0e9af864795f48a0f90479db42a145081f43923b71a95e29f/);
  assert.match(release.scope, /installed corrective.*pending/i);

  const corrective = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/165');
  const handoff = evidence.signals.find(({url}) => url === 'https://github.com/True-Ruslan/villAIgence/pull/167');
  assert.ok(corrective && handoff, 'missing 0.3.1 corrective PR evidence');
  assert.equal(corrective.state, 'merged');
  assert.equal(handoff.state, 'merged');
  assert.equal(handoff.observedAt, '2026-08-14');
  assert.match(handoff.scope, /No installed PASS is claimed/i);
  assert.match(handoff.scope, /VAI-M2-INST-005.*VAI-CONCUR-004/i);
});''',
    )

    replace_test(
        'scripts/vlezet-draft-drift.test.js',
        'Vlezet keeps failed M7.8C history while M8.1 is accepted and current M8.2 remains pending',
        r'''test('Vlezet keeps failed M7.8C history while M8.2 is accepted and pre-production remains unchanged', () => {
  const evidence = JSON.parse(fs.readFileSync(EVIDENCE_PATH, 'utf8'));
  const vlezet = evidence.find((entry) => entry.project === 'vlezet');

  assert.ok(vlezet, 'missing Vlezet evidence snapshot');
  assert.equal(vlezet.status, 'verified');
  assert.equal(vlezet.lastVerified, '2026-08-14');

  const versions = new Map(vlezet.versions.map(({label, value}) => [label, value]));
  assert.equal(versions.get('Accepted recognition slice'), 'M7.8B');
  assert.match(versions.get('Automatic M7.8C result'), /FAIL.*closed unmerged/i);
  assert.match(versions.get('Accepted editor slice'), /M8\.2.*product-owner accepted.*merged/i);
  assert.match(versions.get('Active product slice'), /M8\.2 complete/i);
  assert.match(versions.get('Active product slice'), /testing-policy.*coverage.*M8\.3/i);

  const m78c = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/42');
  assert.ok(m78c, 'missing bounded M7.8C failure signal');
  assert.equal(m78c.state, 'failed');
  assert.match(m78c.scope, /closed unmerged/i);
  assert.match(m78c.scope, /product-owner.*failed usefulness acceptance/i);
  assert.match(m78c.scope, /M7\.8B/i);

  const assisted = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/52');
  assert.ok(assisted, 'missing historical Assisted Tracing signal');
  assert.equal(assisted.state, 'unavailable');
  assert.match(assisted.scope, /closed unmerged/i);
  assert.match(assisted.scope, /superseded/i);

  const m82 = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/87');
  assert.ok(m82, 'missing accepted M8.2 signal');
  assert.equal(m82.kind, 'pr');
  assert.equal(m82.mode, 'automated');
  assert.equal(m82.state, 'merged');
  assert.equal(m82.observedAt, '2026-08-13');
  assert.match(m82.scope, /product-owner acceptance/i);
  assert.match(m82.scope, /e323e331a435ae356b91decbdea80dde95028d8a/);
  assert.match(m82.scope, /Post-merge CI #5097.*CodeQL/i);
  assert.match(m82.scope, /pre-production/i);

  const reconciliation = vlezet.signals.find(({url}) => url === 'https://github.com/True-Ruslan/vlezet/pull/88');
  assert.ok(reconciliation, 'missing M8.2 post-merge reconciliation signal');
  assert.equal(reconciliation.state, 'merged');
  assert.match(reconciliation.scope, /testing-policy.*coverage audit/i);

  assert.doesNotMatch(
    [m78c.scope, assisted.scope, m82.scope, reconciliation.scope].join('\n'),
    /M7\.8C.*product-owner accepted|M8\.2.*production-ready|M8\.2.*released/i,
  );
});''',
    )


if __name__ == '__main__':
    main()
