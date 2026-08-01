# Custom domain operations — `trueruslan.ru`

Этот runbook разделяет две разные стадии:

1. **repository readiness** — код и CI умеют собрать, проверить и опубликовать сайт как для legacy Pages URL, так и для `https://trueruslan.ru`;
2. **production cutover** — DNS GitHub Pages, TLS, canonical origin и Cloudflare Web Analytics фактически переключены на новый hostname.

Готовность репозитория не означает, что HTTPS cutover уже завершён.

## 1. Canonical configuration

Единственный hand-maintained manifest публичной site identity:

```text
data/site.json
```

Он хранит:

```json
{
  "legacyOrigin": "https://true-ruslan.github.io/trueruslan-landing",
  "customOrigin": "https://trueruslan.ru",
  "customHostname": "trueruslan.ru",
  "alternateHostname": "www.trueruslan.ru"
}
```

Production origin не должен дублироваться в `package.json`, workflows или `data/external-links.json`.

## 2. Repository variable

GitHub Actions repository variable:

```text
TR_PRODUCTION_SITE_URL
```

Допустимы только два exact value:

```text
https://true-ruslan.github.io/trueruslan-landing
https://trueruslan.ru
```

Trailing slash запрещён. Любое другое configured value останавливает resolver до build/deploy.

До финального cutover variable можно не создавать. Тогда `auto` безопасно разрешается в legacy origin.

## 3. Deployment modes

Pages workflow `Deploy static content to Pages` поддерживает:

### `auto`

Обычный режим для push в `master`.

- variable отсутствует → legacy origin;
- variable равна legacy origin → legacy;
- variable равна custom origin → custom;
- другое значение → fail closed.

### `legacy`

Принудительно использует legacy origin независимо от repository variable.

Используется для rollback и диагностики.

### `custom`

Принудительно использует `https://trueruslan.ru` независимо от repository variable.

Используется для первого контролируемого cutover после готовности DNS и TLS.

Analytics mode остаётся отдельным контрактом:

- `auto`;
- `required`;
- `disabled`.

Для первого production cutover использовать одновременно:

```text
site_mode=custom
analytics_mode=required
```

## 4. Что проверяет PR CI

Обычная browser/accessibility/visual матрица работает на legacy-default build, чтобы не менять текущие baselines.

После неё CI удаляет `docs-html`, выполняет реальную вторую сборку:

```bash
SITE_URL=https://trueruslan.ru npm run build:docs
npm run check:site
node scripts/site-artifact.js \
  docs-html \
  https://trueruslan.ru \
  https://true-ruslan.github.io/trueruslan-landing
```

Custom artifact gate проверяет:

- RU homepage canonical;
- EN homepage canonical;
- `hreflang` identity;
- `robots.txt` sitemap URL;
- `sitemap.xml` root/RU/EN identity;
- Atom self/site links;
- отсутствие legacy origin на этих public identity surfaces.

## 5. Текущее внешнее состояние на 2026-08-01

Подтверждено владельцем проекта:

- GitHub account domain verification для `trueruslan.ru` — success;
- apex A records возвращают четыре GitHub Pages IPv4 address;
- `http://trueruslan.ru/` уже отдаёт нужный сайт;
- GitHub repository Pages показывает `InvalidDNSError`;
- `Enforce HTTPS` недоступен;
- запрос `CNAME` для `www.trueruslan.ru` через Timeweb, `1.1.1.1` и `8.8.8.8` возвращал `REFUSED`;
- обращение в поддержку Timeweb открыто.

Это внешний blocker. Репозиторий не пытается обходить его собственным сертификатом или DNS automation.

## 6. Gate перед production cutover

Не выполнять окончательный cutover, пока не выполнены все условия:

1. GitHub repository `Settings → Pages` показывает успешный DNS check.
2. `https://trueruslan.ru/` открывается с валидным сертификатом.
3. `www.trueruslan.ru` корректно разрешается и перенаправляется на apex domain.
4. В GitHub Pages доступен и включён `Enforce HTTPS`.
5. В Cloudflare Web Analytics создан отдельный site для `trueruslan.ru`.
6. Получен новый public site token для нового hostname.
7. Repository variable `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` обновлена новым token.
8. Repository variable `TR_PRODUCTION_SITE_URL` установлена в exact value:

