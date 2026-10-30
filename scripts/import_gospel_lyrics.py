#!/usr/bin/env python3
"""Merge supplied numbered hymn text files into the Gospel metadata index."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def split_lyrics(text: str) -> tuple[list[dict[str, object]], str]:
    blocks = re.split(r"\n[ \t]*\n", text.strip())
    lyrics: list[dict[str, object]] = []
    verse_number = 0
    first_line = ""
    for block in blocks:
        lines = [line.rstrip().strip() for line in block.splitlines() if line.strip()]
        if not lines:
            continue
        raw_lines = [line for line in block.splitlines() if line.strip()]
        indentation = [len(line) - len(line.lstrip()) for line in raw_lines]
        is_chorus = min(indentation, default=0) >= 4
        if not is_chorus:
            verse_number += 1
            if not first_line:
                first_line = lines[0]
        lyrics.append({
            "number": verse_number if is_chorus else verse_number,
            "type": "chorus" if is_chorus else "verse",
            "content": "\n".join(lines),
        })
    return lyrics, first_line


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--index", type=Path, required=True)
    parser.add_argument("--lyrics-dir", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    index = json.loads(args.index.read_text(encoding="utf-8"))
    by_number: dict[int, Path] = {}
    for path in args.lyrics_dir.glob("*.txt"):
        match = re.match(r"^(\d+)\s+.+?(?:\s+\(\d+\))?\.txt$", path.name, re.IGNORECASE)
        if not match:
            continue
        number = int(match.group(1))
        current = by_number.get(number)
        # Prefer the original attachment filename over duplicate “(1)” copies.
        if current is None or (re.search(r"\s+\(\d+\)\.txt$", current.name) and not re.search(r"\s+\(\d+\)\.txt$", path.name)):
            by_number[number] = path

    missing: list[str] = []
    imported = 0
    for hymn in index.get("hymns", []):
        number = int(hymn["number"])
        path = by_number.get(number)
        if path is None:
            missing.append(f"{number}: {hymn.get('title', '')}")
            continue
        text = path.read_text(encoding="utf-8-sig").replace("\r\n", "\n").replace("\r", "\n")
        lyrics, first_line = split_lyrics(text)
        if not lyrics or not first_line:
            missing.append(f"{number}: {hymn.get('title', '')} (empty or unparseable file)")
            continue
        hymn["lyrics"] = lyrics
        hymn["firstLine"] = first_line
        hymn["lyricsSource"] = "Supplied numbered text file"
        imported += 1

    if missing:
        raise SystemExit("Could not import all entries:\n" + "\n".join(missing))

    index["lyricsIncluded"] = True
    index["licenseStatus"] = "Lyric text was supplied as numbered text files; the upstream repository does not identify a redistribution license."
    index["hymnsWithLyrics"] = imported
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Imported lyrics into {imported} supplemental hymn records.")


if __name__ == "__main__":
    main()
