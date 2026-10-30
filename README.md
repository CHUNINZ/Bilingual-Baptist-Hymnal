# Bilingual Baptist Hymnal

## Overview

Bilingual Baptist Hymnal is a responsive, installable Progressive Web App for finding and displaying hymn lyrics. Its active full-text collection contains **300 English hymns** with the verses and choruses supplied for each text. Search finds hymns by title, source hymn number, category, or lyric text. A separate index adds **168 hymn title records** with source numbers and categories; those entries do not contain lyrics. Hymn data and the app shell are cached in the browser so the collection can be used offline after it has loaded.

## Features

- Search the 300 full-text hymns by title, source number, or words in the lyrics.
- Search the additional metadata index by title, source number, and category.
- Browse available records alphabetically or by source number, and explore the app’s worship-topic shortcuts.
- Read available verses and choruses in the full-text collection.
- Open full-text hymns in a high-contrast Stage view for projection.
- Save full-text hymns, share their links, and add songs to a reorderable service list.
- Adjust reader text size and switch between light and dark themes.
- Use the browser-generated practice player controls for key, tempo, and S/A/T/B part toggles. The player makes a simple synthesized chord pattern; it does not contain hymn-specific SATB scores or recordings.
- Install the PWA on supported browsers and use its cached shell and hymn data offline after the first successful load.
- Download the full-text Watchman JSON and the separate metadata-only index from the app’s Open Data page.

## Highlights

- **300 full-text hymns:** Search results link to the supplied complete text records and their available verses and choruses.
- **168 additional index entries:** These provide titles, source numbers, and categories only. Lyrics from the Gospel Hymns & Songs repository are not included because its repository does not identify a redistribution license.
- **One offline catalog:** The service worker caches the application and fetched data for later offline use.
- **Local personalization:** Saved hymns, service lists, and theme preference are stored in the browser; reader text size can be adjusted during reading. No account is required.
- **Responsive presentation:** Layouts support mobile and desktop use, with a dedicated Stage view for full-text hymns.
- **Source-aware downloads:** Each dataset is identified separately, and the full-text Watchman collection includes its MIT license notice.

## Built with

| Area | Technology or format |
| --- | --- |
| User interface | HTML |
| Styling and responsive layouts | CSS |
| Application behavior and search | JavaScript (ES modules) |
| Full-text hymn catalog | JSON; Open Hymnal JSON Watchman collection |
| Additional hymn index | JSON; title, source number, and category only |
| Offline support | Progressive Web App manifest, service worker, and Cache API |
| Saved items and preferences | Browser `localStorage` |
| Practice audio | Web Audio API synthesized chord pattern |
| Static build | Node.js script (`npm run build`) |
| Hosting and deployment | Vercel static output from `public/` |
| Source control | GitHub |

## Data sources

- **Full lyrics:** [Open Hymnal JSON Watchman collection](https://github.com/h1rdr3v2/open-hymnal-json/tree/main/hymns/watchman). Its JSON and MIT license notice are included in `public/data/`.
- **Metadata-only index:** [Gospel Hymns & Songs hymn files](https://github.com/marvinjude/gospel-hymns/tree/master/Hymns). The index includes titles, source numbers, and categories only. No lyric text is bundled from this repository; its repository does not state a redistribution license.
- Supplied CSV source files are archived under `source-data/` and are not included in the app’s search catalog.

## Build and run locally

Requirements: Node.js and Python 3.

```sh
npm run build
python -m http.server 8000 --directory public
```

Open <http://localhost:8000>. Serving on localhost or HTTPS is required for service worker support. Vercel uses the **Other** framework preset, runs `npm run build`, and serves `public/` as the output directory.
