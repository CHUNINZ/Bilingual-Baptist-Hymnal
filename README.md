# Bilingual Baptist Hymnal

A responsive, offline-first hymnal PWA focused on 300 English hymns with complete lyrics from the Open Hymnal JSON Watchman collection.

## Hymn collection

Search by title, source hymn number, or any line in a verse or chorus. Open a result to read every available verse, save it, add it to a service order, share it, or show the lyrics in Stage view. The collection is cached for offline use after it has loaded once.

The source collection is available at <https://github.com/h1rdr3v2/open-hymnal-json/tree/main/hymns/watchman>. The JSON and MIT license notice are included in `public/data/`.

## Run locally

With Python installed:

```sh
python scripts/serve.py
```

Open `http://localhost:8000`. The service worker requires localhost or HTTPS.

Vercel uses the **Other** framework preset, `npm run build`, and `public` as the output directory. The build copies the app entry points into `public/`.

## Archived source files

The supplied CSVs and their search index are kept in `source-data/` for reference. They are not bundled into the PWA or included in hymnal search. To rebuild that archived index, run `python scripts/build-index.py`.
