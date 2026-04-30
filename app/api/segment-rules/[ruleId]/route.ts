import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ruleId: string }> }
) {
  try {
    const { ruleId } = await params;
    const body = await req.json();

    if (!body.status || !["approved", "rejected"].includes(body.status)) {
      return NextResponse.json(
        { error: "status must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const update: Record<string, unknown> = {
      status: body.status,
    };

    if (body.status === "approved") {
      update.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("segment_rules")
      .update(update)
      .eq("id", ruleId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Rule not found", details: error?.message },
        { status: 404 }
      );
    }

    // If approving a rule, also approve its action templates
    if (body.status === "approved") {
      await supabase
        .from("action_templates")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("segment_rule_id", ruleId)
        .eq("status", "pending");
    }

    // If rejecting a rule, also reject its action templates
    if (body.status === "rejected") {
      await supabase
        .from("action_templates")
        .update({ status: "rejected" })
        .eq("segment_rule_id", ruleId)
        .eq("status", "pending");
    }

    return NextResponse.json({ rule: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
