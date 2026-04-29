import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const audienceId = req.nextUrl.searchParams.get("audienceId");
    if (!audienceId) {
      return NextResponse.json({ error: "audienceId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("audience_capabilities")
      .select("*")
      .eq("audience_id", audienceId)
      .order("capability_key");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audienceId, capabilities } = body;

    if (!audienceId || !Array.isArray(capabilities)) {
      return NextResponse.json({ error: "audienceId and capabilities array required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Upsert all capabilities
    const rows = capabilities.map((c: { capability_key: string; capability_label: string; status: string; connected_tool: string | null; tool_category: string | null }) => ({
      audience_id: audienceId,
      capability_key: c.capability_key,
      capability_label: c.capability_label,
      status: c.status,
      connected_tool: c.connected_tool,
      tool_category: c.tool_category,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("audience_capabilities")
      .upsert(rows, { onConflict: "audience_id,capability_key" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
