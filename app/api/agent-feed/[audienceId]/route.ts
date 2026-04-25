import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ audienceId: string }> }
) {
  try {
    const { audienceId } = await params;

    if (!audienceId) {
      return NextResponse.json(
        { error: "audienceId is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch visible actions (medium, high, critical) sorted by score desc
    const { data: actions, error } = await supabase
      .from("agent_actions")
      .select("*")
      .eq("audience_id", audienceId)
      .in("priority", ["critical", "high", "medium"])
      .order("action_score", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch agent feed", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      audience_id: audienceId,
      total: actions.length,
      actions,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
