export interface Audience {
  id: string;
  name: string;
  source: string;
  subscriber_count?: number;
}

export interface Subscriber {
  id: string;
  audience_id: string;
  email: string;
  first_name: string;
  last_name: string;
  city: string;
  state: string;
  country: string;
  income_tier: string;
  industry: string;
  job_title: string;
  business_owner: boolean;
  intent_categories: string[];
  recent_activity: string;
  engagement_score: number;
}

export interface Segment {
  id: string;
  audience_id: string;
  name: string;
  description: string;
  segment_type: string;
  subscriber_count: number;
  defining_traits: Record<string, string>;
  monetization_paths: {
    path: string;
    description: string;
    estimated_value: string;
  }[];
  confidence: number;
}

export interface AgentAction {
  id: string;
  audience_id: string;
  segment_id: string;
  title: string;
  action_type: string;
  priority: string;
  action_score: number;
  urgency: string;
  estimated_value: string;
  recommended_channels: string[];
  why_now: string;
  reasoning: {
    segment_signal: string;
    revenue_logic: string;
    risk: string;
  };
  agent_instruction: {
    objective: string;
    steps: string[];
    success_criteria: string;
    fallback: string;
  };
  scoring_inputs: {
    intent_score: number;
    audience_value: number;
    sponsor_fit: number;
    timing_score: number;
    segment_size_weight: number;
    execution_effort: number;
  };
  status: string;
}

// ---------------------------------------------------------------------------
// Mock audience
// ---------------------------------------------------------------------------

export const MOCK_AUDIENCE: Audience = {
  id: "aud-001",
  name: "SaaS Growth Newsletter",
  source: "csv_import",
  subscriber_count: 18420,
};

// ---------------------------------------------------------------------------
// Mock subscribers — high-value B2B newsletter subscribers
// ---------------------------------------------------------------------------

