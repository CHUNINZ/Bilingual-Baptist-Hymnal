import csv
import gzip
import json
from pathlib import Path

source = Path("public/data/texts.csv")
target = Path("public/data/texts-index.json.gz")
fields = ["displayTitle", "firstLine", "textTitle", "refrainFirstLine", "textAuthNumber", "languages", "authors", "yearsWrote", "meter", "totalInstances"]
with source.open(encoding="utf-8-sig", newline="") as f:
    rows = [{key: (row.get(key) or "") for key in fields} for row in csv.DictReader(f)]
payload = json.dumps(rows, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
target.write_bytes(gzip.compress(payload, compresslevel=9, mtime=0))
print(f"Wrote {len(rows):,} records to {target} ({target.stat().st_size / 1_000_000:.1f} MB)")
