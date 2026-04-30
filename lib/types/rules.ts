// ---------------------------------------------------------------------------
// Hybrid Rules System — Type Definitions
// ---------------------------------------------------------------------------

// --- Condition types (stored as JSON in segment_rules.conditions) ---

export type ConditionOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "not_in"
  | "contains"
  | "exists";

export interface FieldCondition {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean | (string | number)[];
}

export interface ConditionGroup {
  logic: "and" | "or";
  conditions: (FieldCondition | ConditionGroup)[];
}

export function isConditionGroup(
  c: FieldCondition | ConditionGroup
): c is ConditionGroup {
  return "logic" in c && "conditions" in c;
}

// --- Database row types ---

export interface AnalysisRunRow {
  id: string;
  audience_id: string;
  status: "pending" | "completed" | "failed";
  subscriber_sample_size: number | null;
  model_used: string | null;
  raw_llm_response: unknown;
  proposed_rules_count: number | null;
  proposed_actions_count: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface SegmentRuleRow {
  id: string;
  audience_id: string;
  name: string;
  description: string | null;
  segment_type: string | null;
  conditions: ConditionGroup;
  defining_traits: Record<string, string> | null;
  monetization_paths: {
    path: string;
    description: string;
    estimated_value: string;
  }[] | null;
  confidence: number | null;
  status: "pending" | "approved" | "rejected";
  source: "llm" | "hardcoded" | "manual";
  llm_run_id: string | null;
  created_at: string;
  approved_at: string | null;
}

export interface ActionTemplateRow {
  id: string;
  audience_id: string;
  segment_rule_id: string;
  action_type: string;
  match_conditions: ConditionGroup;
  title_template: string;
  urgency: string | null;
  estimated_value: string | null;
  recommended_channels: string[] | null;
  why_now_template: string | null;
  reasoning_template: {
    segment_signal: string;
    revenue_logic: string;
    risk: string;
  } | null;
  agent_instruction_template: {
    objective: string;
    steps: string[];
    success_criteria: string;
    fallback: string;
  } | null;
  scoring_inputs: {
    intent_score: number;
    audience_value: number;
    sponsor_fit: number;
    timing_score: number;
    segment_size_weight: number;
    execution_effort: number;
  };
  status: "pending" | "approved" | "rejected";
  source: "llm" | "hardcoded" | "manual";
  llm_run_id: string | null;
  created_at: string;
  approved_at: string | null;
}

// --- Field analysis types (used by LLM prompt builder) ---

export interface FieldValueSummary {
  type: "string" | "number" | "boolean" | "array" | "unknown";
  sample_values: unknown[];
  distinct_count: number;
}
