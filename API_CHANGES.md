# API Contract Changes - Citation & Source Attribution

## Summary

Enhanced the `/api/v1/council/sessions` endpoint response to include source coverage metrics, relevance scores, and AI-generated content percentages.

**Breaking Changes**: ❌ None - All new fields have defaults for backward compatibility

## Before (Original Schema)

### POST `/api/v1/council/sessions` Response

```json
{
  "session_id": "uuid-string",
  "created_at": "2026-03-20T19:00:00Z",
  "query": "How should we sequence GTM for an AI productivity product?",
  "round_table": [
    {
      "persona_id": "shreyas",
      "persona_name": "Shreyas Doshi",
      "response": "This is fundamentally a sequencing question...",
      "citations": [
        {
          "source_id": "shreyas-001",
          "title": "Pre-mortems: How Stripe Does It",
          "url": "https://example.com/premortems",
          "excerpt": "A pre-mortem is a thought exercise...",
          "framework_tag": "GTM"
        }
      ]
    }
  ],
  "clash": { ... },
  "synthesis": { ... }
}
```

---

## After (Enhanced Schema)

### POST `/api/v1/council/sessions` Response

```json
{
  "session_id": "uuid-string",
  "created_at": "2026-03-20T19:00:00Z",
  "query": "How should we sequence GTM for an AI productivity product?",
  "round_table": [
    {
      "persona_id": "shreyas",
      "persona_name": "Shreyas Doshi",
      "response": "This is fundamentally a sequencing question...",
      "citations": [
        {
          "source_id": "shreyas-001",
          "title": "Pre-mortems: How Stripe Does It",
          "url": "https://example.com/premortems",
          "excerpt": "A pre-mortem is a thought exercise...",
          "framework_tag": "GTM",
          "relevance_score": 0.92  // ✨ NEW: 0-1 scale, higher = more relevant
        },
        {
          "source_id": "shreyas-045",
          "title": "Product Strategy Frameworks",
          "url": "https://example.com/frameworks",
          "excerpt": "When thinking about sequencing...",
          "framework_tag": "STRATEGY",
          "relevance_score": 0.78  // ✨ NEW
        }
      ],
      "source_coverage": {  // ✨ NEW: Coverage metadata
        "total_chunks_found": 6,
        "avg_relevance": 0.82,
        "has_direct_coverage": true,
        "coverage_level": "high"  // "high" | "medium" | "low" | "none"
      },
      "ai_generated_percentage": 20  // ✨ NEW: Estimated AI-generated content (0-100)
    },
    {
      "persona_id": "paul_graham",
      "persona_name": "Paul Graham",
      "response": "Start by making something people want...",
      "citations": [],  // Paul Graham has no RAG retrieval
      "source_coverage": {  // ✨ NEW: Shows "none" for Paul Graham
        "total_chunks_found": 0,
        "avg_relevance": 0.0,
        "has_direct_coverage": false,
        "coverage_level": "none"
      },
      "ai_generated_percentage": 95  // ✨ NEW: High AI % for no-RAG persona
    }
  ],
  "clash": { ... },
  "synthesis": { ... }
}
```

---

## New Field Details

### `Citation.relevance_score` (number)
- **Type**: `float` (0.0 - 1.0)
- **Default**: `0.0`
- **Description**: Relevance of this citation to the query, derived from vector search distance
- **Calculation**: `1.0 - vector_distance`
- **Example values**:
  - `0.92` = Highly relevant (92% match)
  - `0.65` = Moderately relevant (65% match)
  - `0.45` = Weakly relevant (45% match)

### `PersonaResponse.source_coverage` (object)
- **Type**: `SourceCoverage`
- **Default**: `{"total_chunks_found": 0, "avg_relevance": 0.0, "has_direct_coverage": false, "coverage_level": "none"}`
- **Description**: Metadata about how much the persona has written about the query topic

#### `source_coverage.total_chunks_found` (integer)
- Number of relevant source chunks retrieved (typically 0-6)

#### `source_coverage.avg_relevance` (number)
- Average relevance score across all retrieved chunks (0.0 - 1.0)

#### `source_coverage.has_direct_coverage` (boolean)
- `true` if `avg_relevance > 0.7` (high-quality sources found)
- `false` otherwise

#### `source_coverage.coverage_level` (string enum)
- **Possible values**: `"high"` | `"medium"` | `"low"` | `"none"`
- **Calculation logic**:
  ```
  if avg_relevance > 0.75 AND total_chunks >= 4:
    → "high"
  elif avg_relevance > 0.65 OR total_chunks >= 2:
    → "medium"
  elif avg_relevance > 0.5 OR total_chunks >= 1:
    → "low"
  else:
    → "none"
  ```

