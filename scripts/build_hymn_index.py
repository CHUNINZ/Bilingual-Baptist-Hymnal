#!/usr/bin/env python3
"""
Build a hymn index JSON from the Hymnary.org Scripture API and local CSV data exports.

Each record gets a textAuthNumber, title, language, scripture references,
people/authors, and metadata. Re-running the script is safe: records you already
filled in are kept, and new search results are merged in by textAuthNumber.

Usage:
    python build_hymn_index.py "Psalm 136" "John 3:16" --out hymns.json
    python build_hymn_index.py "1 John 3:1-4" --all --out hymns.json
"""
import argparse
import csv
import json
import re
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

API = "https://hymnary.org/api/scripture"

# API fields we map explicitly; anything else is treated as a person/role.
KNOWN_KEYS = {
    "title", "date", "meter", "place of origin", "original language",
    "text link", "number of hymnals", "scripture references",
}


def load_local_csv_lookups():
    """Load supplemental data from local CSVs if present in the working directory."""
    lookups = {"texts": {}, "people": {}}
    
    texts_path = Path("source-data/texts.csv")
    if not texts_path.exists():
        texts_path = Path("texts.csv")
    if texts_path.exists():
        try:
            with open(texts_path, mode="r", encoding="utf-8", errors="replace") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    tan = row.get("textAuthNumber", "").strip()
                    if tan:
                        lookups["texts"][tan] = row
        except Exception as e:
            print(f"Note: Could not parse texts.csv: {e}")

    people_path = Path("public/data/people.csv")
    if not people_path.exists():
        people_path = Path("people.csv")
    if people_path.exists():
        try:
            with open(people_path, mode="r", encoding="utf-8", errors="replace") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    pid = row.get("personID", "").strip()
                    if pid:
                        lookups["people"][pid] = row.get("personName", "")
        except Exception as e:
            print(f"Note: Could not parse people.csv: {e}")

    return lookups


def fetch(reference, all_matches=False):
    params = {"reference": reference}
    if all_matches:
        params["all"] = "true"
    req = Request(
        f"{API}?{urlencode(params)}",
        headers={"User-Agent": "hymn-index-builder/1.0"},
    )
    with urlopen(req, timeout=30) as resp:
        return json.load(resp)


def as_list(data):
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return list(data.values())
    return []


def slug_from_link(link):
    match = re.search(r"/text/([^/?#]+)", link or "")
    return match.group(1) if match else ""


def normalize(item, reference, local_lookups):
    lowered = {str(k).lower(): v for k, v in item.items()}
    link = lowered.get("text link", "") or ""
    tan = slug_from_link(link)
    people = {k: v for k, v in lowered.items() if k not in KNOWN_KEYS}
    
    # Check local texts.csv backup metadata if available
    local_text = local_lookups["texts"].get(tan, {})
    
    copyright_stmt = local_text.get("copyrightStatement", "")
    languages = local_text.get("languages", lowered.get("original language", ""))
    authors = local_text.get("authors", "")

    return {
        "textAuthNumber": tan,
        "title": lowered.get("title", "") or local_text.get("displayTitle", ""),
        "language": languages,
        "date": lowered.get("date", "") or local_text.get("yearsWrote", ""),
        "meter": lowered.get("meter", "") or local_text.get("meter", ""),
        "placeOfOrigin": lowered.get("place of origin", ""),
        "textLink": link or (f"https://hymnary.org/text/{tan}" if tan else ""),
        "numberOfHymnals": lowered.get("number of hymnals", "") or local_text.get("totalInstances", ""),
        "scriptureReferences": lowered.get("scripture references", ""),
        "authors": authors,
        "people": people,
        "searchReferences": [reference],
        "verses": [],   # e.g. [{"number": 1, "english": "...", "tagalog": "..."}]
        "refrain": "",
        "source": local_text.get("textSources", ""),
        "license": copyright_stmt,
    }


def load_existing(path):
    if not path.exists():
        return {}
    try:
        records = json.loads(path.read_text(encoding="utf-8"))
        return {r["textAuthNumber"]: r for r in records if r.get("textAuthNumber")}
    except Exception:
        return {}


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("references", nargs="+", help='e.g. "Psalm 136" "John 3:16"')
    parser.add_argument("--out", default="hymns.json")
    parser.add_argument("--all", action="store_true",
                        help="include hymns with incomplete info on Hymnary")
    parser.add_argument("--delay", type=float, default=1.5,
                        help="seconds to wait between requests (be polite)")
    args = parser.parse_args()

    out_path = Path(args.out)
    index = load_existing(out_path)
    local_lookups = load_local_csv_lookups()

    for i, ref in enumerate(args.references):
        if i:
            time.sleep(args.delay)
        print(f"Searching: {ref}")
        try:
            items = as_list(fetch(ref, args.all))
        except Exception as exc:
            print(f"  failed: {exc}")
            continue
        print(f"  {len(items)} results")

        for item in items:
            if not isinstance(item, dict):
                continue
            record = normalize(item, ref, local_lookups)
            key = record["textAuthNumber"]
            if not key:
                continue
            if key in index:
                existing = index[key]
                if ref not in existing["searchReferences"]:
                    existing["searchReferences"].append(ref)
                if not existing.get("license") and record.get("license"):
                    existing["license"] = record["license"]
                if not existing.get("source") and record.get("source"):
                    existing["source"] = record["source"]
            else:
                index[key] = record

    if not index:
        raise SystemExit("No hymns were retrieved; check network access and Scripture references. No output written.")

    records = sorted(index.values(), key=lambda r: r["textAuthNumber"])
    out_path.write_text(json.dumps(records, indent=2, ensure_ascii=False),
                        encoding="utf-8")
    print(f"Saved {len(records)} records to {out_path}")


if __name__ == "__main__":
    main()

