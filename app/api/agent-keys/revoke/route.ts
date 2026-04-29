import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyId } = body;

    if (!keyId) {
      return NextResponse.json(
        { error: "keyId is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("agent_api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", keyId)
      .is("revoked_at", null);

    if (error) {
      return NextResponse.json(
        { error: "Failed to revoke key", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
