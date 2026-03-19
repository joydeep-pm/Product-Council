# UI Preview - Source Coverage & Citation Enhancements

## What Users Will See

### 1. Source Coverage Indicator (Above Each Persona Response)

#### High Coverage Example (🟢)
```
┌─────────────────────────────────────────────────────────┐
│ 🟢 HIGH SOURCE COVERAGE                    6 sources    │
│    Shreyas Doshi has written extensively   ~20% AI-gen  │
│    about this                                            │
└─────────────────────────────────────────────────────────┘
```

#### Medium Coverage Example (🟡)
```
┌─────────────────────────────────────────────────────────┐
│ 🟡 MODERATE SOURCE COVERAGE                3 sources    │
│    Ben Thompson has touched on this topic  ~40% AI-gen  │
└─────────────────────────────────────────────────────────┘
```

#### Low Coverage Example (🟠)
```
┌─────────────────────────────────────────────────────────┐
│ 🟠 LIMITED SOURCE COVERAGE                 1 source     │
│    Operator Collective hasn't written      ~70% AI-gen  │
│    much about this specifically                          │
└─────────────────────────────────────────────────────────┘
```

#### No Coverage Example (🔴)
```
┌─────────────────────────────────────────────────────────┐
│ 🔴 NO DIRECT SOURCES                       0 sources    │
│    Paul Graham hasn't written about        ~95% AI-gen  │
│    this topic                                            │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Enhanced Citation Cards (Evidence Section)

#### Before (Current)
```
Evidence
┌─────────────────────────────────────────────┐
│ [1] Pre-mortems: How Stripe Does It        │
│ A pre-mortem is a thought exercise...      │
│ [GTM]                                       │
└─────────────────────────────────────────────┘
```

#### After (With Relevance Scores)
```
Evidence (4 sources)
┌─────────────────────────────────────────────┐
│ [1] Pre-mortems: How Stripe Does It  ⭐⭐⭐⭐⭐│
│ A pre-mortem is a thought exercise...      │
│ [GTM]                            92% relevant│
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [2] Product Strategy Frameworks       ⭐⭐⭐⭐ │
│ When thinking about sequencing...           │
│ [STRATEGY]                       78% relevant│
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [3] AI Product Development           ⭐⭐⭐   │
│ Building AI products requires...            │
│                                  65% relevant│
└─────────────────────────────────────────────┘
```

---

### 3. No Sources Warning (When Applicable)

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ This perspective is based on general principles,    │
│    not specific writings by Paul Graham                 │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Complete Persona Card Layout

```
┌───────────────────────────────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  ← Colored bar
│                                                               │
│  ┌──┐  Shreyas Doshi                                         │
│  │SD│  COUNCIL PERSPECTIVE                                    │
│  └──┘                                                         │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🟢 HIGH SOURCE COVERAGE              6 sources          │ │  ← NEW: Coverage indicator
│  │    Shreyas Doshi has written         ~20% AI-generated  │ │
│  │    extensively about this                               │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  This is fundamentally a sequencing question. For AI         │
│  productivity tools targeting PMs, start with a narrow       │
│  workflow wedge that creates daily habit formation...        │  ← Response text
│                                                               │
│  The key tradeoff is between immediate utility and long-term │
│  strategic leverage. You can build a feature that gets tried │
│  once or a workflow that gets used daily...                  │
│                                                               │
│  • Lead with workflow ownership (prototyping, not copilot)   │
│  • Validate with repeat usage metrics                        │
│  • Layer AI only where it accelerates the core workflow      │
│  ──────────────────────────────────────────────────────────  │
│  Evidence (4 sources)                                         │  ← Enhanced section header
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [1] Pre-mortems: How Stripe Does It         ⭐⭐⭐⭐⭐    ││  ← NEW: Relevance stars
│  │ A pre-mortem is a thought exercise where...             ││
│  │ [GTM]                                   92% relevant     ││  ← NEW: Relevance %
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [2] Product Strategy Frameworks              ⭐⭐⭐⭐     ││
│  │ When thinking about sequencing GTM...                   ││
│  │ [STRATEGY]                              78% relevant     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [3] AI Product Development                   ⭐⭐⭐       ││
│  │ Building AI products requires different...              ││
│  │                                         65% relevant     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [4] Execution vs Strategy                    ⭐⭐        ││
│  │ Not all decisions require the same level...             ││
│  │                                         52% relevant     ││
│  └─────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────┘
```

---

## Color Schemes

### Coverage Indicators
- **High (🟢)**: Green background (#f0fdf4), green border, green text
- **Medium (🟡)**: Yellow background (#fefce8), yellow border, yellow text
- **Low (🟠)**: Orange background (#fff7ed), orange border, orange text
- **None (🔴)**: Red background (#fef2f2), red border, red text

### Star Ratings
- 5 stars ⭐⭐⭐⭐⭐: 90-100% relevance
- 4 stars ⭐⭐⭐⭐: 70-89% relevance
- 3 stars ⭐⭐⭐: 50-69% relevance
- 2 stars ⭐⭐: 30-49% relevance
- 1 star ⭐: 10-29% relevance
- 0 stars: <10% relevance (rarely displayed)

---

## Key UI/UX Improvements

1. **At-a-glance trust signals**: Users immediately see if a persona has expertise on the topic
2. **Quantified transparency**: Exact percentages for AI-generation and relevance
3. **Visual hierarchy**: Color-coded indicators help users quickly scan multiple personas
4. **Source ranking**: Stars provide instant visual ranking of citation relevance
5. **No confusion**: Clear warnings when responses are extrapolated vs. grounded in sources

---

## Responsive Behavior

- **Desktop**: Full layout as shown above
- **Tablet**: Coverage indicator stacks vertically, stars remain visible
- **Mobile**: Compact layout with coverage indicator showing minimal text, stars scale down

All clickable elements (citations) maintain touch-friendly sizes across devices.
