// ---------------------------------------------------------------------------
// Field Analysis Utilities
// ---------------------------------------------------------------------------
// Analyze subscriber data to build context for the LLM prompt.
// ---------------------------------------------------------------------------

import type { FieldValueSummary } from "@/lib/types/rules";

/**
 * Get all non-null field names present across subscribers.
 * Excludes internal fields like id, audience_id, created_at.
 */
export function getAvailableFields(
  subscribers: Record<string, unknown>[]
): string[] {
  const skip = new Set(["id", "audience_id", "created_at", "raw_data"]);
  const fields = new Set<string>();

  for (const sub of subscribers) {
    for (const key of Object.keys(sub)) {
      if (!skip.has(key) && sub[key] !== null && sub[key] !== undefined) {
        fields.add(key);
      }
    }
  }

  return [...fields].sort();
}

/**
 * Build a summary of each field's type, sample values, and distinct count.
 */
export function getFieldValueSummary(
  subscribers: Record<string, unknown>[]
): Record<string, FieldValueSummary> {
  const fields = getAvailableFields(subscribers);
  const result: Record<string, FieldValueSummary> = {};

  for (const field of fields) {
    const values = subscribers
      .map((s) => s[field])
      .filter((v) => v !== null && v !== undefined);

    if (values.length === 0) continue;

    const first = values[0];
    let type: FieldValueSummary["type"] = "unknown";
    if (typeof first === "string") type = "string";
    else if (typeof first === "number") type = "number";
    else if (typeof first === "boolean") type = "boolean";
    else if (Array.isArray(first)) type = "array";

    // Get distinct values (for arrays, flatten first)
    const flat =
      type === "array"
        ? values.flatMap((v) => v as unknown[])
        : values;
    const distinct = new Set(flat.map((v) => JSON.stringify(v)));

    // Sample up to 10 distinct values
    const sampleValues = [...distinct].slice(0, 10).map((v) => {
      try {
        return JSON.parse(v);
      } catch {
        return v;
      }
    });

    result[field] = {
      type,
      sample_values: sampleValues,
      distinct_count: distinct.size,
    };
  }

  return result;
}

/**
 * Take a stratified sample of subscribers by engagement score quartiles.
 * Returns up to `n` subscribers with diverse engagement levels.
 */
export function sampleSubscribers(
  subscribers: Record<string, unknown>[],
  n: number = 50
): Record<string, unknown>[] {
  if (subscribers.length <= n) return subscribers;

  // Sort by engagement_score
  const sorted = [...subscribers].sort((a, b) => {
    const aScore = (a.engagement_score as number) || 0;
    const bScore = (b.engagement_score as number) || 0;
    return aScore - bScore;
  });

  // Split into 4 quartiles and sample evenly
  const perQuartile = Math.ceil(n / 4);
  const quartileSize = Math.ceil(sorted.length / 4);
  const result: Record<string, unknown>[] = [];

  for (let q = 0; q < 4; q++) {
    const start = q * quartileSize;
    const end = Math.min(start + quartileSize, sorted.length);
    const quartile = sorted.slice(start, end);

    // Random sample from this quartile
    const shuffled = quartile.sort(() => Math.random() - 0.5);
    result.push(...shuffled.slice(0, perQuartile));
  }

  return result.slice(0, n);
}
