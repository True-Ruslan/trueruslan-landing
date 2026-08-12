# P4.1B Google Search Console CSV Adapter

Status: **implemented against an observed operator export shape; external evidence remains sparse and review-gated**.

## Why this adapter exists

On 2026-08-12 the site owner supplied real Google Search Console exports from the production property. The files established the exact Russian-language CSV shape used by the current Search Performance export.

Private raw exports and their real metrics are not committed. Repository tests use a structurally derived synthetic fixture that preserves filenames, headers, empty-table behavior and metric syntax without preserving private observations.

## Observed performance export shape

The exported archive contained these UTF-8 CSV files:

```text
Диаграмма.csv
Запросы.csv
Страницы.csv
Страны.csv
Устройства.csv
Вид в поиске.csv
Фильтры.csv
```

The first adapter intentionally consumes only the evidence needed by the accepted normalized P4.1B contract:

- `Диаграмма.csv` — observation-window dates;
- `Запросы.csv` — query-dimension clicks, impressions, CTR and position;
- `Страницы.csv` — page-dimension clicks, impressions, CTR and position.

The remaining files are retained as raw operator evidence but are not normalized until a concrete review question requires them.

The observed metric header uses `Kлики` with a Latin `K`; the adapter also accepts the visually equivalent Cyrillic `Клики` spelling while keeping all other headers fail-closed.

## Empty low-traffic tables

A valid Search Console export may contain only the header in `Запросы.csv` when Google exposes no query rows. This is accepted as long as the page table contains evidence. An export with no query and no page rows is rejected rather than being promoted to collected evidence.

## Validation boundary

The adapter:

1. requires the three observed performance files;
2. parses CSV quoting without adding a third-party dependency;
3. derives the observation window from the dated chart rows;
4. converts percent CTR values to the normalized `[0, 1]` representation;
5. keeps absent CTR/position fields absent rather than inventing zeroes;
6. passes the resulting object through `validateExternalSearchEvidence`, preserving same-property URL, metric, provenance and temporal validation;
7. never writes raw exports or normalized private metrics into tracked repository data.

Implementation:

```text
scripts/search-discovery-google-csv.js
scripts/search-discovery-google-csv.test.js
```

## Other supplied exports

The owner also supplied Search Console indexing/HTTPS summary exports. Those current files contain aggregate problem/count summaries rather than URL-level indexing rows. The accepted P4.1B indexing contract requires explicit URLs, states and optional canonical URLs, so this adapter does **not** fabricate per-route indexing evidence from aggregate counts.

Three supplied gzip exports contained an empty `empty.tsv`; they carry no observations and are not treated as evidence.

## Evidence sufficiency

The first real Search Console performance export is useful as a sparse migration baseline, particularly for observing legacy URL visibility after the clean-URL migration. It is not sufficient by itself to claim stable CTR, ranking, engagement, indexing success or causal SEO impact.

Therefore:

- P4.1B real evidence has begun, but review remains open;
- P4.1C remains WAITING unless a concrete finding survives the migration/traffic sufficiency review;
- P3.6 remains independent and unchanged;
- the clean-URL observation clock remains `2026-08-05T00:00:00Z`.