export const MOCK_SUBSCRIBERS: Subscriber[] = [
  { id: "sub-001", audience_id: "aud-001", email: "jchen@scalegrid.io", first_name: "Jessica", last_name: "Chen", city: "San Francisco", state: "CA", country: "US", income_tier: "high", industry: "SaaS", job_title: "VP Marketing", business_owner: false, intent_categories: ["marketing_automation", "paid_ads", "attribution"], recent_activity: "clicked_sponsor_link", engagement_score: 94 },
  { id: "sub-002", audience_id: "aud-001", email: "m.rodriguez@arcpay.com", first_name: "Marco", last_name: "Rodriguez", city: "Austin", state: "TX", country: "US", income_tier: "high", industry: "Fintech", job_title: "CEO & Co-Founder", business_owner: true, intent_categories: ["fundraising", "growth_strategy", "hiring"], recent_activity: "replied_to_email", engagement_score: 97 },
  { id: "sub-003", audience_id: "aud-001", email: "sarah.k@brandcraft.co", first_name: "Sarah", last_name: "Kim", city: "Brooklyn", state: "NY", country: "US", income_tier: "medium", industry: "Brand Agency", job_title: "Founder & Creative Director", business_owner: true, intent_categories: ["client_acquisition", "pricing", "positioning"], recent_activity: "opened_3_consecutive", engagement_score: 86 },
  { id: "sub-004", audience_id: "aud-001", email: "dpatil@cloudscale.com", first_name: "Dev", last_name: "Patil", city: "Seattle", state: "WA", country: "US", income_tier: "high", industry: "Cloud Infrastructure", job_title: "Director of Growth", business_owner: false, intent_categories: ["product_led_growth", "onboarding", "activation"], recent_activity: "clicked_sponsor_link", engagement_score: 89 },
  { id: "sub-005", audience_id: "aud-001", email: "anna.w@hemlane.com", first_name: "Anna", last_name: "Weber", city: "Toronto", state: "ON", country: "CA", income_tier: "medium", industry: "PropTech", job_title: "Head of Marketing", business_owner: false, intent_categories: ["email_marketing", "conversion_optimization", "seo"], recent_activity: "clicked_affiliate_link", engagement_score: 78 },
  { id: "sub-006", audience_id: "aud-001", email: "t.jackson@revenuelab.co", first_name: "Tyrone", last_name: "Jackson", city: "Atlanta", state: "GA", country: "US", income_tier: "high", industry: "Revenue Operations", job_title: "Managing Partner", business_owner: true, intent_categories: ["sales_automation", "crm_optimization", "agency_growth"], recent_activity: "forwarded_newsletter", engagement_score: 93 },
  { id: "sub-007", audience_id: "aud-001", email: "lmorales@vitalink.io", first_name: "Laura", last_name: "Morales", city: "Miami", state: "FL", country: "US", income_tier: "medium", industry: "HealthTech", job_title: "VP Product", business_owner: false, intent_categories: ["product_strategy", "user_research"], recent_activity: "inactive_30_days", engagement_score: 22 },
  { id: "sub-008", audience_id: "aud-001", email: "chris.o@closedloop.ai", first_name: "Chris", last_name: "O'Brien", city: "Denver", state: "CO", country: "US", income_tier: "high", industry: "AI/ML", job_title: "VP Revenue", business_owner: false, intent_categories: ["sales_automation", "crm_optimization", "ai_tools"], recent_activity: "clicked_sponsor_link", engagement_score: 88 },
  { id: "sub-009", audience_id: "aud-001", email: "priya.s@mckenzie-digital.com", first_name: "Priya", last_name: "Sharma", city: "Chicago", state: "IL", country: "US", income_tier: "high", industry: "Management Consulting", job_title: "Principal", business_owner: true, intent_categories: ["thought_leadership", "content_marketing", "ai_tools"], recent_activity: "replied_to_email", engagement_score: 95 },
  { id: "sub-010", audience_id: "aud-001", email: "bthompson@freelance.me", first_name: "Brian", last_name: "Thompson", city: "Portland", state: "OR", country: "US", income_tier: "low", industry: "Freelance", job_title: "Freelance Copywriter", business_owner: true, intent_categories: ["freelance_growth", "pricing"], recent_activity: "inactive_60_days", engagement_score: 12 },
  { id: "sub-011", audience_id: "aud-001", email: "emilyz@foundersfund.vc", first_name: "Emily", last_name: "Zhang", city: "Palo Alto", state: "CA", country: "US", income_tier: "high", industry: "Venture Capital", job_title: "Partner", business_owner: false, intent_categories: ["deal_flow", "market_analysis", "ai_tools"], recent_activity: "opened_3_consecutive", engagement_score: 84 },
  { id: "sub-012", audience_id: "aud-001", email: "mike.d@roofstack.io", first_name: "Mike", last_name: "Davis", city: "Nashville", state: "TN", country: "US", income_tier: "medium", industry: "PropTech", job_title: "Co-Founder & CTO", business_owner: true, intent_categories: ["fundraising", "product_market_fit", "hiring"], recent_activity: "clicked_affiliate_link", engagement_score: 72 },
  { id: "sub-013", audience_id: "aud-001", email: "r.nakamura@learnbyte.jp", first_name: "Riku", last_name: "Nakamura", city: "Tokyo", state: "", country: "JP", income_tier: "high", industry: "EdTech", job_title: "CTO", business_owner: false, intent_categories: ["engineering_hiring", "ai_tools", "developer_marketing"], recent_activity: "clicked_sponsor_link", engagement_score: 77 },
  { id: "sub-014", audience_id: "aud-001", email: "kate.l@mediahub.co", first_name: "Kate", last_name: "Lawson", city: "Los Angeles", state: "CA", country: "US", income_tier: "high", industry: "Media & Publishing", job_title: "Head of Partnerships", business_owner: false, intent_categories: ["sponsorship", "brand_deals", "audience_monetization"], recent_activity: "replied_to_email", engagement_score: 91 },
  { id: "sub-015", audience_id: "aud-001", email: "alex.f@stackblitz.dev", first_name: "Alex", last_name: "Fischer", city: "Berlin", state: "", country: "DE", income_tier: "medium", industry: "Developer Tools", job_title: "Founder", business_owner: true, intent_categories: ["developer_marketing", "community_building", "product_led_growth"], recent_activity: "opened_3_consecutive", engagement_score: 81 },
  { id: "sub-016", audience_id: "aud-001", email: "jnewton@goldmansachs.com", first_name: "James", last_name: "Newton", city: "New York", state: "NY", country: "US", income_tier: "high", industry: "Financial Services", job_title: "SVP Digital Transformation", business_owner: false, intent_categories: ["digital_transformation", "vendor_evaluation", "ai_tools"], recent_activity: "inactive_30_days", engagement_score: 31 },
  { id: "sub-017", audience_id: "aud-001", email: "olivia.r@techstars.com", first_name: "Olivia", last_name: "Reed", city: "Boston", state: "MA", country: "US", income_tier: "high", industry: "Startup Accelerator", job_title: "Program Director", business_owner: false, intent_categories: ["portfolio_support", "growth_frameworks", "fundraising"], recent_activity: "forwarded_newsletter", engagement_score: 88 },
  { id: "sub-018", audience_id: "aud-001", email: "sam.h@nativecos.com", first_name: "Sam", last_name: "Harper", city: "Dallas", state: "TX", country: "US", income_tier: "medium", industry: "DTC E-Commerce", job_title: "Growth Marketing Manager", business_owner: false, intent_categories: ["email_marketing", "retention", "conversion_optimization"], recent_activity: "clicked_affiliate_link", engagement_score: 74 },
  { id: "sub-019", audience_id: "aud-001", email: "n.okafor@peostack.com", first_name: "Nneka", last_name: "Okafor", city: "London", state: "", country: "UK", income_tier: "high", industry: "HR Tech", job_title: "CEO", business_owner: true, intent_categories: ["international_expansion", "partnerships", "hiring"], recent_activity: "replied_to_email", engagement_score: 93 },
  { id: "sub-020", audience_id: "aud-001", email: "greg.m@legacymanuf.com", first_name: "Greg", last_name: "Mitchell", city: "Phoenix", state: "AZ", country: "US", income_tier: "low", industry: "Manufacturing", job_title: "Operations Manager", business_owner: false, intent_categories: ["process_improvement"], recent_activity: "inactive_90_days", engagement_score: 8 },
  { id: "sub-021", audience_id: "aud-001", email: "lisa.t@contentengine.co", first_name: "Lisa", last_name: "Torres", city: "San Diego", state: "CA", country: "US", income_tier: "medium", industry: "Content Marketing", job_title: "Founder & CEO", business_owner: true, intent_categories: ["content_strategy", "seo", "ai_tools"], recent_activity: "clicked_sponsor_link", engagement_score: 83 },
  { id: "sub-022", audience_id: "aud-001", email: "d.kumar@dataweave.io", first_name: "Deepak", last_name: "Kumar", city: "Bangalore", state: "", country: "IN", income_tier: "medium", industry: "Data Infrastructure", job_title: "VP Engineering", business_owner: false, intent_categories: ["engineering_hiring", "data_tools", "ai_tools"], recent_activity: "opened_3_consecutive", engagement_score: 75 },
  { id: "sub-023", audience_id: "aud-001", email: "rachel.b@impactfund.org", first_name: "Rachel", last_name: "Brooks", city: "Washington", state: "DC", country: "US", income_tier: "low", industry: "Nonprofit", job_title: "Executive Director", business_owner: false, intent_categories: ["fundraising", "community_building"], recent_activity: "inactive_60_days", engagement_score: 18 },
  { id: "sub-024", audience_id: "aud-001", email: "tom.w@shieldops.io", first_name: "Tom", last_name: "Williams", city: "Raleigh", state: "NC", country: "US", income_tier: "high", industry: "Cybersecurity", job_title: "CISO", business_owner: false, intent_categories: ["vendor_evaluation", "compliance", "ai_tools"], recent_activity: "clicked_sponsor_link", engagement_score: 80 },
];
