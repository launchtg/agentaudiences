// ---------------------------------------------------------------------------
// Rule Evaluation Engine
// ---------------------------------------------------------------------------
// Evaluates JSON condition objects against subscriber records.
// No LLM involved — pure deterministic matching.
// ---------------------------------------------------------------------------

import type {
  FieldCondition,
  ConditionGroup,
} from "@/lib/types/rules";
import { isConditionGroup } from "@/lib/types/rules";

/**
 * Evaluate a ConditionGroup against a subscriber record.
 * Returns true if the subscriber matches the rule.
 */
export function evaluateRule(
  conditions: ConditionGroup,
  record: Record<string, unknown>
): boolean {
  const results = conditions.conditions.map((c) =>
    isConditionGroup(c)
      ? evaluateRule(c, record)
      : evaluateFieldCondition(c, record)
  );

  return conditions.logic === "and"
    ? results.every(Boolean)
    : results.some(Boolean);
}

function evaluateFieldCondition(
  condition: FieldCondition,
  record: Record<string, unknown>
): boolean {
  const value = record[condition.field];

  switch (condition.operator) {
    case "eq":
      return value === condition.value;

    case "neq":
      return value !== condition.value;

    case "gt":
      return typeof value === "number" && value > (condition.value as number);

    case "gte":
      return typeof value === "number" && value >= (condition.value as number);

    case "lt":
      return typeof value === "number" && value < (condition.value as number);

    case "lte":
      return typeof value === "number" && value <= (condition.value as number);

    case "in":
      return Array.isArray(condition.value) && condition.value.includes(value as string | number);

    case "not_in":
      return Array.isArray(condition.value) && !condition.value.includes(value as string | number);

    case "contains": {
      // Subscriber field is an array, condition value is array of acceptable values.
      // Returns true if ANY element in the subscriber's array is in the acceptable set.
      if (!Array.isArray(value) || !Array.isArray(condition.value)) return false;
      return value.some((item) =>
        (condition.value as (string | number)[]).includes(item as string | number)
      );
    }

    case "exists":
      return value !== null && value !== undefined;

    default:
      return false;
  }
}
