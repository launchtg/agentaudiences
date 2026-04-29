import type { Audience, Subscriber, Segment } from "@/lib/mockData";

export interface SegmentRule {
  name: string;
  description: string;
  segment_type: string;
  match: (s: Subscriber) => boolean;
  defining_traits: Record<string, string>;
  monetization_paths: {
    path: string;
    description: string;
    estimated_value: string;
  }[];
  confidence: number;
}

export const SEGMENT_RULES: SegmentRule[] = [
  {
    name: "Sponsor-Clickers With Budget Authority",
    description: "High-income subscribers who clicked sponsor links and hold director+ titles — prime sponsor pitch targets",
    segment_type: "intent_cluster",
    match: (s) =>
      s.recent_activity === "clicked_sponsor_link" &&
      s.income_tier === "high" &&
      s.engagement_score >= 75,
    defining_traits: {
      activity: "clicked_sponsor_link",
      income_tier: "high",
      seniority: "director+",
      engagement: "75+",
    },
    monetization_paths: [
      { path: "sponsorship", description: "Pitch their company as newsletter sponsor — they already engage with sponsor content", estimated_value: "high" },
      { path: "ads", description: "Include in premium ad audience segment for retargeting", estimated_value: "medium" },
    ],
    confidence: 0.92,
  },
  {
    name: "Founder-Operators Actively Buying Tools",
    description: "Business owners browsing intent categories related to tools, automation, and growth — ideal affiliate targets",
    segment_type: "behavioral_cohort",
    match: (s) =>
      s.business_owner &&
      s.engagement_score >= 70 &&
      s.intent_categories.some((c) =>
        ["marketing_automation", "ai_tools", "sales_automation", "crm_optimization", "email_marketing"].includes(c)
      ),
    defining_traits: {
      role: "business_owner",
      intent: "tool_evaluation",
      engagement: "70+",
      buying_signal: "active",
    },
    monetization_paths: [
      { path: "affiliate", description: "Promote SaaS tools via affiliate links — these founders are actively evaluating", estimated_value: "high" },
      { path: "sponsorship", description: "Feature tool sponsors in dedicated sends to this segment", estimated_value: "medium" },
    ],
    confidence: 0.88,
  },
  {
    name: "Reply-Engaged Executive Circle",
    description: "Subscribers who reply to emails and have 90+ engagement — highest-trust relationships for premium offers",
    segment_type: "high_value_tier",
    match: (s) =>
      s.recent_activity === "replied_to_email" && s.engagement_score >= 90,
    defining_traits: {
      activity: "replied_to_email",
      engagement: "90+",
      relationship_depth: "high_trust",
      seniority: "executive",
    },
    monetization_paths: [
      { path: "outreach", description: "Direct outreach for premium consulting, events, or partnerships", estimated_value: "high" },
      { path: "sponsorship", description: "Introduce as warm leads to sponsors seeking executive audiences", estimated_value: "high" },
    ],
    confidence: 0.95,
  },
  {
    name: "Affiliate-Responsive E-Commerce Operators",
    description: "E-commerce and DTC operators clicking affiliate links — proven purchase intent for tool recommendations",
    segment_type: "intent_cluster",
    match: (s) =>
      s.recent_activity === "clicked_affiliate_link" &&
      s.engagement_score >= 60,
    defining_traits: {
      activity: "clicked_affiliate_link",
      industry: "e-commerce/dtc",
      purchase_intent: "demonstrated",
      engagement: "60+",
    },
    monetization_paths: [
      { path: "affiliate", description: "Double down on affiliate placements — this segment clicks and converts", estimated_value: "high" },
      { path: "sponsorship", description: "Sell dedicated sends to e-commerce tool vendors targeting this segment", estimated_value: "medium" },
    ],
    confidence: 0.85,
  },
  {
    name: "Newsletter Evangelists",
    description: "Subscribers who forward the newsletter to others — organic growth amplifiers and social proof sources",
    segment_type: "behavioral_cohort",
    match: (s) => s.recent_activity === "forwarded_newsletter",
    defining_traits: {
      activity: "forwarded_newsletter",
      advocacy: "active_promoter",
      network_value: "high",
    },
    monetization_paths: [
      { path: "outreach", description: "Recruit as referral partners or affiliate ambassadors", estimated_value: "medium" },
      { path: "sponsorship", description: "Feature in media kit as engagement proof for sponsors", estimated_value: "low" },
    ],
    confidence: 0.80,
  },
  {
    name: "Fundraising-Intent Founders",
    description: "Business owners actively interested in fundraising — high-value for VC sponsors and accelerator partnerships",
    segment_type: "intent_cluster",
    match: (s) =>
      s.business_owner &&
      s.intent_categories.includes("fundraising") &&
      s.engagement_score >= 50,
    defining_traits: {
      role: "founder",
      intent: "fundraising",
      stage: "actively_raising",
      engagement: "50+",
    },
    monetization_paths: [
      { path: "sponsorship", description: "Pitch VC firms and accelerators as sponsors targeting this segment", estimated_value: "high" },
      { path: "affiliate", description: "Recommend fundraising tools, pitch deck builders, cap table software", estimated_value: "medium" },
    ],
    confidence: 0.82,
  },
  {
    name: "30-Day Dormant High-Value Contacts",
    description: "Previously engaged high-income subscribers gone quiet in the last 30 days — recoverable revenue at risk",
    segment_type: "reactivation_pool",
    match: (s) =>
      s.recent_activity === "inactive_30_days" &&
      s.income_tier === "high",
    defining_traits: {
      activity: "inactive_30_days",
      income_tier: "high",
      previous_engagement: "was_active",
      risk: "churn_imminent",
    },
    monetization_paths: [
      { path: "reactivation", description: "Win-back campaign before they fully churn — these are high-value contacts", estimated_value: "medium" },
    ],
    confidence: 0.72,
  },
  {
    name: "60–90 Day Churned Subscribers",
    description: "Long-inactive subscribers across all tiers — last-chance reactivation before list cleanup",
    segment_type: "reactivation_pool",
    match: (s) =>
      ["inactive_60_days", "inactive_90_days"].includes(s.recent_activity),
    defining_traits: {
      activity: "inactive_60_90_days",
      engagement: "below_20",
      status: "near_churned",
    },
    monetization_paths: [
      { path: "reactivation", description: "Final win-back sequence — recover or remove to improve list health and deliverability", estimated_value: "low" },
    ],
    confidence: 0.60,
  },
  {
    name: "International Growth Leaders",
    description: "Non-US subscribers in senior roles — underserved segment for international sponsor expansion",
    segment_type: "demographic_slice",
    match: (s) =>
      s.country !== "US" &&
      s.engagement_score >= 70,
    defining_traits: {
      geography: "international",
      engagement: "70+",
      seniority: "senior",
      market: "underserved",
    },
    monetization_paths: [
      { path: "sponsorship", description: "Sell geo-targeted sponsorship slots to international SaaS companies", estimated_value: "medium" },
      { path: "outreach", description: "Partnership outreach for international expansion consulting", estimated_value: "medium" },
    ],
    confidence: 0.75,
  },
  {
    name: "Consistent Openers Without Clicks",
    description: "Subscribers who open 3+ consecutive emails but never click — content-engaged but not yet monetized",
    segment_type: "behavioral_cohort",
    match: (s) =>
      s.recent_activity === "opened_3_consecutive" &&
      s.engagement_score >= 70 &&
      s.engagement_score < 90,
    defining_traits: {
      activity: "opened_3_consecutive",
      engagement: "70-89",
      click_behavior: "non_clicker",
      opportunity: "untapped",
    },
    monetization_paths: [
      { path: "ads", description: "Test inline content ads — they read but don't click CTAs, different placement may convert", estimated_value: "medium" },
      { path: "affiliate", description: "Experiment with editorial-style affiliate recommendations vs banner links", estimated_value: "medium" },
    ],
    confidence: 0.70,
  },
];

let segmentCounter = 0;

function makeSegmentId(): string {
  segmentCounter++;
  return `seg-${String(segmentCounter).padStart(3, "0")}`;
}

export function generateSegments(
  audience: Audience,
  subscribers: Subscriber[]
): Segment[] {
  segmentCounter = 0;

  return SEGMENT_RULES.map((rule) => {
    const matched = subscribers.filter(rule.match);
    return {
      id: makeSegmentId(),
      audience_id: audience.id,
      name: rule.name,
      description: rule.description,
      segment_type: rule.segment_type,
      subscriber_count: matched.length,
      defining_traits: rule.defining_traits,
      monetization_paths: rule.monetization_paths,
      confidence: rule.confidence,
    };
  }).filter((seg) => seg.subscriber_count > 0);
}
