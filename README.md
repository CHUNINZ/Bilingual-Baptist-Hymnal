# Bilingual Baptist Hymnal

## Overview

Bilingual Baptist Hymnal is a responsive, installable app with **468 English hymns** and their available verses and choruses. The collection combines 300 full-text hymns from the Open Hymnal JSON Watchman collection with 168 additional texts parsed from the numbered `.txt` files supplied for this project. Search by title, hymn number, category, or lyric line, then read, save, share, or project a hymn. You can also organize songs into a service list and use the practice player to adjust key, tempo, and vocal parts. After loading, the app and hymn data are available offline.

## Features

- Search all 468 full-text hymns by title, source number, category, or lyrics.
- Browse alphabetically, by source number, or by worship topic.
- Read available verses and choruses, adjust text size, save hymns, and share links.
- Display full-text hymns in a high-contrast Stage view.
- Create and reorder a service list.
- Practice with synthesized chords, key and tempo controls, and part toggles.
- Switch between light and dark themes.
- Use the app offline after its files and hymn data are cached.

## Highlights

- Complete available lyrics for 468 English hymns.
- The 168 supplemental hymns retain their source numbers and categories, with verses and refrains parsed from the supplied text files.
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
- Supplied CSV files are archived in `source-data/` and are not included in app search.
