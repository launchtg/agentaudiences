// ---------------------------------------------------------------------------
// Capability-Aware Execution System
// ---------------------------------------------------------------------------
// Priority order:
// 1. Use tools the user already has connected
// 2. Use native/manual execution with no new tools
// 3. Use free/simple fallback methods
// 4. Only then show optional execution tools if the action is blocked
// ---------------------------------------------------------------------------

export interface Capability {
  capability_key: string;
  capability_label: string;
  status: "available" | "missing";
  connected_tool: string | null;
  tool_category: string | null;
}

export interface ExecutionResult {
  status: "ready" | "partial" | "blocked";
  using_user_tools: boolean;
  available_capabilities: string[];
  available_tools: string[];
  missing_capabilities: string[];
  primary_execution_path: string;
  fallback_methods: string[];
  optional_execution_tools: OptionalTool[];
}

export interface OptionalTool {
  name: string;
  category: string;
  reason: string;
  setup_time: string;
}

// ---------------------------------------------------------------------------
// Default capabilities for demo audiences
// ---------------------------------------------------------------------------

export function getDefaultCapabilities(): Capability[] {
  return [
    { capability_key: "newsletter_platform", capability_label: "Newsletter Platform", status: "available", connected_tool: "Beehiiv", tool_category: "owned" },
    { capability_key: "crm", capability_label: "CRM", status: "available", connected_tool: "GoHighLevel", tool_category: "owned" },
    { capability_key: "automation", capability_label: "Automation", status: "available", connected_tool: "n8n", tool_category: "owned" },
    { capability_key: "api_access", capability_label: "API Access", status: "available", connected_tool: "AgentAudiences API", tool_category: "owned" },
    { capability_key: "cold_email", capability_label: "Cold Email Infrastructure", status: "missing", connected_tool: null, tool_category: null },
    { capability_key: "linkedin", capability_label: "LinkedIn Outreach", status: "missing", connected_tool: null, tool_category: null },
    { capability_key: "meta_ads", capability_label: "Meta Ads", status: "missing", connected_tool: null, tool_category: null },
    { capability_key: "google_ads", capability_label: "Google Ads", status: "missing", connected_tool: null, tool_category: null },
    { capability_key: "email_verification", capability_label: "Email Verification", status: "missing", connected_tool: null, tool_category: null },
    { capability_key: "landing_page_builder", capability_label: "Landing Page Builder", status: "missing", connected_tool: null, tool_category: null },
  ];
}

// ---------------------------------------------------------------------------
// Capability descriptions for UI
// ---------------------------------------------------------------------------

export const CAPABILITY_DESCRIPTIONS: Record<string, string> = {
  newsletter_platform: "Used for sponsor placements, content campaigns, affiliate offers, and reactivation.",
  crm: "Used for follow-up tasks, sponsor pipeline, and relationship tracking.",
  cold_email: "Used for outbound sponsor campaigns at scale.",
  linkedin: "Used for warm outreach and partnership conversations.",
  meta_ads: "Used to push high-intent segments into paid campaigns.",
  google_ads: "Used for search and display campaigns targeting audience segments.",
  email_verification: "Used to validate email addresses before outbound campaigns.",
  landing_page_builder: "Used for sponsor landing pages, affiliate offers, and media kits.",
  automation: "Used for workflow automation, scheduling, and multi-step sequences.",
  api_access: "Used for programmatic access to audience data and agent feeds.",
};

// ---------------------------------------------------------------------------
// Action type → required/optional capability mapping
// ---------------------------------------------------------------------------

interface CapabilityMapping {
  required: string[][];      // OR groups — any group fully met = satisfied
  fallback_methods: string[];
  optional_scale_tools: string[];
}

const ACTION_CAPABILITY_MAP: Record<string, CapabilityMapping> = {
  sponsor_pitch: {
    required: [["newsletter_platform"], ["crm"]],
    fallback_methods: ["Manual sponsor pitch via email", "Export sponsor brief as document"],
    optional_scale_tools: ["cold_email", "linkedin"],
  },
  cold_outreach: {
    required: [["cold_email"]],
    fallback_methods: ["Manual email outreach", "CRM task creation for follow-up"],
    optional_scale_tools: ["cold_email", "email_verification"],
  },
  affiliate_offer: {
    required: [["newsletter_platform"]],
    fallback_methods: ["Manual newsletter placement"],
    optional_scale_tools: ["landing_page_builder", "automation"],
  },
  newsletter_content: {
    required: [["newsletter_platform"]],
    fallback_methods: ["Export content brief as document"],
    optional_scale_tools: ["automation"],
  },
  reactivation: {
    required: [["newsletter_platform"], ["crm"]],
    fallback_methods: ["Manual segment export and email", "CRM-based re-engagement sequence"],
    optional_scale_tools: ["automation"],
  },
  ad_audience_push: {
    required: [["meta_ads"], ["google_ads"]],
    fallback_methods: ["Export custom audience CSV for manual upload"],
    optional_scale_tools: ["meta_ads", "google_ads"],
  },
  media_kit_update: {
    required: [],  // No tools required
    fallback_methods: ["Export media kit copy as document"],
    optional_scale_tools: ["landing_page_builder"],
  },
  crm_sync: {
    required: [["crm"]],
    fallback_methods: ["CSV export of segment data"],
    optional_scale_tools: ["automation"],
  },
};

