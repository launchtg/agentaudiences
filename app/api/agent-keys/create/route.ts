import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { randomBytes, createHash } from "crypto";

function generateApiKey(): string {
  const raw = randomBytes(32).toString("base64url");
  return `aa_live_${raw}`;
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audienceId, name, audienceName } = body;

    if (!audienceId || !name) {
      return NextResponse.json(
        { error: "audienceId and name are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if audience exists
    const { data: audience, error: audError } = await supabase
      .from("audiences")
      .select("id")
      .eq("id", audienceId)
      .single();

    if (audError || !audience) {
      // If audienceName provided, create the audience on the fly
      if (audienceName) {
        const { error: createError } = await supabase
          .from("audiences")
          .insert({ id: audienceId, name: audienceName, source: "demo" });

        if (createError) {
          return NextResponse.json(
            { error: "Audience not found and could not be created", details: createError.message },
            { status: 404 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Audience not found" },
          { status: 404 }
        );
      }
    }

    // Generate key
    const rawKey = generateApiKey();
    const keyHash = hashKey(rawKey);
    const keyPrefix = rawKey.slice(0, 16);

    // Store hashed key
    const { error: insertError } = await supabase
      .from("agent_api_keys")
      .insert({
        audience_id: audienceId,
        name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
      });

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to create API key", details: insertError.message },
        { status: 500 }
      );
    }

    const host = req.headers.get("host") || "agentaudiences.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const feedUrl = `${protocol}://${host}/api/agent-feed/${audienceId}`;

    return NextResponse.json({
      success: true,
      apiKey: rawKey,
      keyPrefix,
      feedUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
