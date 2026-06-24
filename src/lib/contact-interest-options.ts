export type ContactInterest = {
  id: string;
  label: string;
};

export const TALENT_INTERESTS: ContactInterest[] = [
  { id: "management", label: "Talent management" },
  { id: "brand-deals", label: "Brand partnerships & deals" },
  { id: "campaign-ops", label: "Campaign operations & negotiations" },
  { id: "content-strategy", label: "Content & creative strategy" },
  { id: "appearances-pr", label: "Appearances & PR" },
  { id: "monetisation", label: "Creator store & monetisation" },
  { id: "other", label: "Something else" },
];

export const BRAND_INTERESTS: ContactInterest[] = [
  { id: "influencer-campaigns", label: "Influencer / creator campaigns" },
  { id: "paid-social", label: "Paid social advertising" },
  { id: "social-management", label: "Social media management" },
  { id: "ugc-creator", label: "UGC & creator content" },
  { id: "brand-strategy", label: "Brand strategy" },
  { id: "content-production", label: "Content production" },
  { id: "growth-performance", label: "Growth & performance" },
  { id: "roster-access", label: "Roster / talent access" },
  { id: "other", label: "Something else" },
];

/** Maps `?service=` slugs from brand service cards to interest ids. */
export const BRAND_SERVICE_TO_INTEREST: Record<string, string> = {
  "paid-social-advertising": "paid-social",
  "social-media-management": "social-management",
  "ugc-creator-content": "ugc-creator",
  "brand-strategy": "brand-strategy",
  "content-production": "content-production",
  "growth-performance": "growth-performance",
};
