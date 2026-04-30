import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
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
      .from("action_templates")
      .update(update)
      .eq("id", templateId)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Template not found", details: error?.message },
        { status: 404 }
      );
    }

    return NextResponse.json({ template: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
