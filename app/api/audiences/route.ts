import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "name is required and must be a string" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("audiences")
      .insert({
        name: body.name,
        source: body.source || null,
        user_id: body.user_id || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create audience", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ audience: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