### `PersonaResponse.ai_generated_percentage` (integer)
- **Type**: `int` (0 - 100)
- **Default**: `0`
- **Description**: Estimated percentage of response that is AI-generated vs. grounded in sources
- **Mapping**:
  - High coverage → `20%` AI (80% source-based)
  - Medium coverage → `40%` AI (60% source-based)
  - Low coverage → `70%` AI (30% source-based)
  - No coverage → `95%` AI (5% source-based)

---

## Example Scenarios

### Scenario 1: High Coverage Query
**Query**: "How should we sequence GTM for an AI productivity product?"
**Persona**: Shreyas Doshi (has written extensively about GTM)

```json
{
  "persona_id": "shreyas",
  "source_coverage": {
    "total_chunks_found": 6,
    "avg_relevance": 0.82,
    "has_direct_coverage": true,
    "coverage_level": "high"
  },
  "ai_generated_percentage": 20,
  "citations": [
    {"title": "...", "relevance_score": 0.92},
    {"title": "...", "relevance_score": 0.85},
    {"title": "...", "relevance_score": 0.78}
  ]
}
```

### Scenario 2: No Coverage Query
**Query**: "How to cook pasta perfectly?"
**Persona**: Any (no one has written about cooking)

```json
{
  "persona_id": "shreyas",
  "source_coverage": {
    "total_chunks_found": 0,
    "avg_relevance": 0.0,
    "has_direct_coverage": false,
    "coverage_level": "none"
  },
  "ai_generated_percentage": 95,
  "citations": []
}
```

### Scenario 3: Paul Graham (No RAG)
**Query**: Any query
**Persona**: Paul Graham (RAG disabled, general principles only)

```json
{
  "persona_id": "paul_graham",
  "source_coverage": {
    "total_chunks_found": 0,
    "avg_relevance": 0.0,
    "has_direct_coverage": false,
    "coverage_level": "none"
  },
  "ai_generated_percentage": 95,
  "citations": []
}
```

---

## Backward Compatibility

### Old Clients (Before Changes)
Will **continue to work** because:
1. All new fields have default values
2. JSON deserialization ignores unknown fields
3. Required fields (`persona_id`, `persona_name`, `response`, `citations`) unchanged

### New Clients (After Changes)
Can leverage enhanced metadata:
1. Display source coverage indicators
2. Show relevance scores on citations
3. Indicate AI-generated percentages
4. Warn users when coverage is low/none

---

## API Version

No API version bump required - this is an **additive change** only.

Current version: `v1` (remains `v1`)

---

## Type Definitions

### Python (Pydantic)
```python
from typing import Literal
from pydantic import BaseModel, Field

class Citation(BaseModel):
    source_id: str
    title: str
    url: str
    excerpt: str
    framework_tag: str | None = None
    relevance_score: float = 0.0

class SourceCoverage(BaseModel):
    total_chunks_found: int
    avg_relevance: float
    has_direct_coverage: bool
    coverage_level: Literal["high", "medium", "low", "none"]

class PersonaResponse(BaseModel):
    persona_id: PersonaId
    persona_name: str
    response: str
    citations: list[Citation] = Field(default_factory=list)
    source_coverage: SourceCoverage = Field(
        default_factory=lambda: SourceCoverage(
            total_chunks_found=0,
            avg_relevance=0.0,
            has_direct_coverage=False,
            coverage_level="none"
        )
    )
    ai_generated_percentage: int = 0
```

### TypeScript
```typescript
export interface Citation {
  source_id: string;
  title: string;
  url: string;
  excerpt: string;
  framework_tag?: string | null;
  relevance_score: number;
}

export interface SourceCoverage {
  total_chunks_found: number;
  avg_relevance: number;
  has_direct_coverage: boolean;
  coverage_level: "high" | "medium" | "low" | "none";
}

export interface PersonaResponse {
  persona_id: PersonaId;
  persona_name: string;
  response: string;
  citations: Citation[];
  source_coverage: SourceCoverage;
  ai_generated_percentage: number;
}
```

---

## Migration Guide

### For Backend Consumers
No changes needed - defaults handle everything.

### For Frontend Consumers
Optional enhancements:

```typescript
// Before
<div>{persona.persona_name}</div>
<div>{persona.response}</div>

// After (optional enhancements)
<div>{persona.persona_name}</div>

{/* NEW: Show coverage indicator */}
{persona.source_coverage.coverage_level !== "none" && (
  <SourceCoverageIndicator coverage={persona.source_coverage} />
)}

<div>{persona.response}</div>

{/* NEW: Show relevance on citations */}
{persona.citations.map(c => (
  <Citation {...c} relevanceScore={c.relevance_score} />
))}
```

---

## Performance Impact

- **Computation**: Minimal (<5ms per persona)
  - Coverage calculation: Simple arithmetic on existing data
  - Relevance score: Already computed during retrieval
- **Payload size**: +50-100 bytes per persona response
- **Database**: No additional queries needed

---

## Validation

Run tests:
```bash
cd backend
pytest tests/test_citation_coverage.py -v
```

Expected output:
```
6 passed in 0.04s
```
