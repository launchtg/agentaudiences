import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createHash } from "crypto";
import { evaluateActionExecution, type Capability } from "@/lib/execution/capabilities";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

async function validateApiKey(
  supabase: ReturnType<typeof createAdminClient>,
  token: string,
  audienceId: string
): Promise<{ valid: boolean; keyId?: string }> {
  const keyHash = hashKey(token);

  const { data, error } = await supabase
    .from("agent_api_keys")
    .select("id, audience_id, revoked_at")
    .eq("key_hash", keyHash)
    .single();

  if (error || !data) return { valid: false };
  if (data.revoked_at) return { valid: false };
  if (data.audience_id !== audienceId) return { valid: false };

  // Update last_used_at
  await supabase
    .from("agent_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return { valid: true, keyId: data.id };
}

export async function GET(
  req: NextRequest,
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

    // Check for Authorization header (external agent access)
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "");
      if (!token || !token.startsWith("aa_live_")) {
        return NextResponse.json(
          { error: "Invalid API key format" },
          { status: 401 }
        );
      }

      const { valid } = await validateApiKey(supabase, token, audienceId);
      if (!valid) {
        return NextResponse.json(
          { error: "Invalid or revoked API key" },
          { status: 401 }
        );
      }
    }

    // Fetch audience info
    const { data: audience } = await supabase
      .from("audiences")
      .select("id, name, source")
      .eq("id", audienceId)
      .single();

    // Fetch capabilities for this audience
    const { data: capRows } = await supabase
      .from("audience_capabilities")
      .select("*")
      .eq("audience_id", audienceId);

    const capabilities: Capability[] = (capRows ?? []).map((c) => ({
      capability_key: c.capability_key,
      capability_label: c.capability_label,
      status: c.status as "available" | "missing",
      connected_tool: c.connected_tool,
      tool_category: c.tool_category,
    }));

    const availableCaps = capabilities.filter((c) => c.status === "available").map((c) => c.capability_key);
    const missingCaps = capabilities.filter((c) => c.status === "missing").map((c) => c.capability_key);

    // Fetch visible actions sorted by score desc
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

    // Return clean agent-ready structure with execution metadata
    return NextResponse.json({
      audience: audience
        ? { id: audience.id, name: audience.name, source: audience.source }
        : { id: audienceId, name: "Unknown", source: "unknown" },
      generatedAt: new Date().toISOString(),
      capabilities: {
        available: availableCaps,
        missing: missingCaps,
      },
      actions: (actions ?? []).map((a) => {
        const execution = capabilities.length > 0
          ? evaluateActionExecution(a.action_type, capabilities)
          : undefined;

        const host = req.headers.get("host") || "agentaudiences.vercel.app";
        const protocol = host.includes("localhost") ? "http" : "https";

        return {
          id: a.id,
          segment_id: a.segment_id,
          segment_members_url: a.segment_id
            ? `${protocol}://${host}/api/segments/${a.segment_id}/members`
            : null,
          title: a.title,
          action_type: a.action_type,
          priority: a.priority,
          action_score: a.action_score,
          urgency: a.urgency,
          estimated_value: a.estimated_value,
          recommended_channels: a.recommended_channels,
          why_now: a.why_now,
          reasoning: a.reasoning,
          agent_instruction: {
            goal: a.agent_instruction?.objective || a.agent_instruction?.goal || "",
            steps: a.agent_instruction?.steps || [],
            copy_angle: a.agent_instruction?.copy_angle || "",
            success_metric: a.agent_instruction?.success_criteria || a.agent_instruction?.success_metric || "",
            human_approval_required: true,
          },
          execution,
          status: a.status,
        };
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
