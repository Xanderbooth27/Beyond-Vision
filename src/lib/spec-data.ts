export type Campaign = {
  id: string;
  influencer: string;
  brand: string;
  platform: string;
  month: string;
  category: string;
  strategy: string;
  thumbnail: string;
  videoUrl?: string;
  tiktokUrl?: string;
  description?: string;
  metrics: {
    views: string;
    likes?: string;
    engagement: string;
    er?: string;
  };
};

export type CreatorProfile = {
  id: string;
  creatorName: string;
  displayName: string;
  category: string;
  bio: string;
  country: string;
  specificNiche: string;
  email: string;
  engagement: string;
  avgViews: string;
  avgLikes: string;
  totalLikes: string;
  tiktokRate: string;
  instagramRate: string;
  soundRate: string;
  audienceDemographics: {
    topCountries: string;
    genderSplit: string;
    ageGroups: string;
  };
  tiktokUsername: string;
  instagramUsername: string;
  socialLinks: {
    tiktokFollowers: string;
    tiktokUrl: string;
    instagramFollowers: string;
    instagramUrl: string;
  };
  profileImageUrl: string;
  highlightVideoUrl?: string;
};



export const brandServices = [
  {
    title: "Strategic Influencer Marketing",
    description:
      "We plan creator campaigns around audience fit, deliverables, usage rights, timelines, and measurable outcomes. The goal is not just bigger reach; it is the right creator, the right brief, and work that audiences trust.",
  },
  {
    title: "End-to-End Campaign Management",
    description:
      "We manage creator sourcing, negotiation, creative direction, approvals, posting windows, partner communication, and reporting so campaigns move cleanly from brief to live content.",
  },
  {
    title: "Brand & Talent Partnerships",
    description:
      "We build partnerships that can grow beyond one post, matching brands with creators whose audience, tone, and category make the collaboration feel native.",
  },
  {
    title: "Content & Creative Strategy",
    description:
      "We shape briefs, hooks, content cadence, and platform-specific angles across TikTok, Instagram, YouTube, Twitch, Snapchat, and X.",
  },
  {
    title: "Performance-Driven Results",
    description:
      "We report on the numbers that matter for the brief: views, engagement quality, conversions, content usage, audience response, and partner learnings.",
  },
  {
    title: "Why Brands Choose Beyond Vision",
    description:
      "Brands work with Beyond Vision for clear communication, creator access, structured campaign operations, and partnerships built to protect audience trust.",
  },
];

export const creatorServices = [
  {
    title: "Social Media Management",
    description:
      "Platform planning, content cadence, posting support, and creator operations across TikTok, Instagram, Twitch, Snapchat, and X.",
  },
  {
    title: "Career Management",
    description:
      "Long-term positioning, opportunity planning, partner selection, and category strategy built around the creator's actual audience.",
  },
  {
    title: "Contract Management",
    description:
      "Negotiation, deal terms, usage rights, payment timing, and partner communication handled with long-term value in mind.",
  },
  {
    title: "Public Appearances",
    description:
      "Appearances, events, activations, and IRL opportunities aligned with the creator's brand and schedule.",
  },
  {
    title: "Sales & Marketing",
    description:
      "Commercial strategy for brand partnerships, product launches, affiliate opportunities, and creator-owned revenue.",
  },
  {
    title: "Public Relations",
    description:
      "Public positioning, press opportunities, partner messaging, and reputation support when visibility increases.",
  },
  {
    title: "Creator Store",
    description:
      "Store planning, merchandise positioning, launch support, and optimization for creator-owned commerce.",
  },
  {
    title: "Live Streaming Management",
    description:
      "Streaming schedules, platform growth, sponsorship packaging, and monetization support for live audiences.",
  },
];

export const creatorStats = [
  { value: "GBP 4M+", label: "Paid to Creators since 2022" },
  { value: "250+", label: "Brands worked with per year" },
  { value: "5,000+", label: "Creators Trust Us" },
  { value: "1bn+", label: "Combined Roster Following" },
];

export const aboutStats = [
  { value: "£4m+", label: "Paid Out To Creators Since 2022" },
  { value: "50+", label: "Signed Creators" },
  { value: "5,000+", label: "Trusted by Creators" },
  { value: "1,000+", label: "Trusted by Brands" },
  { value: "1,000+", label: "Completed Campaigns in the Past Year" },
];



export const teamPlaceholders = [
  { name: "Team Member", role: "Founder / Strategy Lead", email: "team@beyondvision.com" },
  { name: "Team Member", role: "Campaign Manager", email: "campaigns@beyondvision.com" },
  { name: "Team Member", role: "Talent Partnerships", email: "talent@beyondvision.com" },
  { name: "Team Member", role: "Brand Partnerships", email: "brands@beyondvision.com" },
];