// ---------------------------------------------------------------------------
// Optional tool metadata
// ---------------------------------------------------------------------------

const OPTIONAL_TOOL_META: Record<string, { name: string; category: string; reason: string; setup_time: string }> = {
  cold_email: { name: "Cold email infrastructure", category: "Outbound", reason: "Scale sponsor and partnership outreach beyond manual email", setup_time: "1-2 hours" },
  email_verification: { name: "Email verification system", category: "Data quality", reason: "Validate email addresses before outbound campaigns", setup_time: "30 minutes" },
  linkedin: { name: "LinkedIn outreach tool", category: "Social", reason: "Automate warm outreach and partnership conversations", setup_time: "1 hour" },
  meta_ads: { name: "Meta Ads connection", category: "Paid media", reason: "Push high-intent segments into paid campaigns on Facebook/Instagram", setup_time: "1-2 hours" },
  google_ads: { name: "Google Ads connection", category: "Paid media", reason: "Run search and display campaigns targeting audience segments", setup_time: "1-2 hours" },
  landing_page_builder: { name: "Landing page builder", category: "Content", reason: "Create sponsor landing pages, affiliate offers, or media kits", setup_time: "30 minutes" },
  automation: { name: "Automation workflow", category: "Workflow", reason: "Automate multi-step sequences and scheduled tasks", setup_time: "1-2 hours" },
};

// ---------------------------------------------------------------------------
// Core evaluation functions
// ---------------------------------------------------------------------------

export function getExecutionStatus(
  requiredGroups: string[][],
  availableKeys: Set<string>
): "ready" | "partial" | "blocked" {
  // No requirements = always ready
  if (requiredGroups.length === 0) return "ready";

  // Check if ANY required group is fully met
  const anyGroupMet = requiredGroups.some((group) =>
    group.every((key) => availableKeys.has(key))
  );

  if (anyGroupMet) return "ready";

  // Check if there's any partial overlap
  const anyCapabilityAvailable = requiredGroups.some((group) =>
    group.some((key) => availableKeys.has(key))
  );

  if (anyCapabilityAvailable) return "partial";

  return "blocked";
}

export function getFallbackMethods(
  actionType: string,
  capabilities: Capability[]
): string[] {
  const mapping = ACTION_CAPABILITY_MAP[actionType];
  if (!mapping) return ["Manual execution"];

  const available = new Set(
    capabilities.filter((c) => c.status === "available").map((c) => c.capability_key)
  );

  const fallbacks = [...mapping.fallback_methods];

  // If CRM is available but not the primary tool, add CRM-specific fallback
  if (available.has("crm") && actionType === "cold_outreach") {
    fallbacks.unshift("Use GoHighLevel to create outreach task");
  }

  return fallbacks;
}

export function getOptionalExecutionTools(
  missingCapabilities: string[],
  actionType: string
): OptionalTool[] {
  const mapping = ACTION_CAPABILITY_MAP[actionType];
  if (!mapping) return [];

  // Only show tools that are both missing AND relevant to scaling this action
  const relevant = mapping.optional_scale_tools.filter((key) =>
    missingCapabilities.includes(key)
  );

  return relevant
    .map((key) => OPTIONAL_TOOL_META[key])
    .filter(Boolean);
}

export function evaluateActionExecution(
  actionType: string,
  capabilities: Capability[]
): ExecutionResult {
  const mapping = ACTION_CAPABILITY_MAP[actionType] || {
    required: [],
    fallback_methods: ["Manual execution"],
    optional_scale_tools: [],
  };

  const availableCaps = capabilities.filter((c) => c.status === "available");
  const availableKeys = new Set(availableCaps.map((c) => c.capability_key));
  const allKeys = new Set(capabilities.map((c) => c.capability_key));

  // Determine which capabilities are required but missing
  const allRequiredKeys = new Set(mapping.required.flat());
  const missingKeys = [...allRequiredKeys].filter((k) => !availableKeys.has(k));
  const availableRequired = [...allRequiredKeys].filter((k) => availableKeys.has(k));

  const status = getExecutionStatus(mapping.required, availableKeys);
  const fallbacks = getFallbackMethods(actionType, capabilities);

  // Only show optional tools when blocked or when action can't scale with current tools
  const optionalTools = status !== "ready"
    ? getOptionalExecutionTools(
        [...allKeys].filter((k) => !availableKeys.has(k)),
        actionType
      )
    : [];

  // Build primary execution path
  const availableToolNames = availableCaps
    .filter((c) => availableRequired.includes(c.capability_key) && c.connected_tool)
    .map((c) => c.connected_tool!);

  let primaryPath: string;
  if (status === "ready" && availableToolNames.length > 0) {
    primaryPath = `Use ${availableToolNames.join(" and ")} to execute this action now.`;
  } else if (status === "ready") {
    primaryPath = "This action can be executed manually with no additional tools.";
  } else if (status === "partial") {
    primaryPath = "You can execute this with a manual fallback using your current setup.";
  } else {
    primaryPath = "This action needs additional setup before your agent can execute it.";
  }

  return {
    status,
    using_user_tools: status === "ready" && availableToolNames.length > 0,
    available_capabilities: availableCaps.map((c) => c.capability_key),
    available_tools: availableToolNames,
    missing_capabilities: missingKeys,
    primary_execution_path: primaryPath,
    fallback_methods: status === "ready" ? [] : fallbacks,
    optional_execution_tools: optionalTools,
  };
}
