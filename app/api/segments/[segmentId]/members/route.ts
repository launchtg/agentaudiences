import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createHash } from "crypto";
import { SEGMENT_RULES } from "@/lib/generators/segments";
import { evaluateRule } from "@/lib/engine/evaluateRule";
import type { ConditionGroup } from "@/lib/types/rules";
import type { Subscriber } from "@/lib/mockData";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ segmentId: string }> }
) {
  try {
    const { segmentId } = await params;

    if (!segmentId) {
      return NextResponse.json(
        { error: "segmentId is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Optional API key auth (same pattern as agent-feed)
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "");
      if (!token || !token.startsWith("aa_live_")) {
        return NextResponse.json({ error: "Invalid API key format" }, { status: 401 });
      }

      const keyHash = hashKey(token);
      const { data: keyData } = await supabase
        .from("agent_api_keys")
        .select("id, audience_id, revoked_at")
        .eq("key_hash", keyHash)
        .single();

      if (!keyData || keyData.revoked_at) {
        return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
      }

      // Update last_used_at
      await supabase
        .from("agent_api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", keyData.id);
    }

    // Fetch the segment
    const { data: segment, error: segError } = await supabase
      .from("segments")
      .select("*")
      .eq("id", segmentId)
      .single();

    if (segError || !segment) {
      return NextResponse.json(
        { error: "Segment not found" },
        { status: 404 }
      );
    }

    // Fetch all subscribers for this audience
    const { data: subscribers, error: subError } = await supabase
      .from("subscribers")
      .select("*")
      .eq("audience_id", segment.audience_id);

    if (subError || !subscribers) {
      return NextResponse.json(
        { error: "Failed to fetch subscribers" },
        { status: 500 }
      );
    }

    // Determine matching strategy
    let matched: Subscriber[];

    if (segment.segment_rule_id) {
      // Hybrid path: use stored rule conditions
      const { data: storedRule } = await supabase
        .from("segment_rules")
        .select("conditions")
        .eq("id", segment.segment_rule_id)
        .single();

      if (storedRule) {
        matched = (subscribers as unknown as Record<string, unknown>[]).filter(
          (s) => evaluateRule(storedRule.conditions as ConditionGroup, s)
        ) as unknown as Subscriber[];
      } else {
        matched = subscribers as unknown as Subscriber[];
      }
    } else {
      // Legacy path: find hardcoded rule by name
      const rule = SEGMENT_RULES.find((r) => r.name === segment.name);
      if (rule) {
        matched = (subscribers as unknown as Subscriber[]).filter(rule.match);
      } else {
        matched = subscribers as unknown as Subscriber[];
      }
    }

    return NextResponse.json({
      segment: {
        id: segment.id,
        name: segment.name,
        description: segment.description,
        segment_type: segment.segment_type,
        subscriber_count: matched.length,
      },
      members: matched.map((s) => ({
        id: s.id,
        first_name: s.first_name,
        last_name: s.last_name,
        email: s.email,
        company: s.email.split("@")[1]?.replace(/\.(com|co|io|ai|dev|org|vc|me|jp)$/i, "").split(".").pop() || "",
        job_title: s.job_title,
        industry: s.industry,
        income_tier: s.income_tier,
        engagement_score: s.engagement_score,
        recent_activity: s.recent_activity,
        intent_categories: s.intent_categories,
        business_owner: s.business_owner,
        city: s.city,
        country: s.country,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
