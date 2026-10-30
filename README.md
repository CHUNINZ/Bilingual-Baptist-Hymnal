# Bilingual Baptist Hymnal

## Overview

Bilingual Baptist Hymnal is a responsive, installable app with **300 English hymns** and their available verses and choruses. Search by title, hymn number, or lyric line, then read, save, share, or project a hymn. An additional **168 metadata-only records** can be searched by title, source number, or category; they do not include lyrics. You can also organize songs into a service list and use the practice player to adjust key, tempo, and vocal parts. After loading, the app and hymn data are available offline.

## Features

- Search full-text hymns by title, number, or lyrics; search the additional index by title, number, or category.
- Browse alphabetically, by source number, or by worship topic.
- Read available verses and choruses, adjust text size, save hymns, and share links.
- Display full-text hymns in a high-contrast Stage view.
- Create and reorder a service list.
- Practice with synthesized chords, key and tempo controls, and part toggles.
- Switch between light and dark themes.
- Use the app offline after its files and hymn data are cached.

## Highlights

- Complete available lyrics for 300 English hymns.
- A separate index of 168 titles, source numbers, and categories; no lyrics from that source are bundled.
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

- Full lyrics: [Open Hymnal JSON Watchman collection](https://github.com/h1rdr3v2/open-hymnal-json/tree/main/hymns/watchman). Its JSON and MIT license notice are included in `public/data/`.
- Metadata-only index: [Gospel Hymns & Songs](https://github.com/marvinjude/gospel-hymns/tree/master/Hymns). It contains titles, source numbers, and categories only; no lyric text is bundled from this source.
- Supplied CSV files are archived in `source-data/` and are not included in app search.
