from __future__ import annotations

import argparse
import shutil
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
DEFAULT_MAP = {
    "Ben Thompson": ("Canon", ROOT_DIR / "data" / "stratechery"),
    "Shreyas Doshi": ("Curated", ROOT_DIR / "data" / "shreyas"),
    "Paul Graham": (None, ROOT_DIR / "data" / "pg"),
    "Operator Collective": (None, ROOT_DIR / "data" / "lenny_podcasts"),
}


def sync_folder(source: Path, destination: Path) -> tuple[int, int]:
    copied = 0
    skipped = 0
    destination.mkdir(parents=True, exist_ok=True)

    for file_path in source.rglob("*"):
        if not file_path.is_file():
            continue
        if file_path.suffix.lower() not in {".md", ".txt"}:
            continue

        rel = file_path.relative_to(source)
        target = destination / rel
        target.parent.mkdir(parents=True, exist_ok=True)

        source_text = file_path.read_text(encoding="utf-8", errors="ignore")
        if target.exists() and target.read_text(encoding="utf-8", errors="ignore") == source_text:
            skipped += 1
            continue

        shutil.copy2(file_path, target)
        copied += 1

    return copied, skipped


def main() -> None:
    parser = argparse.ArgumentParser(description="Sync persona markdown notes from an Obsidian vault into backend/data")
    parser.add_argument("vault_path", help="Path to Obsidian vault root")
    parser.add_argument(
        "--personas-root",
        default="Personas",
        help="Folder inside the vault containing persona subfolders (default: Personas)",
    )
    args = parser.parse_args()

    vault_path = Path(args.vault_path).expanduser().resolve()
    personas_root = (vault_path / args.personas_root).resolve()

    if not personas_root.exists():
        raise SystemExit(f"Personas root does not exist: {personas_root}")

    for folder_name, config in DEFAULT_MAP.items():
        subfolder, target_dir = config
        source_dir = personas_root / folder_name
        if subfolder:
            source_dir = source_dir / subfolder
        if not source_dir.exists():
            print({"persona_folder": folder_name, "status": "missing", "source": str(source_dir)})
            continue

        copied, skipped = sync_folder(source_dir, target_dir)
        print(
            {
                "persona_folder": folder_name,
                "source": str(source_dir),
                "target": str(target_dir),
                "copied": copied,
                "skipped": skipped,
            }
        )


if __name__ == "__main__":
    main()
