"""Test citation and source coverage enhancements."""
from app.schemas import Citation, PersonaResponse, SourceCoverage


def test_citation_with_relevance_score():
    """Test Citation model with new relevance_score field."""
    citation = Citation(
        source_id="test-123",
        title="Test Article",
        url="https://example.com/test",
        excerpt="This is a test excerpt",
        framework_tag="GTM",
        relevance_score=0.85,
    )

    assert citation.relevance_score == 0.85
    assert citation.source_id == "test-123"


def test_citation_with_default_relevance():
    """Test Citation model with default relevance_score."""
    citation = Citation(
        source_id="test-456",
        title="Test Article 2",
        url="https://example.com/test2",
        excerpt="Another test excerpt",
    )

    assert citation.relevance_score == 0.0


def test_source_coverage_model():
    """Test SourceCoverage model."""
    coverage = SourceCoverage(
        total_chunks_found=6,
        avg_relevance=0.78,
        has_direct_coverage=True,
        coverage_level="high",
    )

    assert coverage.total_chunks_found == 6
    assert coverage.avg_relevance == 0.78
    assert coverage.has_direct_coverage is True
    assert coverage.coverage_level == "high"


def test_persona_response_with_coverage():
    """Test PersonaResponse with new source_coverage and ai_generated_percentage fields."""
    coverage = SourceCoverage(
        total_chunks_found=4,
        avg_relevance=0.72,
        has_direct_coverage=True,
        coverage_level="medium",
    )

    citation = Citation(
        source_id="test-789",
        title="Test Article 3",
        url="https://example.com/test3",
        excerpt="Yet another test excerpt",
        relevance_score=0.72,
    )

    response = PersonaResponse(
        persona_id="shreyas",
        persona_name="Shreyas Doshi",
        response="Test response text",
        citations=[citation],
        source_coverage=coverage,
        ai_generated_percentage=40,
    )

    assert response.source_coverage.coverage_level == "medium"
    assert response.ai_generated_percentage == 40
    assert len(response.citations) == 1
    assert response.citations[0].relevance_score == 0.72


def test_persona_response_with_defaults():
    """Test PersonaResponse with default values for new fields."""
    response = PersonaResponse(
        persona_id="paul_graham",
        persona_name="Paul Graham",
        response="Test response",
    )

    assert response.source_coverage.coverage_level == "none"
    assert response.source_coverage.total_chunks_found == 0
    assert response.ai_generated_percentage == 0
    assert len(response.citations) == 0


def test_coverage_level_values():
    """Test all valid coverage level values."""
    levels = ["high", "medium", "low", "none"]

    for level in levels:
        coverage = SourceCoverage(
            total_chunks_found=1,
            avg_relevance=0.5,
            has_direct_coverage=False,
            coverage_level=level,
        )
        assert coverage.coverage_level in levels
