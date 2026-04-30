import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { callLLMJson } from "@/lib/llm/client";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisUserPrompt,
} from "@/lib/prompts/analysisPrompt";
import {
  getAvailableFields,
  getFieldValueSummary,
  sampleSubscribers,
} from "@/lib/analysis/fieldAnalysis";
import type { ConditionGroup } from "@/lib/types/rules";

// Shape of the LLM response
interface LLMAnalysisResponse {
  segment_rules: {
    name: string;
    description: string;
    segment_type: string;
    conditions: ConditionGroup;
    defining_traits: Record<string, string>;
    monetization_paths: {
      path: string;
      description: string;
      estimated_value: string;
    }[];
    confidence: number;
    action_templates: {
      action_type: string;
      title_template: string;
      urgency: string;
      estimated_value: string;
      recommended_channels: string[];
      why_now_template: string;
      reasoning_template: {
        segment_signal: string;
        revenue_logic: string;
        risk: string;
      };
      agent_instruction_template: {
        objective: string;
        steps: string[];
        success_criteria: string;
        fallback: string;
      };
      scoring_inputs: {
        intent_score: number;
        audience_value: number;
        sponsor_fit: number;
        timing_score: number;
        segment_size_weight: number;
        execution_effort: number;
      };
    }[];
  }[];
}

/**
 * Validate that all condition fields reference real subscriber fields.
 */
function validateConditionFields(
  conditions: ConditionGroup,
  validFields: Set<string>
): string[] {
  const errors: string[] = [];

  for (const c of conditions.conditions) {
    if ("logic" in c && "conditions" in c) {
      errors.push(...validateConditionFields(c as ConditionGroup, validFields));
    } else {
      const fc = c as { field: string };
      if (!validFields.has(fc.field)) {
        errors.push(`Unknown field "${fc.field}"`);
      }
    }
  }

  return errors;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.audience_id) {
      return NextResponse.json(
        { error: "audience_id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch audience
    const { data: audience, error: audError } = await supabase
      .from("audiences")
      .select("id, name, source")
      .eq("id", body.audience_id)
      .single();

    if (audError || !audience) {
      return NextResponse.json(
        { error: "Audience not found" },
        { status: 404 }
      );
    }

    // Fetch all subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("subscribers")
      .select("*")
      .eq("audience_id", body.audience_id);

    if (subError || !subscribers || subscribers.length === 0) {
      return NextResponse.json(
        {
          error: "No subscribers found. Import subscribers first.",
        },
        { status: 422 }
      );
    }

    // Analyze subscriber fields
    const availableFields = getAvailableFields(
      subscribers as Record<string, unknown>[]
    );
    const fieldSummary = getFieldValueSummary(
      subscribers as Record<string, unknown>[]
    );
    const sample = sampleSubscribers(
      subscribers as Record<string, unknown>[],
      50
    );

    // Create analysis run record
    const { data: run, error: runError } = await supabase
      .from("analysis_runs")
      .insert({
        audience_id: body.audience_id,
        status: "pending",
        subscriber_sample_size: sample.length,
      })
      .select()
      .single();

    if (runError || !run) {
      return NextResponse.json(
        { error: "Failed to create analysis run" },
        { status: 500 }
      );
    }

    // Call LLM
    let llmResult: LLMAnalysisResponse;
    let model: string;

    try {
      const userPrompt = buildAnalysisUserPrompt(
        audience.name,
        subscribers.length,
        sample,
        availableFields,
        fieldSummary
      );

      const response = await callLLMJson<LLMAnalysisResponse>({
        systemPrompt: ANALYSIS_SYSTEM_PROMPT,
        userPrompt,
        maxTokens: 8192,
      });

      llmResult = response.data;
      model = response.model;

      // Store raw response
      await supabase
        .from("analysis_runs")
        .update({
          raw_llm_response: llmResult,
          model_used: model,
        })
        .eq("id", run.id);
    } catch (err) {
      // Mark run as failed
      await supabase
        .from("analysis_runs")
        .update({
          status: "failed",
          error_message:
            err instanceof Error ? err.message : "LLM call failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", run.id);

      return NextResponse.json(
        {
          error: "LLM analysis failed",
          details: err instanceof Error ? err.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Validate and insert proposed rules
    const validFields = new Set(availableFields);
    const insertedRules: { id: string; name: string }[] = [];
    const validationWarnings: string[] = [];

    for (const rule of llmResult.segment_rules || []) {
      // Validate condition fields
      const fieldErrors = validateConditionFields(
        rule.conditions,
        validFields
      );
      if (fieldErrors.length > 0) {
        validationWarnings.push(
          `Rule "${rule.name}": ${fieldErrors.join(", ")}`
        );
        continue; // Skip rules referencing invalid fields
      }

      // Insert segment rule
      const { data: savedRule, error: ruleError } = await supabase
        .from("segment_rules")
        .insert({
          audience_id: body.audience_id,
          name: rule.name,
          description: rule.description,
          segment_type: rule.segment_type,
          conditions: rule.conditions,
          defining_traits: rule.defining_traits,
          monetization_paths: rule.monetization_paths,
          confidence: rule.confidence,
          status: "pending",
          source: "llm",
          llm_run_id: run.id,
        })
        .select()
        .single();

      if (ruleError || !savedRule) continue;

      insertedRules.push({ id: savedRule.id, name: savedRule.name });

      // Insert action templates for this rule
      for (const template of rule.action_templates || []) {
        await supabase.from("action_templates").insert({
          audience_id: body.audience_id,
          segment_rule_id: savedRule.id,
          action_type: template.action_type,
          match_conditions: {
            logic: "and",
            conditions: [
              {
                field: "segment_type",
                operator: "eq",
                value: rule.segment_type,
              },
            ],
          },
          title_template: template.title_template,
          urgency: template.urgency,
          estimated_value: template.estimated_value,
          recommended_channels: template.recommended_channels,
          why_now_template: template.why_now_template,
          reasoning_template: template.reasoning_template,
          agent_instruction_template: template.agent_instruction_template,
          scoring_inputs: template.scoring_inputs,
          status: "pending",
          source: "llm",
          llm_run_id: run.id,
        });
      }
    }

    // Count action templates
    const { count: templateCount } = await supabase
      .from("action_templates")
      .select("*", { count: "exact", head: true })
      .eq("llm_run_id", run.id);

    // Update analysis run as completed
    await supabase
      .from("analysis_runs")
      .update({
        status: "completed",
        proposed_rules_count: insertedRules.length,
        proposed_actions_count: templateCount || 0,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    // Fetch complete proposals for response
    const { data: proposedRules } = await supabase
      .from("segment_rules")
      .select("*")
      .eq("llm_run_id", run.id)
      .order("confidence", { ascending: false });

    const { data: proposedTemplates } = await supabase
      .from("action_templates")
      .select("*")
      .eq("llm_run_id", run.id);

    return NextResponse.json({
      run_id: run.id,
      proposed_rules: proposedRules || [],
      proposed_action_templates: proposedTemplates || [],
      validation_warnings: validationWarnings,
    });
  } catch (err) {
    console.error("[analyze] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
