import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { MOCK_SUBSCRIBERS } from "@/lib/mockData";
import { generateSegments } from "@/lib/generators/segments";
import { generateActions } from "@/lib/generators/actions";
import type { Audience, Subscriber, Segment } from "@/lib/mockData";

export async function POST() {
  try {
    const supabase = createAdminClient();

    // 1. Clean up previous demo audiences (cascade deletes subscribers, segments, actions)
    const { data: existing } = await supabase
      .from("audiences")
      .select("id")
      .eq("source", "demo")
      .limit(50);

    if (existing && existing.length > 0) {
      const ids = existing.map((a) => a.id);
      await supabase.from("audiences").delete().in("id", ids);
      console.log("[demo] Cleaned up", ids.length, "old demo audiences");
    }

    // 2. Create demo audience
    const { data: audience, error: audError } = await supabase
      .from("audiences")
      .insert({ name: "SaaS Growth Newsletter", source: "demo" })
      .select()
      .single();

    if (audError || !audience) {
      console.error("[demo] Failed to create audience:", audError?.message);
      return NextResponse.json(
        { error: "Failed to create audience", details: audError?.message },
        { status: 500 }
      );
    }

    console.log("[demo] Audience created:", audience.id);

    // 3. Insert demo subscribers
    const subRows = MOCK_SUBSCRIBERS.map((s) => ({
      audience_id: audience.id,
      email: s.email,
      first_name: s.first_name,
      last_name: s.last_name,
      city: s.city,
      state: s.state,
      country: s.country,
      income_tier: s.income_tier,
      industry: s.industry,
      job_title: s.job_title,
      business_owner: s.business_owner,
      intent_categories: s.intent_categories,
      recent_activity: s.recent_activity,
      engagement_score: s.engagement_score,
    }));

    const { data: subs, error: subError } = await supabase
      .from("subscribers")
      .insert(subRows)
      .select();

    if (subError || !subs) {
      console.error("[demo] Failed to insert subscribers:", subError?.message);
      return NextResponse.json(
        { error: "Failed to insert subscribers", details: subError?.message },
        { status: 500 }
      );
    }

    console.log("[demo] Subscribers inserted:", subs.length);

    // 4. Generate segments from subscriber data
    const audForGen: Audience = {
      id: audience.id,
      name: audience.name,
      source: audience.source || "demo",
      subscriber_count: subs.length,
    };

    const generatedSegments = generateSegments(
      audForGen,
      subs as unknown as Subscriber[]
    );

    // 5. Insert segments into Supabase (DB generates UUID ids)
    const segRows = generatedSegments.map((seg) => ({
      audience_id: audience.id,
      name: seg.name,
      description: seg.description,
      segment_type: seg.segment_type,
      subscriber_count: seg.subscriber_count,
      defining_traits: seg.defining_traits,
      monetization_paths: seg.monetization_paths,
      confidence: seg.confidence,
    }));

    const { data: savedSegs, error: segError } = await supabase
      .from("segments")
      .insert(segRows)
      .select();

    if (segError || !savedSegs) {
      console.error("[demo] Failed to save segments:", segError?.message);
      return NextResponse.json(
        { error: "Failed to save segments", details: segError?.message },
        { status: 500 }
      );
    }

    console.log("[demo] Segments created:", savedSegs.length);

    // 6. Generate actions using DB segments (which have UUID ids)
    const generatedActions = generateActions(
      audForGen,
      savedSegs as unknown as Segment[]
    );

    // 7. Insert actions into Supabase
    const actionRows = generatedActions.map((action) => ({
      audience_id: audience.id,
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

    const { data: savedActions, error: actionError } = await supabase
      .from("agent_actions")
      .insert(actionRows)
      .select();

    if (actionError || !savedActions) {
      console.error("[demo] Failed to save actions:", actionError?.message);
      return NextResponse.json(
        { error: "Failed to save actions", details: actionError?.message },
        { status: 500 }
      );
    }

    console.log("[demo] Actions created:", savedActions.length);
    console.log("[demo] Demo complete. audienceId:", audience.id);

    return NextResponse.json({
      success: true,
      audienceId: audience.id,
      subscribersImported: subs.length,
      segmentsCreated: savedSegs.length,
      actionsCreated: savedActions.length,
    });
  } catch (err) {
    console.error("[demo] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
