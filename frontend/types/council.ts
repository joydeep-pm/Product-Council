export type PersonaId = "paul_graham" | "shreyas" | "operator_collective" | "ben_thompson";

export interface Citation {
  source_id: string;
  title: string;
  url: string;
  excerpt: string;
  framework_tag?: string | null;
  relevance_score: number;
  author?: string | null;
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

export interface ClashResult {
  friction_point: string;
  why_it_matters: string;
  tradeoff_axes: string[];
}

export interface Actions306090 {
  days_0_30: string[];
  days_31_60: string[];
  days_61_90: string[];
}

export interface SynthesisResult {
  recommendation: string;
  actions_30_60_90: Actions306090;
  risks: string[];
  leading_indicators: string[];
}

export interface SessionTurn {
  question: string;
  created_at: string;
}

export interface CouncilSession {
  session_id: string;
  created_at: string;
  query: string;
  turns: SessionTurn[];
  round_table: PersonaResponse[];
  clash: ClashResult;
  synthesis: SynthesisResult;
}

export interface SessionListItem {
  session_id: string;
  created_at: string;
  query: string;
  question_count: number;
  friction_summary?: string | null;
  synthesis_summary?: string | null;
}

export interface SessionListResponse {
  items: SessionListItem[];
  total: number;
}
