from app.rag.sources import extract_paul_graham_essay_urls, parse_header_metadata


def test_extract_paul_graham_urls_filters_non_essays():
    html = """
    <html><body>
      <a href="articles.html">articles</a>
      <a href="start.html">How to Start</a>
      <a href="https://paulgraham.com/makersschedule.html">Maker Schedule</a>
      <a href="https://example.com/other.html">external</a>
      <a href="rss.html">rss</a>
    </body></html>
    """
    urls = extract_paul_graham_essay_urls(html, "https://paulgraham.com/articles.html")
    assert "https://paulgraham.com/start.html" in urls
    assert "https://paulgraham.com/makersschedule.html" in urls
    assert all("articles.html" not in url for url in urls)
    assert all("rss.html" not in url for url in urls)
    assert all("example.com" not in url for url in urls)


def test_parse_header_metadata_removes_header_lines():
    raw = (
        "Source URL: https://paulgraham.com/start.html\n"
        "Source Title: How to Start\n\n"
        "# Heading\n"
        "Essay body"
    )
    text, meta = parse_header_metadata(raw)
    assert meta["source_url"] == "https://paulgraham.com/start.html"
    assert meta["source_title"] == "How to Start"
    assert text.startswith("# Heading")
