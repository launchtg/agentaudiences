import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.audience_id || typeof body.audience_id !== "string") {
      return NextResponse.json(
        { error: "audience_id is required and must be a string" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.subscribers) || body.subscribers.length === 0) {
      return NextResponse.json(
        { error: "subscribers must be a non-empty array" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify audience exists
    const { data: audience, error: audienceError } = await supabase
      .from("audiences")
      .select("id")
      .eq("id", body.audience_id)
      .single();

    if (audienceError || !audience) {
      return NextResponse.json(
        { error: "Audience not found", details: audienceError?.message },
        { status: 404 }
      );
    }

    const rows = body.subscribers.map(
      (s: Record<string, unknown>) => ({
        audience_id: body.audience_id,
        email: s.email || null,
        first_name: s.first_name || null,
        last_name: s.last_name || null,
        city: s.city || null,
        state: s.state || null,
        country: s.country || null,
        income_tier: s.income_tier || null,
        industry: s.industry || null,
        job_title: s.job_title || null,
        business_owner: s.business_owner ?? null,
        intent_categories: Array.isArray(s.intent_categories)
          ? s.intent_categories
          : null,
        recent_activity: s.recent_activity || null,
        engagement_score: s.engagement_score ?? null,
        raw_data: s.raw_data || null,
      })
    );

    const { data, error } = await supabase
      .from("subscribers")
      .insert(rows)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Failed to import subscribers", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { imported: data.length, subscribers: data },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
