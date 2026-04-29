"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import {
  getDefaultCapabilities,
  CAPABILITY_DESCRIPTIONS,
} from "@/lib/execution/capabilities";

interface CapRow {
  capability_key: string;
  capability_label: string;
  status: "available" | "missing";
  connected_tool: string | null;
  tool_category: string | null;
}

interface AudienceOption {
  id: string;
  name: string;
}

export default function CapabilitiesPage() {
  const router = useRouter();
  const [audiences, setAudiences] = useState<AudienceOption[]>([]);
  const [selectedAudienceId, setSelectedAudienceId] = useState("");
  const [capabilities, setCapabilities] = useState<CapRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    loadAudiences();
  });

  const loadAudiences = useCallback(async () => {
    try {
      const res = await fetch("/api/audiences");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAudiences(data.map((a: { id: string; name: string }) => ({ id: a.id, name: a.name })));
          setSelectedAudienceId(data[0].id);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!selectedAudienceId) return;
    loadCapabilities(selectedAudienceId);
  }, [selectedAudienceId]);

  async function loadCapabilities(audienceId: string) {
    try {
      const res = await fetch(`/api/capabilities?audienceId=${audienceId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCapabilities(data.map((c: CapRow) => ({
            capability_key: c.capability_key,
            capability_label: c.capability_label,
            status: c.status as "available" | "missing",
            connected_tool: c.connected_tool,
            tool_category: c.tool_category,
          })));
          return;
        }
      }
    } catch {
      // ignore
    }
    // Fallback: use defaults
    setCapabilities(getDefaultCapabilities().map((c) => ({
      capability_key: c.capability_key,
      capability_label: c.capability_label,
      status: c.status as "available" | "missing",
      connected_tool: c.connected_tool,
      tool_category: c.tool_category,
    })));
  }

  function toggleCapability(key: string) {
    setCapabilities((prev) =>
      prev.map((c) =>
        c.capability_key === key
          ? {
              ...c,
              status: c.status === "available" ? "missing" : "available",
              connected_tool: c.status === "available" ? null : c.connected_tool,
              tool_category: c.status === "available" ? null : c.tool_category,
            }
          : c
      )
    );
    setSaved(false);
  }

  function updateTool(key: string, tool: string) {
    setCapabilities((prev) =>
      prev.map((c) =>
        c.capability_key === key
          ? { ...c, connected_tool: tool || null, tool_category: tool ? "owned" : null }
          : c
      )
    );
    setSaved(false);
  }

  async function saveCapabilities() {
    if (!selectedAudienceId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/capabilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audienceId: selectedAudienceId, capabilities }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // ignore
    }
    setSaving(false);
  }

  if (audiences.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">Agent Capabilities</h1>
          <p className="mt-0.5 text-sm text-muted">
            Tell AgentAudiences what your agents can actually use so every action is executable.
          </p>
        </div>
        <EmptyState
          title="No audiences found"
          description="Run the demo or create an audience first to configure capabilities."
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

  const availableCount = capabilities.filter((c) => c.status === "available").length;
  const missingCount = capabilities.filter((c) => c.status === "missing").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Agent Capabilities</h1>
        <p className="mt-0.5 text-sm text-muted">
          AgentAudiences gets smarter when it knows what your agents can actually use. Add your current tools so the feed prioritizes actions you can execute right now.
        </p>
      </div>

      {/* Audience Selector */}
      <div className="rounded-lg border border-border-subtle bg-surface p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Select Audience</h2>
        <select
          value={selectedAudienceId}
          onChange={(e) => setSelectedAudienceId(e.target.value)}
          className="w-full rounded-md border border-border-subtle bg-background px-3 py-2 text-sm text-white focus:border-neon/40 focus:outline-none"
        >
          {audiences.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-neon/20 bg-neon-glow p-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Available</p>
          <p className="mt-1.5 text-2xl font-bold text-neon">{availableCount}</p>
          <p className="mt-0.5 text-xs text-muted">capabilities connected</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Missing</p>
          <p className="mt-1.5 text-2xl font-bold text-white">{missingCount}</p>
          <p className="mt-0.5 text-xs text-muted">not configured</p>
        </div>
      </div>

      {/* Capabilities List */}
      <div className="rounded-lg border border-border-subtle bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Capabilities</h2>
          <button
            onClick={saveCapabilities}
            disabled={saving}
            className="inline-flex h-8 items-center rounded-lg bg-neon px-4 text-xs font-bold text-background hover:brightness-110 transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
          </button>
        </div>
        <div className="divide-y divide-border-subtle">
          {capabilities.map((cap) => {
            const isAvailable = cap.status === "available";
            return (
              <div key={cap.capability_key} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white">{cap.capability_label}</p>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                        isAvailable ? "bg-neon/15 text-neon" : "bg-white/[0.06] text-muted"
                      }`}>
                        {isAvailable ? "Available" : "Missing"}
                      </span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      {CAPABILITY_DESCRIPTIONS[cap.capability_key] || ""}
                    </p>
                    {isAvailable && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Connected tool name (e.g. Beehiiv)"
                          value={cap.connected_tool || ""}
                          onChange={(e) => updateTool(cap.capability_key, e.target.value)}
                          className="w-64 rounded-md border border-border-subtle bg-background px-2.5 py-1.5 text-xs text-white placeholder:text-muted/50 focus:border-neon/40 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleCapability(cap.capability_key)}
                    className={`relative h-6 w-11 rounded-full transition-colors shrink-0 mt-0.5 ${
                      isAvailable ? "bg-neon/30" : "bg-white/[0.08]"
                    }`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${
                      isAvailable ? "left-[22px] bg-neon" : "left-0.5 bg-muted"
                    }`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-muted/50 italic">
        We always use your existing tools first. New tools only appear as optional ways to scale blocked actions.
      </p>
    </div>
  );
}