```text
https://trueruslan.ru
```

## 7. DNS verification

Apex:

```bash
dig @1.1.1.1 trueruslan.ru A +short
dig @8.8.8.8 trueruslan.ru A +short
```

Ожидаются четыре адреса:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Alternate hostname:

```bash
dig @1.1.1.1 www.trueruslan.ru CNAME +short
dig @8.8.8.8 www.trueruslan.ru CNAME +short
```

Ожидается стандартный публичный ответ:

```text
true-ruslan.github.io.
```

TXT verification record GitHub удалять нельзя.

## 8. Первый cutover

После выполнения gate:

1. Обновить `TR_PRODUCTION_SITE_URL` на `https://trueruslan.ru`.
2. Обновить `TR_CLOUDFLARE_WEB_ANALYTICS_TOKEN` token нового Cloudflare site.
3. Открыть workflow `Deploy static content to Pages`.
4. Запустить вручную:

```text
site_mode: custom
analytics_mode: required
```

5. Потребовать success для:
   - tests;
   - site deployment resolver;
   - analytics resolver;
   - build;
   - generated-site integrity;
   - generated RU/EN analytics verification;
   - Pages deployment;
   - deployed endpoint smoke;
   - RU/EN canonical identity;
   - exact analytics beacon state.
6. Сохранить `site-deployment-contract.json`, `analytics-deployment-contract.json` и `production-smoke-report.json`.
7. Проверить Cloudflare dashboard отдельно: deployed beacon и provider telemetry — разные факты.

## 9. Production verification

HTTP/HTTPS:

```bash
curl -I http://trueruslan.ru/
curl -I https://trueruslan.ru/
curl -I https://www.trueruslan.ru/
```

Ожидаемая публичная модель:

```text
http://trueruslan.ru/*      → https://trueruslan.ru/*
https://www.trueruslan.ru/* → https://trueruslan.ru/*
```

Основные routes:

```bash
curl -I https://trueruslan.ru/
curl -I https://trueruslan.ru/en/
curl -I https://trueruslan.ru/landing/projects.html
curl -I https://trueruslan.ru/landing/now.html
curl -I https://trueruslan.ru/feed.xml
curl -I https://trueruslan.ru/sitemap.xml
curl -I https://trueruslan.ru/assets/documents/cv.pdf
```

Canonical spot checks:

```bash
curl -fsSL https://trueruslan.ru/ | grep -F 'https://trueruslan.ru/'
curl -fsSL https://trueruslan.ru/en/ | grep -F 'https://trueruslan.ru/en/'
```

## 10. Rollback

Если custom deployment или verification не проходит:

1. Не ослаблять smoke/identity/analytics проверки.
2. Запустить Pages workflow вручную:

```text
site_mode: legacy
analytics_mode: auto
```

3. При необходимости вернуть `TR_PRODUCTION_SITE_URL` в:

```text
https://true-ruslan.github.io/trueruslan-landing
```

или удалить variable, чтобы `auto` снова выбрал legacy default.

4. Не удалять DNS/TXT наугад. Сначала определить, является ли failure:
   - DNS;
   - TLS;
   - Pages routing;
   - generated identity;
   - analytics hostname/token mismatch.
5. После rollback проверить legacy deployment через production smoke и weekly health.

## 11. Security/privacy boundary

Не добавлять:

- DNS-provider API token;
- GitHub Pages provisioning credentials;
- Cloudflare account API credentials;
- private TLS key/certificate;
- analytics custom events;
- cookies/persistent identifiers;
- fingerprinting/session replay/cross-site tracking.

`TR_PRODUCTION_SITE_URL` и Cloudflare site token являются public deployment identifiers, но diagnostic reports остаются bounded и не содержат analytics token/hash.
