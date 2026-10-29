#!/usr/bin/env python3
"""Create a licensed, ID-keyed lyric overlay from a Hymnary text-record JSON file.

Input records must include textAuthNumber and may include textLink. The output is
an array of records suitable for public/data/hymn-lyrics.json. Unknown or
copyrighted records are never added to the lyric output.
"""
import argparse
import html
import json
import re
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen


class PageText(HTMLParser):
    BLOCKS = {"address", "article", "blockquote", "br", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ol", "p", "section", "tr"}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "noscript"}:
            self.skip += 1
        elif not self.skip and tag in self.BLOCKS:
            self.parts.append("\n\n" if tag != "br" else "\n")

    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript"} and self.skip:
            self.skip -= 1
        elif not self.skip and tag in self.BLOCKS:
            self.parts.append("\n\n")

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def page_text(raw_html):
    parser = PageText()
    parser.feed(raw_html)
    text = html.unescape("".join(parser.parts)).replace("\xa0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def parse_page(raw_html):
    text = page_text(raw_html)
    starts = list(re.finditer(r"(?im)^\s*Representative Text\s*$", text))
    rep_text = ""
    if starts:
        tail = text[starts[-1].end():]
        end = re.search(r"(?im)^\s*(?:Author\s*:|Text Information\s*$|All representative texts\b|Compare texts\b)", tail)
        rep_text = tail[:end.start()] if end else tail
    get = lambda label: (re.search(rf"(?im)^\s*{label}\s*:\s*(.+?)\s*$", text).group(1).strip()
                         if re.search(rf"(?im)^\s*{label}\s*:\s*(.+?)\s*$", text) else "")
    return {"license": get("Copyright"), "language": get("Language"),
            "representativeText": rep_text.strip(), "source": get("Source")}


def split_verses(rep_text):
    verses, refrain, refrain_next = [], "", False
    blocks = re.split(r"\n\s*\n", rep_text.strip())
    for block in blocks:
        lines = [line.strip() for line in block.splitlines() if line.strip() and line.strip() not in {"•", "|"}]
        if not lines:
            continue
        if re.match(r"(?i)^refrain\s*:?(?:\s|$)", lines[0]):
            lines[0] = re.sub(r"(?i)^refrain\s*:?\s*", "", lines[0]).strip()
            refrain = "\n".join([line for line in lines if line])
            refrain_next = not bool(refrain)
            continue
        if re.match(r"(?i)^(?:all representative texts|compare texts|text size|first line:|title:|author:|copyright:)", lines[0]):
            break
        match = re.match(r"^(\d{1,2})[.)]?\s*(.*)$", lines[0])
        if refrain_next and not match:
            refrain = "\n".join(lines).strip()
            refrain_next = False
            continue
        if match:
            number = int(match.group(1))
            if match.group(2):
                lines[0] = match.group(2)
            else:
                lines = lines[1:]
        else:
            number = len(verses) + 1
        if lines:
            verses.append({"number": number, "text": "\n".join(lines).strip()})
    return verses, refrain.strip()


def allowed_license(value):
    # Fail closed. Missing/ambiguous rights must not be treated as public domain.
    license_text = (value or "").strip().lower()
    return bool(re.search(r"\b(public domain|cc0|cc-by(?:-sa)?(?:\s|[-.]|$)|creative commons attribution)\b", license_text))


def localized_verses(verses, language):
    lang = (language or "").lower()
    field = "tagalog" if re.search(r"tagalog|filipino", lang) else "english" if "english" in lang else "text"
    return [{"number": verse["number"], field: verse["text"]} for verse in verses]


def safe_text_url(record):
    url = record.get("textLink") or f"https://hymnary.org/text/{record.get('textAuthNumber', '')}"
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in {"hymnary.org", "www.hymnary.org"}:
        raise ValueError("textLink must point to https://hymnary.org")
    return url


def fetch(url):
    request = Request(url, headers={"User-Agent": "Bilingual-Baptist-Hymnal/1.0 (text source lookup)"})
    with urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", errors="replace")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("infile", help="JSON array from build_hymn_index.py")
    parser.add_argument("--out", help="output JSON; default: <input>_with_lyrics.json")
    parser.add_argument("--only", help="process one exact textAuthNumber")
    parser.add_argument("--limit", type=int, help="maximum number of records to request")
    parser.add_argument("--delay", type=float, default=2.0, help="seconds between requests (default: 2)")
    args = parser.parse_args()
    source = Path(args.infile)
    records = json.loads(source.read_text(encoding="utf-8"))
    if not isinstance(records, list):
        raise SystemExit("Input must be a JSON array of hymn records.")
    output = Path(args.out) if args.out else source.with_name(f"{source.stem}_with_lyrics.json")
    found = {}
    if output.exists():
        try:
            prior = json.loads(output.read_text(encoding="utf-8"))
            if isinstance(prior, list):
                found = {r.get("textAuthNumber"): r for r in prior if r.get("textAuthNumber")}
        except (OSError, json.JSONDecodeError):
            print("Note: existing output could not be read; starting a new lyric index.")
    processed = 0
    for record in records:
        key = str(record.get("textAuthNumber") or "").strip()
        if not key or (args.only and key != args.only):
            continue
        if args.limit is not None and processed >= max(0, args.limit):
            break
        processed += 1
        url = safe_text_url(record)
        try:
            info = parse_page(fetch(url))
        except Exception as exc:
            print(f"{key}: fetch failed: {exc}")
            continue
        if not allowed_license(info["license"]):
            print(f"{key}: skipped; license is missing or not explicitly open ({info['license'] or 'unknown'})")
            continue
        verses, refrain = split_verses(info["representativeText"])
        if not verses:
            print(f"{key}: no structured representative text found")
            continue
        language = info["language"] or record.get("language", "")
        found[key] = {
            "textAuthNumber": key,
            "title": record.get("title", ""),
            "language": language,
            "verses": localized_verses(verses, language),
            "refrain": refrain,
            "source": info["source"] or "Hymnary.org",
            "sourceUrl": url,
            "license": info["license"],
        }
        print(f"{key}: saved {len(verses)} verses")
        if processed < len(records):
            time.sleep(max(0, args.delay))
    output.write_text(json.dumps(list(found.values()), ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {len(found)} licensed lyric records to {output}")


if __name__ == "__main__":
    main()
