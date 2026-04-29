import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const audienceId = req.nextUrl.searchParams.get("audienceId");

    if (!audienceId) {
      return NextResponse.json(
        { error: "audienceId query parameter is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: keys, error } = await supabase
      .from("agent_api_keys")
      .select("id, name, key_prefix, created_at, last_used_at, revoked_at")
      .eq("audience_id", audienceId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch API keys", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(keys ?? []);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
