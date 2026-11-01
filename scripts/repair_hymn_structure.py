#!/usr/bin/env python3
"""Apply source-checked stanza structure and typo corrections to hymn JSON."""

from __future__ import annotations

import json
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "public" / "data"

# First chunks in these supplied records are the refrain/chorus, not Verse 1.
# URLs point to Hymnary text authorities/representative texts used to confirm it.
PROVIDED_CHORUSES = {
    "2": "https://hymnary.org/hymn/LBoW1978/527",
    "27": "https://hymnary.org/text/rejoice_ye_pure_in_heart",
    "91": "https://hymnary.org/text/ye_watchers_and_ye_holy_ones",
    "99": "https://hymnary.org/text/god_will_take_care_of_you_be_not_afraid",
    "112": "https://hymnary.org/text/let_us_with_a_gladsome_mind",
    "115": "https://hymnary.org/text/o_come_o_come_emmanuel_and_ransom",
    "142": "https://hymnary.org/text/angels_we_have_heard_on_high",
    "172": "https://hymnary.org/hymn/ToPr2011/270",
    "198": "https://hymnary.org/text/and_can_it_be_that_i_should_gain",
    "208": "https://hymnary.org/text/therell_be_no_dark_valley_when_jesus_com",
    "212": "https://hymnary.org/hymn/CYBER/6792",
    "246": "https://hymnary.org/text/worthy_worthy_is_the_lamb_worthy",
    "260": "https://hymnary.org/search?qu=Hover+O%27er+Me%2C+Holy+Spirit",
    "284": "https://hymnary.org/search?qu=For+You+I+Am+Praying",
    "305": "https://hymnary.org/search?qu=Give+Me+Jesus",
    "318": "https://hymnary.org/search?qu=Whiter+Than+Snow",
    "335": "https://hymnary.org/search?qu=What+a+Wonderful+Savior",
    "362": "https://hymnary.org/search?qu=Lift+High+the+Cross",
    "365": "https://hymnary.org/text/o_zion_haste_thy_mission_high_fulfilling",
    "468": "https://hymnary.org/search?qu=A+Child+of+the+King+My+Father+is+rich",
    "512": "https://hymnary.org/text/just_when_i_need_him_jesus_is_near_just",
    "525": "https://hymnary.org/search?qu=Hiding+in+Thee",
    "569": "https://hymnary.org/search?qu=Pass+Me+Not+O+Gentle+Savior",
    "608": "https://hymnary.org/hymn/NCH1976/216",
    "624": "https://hymnary.org/search?qu=I+Want+Jesus+to+Walk+with+Me",
    "652": "https://hymnary.org/search?qu=Love+at+Home",
    "674": "https://hymnary.org/search?qu=Shalom+my+friends+shalom",
}
EXPECTED_TITLES = {
    "2": "All Creatures of Our God and King",
    "27": "Rejoice, Ye Pure in Heart!",
    "91": "Ye Watchers and Ye Holy Ones",
    "99": "God Will Take Care of You",
    "112": "Let Us With a Gladsome Mind",
    "115": "O Come, O Come, Immanuel",
    "142": "Angels We Have Heard On High",
    "172": "The Strife Is O'er",
    "198": "And Can It Be?",
    "208": "There'll Be No Dark Valley",
    "212": "'Tis Almost Time for the Lord to Come",
    "246": "Worthy, Worthy Is the Lamb",
    "260": "Hover O'er Me, Holy Spirit",
    "284": "For You I Am Praying",
    "305": "Give Me Jesus",
    "318": "Whiter Than Snow",
    "335": "What a Wonderful Savior",
    "362": "Lift High the Cross",
    "365": "O Zion, Haste",
    "468": "A Child of the King",
    "512": "Just When I Need Him Most",
    "525": "Hiding in Thee",
    "569": "Pass Me Not, O Gentle Savior",
    "608": "Faith Is the Victory",
    "624": "I Want Jesus to Walk With Me",
    "652": "Love at Home",
    "674": "Shalom",
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalize_provided() -> int:
    path = DATA / "provided-hymns.json"
    dataset = load(path)
    by_number = {str(row.get("number")): row for row in dataset["hymns"]}
    changed = 0
    for number, reference in PROVIDED_CHORUSES.items():
        row = by_number.get(number)
        if not row or not row.get("lyrics"):
            raise ValueError(f"Missing provided hymn {number}")
        if row.get("title") != EXPECTED_TITLES[number]:
            raise ValueError(f"Source number {number} is unexpectedly titled {row.get('title')!r}")
        parts = row["lyrics"]
        if any(part.get("type") == "chorus" for part in parts):
            continue
        # Move the verified refrain after the first actual verse, then number
        # actual verses consecutively. The reader repeats this chorus after each.
        chorus = dict(parts[0])
        chorus["type"] = "chorus"
        verses = [dict(part) for part in parts[1:]]
        if not verses:
            raise ValueError(f"No verse remains after chorus in {number}")
        for verse_number, verse in enumerate(verses, 1):
            verse["number"] = verse_number
            verse["type"] = "verse"
        row["lyrics"] = [verses[0], chorus, *verses[1:]]
        row["lyricsSource"] = row.get("lyricsSource") or "User-provided hymn text; stanza roles checked against Hymnary.org"
        changed += 1

    # Verified spelling in Hymnary's representative text.
    typo_row = by_number.get("440")
    if typo_row:
        for part in typo_row.get("lyrics", []):
            part["content"] = part.get("content", "").replace("bouys", "buoys")
    write(path, dataset)
    return changed


def normalize_docx() -> None:
    path = DATA / "docx-hymns.json"
    dataset = load(path)
    row = next(row for row in dataset["hymns"] if str(row.get("number")) == "1532")
    parts = row["verses"]
    chorus = next((part for part in parts if part.get("type") == "chorus"), None)
    verses = [part for part in parts if part.get("type") != "chorus"]
    if chorus and verses:
        row["verses"] = [verses[0], chorus, *verses[1:]]
        for number, verse in enumerate((part for part in row["verses"] if part.get("type") != "chorus"), 1):
            verse["number"] = number
    write(path, dataset)


def normalize_watchman() -> None:
    path = DATA / "watchman-hymns.json"
    dataset = load(path)
    row = next(row for row in dataset["hymns"] if str(row.get("number")) == "208")
    lyrics = row["lyrics"]
    if lyrics and int(lyrics[0].get("verse", 0)) == 2:
        lyrics.insert(0, {
            "verse": 1,
            "content": "Spirit divine, attend our prayer,\nAnd make this house your home;\nDescend with all your gracious power;\nO come, great Spirit, come!",
            "type": "verse",
        })
    write(path, dataset)


def normalize_awit() -> None:
    path = DATA / "awit-hymnal.json"
    dataset = load(path)
    row = next(row for row in dataset["awit"] if str(row.get("id")) == "131")
    placeholder = "[Ang mga talata ng awit na ito ay wala sa na-scan na PDF.]"
    row["text"] = row.get("text", "").replace(placeholder, "").strip()
    write(path, dataset)


if __name__ == "__main__":
    count = normalize_provided()
    normalize_docx()
    normalize_watchman()
    normalize_awit()
    print(f"Normalized {count} verified supplied-hymn refrain records and corrected the audited structural issues.")
