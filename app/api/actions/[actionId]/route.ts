import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["new", "in_progress", "completed", "dismissed"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ actionId: string }> }
) {
  try {
    const { actionId } = await params;

    if (!actionId) {
      return NextResponse.json(
        { error: "actionId is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body.status || typeof body.status !== "string") {
      return NextResponse.json(
        { error: "status is required and must be a string" },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("agent_actions")
      .update({ status: body.status })
      .eq("id", actionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update action", details: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json({ action: data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
