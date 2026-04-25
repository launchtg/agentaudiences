import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateSegments } from "@/lib/generators/segments";
import type { Audience, Subscriber } from "@/lib/mockData";

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

    // Fetch subscribers
    const { data: subscribers, error: subError } = await supabase
      .from("subscribers")
      .select("*")
      .eq("audience_id", body.audience_id);

    if (subError) {
      return NextResponse.json(
        { error: "Failed to fetch subscribers", details: subError.message },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: "No subscribers found for this audience. Import subscribers first." },
        { status: 422 }
      );
    }

    // Generate segments deterministically
    const segments = generateSegments(
      audience as Audience,
      subscribers as Subscriber[]
    );

    // Upsert segments into database
    const rows = segments.map((seg) => ({
      audience_id: body.audience_id,
      name: seg.name,
      description: seg.description,
      segment_type: seg.segment_type,
      subscriber_count: seg.subscriber_count,
      defining_traits: seg.defining_traits,
      monetization_paths: seg.monetization_paths,
      confidence: seg.confidence,
    }));

    const { data: saved, error: insertError } = await supabase
      .from("segments")
      .insert(rows)
      .select();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to save segments", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { generated: saved.length, segments: saved },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
