"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import CopyBlock from "@/components/CopyBlock";
import EmptyState from "@/components/EmptyState";

interface ApiKeyRecord {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

interface AudienceOption {
  id: string;
  name: string;
}

// --- Prompt templates ---

function universalPrompt(feedUrl: string, apiKey: string) {
  return `You are connected to AgentAudiences.

AgentAudiences gives you a prioritized feed of revenue actions based on my audience data.

Your job is to fetch the Agent Feed, review the actions, and help execute them safely.

Agent Feed URL:
${feedUrl}

API Key:
${apiKey}

Authentication:
Use this header:
Authorization: Bearer ${apiKey}

When you fetch the feed, you will receive JSON with prioritized actions.

For each action:
1. Read the title, priority, action score, estimated value, and why_now.
2. Review the agent_instruction object.
3. Explain what you recommend doing first.
4. Draft any needed outreach, sponsor pitch, ad audience instructions, or workflow steps.
5. Do NOT send emails, publish campaigns, spend money, or modify accounts without my approval.
6. Ask for approval before taking any external action.
7. Prioritize critical and high-score actions first.

Start by testing the connection and summarizing the top 3 actions.`;
}

function openclawPrompt(feedUrl: string, apiKey: string) {
  return `Create a new tool connection called AgentAudiences Feed.

Purpose:
Fetch prioritized revenue actions from AgentAudiences so you can help me act on audience monetization opportunities.

Endpoint:
${feedUrl}

Method:
GET

Headers:
Authorization: Bearer ${apiKey}
Content-Type: application/json

Expected response:
A JSON object containing an audience and an array of prioritized actions.

Use the feed this way:
1. Fetch the AgentAudiences feed.
2. Sort actions by priority and action_score.
3. Start with critical and high-priority actions.
4. For each action, read the agent_instruction steps.
5. Draft execution assets such as sponsor pitches, outreach lists, email copy, CRM tasks, ad audience instructions, or media kit updates.
6. Do not send, publish, spend, or modify external systems without human approval.
7. When you complete a recommended draft or plan, summarize the expected business outcome.

First task:
Test the connection to AgentAudiences and show me the top 3 recommended revenue actions.`;
}

function claudeCodePrompt(feedUrl: string, apiKey: string) {
  return `Connect this project to AgentAudiences.

AgentAudiences provides an API feed of prioritized revenue actions.

Create a small integration utility that fetches the Agent Feed from:

${feedUrl}

Use this API key:

${apiKey}

Authentication header:
Authorization: Bearer ${apiKey}

Build:
1. A TypeScript function called fetchAgentAudiencesFeed()
2. Strong types for the feed response
3. Error handling for 401, 404, and empty feed responses
4. A simple script or test command that prints the top 3 actions
5. Documentation in README explaining how to use it

Rules:
- Do not hardcode the API key in source files.
- Use environment variables:
  AGENT_AUDIENCES_FEED_URL
  AGENT_AUDIENCES_API_KEY
- Do not execute external actions automatically.
- Treat the feed as recommendations requiring human approval.

After implementation, test the connection and print:
- audience name
- number of actions
- top 3 actions by priority and action_score`;
}

function n8nNotes(feedUrl: string, apiKey: string) {
  return `Use an HTTP Request node.

Method:
GET

URL:
${feedUrl}

Headers:
Authorization: Bearer ${apiKey}
Content-Type: application/json

Recommended workflow:
1. Trigger daily or weekly.
2. Fetch AgentAudiences feed.
3. Filter for priority = critical or high.
4. Send top actions to Slack, email, Notion, CRM, or your agent system.
5. Require human approval before sending outreach, launching ads, or spending money.

Suggested next nodes:
- IF node: priority is critical/high
- Slack node: send approval request
- Gmail/Email node: draft sponsor pitch
- Notion/CRM node: create task`;
}

// --- Main page ---

export default function AgentConnectionsPage() {
  const router = useRouter();
  const [audiences, setAudiences] = useState<AudienceOption[]>([]);
  const [selectedAudienceId, setSelectedAudienceId] = useState("");
  const [keyName, setKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<{ apiKey: string; feedUrl: string; keyPrefix: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [existingKeys, setExistingKeys] = useState<ApiKeyRecord[]>([]);
  const [testResult, setTestResult] = useState<{ status: string; data?: unknown } | null>(null);
  const [testing, setTesting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [feedPreview, setFeedPreview] = useState<Record<string, any> | null>(null);
  const [activePrompt, setActivePrompt] = useState<"universal" | "openclaw" | "claude" | "n8n">("universal");
  const didInit = useRef(false);

  // Load audiences on mount
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    loadAudiences();
  });

  const loadAudiences = useCallback(async () => {
    // Try Supabase first
    try {
      const res = await fetch("/api/audiences");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAudiences(data.map((a: { id: string; name: string }) => ({ id: a.id, name: a.name })));
          setSelectedAudienceId(data[0].id);
          return;
        }
      }
    } catch {
      // fall through
    }

    // Fallback: check sessionStorage for demo audience
    try {
      const stored = sessionStorage.getItem("demo_audience");
      if (stored) {
        const aud = JSON.parse(stored);
        if (aud.id && aud.name) {
          setAudiences([{ id: aud.id, name: aud.name }]);
          setSelectedAudienceId(aud.id);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Load existing keys when audience changes
  useEffect(() => {
    if (!selectedAudienceId) return;
    loadKeys(selectedAudienceId);
  }, [selectedAudienceId]);

  async function loadKeys(audienceId: string) {
    try {
      const res = await fetch(`/api/agent-keys?audienceId=${audienceId}`);
      if (res.ok) {
        const data = await res.json();
        setExistingKeys(data);
      }
    } catch {
      // ignore
    }
  }

  async function generateKey() {
    if (!selectedAudienceId || !keyName.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/agent-keys/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audienceId: selectedAudienceId, name: keyName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedKey({ apiKey: data.apiKey, feedUrl: data.feedUrl, keyPrefix: data.keyPrefix });
        setKeyName("");
        loadKeys(selectedAudienceId);
      }
    } catch {
      // ignore
    }
    setGenerating(false);
  }

  async function revokeKey(keyId: string) {
    try {
      await fetch("/api/agent-keys/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      loadKeys(selectedAudienceId);
    } catch {
      // ignore
    }
  }

  async function testConnection() {
    if (!generatedKey) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(generatedKey.feedUrl, {
        headers: { Authorization: `Bearer ${generatedKey.apiKey}` },
      });
      const data = await res.json();
      setTestResult({ status: res.ok ? "success" : "error", data });
      if (res.ok) {
        setFeedPreview(data);
      }
    } catch {
      setTestResult({ status: "error", data: { error: "Connection failed" } });
    }
    setTesting(false);
  }

  const feedUrl = generatedKey?.feedUrl || (selectedAudienceId ? `${window.location.origin}/api/agent-feed/${selectedAudienceId}` : "");
  const apiKey = generatedKey?.apiKey || "YOUR_API_KEY";

  const curlCommand = `curl -s "${feedUrl}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" | jq .`;

  const prompts: Record<string, { label: string; content: string }> = {
    universal: { label: "Universal Agent", content: universalPrompt(feedUrl, apiKey) },
    openclaw: { label: "OpenClaw", content: openclawPrompt(feedUrl, apiKey) },
    claude: { label: "Claude Code", content: claudeCodePrompt(feedUrl, apiKey) },
    n8n: { label: "n8n", content: n8nNotes(feedUrl, apiKey) },
  };

  if (audiences.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">Connect Your AI Agent</h1>
          <p className="mt-0.5 text-sm text-muted">
            Give OpenClaw, Claude Code, n8n, or any custom agent a secure feed of revenue actions it can execute.
          </p>
        </div>
        <EmptyState
          title="No audiences found"
          description="Run the demo or create an audience first to generate an agent connection."
          action={
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex h-9 items-center rounded-lg bg-neon px-5 text-sm font-bold text-background hover:brightness-110 transition-all"
            >
              Run Demo
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-white">Connect Your AI Agent</h1>
          <span className="rounded bg-neon/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-neon">
            Secure
          </span>
        </div>
        <p className="text-sm text-muted">
          Give OpenClaw, Claude Code, n8n, or any custom agent a secure feed of revenue actions it can execute.
        </p>
      </div>

      {/* Audience Selector */}
      <div className="rounded-lg border border-border-subtle bg-surface p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Select Audience</h2>
        <select
          value={selectedAudienceId}
          onChange={(e) => {
            setSelectedAudienceId(e.target.value);
            setGeneratedKey(null);
            setTestResult(null);
            setFeedPreview(null);
          }}
          className="w-full rounded-md border border-border-subtle bg-background px-3 py-2 text-sm text-white focus:border-neon/40 focus:outline-none"
        >
          {audiences.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* API Key Generator */}
      <div className="rounded-lg border border-border-subtle bg-surface p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Generate Agent API Key</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Key name (e.g. OpenClaw Agent)"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="flex-1 rounded-md border border-border-subtle bg-background px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:border-neon/40 focus:outline-none"
          />
          <button
            onClick={generateKey}
            disabled={generating || !keyName.trim()}
            className="inline-flex h-[38px] items-center rounded-lg bg-neon px-5 text-sm font-bold text-background hover:brightness-110 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {generating ? "Generating..." : "Generate Key"}
          </button>
        </div>
        {generatedKey && (
          <div className="mt-4 rounded-md border border-neon/20 bg-neon/[0.03] p-4">
            <div className="flex items-center gap-2 mb-3">
              <WarningIcon />
              <span className="text-xs font-semibold text-neon">Copy this key now. For security, we&apos;ll only show it once.</span>
            </div>
            <div className="space-y-3">
              <CopyBlock label="API Key" value={generatedKey.apiKey} />
              <CopyBlock label="Agent Feed URL" value={generatedKey.feedUrl} />
            </div>
          </div>
        )}
      </div>

      {/* Connection Card */}
      {generatedKey && (
        <div className="rounded-lg border border-border-subtle bg-surface p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Connection Details</h2>
          <CopyBlock label="cURL Test Command" value={curlCommand} multiline />
          <div className="flex gap-2">
            <button
              onClick={testConnection}
              disabled={testing}
              className="inline-flex h-9 items-center rounded-lg bg-neon px-5 text-sm font-bold text-background hover:brightness-110 transition-all disabled:opacity-50"
            >
              {testing ? "Testing..." : "Test Connection"}
            </button>
            {testResult && (
              <span className={`flex items-center gap-1.5 text-xs font-medium ${testResult.status === "success" ? "text-emerald-400" : "text-red-400"}`}>
                <span className={`h-2 w-2 rounded-full ${testResult.status === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
                {testResult.status === "success" ? "Connected successfully" : "Connection failed"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Agent Setup Prompts */}
      <div className="rounded-lg border border-border-subtle bg-surface p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Agent Setup Prompts</h2>
        <div className="flex gap-1 mb-4">
          {(Object.keys(prompts) as Array<keyof typeof prompts>).map((key) => (
            <button
              key={key}
              onClick={() => setActivePrompt(key as typeof activePrompt)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activePrompt === key
                  ? "bg-neon/15 text-neon"
                  : "text-muted hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {prompts[key].label}
            </button>
          ))}
        </div>
        <CopyBlock
          label={`${prompts[activePrompt].label} Prompt`}
          value={prompts[activePrompt].content}
          multiline
          mono={false}
        />
      </div>

      {/* JSON Preview */}
      {feedPreview && (
        <div className="rounded-lg border border-border-subtle bg-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Feed JSON Preview</h2>
            <span className="rounded bg-neon/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-neon">
              Live
            </span>
          </div>
          <pre className="rounded-md border border-border-subtle bg-background p-4 text-xs text-white/70 font-mono overflow-x-auto max-h-96 overflow-y-auto">
            {JSON.stringify(feedPreview, null, 2)}
          </pre>
        </div>
      )}

      {/* Existing Keys */}
      <div className="rounded-lg border border-border-subtle bg-surface p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Existing API Keys</h2>
        {existingKeys.length === 0 ? (
          <p className="text-xs text-muted">No API keys generated for this audience yet.</p>
        ) : (
          <div className="space-y-2">
            {existingKeys.map((k) => (
              <div
                key={k.id}
                className={`flex items-center justify-between rounded-md border px-4 py-3 ${
                  k.revoked_at ? "border-red-500/10 bg-red-500/[0.02]" : "border-border-subtle bg-background"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">{k.name}</p>
                    <p className="text-[11px] text-muted font-mono">{k.key_prefix}...</p>
                  </div>
                  <div className="flex gap-4 text-[11px] text-muted">
                    <span>Created {new Date(k.created_at).toLocaleDateString()}</span>
                    {k.last_used_at && (
                      <span>Last used {new Date(k.last_used_at).toLocaleDateString()}</span>
                    )}
                    {k.revoked_at && (
                      <span className="text-red-400">Revoked</span>
                    )}
                  </div>
                </div>
                {!k.revoked_at && (
                  <button
                    onClick={() => revokeKey(k.id)}
                    className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-neon shrink-0">
      <path d="M7 1L13 12H1L7 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7 5.5v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7" cy="10" r="0.5" fill="currentColor" />
    </svg>
  );
}
