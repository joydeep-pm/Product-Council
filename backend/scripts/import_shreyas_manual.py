from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT_DIR / "data" / "shreyas"


@dataclass
class ManualDoc:
    topic: str
    text: str


def slugify(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "_", value.strip())
    cleaned = re.sub(r"_+", "_", cleaned).strip("_")
    return cleaned[:120] or "untitled"


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def read_ndjson(path: Path) -> list[ManualDoc]:
    docs: list[ManualDoc] = []
    for line_number, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        line = raw.strip()
        if not line:
            continue
        payload = json.loads(line)
        topic = clean_text(str(payload.get("topic") or ""))
        text = str(payload.get("text") or "").strip()
        if not topic or not text:
            print(f"Skipped line {line_number}: missing topic or text")
            continue
        docs.append(ManualDoc(topic=topic, text=text))
    return docs


def save_doc(doc: ManualDoc, index: int) -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"manual_{index:03d}_{slugify(doc.topic)}.md"
    path = OUTPUT_DIR / filename
    payload = f"Source URL: local://manual-shreyas-capture\nSource Title: {doc.topic}\n\n{doc.text.strip()}\n"
    path.write_text(payload, encoding="utf-8")
    return path


def main() -> None:
    parser = argparse.ArgumentParser(description="Import manually captured Shreyas notes from NDJSON")
    parser.add_argument(
        "input_path",
        nargs="?",
        default=str(ROOT_DIR / "data" / "shreyas" / "manual_capture_minimal.ndjson"),
        help="Path to NDJSON file with {topic,text} objects",
    )
    args = parser.parse_args()

    input_path = Path(args.input_path).expanduser().resolve()
    docs = read_ndjson(input_path)
    print(f"Found {len(docs)} valid manual captures")

    for index, doc in enumerate(docs, start=1):
        saved = save_doc(doc, index)
        print(f"Saved {saved.name}")


if __name__ == "__main__":
    main()
