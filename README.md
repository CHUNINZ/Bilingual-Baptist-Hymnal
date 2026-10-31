# Bilingual Baptist Hymnal

## Overview

Bilingual Baptist Hymnal is a responsive, installable app with **1,278 English hymn records** and their available verses and choruses. Search by title, catalog number, source number, category, or lyric line, then read, save, share, or project a hymn. You can also organize songs into a service list and use the practice player to adjust key, tempo, and vocal parts. After loading, the app and hymn data are available offline.

## Features

- Search all 1,278 full-text hymn records by title, catalog number, source number, category, or lyrics.
- Browse alphabetically, by source number, or by worship topic.
- Read available verses and choruses, adjust text size, save hymns, and share links.
- Display full-text hymns in a high-contrast Stage view.
- Create and reorder a service list.
- Practice with synthesized chords, key and tempo controls, and part toggles.
- Switch between light and dark themes.
- Use the app offline after its files and hymn data are cached.

## Highlights

- Complete available lyrics for 1,278 English hymn records.
- The 168 supplemental hymns retain their source numbers and categories, with verses and refrains parsed from the supplied text files.
- The 810 imported records retain their source numbers and categories; repeated titles already represented in the catalog were skipped.
- Responsive layouts for desktop, tablet, and mobile.
- Saved hymns and service lists persist in the browser without an account.
- Service worker caching supports offline use.
- Practice audio is synthesized in the browser; it is not a recording of each hymn’s melody.

## Built with

| Area | Technology |
| --- | --- |
| Interface | HTML |
| Styling | CSS |
| App behavior | JavaScript |
| Hymn data | JSON |
| Offline support | Web App Manifest, service worker, and Cache API |
| Local storage | Browser `localStorage` |
| Practice audio | Web Audio API |
| Build | Node.js static build script |
| Hosting | Vercel |
| Source control | GitHub |

## Data sources

- Full lyrics for the core 300: [Open Hymnal JSON Watchman collection](https://github.com/h1rdr3v2/open-hymnal-json/tree/main/hymns/watchman). Its JSON and MIT license notice are included in `public/data/`.
- Supplemental lyrics for 168 hymns were parsed from the numbered `.txt` files supplied for this project. The [Gospel Hymns & Songs repository](https://github.com/marvinjude/gospel-hymns/tree/master/Hymns) is listed as the source collection; its repository does not identify a redistribution license.
- A further 810 missing-title lyric records were extracted from `hymns.json` supplied for this project and are stored in `public/data/provided-hymns.json`.
- Supplied CSV files are archived in `source-data/` and are not included in app search.
