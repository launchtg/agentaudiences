export interface ScoringInputs {
  intent_score: number;      // 0.1–1.0
  audience_value: number;    // 1–10
  sponsor_fit: number;       // 0.1–1.0
  timing_score: number;      // 0.1–1.0
  segment_size_weight: number; // 1–5
  execution_effort: number;  // 1–10
}

export type ActionPriority = "critical" | "high" | "medium" | "hidden";

// Max raw score: (1.0 × 10 × 1.0 × 1.0 × 5) / 1 = 50
// Min raw score: (0.1 × 1 × 0.1 × 0.1 × 1) / 10 = 0.0001
const MAX_RAW = 50;

export function calculateActionScore(inputs: ScoringInputs): number {
  const raw =
    (inputs.intent_score *
      inputs.audience_value *
      inputs.sponsor_fit *
      inputs.timing_score *
      inputs.segment_size_weight) /
    inputs.execution_effort;

  return Math.min(100, Math.round((raw / MAX_RAW) * 100));
}

export function getPriority(score: number): ActionPriority {
  if (score >= 90) return "critical";
  if (score >= 75) return "high";
  if (score >= 55) return "medium";
  return "hidden";
}

export function shouldShowAction(score: number): boolean {
  return score >= 55;
}

// --- Example usage ---
//
// const inputs: ScoringInputs = {
//   intent_score: 0.9,
//   audience_value: 8,
//   sponsor_fit: 0.85,
//   timing_score: 0.9,
//   segment_size_weight: 4,
//   execution_effort: 3,
// };
//
// const score = calculateActionScore(inputs);  // 73
// const priority = getPriority(score);          // "medium"
// const show = shouldShowAction(score);         // true
//
// --- Edge cases ---
//
// Perfect score:  { 1.0, 10, 1.0, 1.0, 5, 1 } → 100 (critical)
// Worst score:    { 0.1,  1, 0.1, 0.1, 1, 10 } → 0   (hidden)
// Mid-range:      { 0.5,  5, 0.5, 0.5, 3, 5 }  → 2   (hidden)
// High-effort:    { 1.0, 10, 1.0, 1.0, 5, 10 } → 10  (hidden)
