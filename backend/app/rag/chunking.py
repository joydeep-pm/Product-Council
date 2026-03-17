from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class ChunkSpan:
    text: str
    char_start: int
    char_end: int
    section_title: str | None = None


BOILERPLATE_PATTERNS = [
    re.compile(r"subscribe", re.IGNORECASE),
    re.compile(r"all rights reserved", re.IGNORECASE),
]


def normalize_text(text: str) -> str:
    lines: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            lines.append("")
            continue
        if any(pattern.search(stripped) for pattern in BOILERPLATE_PATTERNS):
            continue
        lines.append(stripped)
    cleaned = "\n".join(lines)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def chunk_text(text: str, target: int = 1000, overlap: int = 150, hard_cap: int = 1400) -> list[ChunkSpan]:
    text = normalize_text(text)
    if not text:
        return []

    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[ChunkSpan] = []

    buf = ""
    buf_start = 0
    cursor = 0

    for para in paragraphs:
        candidate = f"{buf}\n\n{para}".strip() if buf else para
        if len(candidate) <= target:
            if not buf:
                buf_start = text.find(para, cursor)
            buf = candidate
            cursor = max(cursor, buf_start + len(buf))
            continue

        if buf:
            end = buf_start + len(buf)
            chunks.append(ChunkSpan(text=buf[:hard_cap], char_start=buf_start, char_end=end))
            tail = buf[-overlap:] if overlap else ""
            buf = f"{tail}\n\n{para}".strip() if tail else para
            buf_start = max(end - len(tail), 0)
        else:
            start = 0
            while start < len(para):
                end = min(start + target, len(para))
                chunks.append(ChunkSpan(text=para[start:end], char_start=start, char_end=end))
                start = max(end - overlap, end)

    if buf:
        chunks.append(
            ChunkSpan(
                text=buf[:hard_cap],
                char_start=buf_start,
                char_end=buf_start + len(buf[:hard_cap]),
            )
        )

    return chunks
