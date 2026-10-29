# Bilingual Baptist Hymnal

A responsive, static PWA for searching the supplied Hymnary text catalog, browsing metadata, saving records, drafting a service order, and downloading the original CSV datasets.

## Run locally

With Python installed, run the included local server:

```sh
python scripts/serve.py
```

Then open `http://localhost:8000`. The service worker requires localhost or HTTPS.

Vercel uses the **Other** framework preset, `npm run build` and `public` as the output directory. The build copies the root app entry points into `public/` alongside the datasets and PWA assets.

## Data

`public/data/texts-index.json.gz` is a compact search index built from `public/data/texts.csv`. Rebuild it after changing the source CSV with `python scripts/build-index.py`. Original CSV files remain available from Open Data.

The provided text file contains catalog metadata and opening lines, not full verse transcriptions. The supplied files do not contain reliable hymn translation links, per-hymn hymnal page mappings, Scripture references, or SATB arrangements. Audio is therefore a clearly labeled synthesized chord exercise, not a hymn performance. No external search API is configured.
