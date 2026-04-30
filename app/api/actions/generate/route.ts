import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateActions } from "@/lib/generators/actions";
import { generateActionsFromTemplates } from "@/lib/engine/generateFromRules";
import type { Audience, Segment } from "@/lib/mockData";
import type { ActionTemplateRow } from "@/lib/types/rules";
import type { Capability } from "@/lib/execution/capabilities";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.audience_id || typeof body.audience_id !== "string") {
      return NextResponse.json(
        { error: "audience_id is required and must be a string" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch audience
    const { data: audience, error: audienceError } = await supabase
      .from("audiences")
      .select("id, name, source")
      .eq("id", body.audience_id)
      .single();

    if (audienceError || !audience) {
      return NextResponse.json(
        { error: "Audience not found", details: audienceError?.message },
        { status: 404 }
      );
    }

    // Fetch segments
    const { data: segments, error: segError } = await supabase
      .from("segments")
      .select("*")
      .eq("audience_id", body.audience_id);

    if (segError) {
      return NextResponse.json(
        { error: "Failed to fetch segments", details: segError.message },
        { status: 500 }
      );
    }

    if (!segments || segments.length === 0) {
      return NextResponse.json(
        { error: "No segments found for this audience. Generate segments first." },
        { status: 422 }
      );
    }

    // Fetch capabilities
    const { data: capRows } = await supabase
      .from("audience_capabilities")
      .select("*")
      .eq("audience_id", body.audience_id);

    const capabilities: Capability[] | undefined = capRows
      ? capRows.map((c) => ({
          capability_key: c.capability_key,
          capability_label: c.capability_label,
          status: c.status as "available" | "missing",
          connected_tool: c.connected_tool,
          tool_category: c.tool_category,
        }))
      : undefined;

    // Check for approved action templates (hybrid path)
    const { data: approvedTemplates } = await supabase
      .from("action_templates")
      .select("*")
      .eq("audience_id", body.audience_id)
      .eq("status", "approved");

    let generatedActions;
    let mode: string;

    if (approvedTemplates && approvedTemplates.length > 0) {
      // Hybrid path: use stored templates
      generatedActions = generateActionsFromTemplates(
        audience as Audience,
        segments as Segment[],
        approvedTemplates as ActionTemplateRow[],
        capabilities
      );
      mode = "hybrid";
    } else {
      // Legacy path: use hardcoded templates
      generatedActions = generateActions(
        audience as Audience,
        segments as Segment[],
        capabilities
      );
      mode = "legacy";
    }

    // Save to database
    const rows = generatedActions.map((action) => ({
      audience_id: body.audience_id,
      segment_id: action.segment_id,
      title: action.title,
      action_type: action.action_type,
      priority: action.priority,
      action_score: action.action_score,
      urgency: action.urgency,
      estimated_value: action.estimated_value,
      recommended_channels: action.recommended_channels,
      why_now: action.why_now,
      reasoning: action.reasoning,
      agent_instruction: action.agent_instruction,
      status: "new",
    }));

    const { data: saved, error: insertError } = await supabase
      .from("agent_actions")
      .insert(rows)
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to save actions", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { generated: saved.length, mode, actions: saved },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
