import type { Audience, Segment, AgentAction } from "@/lib/mockData";
import {
  calculateActionScore,
  getPriority,
  type ScoringInputs,
} from "@/lib/scoring";
import {
  evaluateActionExecution,
  getDefaultCapabilities,
  type Capability,
} from "@/lib/execution/capabilities";

interface ActionTemplate {
  action_type: string;
  match: (seg: Segment) => boolean;
  build: (audience: Audience, seg: Segment) => Omit<AgentAction, "id" | "audience_id" | "segment_id" | "action_score" | "priority" | "status">;
}

const ACTION_TEMPLATES: ActionTemplate[] = [
  {
    action_type: "sponsor_pitch",
    match: (seg) =>
      seg.monetization_paths.some((p) => p.path === "sponsorship") &&
      seg.confidence >= 0.8,
    build: (audience, seg) => ({
      title: `Pitch sponsor packages to companies targeting ${seg.name}`,
      action_type: "sponsor_pitch",
      urgency: "this_week" as const,
      estimated_value: "$2,000–$5,000/placement",
      recommended_channels: ["cold_email", "linkedin_dm"],
      why_now: `${seg.subscriber_count} subscribers in this segment are actively engaging with sponsor content — strike while attention is fresh`,
      reasoning: {
        segment_signal: `${seg.defining_traits.activity || seg.defining_traits.intent || "high engagement"} with ${seg.confidence * 100}% confidence`,
        revenue_logic: `${seg.subscriber_count} qualified subscribers × premium CPM = $2K–5K per placement`,
        risk: "Sponsor fatigue if placements are too frequent — cap at 2x/month for this segment",
      },
      agent_instruction: {
        objective: `Secure a paid sponsor placement targeting the "${seg.name}" segment in ${audience.name}`,
        steps: [
          `Pull list of companies whose products align with segment traits: ${Object.values(seg.defining_traits).join(", ")}`,
          "Draft personalized pitch email highlighting segment size, engagement rate, and audience demographics",
          "Include media kit link and pricing for dedicated send vs inline placement",
          "Send to marketing/partnerships contacts at top 10 target companies",
          "Follow up after 3 business days if no response",
        ],
        success_criteria: "At least 2 sponsor meetings booked within 10 business days",
        fallback: "If cold outreach stalls, create a self-serve sponsor page and promote via LinkedIn",
      },
      scoring_inputs: {
        intent_score: 0.9,
        audience_value: seg.subscriber_count >= 4 ? 9 : 7,
        sponsor_fit: seg.confidence,
        timing_score: 0.85,
        segment_size_weight: Math.min(5, Math.max(1, Math.ceil(seg.subscriber_count / 2))),
        execution_effort: 4,
      },
    }),
  },
  {
    action_type: "affiliate_offer",
    match: (seg) =>
      seg.monetization_paths.some((p) => p.path === "affiliate"),
    build: (_audience, seg) => ({
      title: `Deploy targeted affiliate offers to ${seg.name}`,
      action_type: "affiliate_offer",
      urgency: "this_week" as const,
      estimated_value: "$500–$3,000/month recurring",
      recommended_channels: ["sponsored_newsletter", "in_app_notification"],
      why_now: `Segment shows active tool-evaluation intent — affiliate conversion rates peak during active buying windows`,
      reasoning: {
        segment_signal: `${seg.defining_traits.intent || seg.defining_traits.purchase_intent || "buying_signal"} across ${seg.subscriber_count} subscribers`,
        revenue_logic: "5–8% click-through × 10–15% conversion × $50–200 avg commission = predictable monthly recurring affiliate revenue",
        risk: "Over-promotion erodes trust — limit to 1 affiliate mention per email, editorially integrated",
      },
      agent_instruction: {
        objective: `Generate affiliate revenue from the "${seg.name}" segment through editorially integrated product recommendations`,
        steps: [
          `Identify top 3 affiliate programs matching segment intent: ${Object.values(seg.defining_traits).join(", ")}`,
          "Write editorial-style product recommendation (not banner ad) for next newsletter issue",
          "A/B test placement: mid-article callout vs end-of-email featured tool",
          "Track click-through and conversion per affiliate link",
          "Optimize top performer into recurring placement",
        ],
        success_criteria: "At least $500 in affiliate revenue within 30 days from this segment",
        fallback: "If click-through is below 3%, switch from inline mention to dedicated 'Tool of the Week' section",
      },
      scoring_inputs: {
        intent_score: 0.8,
        audience_value: 7,
        sponsor_fit: 0.7,
        timing_score: 0.8,
        segment_size_weight: Math.min(5, Math.max(1, Math.ceil(seg.subscriber_count / 2))),
        execution_effort: 3,
      },
    }),
  },
  {
    action_type: "reactivation",
    match: (seg) => seg.segment_type === "reactivation_pool",
    build: (audience, seg) => ({
      title: `Run win-back sequence for ${seg.name}`,
      action_type: "reactivation",
      urgency: seg.defining_traits.activity === "inactive_60_90_days" ? "immediate" as const : "this_week" as const,
      estimated_value: "$200–$1,500 in recovered subscriber value",
      recommended_channels: ["cold_email", "sms"],
      why_now: seg.defining_traits.risk === "churn_imminent"
        ? "These subscribers are about to fully churn — every week of delay reduces recovery probability by ~15%"
        : "Final window before list cleanup — unrecoverable after removal",
      reasoning: {
        segment_signal: `${seg.subscriber_count} subscribers with ${seg.defining_traits.activity} status`,
        revenue_logic: "Recovering 20–30% of dormant high-value subscribers preserves $200–1,500 in future sponsorship and affiliate value",
        risk: "Aggressive reactivation can trigger spam complaints — use soft subject lines and include easy unsubscribe",
      },
      agent_instruction: {
        objective: `Recover inactive subscribers in "${seg.name}" for ${audience.name}`,
        steps: [
          `Segment inactive subscribers by last activity date and previous engagement level`,
          "Draft 3-email win-back sequence: (1) 'We miss you' with best recent content, (2) Exclusive offer or content preview, (3) Final 'Stay or go' with clear unsubscribe",
          "Set send cadence: Day 1, Day 4, Day 10",
          "Track opens and clicks per email in sequence",
          "Move re-engaged subscribers back to active segments; remove non-responders after email 3",
        ],
        success_criteria: "Recover at least 20% of dormant subscribers back to active status",
        fallback: "If open rate on email 1 is below 5%, switch to SMS for email 2 if phone numbers are available",
      },
      scoring_inputs: {
        intent_score: 0.4,
        audience_value: seg.defining_traits.income_tier === "high" ? 8 : 4,
        sponsor_fit: 0.3,
        timing_score: seg.defining_traits.risk === "churn_imminent" ? 0.95 : 0.7,
        segment_size_weight: Math.min(5, Math.max(1, seg.subscriber_count)),
        execution_effort: 3,
      },
    }),
  },
  {
    action_type: "cold_outreach",
    match: (seg) =>
      seg.segment_type === "high_value_tier" &&
      seg.confidence >= 0.9,
    build: (audience, seg) => ({
      title: `Launch direct outreach to ${seg.name} for premium partnerships`,
      action_type: "cold_outreach",
      urgency: "this_week" as const,
      estimated_value: "$5,000–$25,000 in partnership revenue",
      recommended_channels: ["cold_email", "linkedin_dm"],
      why_now: `These are your highest-trust relationships with ${seg.confidence * 100}% confidence — they reply to your emails. Monetize the relationship before attention drifts.`,
      reasoning: {
        segment_signal: `${seg.subscriber_count} executive-level subscribers actively replying — highest relationship signal possible`,
        revenue_logic: "1-2 closed partnerships from warm executive relationships = $5K–25K in consulting, events, or co-marketing revenue",
        risk: "Direct monetization of trusted relationships requires value-first framing — never lead with the ask",
      },
      agent_instruction: {
        objective: `Convert high-trust relationships in "${seg.name}" into premium revenue opportunities for ${audience.name}`,
        steps: [
          "Review each subscriber's company, role, and past interactions",
          "Draft personalized 1:1 outreach offering exclusive value (early access, advisory invite, co-creation opportunity)",
          "Embed soft partnership ask after establishing mutual value",
          "For each positive response, schedule a 20-minute discovery call",
          "Prepare a lightweight partnership proposal template with 3 tiers ($5K / $10K / $25K)",
        ],
        success_criteria: "At least 3 discovery calls booked and 1 partnership closed within 30 days",
        fallback: "If direct outreach gets no response within 7 days, invite to an exclusive virtual roundtable as a lower-commitment entry point",
      },
      scoring_inputs: {
        intent_score: 0.95,
        audience_value: 10,
        sponsor_fit: 0.9,
        timing_score: 0.9,
        segment_size_weight: Math.min(5, Math.max(1, seg.subscriber_count)),
        execution_effort: 5,
      },
    }),
  },
  {
    action_type: "ad_audience_push",
    match: (seg) =>
      seg.monetization_paths.some((p) => p.path === "ads") &&
      seg.subscriber_count >= 3,
    build: (_audience, seg) => ({
      title: `Push ${seg.name} to ad platform as custom audience`,
      action_type: "ad_audience_push",
      urgency: "this_month" as const,
      estimated_value: "$300–$1,500/month in ad revenue",
      recommended_channels: ["retargeting_ad"],
      why_now: `Segment has ${seg.subscriber_count} qualified subscribers with consistent engagement — large enough for ad platform minimum thresholds`,
      reasoning: {
        segment_signal: `${seg.defining_traits.engagement || "active"} engagement pattern across ${seg.subscriber_count} subscribers`,
        revenue_logic: "Custom audiences with known intent signals command 3–5x higher CPMs than generic audiences",
        risk: "Privacy compliance required — ensure opt-in covers ad targeting use case",
      },
      agent_instruction: {
        objective: `Create a high-value custom audience from "${seg.name}" for programmatic ad monetization`,
        steps: [
          "Export subscriber emails from this segment (hashed for privacy)",
          "Create custom audience in Meta Ads Manager and Google Ads",
          "Build lookalike audience (1–3%) from the custom audience",
          "Set up retargeting campaign or sell audience access to sponsors",
          "Monitor match rate and audience size — refresh weekly",
        ],
        success_criteria: "Audience match rate above 60% and at least one active ad campaign using the segment",
        fallback: "If match rate is below 40%, supplement with website visitor retargeting pixel data",
      },
      scoring_inputs: {
        intent_score: 0.6,
        audience_value: 6,
        sponsor_fit: 0.5,
        timing_score: 0.6,
        segment_size_weight: Math.min(5, Math.max(1, Math.ceil(seg.subscriber_count / 2))),
        execution_effort: 4,
      },
    }),
  },
  {
    action_type: "media_kit_update",
    match: (seg) =>
      seg.segment_type === "behavioral_cohort" &&
      seg.defining_traits.advocacy === "active_promoter",
    build: (audience, seg) => ({
      title: `Update media kit with ${seg.name} engagement proof`,
      action_type: "media_kit_update",
      urgency: "this_month" as const,
      estimated_value: "$1,000–$3,000 in increased sponsor pricing power",
      recommended_channels: ["cold_email", "linkedin_dm"],
      why_now: `${seg.subscriber_count} subscribers are actively forwarding your content — this is verifiable social proof that justifies premium pricing`,
      reasoning: {
        segment_signal: `${seg.subscriber_count} active promoters forwarding content organically`,
        revenue_logic: "Documented forwarding/sharing behavior increases sponsor willingness-to-pay by 20–40%",
        risk: "Low direct risk — this is a preparation action that amplifies future revenue actions",
      },
      agent_instruction: {
        objective: `Strengthen ${audience.name} media kit with engagement data from "${seg.name}"`,
        steps: [
          "Pull forwarding and sharing metrics for this segment",
          "Calculate viral coefficient: avg forwards per subscriber per month",
          "Add 'Audience Amplification' section to media kit with hard numbers",
          "Include anonymized testimonial or case study if a forwarder has responded positively",
          "Update sponsor pricing page to reflect premium engagement tier",
        ],
        success_criteria: "Updated media kit with at least 3 new data points from this segment",
        fallback: "If forwarding data is limited, substitute with reply rate and open streak data as engagement proof",
      },
      scoring_inputs: {
        intent_score: 0.5,
        audience_value: 5,
        sponsor_fit: 0.6,
        timing_score: 0.5,
        segment_size_weight: Math.min(5, Math.max(1, seg.subscriber_count)),
        execution_effort: 2,
      },
    }),
  },
  {
    action_type: "newsletter_content",
    match: (seg) =>
      seg.segment_type === "behavioral_cohort" &&
      seg.defining_traits.opportunity === "untapped",
    build: (audience, seg) => ({
      title: `Create conversion-optimized content for ${seg.name}`,
      action_type: "newsletter_content",
      urgency: "this_month" as const,
      estimated_value: "$500–$2,000 in unlocked click revenue",
      recommended_channels: ["sponsored_newsletter"],
      why_now: `${seg.subscriber_count} subscribers read every issue but never click — content format change could unlock a new revenue stream`,
      reasoning: {
        segment_signal: `Consistent openers (${seg.defining_traits.engagement} engagement) with zero click-through — content mismatch, not disinterest`,
        revenue_logic: "Converting even 10% of consistent openers to clickers at current audience size unlocks meaningful affiliate and sponsor click revenue",
        risk: "Format experimentation could reduce open rates if changes feel too different — A/B test before full rollout",
      },
      agent_instruction: {
        objective: `Convert non-clicking readers in "${seg.name}" into active clickers for ${audience.name}`,
        steps: [
          "Analyze which content topics this segment opens most consistently",
          "Draft 3 alternative CTA formats: (1) inline text link, (2) callout box, (3) 'recommended reading' footer section",
          "A/B test all 3 formats in next newsletter send to this segment only",
          "Track click-through rate per format over 2 sends",
          "Roll winning format into default template for this segment",
        ],
        success_criteria: "Click-through rate for this segment increases from <1% to at least 5% within 4 sends",
        fallback: "If no format lifts clicks, test interactive content (polls, quizzes) as engagement bridge",
      },
      scoring_inputs: {
        intent_score: 0.5,
        audience_value: 6,
        sponsor_fit: 0.4,
        timing_score: 0.6,
        segment_size_weight: Math.min(5, Math.max(1, Math.ceil(seg.subscriber_count / 2))),
        execution_effort: 3,
      },
    }),
  },
  {
    action_type: "crm_sync",
    match: (seg) =>
      seg.segment_type === "demographic_slice" &&
      seg.subscriber_count >= 2,
    build: (audience, seg) => ({
      title: `Sync ${seg.name} to CRM for targeted outreach`,
      action_type: "crm_sync",
      urgency: "this_month" as const,
      estimated_value: "$1,000–$5,000 in pipeline value",
      recommended_channels: ["cold_email", "linkedin_dm"],
      why_now: `${seg.subscriber_count} international subscribers are engaged but untracked in your CRM — invisible revenue opportunity`,
      reasoning: {
        segment_signal: `${seg.subscriber_count} active subscribers in underserved geographies with ${seg.defining_traits.engagement} engagement`,
        revenue_logic: "International subscribers often represent untapped sponsor markets — geo-specific sponsors pay premium for proven international reach",
        risk: "GDPR and international privacy compliance must be verified before CRM sync and outreach",
      },
      agent_instruction: {
        objective: `Import "${seg.name}" into CRM and prepare geo-targeted outreach pipeline for ${audience.name}`,
        steps: [
          "Export segment subscriber data with geography and engagement fields",
          "Verify privacy compliance for each subscriber's country (GDPR, PIPEDA, etc.)",
          "Import compliant records into CRM with segment tag and source attribution",
          "Create a geo-targeted outreach sequence for international sponsors",
          "Set up dashboard to track international segment growth month-over-month",
        ],
        success_criteria: "All compliant subscribers synced to CRM and at least 1 geo-targeted sponsor outreach sent",
        fallback: "If compliance review blocks CRM sync, create anonymized international audience report for the media kit instead",
      },
      scoring_inputs: {
        intent_score: 0.6,
        audience_value: 7,
        sponsor_fit: 0.6,
        timing_score: 0.5,
        segment_size_weight: Math.min(5, Math.max(1, seg.subscriber_count)),
        execution_effort: 4,
      },
    }),
  },
];

let actionCounter = 0;

function makeActionId(): string {
  actionCounter++;
  return `act-${String(actionCounter).padStart(3, "0")}`;
}

export function generateActions(
  audience: Audience,
  segments: Segment[],
  capabilities?: Capability[]
): AgentAction[] {
  actionCounter = 0;
  const caps = capabilities || getDefaultCapabilities();

  const actions: AgentAction[] = [];

  for (const segment of segments) {
    for (const template of ACTION_TEMPLATES) {
      if (!template.match(segment)) continue;

      const built = template.build(audience, segment);
      const score = calculateActionScore(built.scoring_inputs as ScoringInputs);
      const priority = getPriority(score);

      if (priority === "hidden") continue;

      const execution = evaluateActionExecution(built.action_type, caps);

      actions.push({
        id: makeActionId(),
        audience_id: audience.id,
        segment_id: segment.id,
        action_score: score,
        priority,
        status: "new",
        execution,
        ...built,
      });
    }
  }

  return actions.sort((a, b) => b.action_score - a.action_score);
}
