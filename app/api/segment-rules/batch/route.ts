import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.run_id) {
      return NextResponse.json(
        { error: "run_id is required" },
        { status: 400 }
      );
    }

    if (!body.action || !["approve_all", "reject_all"].includes(body.action)) {
      return NextResponse.json(
        { error: "action must be 'approve_all' or 'reject_all'" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    if (body.action === "approve_all") {
      // Approve all pending rules for this run
      const { data: rules, error: ruleError } = await supabase
        .from("segment_rules")
        .update({ status: "approved", approved_at: now })
        .eq("llm_run_id", body.run_id)
        .eq("status", "pending")
        .select();

      if (ruleError) {
        return NextResponse.json(
          { error: "Failed to approve rules", details: ruleError.message },
          { status: 500 }
        );
      }

      // Approve all pending action templates for this run
      const { data: templates } = await supabase
        .from("action_templates")
        .update({ status: "approved", approved_at: now })
        .eq("llm_run_id", body.run_id)
        .eq("status", "pending")
        .select();

      return NextResponse.json({
        rules_approved: rules?.length || 0,
        templates_approved: templates?.length || 0,
      });
    } else {
      // Reject all pending rules for this run
      const { data: rules } = await supabase
        .from("segment_rules")
        .update({ status: "rejected" })
        .eq("llm_run_id", body.run_id)
        .eq("status", "pending")
        .select();

      // Reject all pending action templates for this run
      const { data: templates } = await supabase
        .from("action_templates")
        .update({ status: "rejected" })
        .eq("llm_run_id", body.run_id)
        .eq("status", "pending")
        .select();

      return NextResponse.json({
        rules_rejected: rules?.length || 0,
        templates_rejected: templates?.length || 0,
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
