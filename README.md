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

## Optional full-text overlay

The reader can display complete verses from `public/data/hymn-lyrics.json`. This must be a JSON array whose records use the exact `textAuthNumber` from `texts.csv`. A verse may contain `english`, `tagalog`, or generic `text` fields. When both `english` and `tagalog` are present for every verse, the reader displays aligned language columns on desktop and stacked columns on mobile. Optional record fields include `language`, `refrain`, `source`, `sourceUrl`, and `license`. The app joins lyrics by that exact catalog ID; it never matches verses by title alone. If an ID has no usable lyric entry, the reader shows only the supplied opening line.

`scripts/fill_hymn_lyrics.py` can create a licensed overlay from a JSON array containing Hymnary text IDs and links. It accepts only explicit public-domain or recognized Creative Commons licenses and skips unknown or copyrighted records. The filler retrieves the representative text in its source language; it does not translate lyrics into Tagalog. The Scripture API index builder produces Scripture-linked records only and requires one or more Scripture references; it is not a complete lyric export for all 290,129 text records. Review source and edition differences before treating a representative text as the wording of a particular hymnal.
