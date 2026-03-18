from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def slugify(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip())
    cleaned = re.sub(r"-+", "-", cleaned).strip("-")
    return cleaned[:120] or "untitled"


def render_note(item: dict[str, object]) -> str:
    title = str(item.get("title") or "Untitled")
    url = str(item.get("url") or "local://manual-capture")
    date = str(item.get("date") or "")
    source = str(item.get("source") or "substack")
    tags = item.get("tags") or []
    frameworks = item.get("frameworks") or []
    text = str(item.get("text") or "").strip()

    def list_yaml(values: object) -> str:
        if not isinstance(values, list):
            return "[]"
        if not values:
            return "[]"
        return "[" + ", ".join(json.dumps(str(v)) for v in values) + "]"

    return (
        f"---\n"
        f"persona: shreyas\n"
        f"source: {source}\n"
        f"title: {title}\n"
        f"url: {url}\n"
        f"date: {date}\n"
        f"tags: {list_yaml(tags)}\n"
        f"frameworks: {list_yaml(frameworks)}\n"
        f"---\n\n"
        f"Source URL: {url}\n"
        f"Source Title: {title}\n\n"
        f"Notes / excerpts:\n\n{text}\n"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Import a JSON batch into Obsidian Shreyas Inbox notes")
    parser.add_argument("input_json", help="Path to batch JSON file")
    parser.add_argument("output_dir", help="Path to Obsidian output directory")
    args = parser.parse_args()

    input_path = Path(args.input_json).expanduser().resolve()
    output_dir = Path(args.output_dir).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    payload = json.loads(input_path.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise SystemExit("Input JSON must be an array")

    for index, item in enumerate(payload, start=1):
        if not isinstance(item, dict):
            print(f"Skipped item {index}: not an object")
            continue
        title = str(item.get("title") or "").strip()
        text = str(item.get("text") or "").strip()
        if not title or not text:
            print(f"Skipped item {index}: missing title or text")
            continue

        filename = f"{index:03d}-{slugify(title)}.md"
        path = output_dir / filename
        path.write_text(render_note(item), encoding="utf-8")
        print(f"Saved {path.name}")


if __name__ == "__main__":
    main()
