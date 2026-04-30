// ---------------------------------------------------------------------------
// Generation from Stored Rules
// ---------------------------------------------------------------------------
// Replaces the hardcoded generators when an audience has approved rules.
// Uses evaluateRule() for segment matching and renderTemplate() for actions.
// ---------------------------------------------------------------------------

import type { Audience, Segment, AgentAction } from "@/lib/mockData";
import type { SegmentRuleRow, ActionTemplateRow, ConditionGroup } from "@/lib/types/rules";
import type { Capability } from "@/lib/execution/capabilities";
import { evaluateRule } from "@/lib/engine/evaluateRule";
import { renderTemplate, renderTemplateObject } from "@/lib/engine/renderTemplate";
import { calculateActionScore, getPriority } from "@/lib/scoring";
import type { ScoringInputs } from "@/lib/scoring";
import { evaluateActionExecution, getDefaultCapabilities } from "@/lib/execution/capabilities";
import { isConditionGroup } from "@/lib/types/rules";

// ---------------------------------------------------------------------------
// Segment generation from stored rules
// ---------------------------------------------------------------------------

let segmentCounter = 0;

function makeSegmentId(): string {
  segmentCounter++;
  return `seg-${String(segmentCounter).padStart(3, "0")}`;
}

export function generateSegmentsFromRules(
  audience: Audience,
  subscribers: Record<string, unknown>[],
  rules: SegmentRuleRow[]
): (Segment & { segment_rule_id: string })[] {
  segmentCounter = 0;

  return rules
    .filter((rule) => rule.status === "approved")
    .map((rule) => {
      const matched = subscribers.filter((s) =>
        evaluateRule(rule.conditions, s)
      );
      return {
        id: makeSegmentId(),
        audience_id: audience.id,
        segment_rule_id: rule.id,
        name: rule.name,
        description: rule.description || "",
        segment_type: rule.segment_type || "intent_cluster",
        subscriber_count: matched.length,
        defining_traits: rule.defining_traits || {},
        monetization_paths: rule.monetization_paths || [],
        confidence: rule.confidence || 0.5,
      };
    })
    .filter((seg) => seg.subscriber_count > 0);
}

// ---------------------------------------------------------------------------
// Action template matching against segments
// ---------------------------------------------------------------------------

function evaluateActionMatch(
  conditions: ConditionGroup,
  segment: Segment
): boolean {
  const results = conditions.conditions.map((c) => {
    if (isConditionGroup(c)) {
      return evaluateActionMatch(c, segment);
    }

    // Handle special "has_path" operator for monetization_paths
    if (c.field === "monetization_paths" && c.operator === "contains") {
      return segment.monetization_paths.some(
        (p) => p.path === c.value
      );
    }

    // Standard field evaluation against segment as a record
    const record = segment as unknown as Record<string, unknown>;
    const value = record[c.field];

    switch (c.operator) {
      case "eq":
        return value === c.value;
      case "gte":
        return typeof value === "number" && value >= (c.value as number);
      case "lte":
        return typeof value === "number" && value <= (c.value as number);
      case "in":
        return Array.isArray(c.value) && c.value.includes(value as string | number);
      default:
        return false;
    }
  });

  return conditions.logic === "and"
    ? results.every(Boolean)
    : results.some(Boolean);
}

// ---------------------------------------------------------------------------
// Action generation from stored templates
// ---------------------------------------------------------------------------

let actionCounter = 0;

function makeActionId(): string {
  actionCounter++;
  return `act-${String(actionCounter).padStart(3, "0")}`;
}

export function generateActionsFromTemplates(
  audience: Audience,
  segments: Segment[],
  templates: ActionTemplateRow[],
  capabilities?: Capability[]
): AgentAction[] {
  actionCounter = 0;
  const caps = capabilities || getDefaultCapabilities();
  const actions: AgentAction[] = [];

  const approvedTemplates = templates.filter((t) => t.status === "approved");

  for (const segment of segments) {
    for (const template of approvedTemplates) {
      if (!evaluateActionMatch(template.match_conditions, segment)) continue;

      const context: Record<string, unknown> = { segment, audience };

      const title = renderTemplate(template.title_template, context);
      const whyNow = template.why_now_template
        ? renderTemplate(template.why_now_template, context)
        : "";
      const reasoning = template.reasoning_template
        ? renderTemplateObject(template.reasoning_template, context)
        : { segment_signal: "", revenue_logic: "", risk: "" };
      const agentInstruction = template.agent_instruction_template
        ? renderTemplateObject(template.agent_instruction_template, context)
        : { objective: "", steps: [], success_criteria: "", fallback: "" };

      // Adjust segment_size_weight based on actual segment size
      const scoringInputs: ScoringInputs = {
        ...template.scoring_inputs,
        segment_size_weight: Math.min(
          5,
          Math.max(1, Math.ceil(segment.subscriber_count / 2))
        ),
      };

      const score = calculateActionScore(scoringInputs);
      const priority = getPriority(score);
      if (priority === "hidden") continue;

      const execution = evaluateActionExecution(template.action_type, caps);

      actions.push({
        id: makeActionId(),
        audience_id: audience.id,
        segment_id: segment.id,
        title,
        action_type: template.action_type,
        action_score: score,
        priority,
        urgency: template.urgency || "this_month",
        estimated_value: template.estimated_value || "",
        recommended_channels: template.recommended_channels || [],
        why_now: whyNow,
        reasoning,
        agent_instruction: {
          ...agentInstruction,
          steps: [
            "Fetch the segment members from the segment_members_url on this action to get the full subscriber list with names, companies, titles, and engagement data",
            ...(agentInstruction.steps || []),
          ],
        },
        scoring_inputs: scoringInputs,
        execution,
        status: "new",
      });
    }
  }

  return actions.sort((a, b) => b.action_score - a.action_score);
}
