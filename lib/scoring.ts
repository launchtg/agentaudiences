export interface ScoringInputs {
  intent_score: number;      // 0.1–1.0
  audience_value: number;    // 1–10
  sponsor_fit: number;       // 0.1–1.0
  timing_score: number;      // 0.1–1.0
  segment_size_weight: number; // 1–5
  execution_effort: number;  // 1–10
}

export type ActionPriority = "critical" | "high" | "medium" | "hidden";

// Realistic "best case" raw: ~6 (high intent, high value, large segment, moderate effort)
// Cube root normalization compresses the multiplicative spread so scores
// distribute across the 55-100 range instead of clustering near zero.
const MAX_RAW = 5.5;

export function calculateActionScore(inputs: ScoringInputs): number {
  const raw =
    (inputs.intent_score *
      inputs.audience_value *
      inputs.sponsor_fit *
      inputs.timing_score *
      inputs.segment_size_weight) /
    inputs.execution_effort;

  const normalized = Math.cbrt(raw / MAX_RAW);
  return Math.min(100, Math.round(normalized * 100));
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
// --- Edge cases (cube root normalization, MAX_RAW=5.5) ---
//
// Perfect score:  { 1.0, 10, 1.0, 1.0, 5, 1 } → 100 (critical)
// Strong action:  { 0.9,  9, 0.9, 0.85,3, 4 } → 95  (critical)
// Good action:    { 0.8,  7, 0.7, 0.8, 2, 3 } → 72  (medium)
// Weak action:    { 0.4,  4, 0.3, 0.7, 1, 3 } → 39  (hidden)
// Worst score:    { 0.1,  1, 0.1, 0.1, 1, 10 } → 3   (hidden)
