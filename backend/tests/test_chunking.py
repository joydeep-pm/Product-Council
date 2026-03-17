from app.rag.chunking import chunk_text


def test_chunking_produces_spans():
    text = "\n\n".join(["Paragraph " + str(i) + " text." * 60 for i in range(10)])
    chunks = chunk_text(text)
    assert len(chunks) > 1
    assert all(chunk.text for chunk in chunks)
