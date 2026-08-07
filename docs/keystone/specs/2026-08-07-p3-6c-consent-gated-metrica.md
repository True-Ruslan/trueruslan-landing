# P3.6C — Consent-gated Yandex Metrica browser collection

> Status: IMPLEMENTED IN PR #158 / PRODUCTION ACCEPTANCE PENDING EXACT DEPLOYMENT
>
> Date: 2026-08-07

## Scope

P3.6B and P3.6C are separate layers. **P3.6B — Reports API** reads aggregate Yandex Metrica statistics through read-only OAuth. **P3.6C — browser collection** may load the public Yandex Metrica tag only after explicit visitor consent.

Cloudflare Web Analytics remains independent and unchanged. P3.6C does not replace it. P3.6 measurement remains open and is not accepted merely because another collection source exists.

## Browser privacy contract

Production receives only the public repository variable `YANDEX_METRIKA_COUNTER_ID`, mapped to `TR_YANDEX_METRIKA_COUNTER_ID` during the Pages build. The browser does not use OAuth and never receives the P3.6B token.

The controller is injected after clean URLs so final directory-route HTML is covered. Without a configured counter the Yandex postprocessor is a no-op.

With a configured counter, generated HTML contains a first-party consent controller but **no Yandex provider network request before consent**. Provider cookies are possible only after consent because `https://mc.yandex.ru/metrika/tag.js` is inserted dynamically only after the visitor chooses Allow / Разрешить.

The only first-party preference is `tr_privacy_consent_v1 = granted | denied`. It stores the analytics choice, not a visitor identity. Before consent and after denial the controller sets `window['disableYaCounter' + counterId] = true` and does not load the provider tag.

The settings control lets the visitor withdraw / отозвать consent. An initial denial before the provider is loaded immediately stores `denied`, keeps the disable flag active and leaves the provider unloaded. If the visitor withdraws consent **after Metrica has already been initialized in the current document**, the controller first stores `denied` and sets the disable flag, then reloads the page. The new document reads the denied preference and sets `disableYaCounter... = true` before any Metrica initialization, so the provider tag is not loaded again. This avoids relying on an undocumented assumption that changing the flag after `init` tears down an already initialized library. Provider cookies that already exist after a prior opt-in **may persist until provider/browser expiry**; P3.6C does not claim they are deleted immediately.

## Bounded initialization

The only permitted initialization is:

```js
ym(counterId, 'init', {
  clickmap: false,
  trackLinks: false,
  accurateTrackBounce: false,
  webvisor: false,
  trackHash: false,
  sendTitle: false,
});
```

P3.6C permits **no custom events**, **no user parameters**, **no ecommerce**, and **no noscript tracking**. It also forbids Webvisor/session replay, Click Map, automatic outbound-link tracking, accurate-bounce events, hash tracking and page-title transmission.

The consent text describes traffic statistics and provider cookies. It does not promise anonymous collection.

## Verification

PR builds intentionally receive no counter ID. A fake-counter browser smoke injects the controller into a temporary artifact and proves: zero Yandex requests before consent; zero after denial; one attempted tag load after opt-in; the exact bounded `init` object; withdrawal after active initialization forces a reload; the reloaded denied-state document makes zero new Yandex requests and contains no provider script; and RU/EN copy is correct. Fake provider traffic is intercepted locally.

The Pages workflow verifies the final artifact before upload and rejects missing or duplicate controllers, wrong counter binding, static Yandex scripts, noscript tracking, or broader options. The verification report omits the counter ID.

Analytics failure never controls rendering, navigation, search, evidence labels or product truth.

## Counter-side operator gate

Frontend controls do not configure every counter-side feature. Before final production acceptance, verify in Yandex Metrica:

- **Do not store full IP addresses of site visitors / Не сохранять полный IP-адрес посетителей** — enabled;
- Webvisor disabled (`code_options.visor = false`);
- Click Map disabled (`code_options.clickmap = false`);
- ecommerce disabled (`code_options.ecommerce = false`);
- hash tracking disabled (`code_options.track_hash = false`);
- automatic goals disabled (`autogoals_enabled = false`);
- advanced first-party collection disabled (`counter_flags.collect_first_party_data = false`);
- Measurement Protocol disabled unless separately required (`counter_flags.measurement_enabled = false`);
- market benchmark contribution reviewed and preferably disabled for the minimal profile (`counter_flags.use_in_benchmarks = false`);
- GDPR/Data Processing Agreement state reviewed as applicable.

The existing OAuth permission remains `metrika:read`. OAuth is not part of browser deployment. Counter-side changes are not made silently by this feature.

## Acceptance boundary

P3.6C requires exact-head CI, consent lifecycle browser smoke, security/dependency gates, zero unresolved review findings, exact Pages deployment, final artifact verification with the real counter variable, and a Production Live Smoke proving zero Yandex provider requests on a fresh page before consent. Production acceptance automation must not click Allow on the real site.

Even after P3.6C acceptance, **P3.6 MEASUREMENT remains NOT ACCEPTED** until its real equal-duration observation windows, minimum duration, traffic-sufficiency assessment and human review are complete.
