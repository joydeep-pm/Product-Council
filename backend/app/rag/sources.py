from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from markdownify import markdownify


@dataclass
class SourceDocument:
    persona_scope: str
    source_id: str
    source_uri: str
    source_type: str
    title: str
    text: str
    author: str | None = None
    published_at: str | None = None
    license_note: str | None = None
    framework_tags: list[str] | None = None

    @property
    def content_hash(self) -> str:
        return hashlib.sha256(self.text.encode("utf-8")).hexdigest()


class BaseSource:
    def list_documents(self) -> list[SourceDocument]:
        raise NotImplementedError


class LocalFolderSource(BaseSource):
    def __init__(self, persona_scope: str, folder: Path, source_type: str = "manual") -> None:
        self.persona_scope = persona_scope
        self.folder = folder
        self.source_type = source_type

    def list_documents(self) -> list[SourceDocument]:
        docs: list[SourceDocument] = []
        if not self.folder.exists():
            return docs

        for file_path in sorted(self.folder.rglob("*")):
            if not file_path.is_file():
                continue
            if file_path.suffix.lower() not in {".md", ".txt"}:
                continue
            raw_text = file_path.read_text(encoding="utf-8", errors="ignore")
            text, header_meta = parse_header_metadata(raw_text)
            if not text.strip():
                continue
            rel = file_path.relative_to(self.folder).as_posix()
            docs.append(
                SourceDocument(
                    persona_scope=self.persona_scope,
                    source_id=f"{self.persona_scope}:{rel}",
                    source_uri=header_meta.get("source_url", f"file://{file_path.resolve().as_posix()}"),
                    source_type=self.source_type,
                    title=header_meta.get("source_title", file_path.stem),
                    text=text,
                )
            )
        return docs


class PaulWebSource(BaseSource):
    def __init__(self, urls: list[str]) -> None:
        self.urls = urls

    def list_documents(self) -> list[SourceDocument]:
        docs: list[SourceDocument] = []
        for url in self.urls:
            text, title = fetch_url_text(url)
            docs.append(
                SourceDocument(
                    persona_scope="paul_graham",
                    source_id=f"paul_graham:{slugify(title)}",
                    source_uri=url,
                    source_type="web",
                    title=title,
                    text=text,
                )
            )
        return docs


class LennyMcpSource(BaseSource):
    # Scaffold for future MCP integration.
    def list_documents(self) -> list[SourceDocument]:
        return []


class CodaExportDropAdapter(LocalFolderSource):
    def __init__(self, folder: Path) -> None:
        super().__init__("shreyas", folder, source_type="drop")


class StratecheryExportDropAdapter(LocalFolderSource):
    def __init__(self, folder: Path) -> None:
        super().__init__("ben_thompson", folder, source_type="drop")


def fetch_url_text(url: str) -> tuple[str, str]:
    with httpx.Client(timeout=20.0, follow_redirects=True) as client:
        resp = client.get(url)
        resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    for node in soup(["script", "style", "noscript", "nav", "footer"]):
        node.decompose()
    title = soup.title.string.strip() if soup.title and soup.title.string else url
    text = markdownify(str(soup), heading_style="ATX")
    return text, title


def discover_paul_graham_essay_urls(index_url: str = "https://paulgraham.com/articles.html") -> list[str]:
    with httpx.Client(timeout=20.0, follow_redirects=True) as client:
        resp = client.get(index_url)
        resp.raise_for_status()

    return extract_paul_graham_essay_urls(resp.text, index_url)


def extract_paul_graham_essay_urls(html: str, base_url: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    blocked_paths = {
        "index.html",
        "articles.html",
        "rss.html",
        "guidetothewebsite.html",
        "workedsince.html",
    }

    urls: list[str] = []
    seen: set[str] = set()
    for anchor in soup.find_all("a"):
        href = (anchor.get("href") or "").strip()
        if not href:
            continue
        absolute = urljoin(base_url, href)
        parsed = urlparse(absolute)
        if parsed.netloc != "paulgraham.com":
            continue
        file_name = Path(parsed.path).name.lower()
        if not file_name.endswith(".html"):
            continue
        if file_name in blocked_paths:
            continue
        if absolute in seen:
            continue
        seen.add(absolute)
        urls.append(absolute)

    return sorted(urls)


def parse_header_metadata(raw_text: str) -> tuple[str, dict[str, str]]:
    lines = raw_text.splitlines()
    if len(lines) < 2:
        return raw_text, {}

    source_url_match = re.match(r"^Source URL:\s*(\S+)\s*$", lines[0].strip(), re.IGNORECASE)
    if not source_url_match:
        return raw_text, {}

    source_title = ""
    title_match = re.match(r"^Source Title:\s*(.+)\s*$", lines[1].strip(), re.IGNORECASE)
    start_idx = 1
    if title_match:
        source_title = title_match.group(1).strip()
        start_idx = 2

    while start_idx < len(lines) and not lines[start_idx].strip():
        start_idx += 1

    clean_text = "\n".join(lines[start_idx:])
    meta = {"source_url": source_url_match.group(1).strip()}
    if source_title:
        meta["source_title"] = source_title
    return clean_text, meta


def slugify(text: str) -> str:
    slug = "".join(ch.lower() if ch.isalnum() else "-" for ch in text)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")[:120]
