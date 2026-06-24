import {
  driveCampaignContent,
  type DriveCampaignContent,
} from "@/lib/drive-content";

const MONTH_ORDER = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type HomeCampaignCard = {
  id: string;
  title: string;
  thumbnail: string;
  brand: string;
  influencer: string;
  month: string;
  year: string;
  strategy: string;
};

function monthIndex(month: string) {
  const index = MONTH_ORDER.indexOf(month as (typeof MONTH_ORDER)[number]);
  return index === -1 ? 0 : index;
}

/** Same campaign archive as /recent-campaigns, newest first. */
export function sortCampaignsByRecency(campaigns: DriveCampaignContent[]) {
  return [...campaigns].sort((a, b) => {
    const yearDiff = Number(b.year) - Number(a.year);
    if (yearDiff !== 0) return yearDiff;
    return monthIndex(b.month) - monthIndex(a.month);
  });
}

export function driveCampaignToHomeCard(campaign: DriveCampaignContent): HomeCampaignCard {
  return {
    id: campaign.id,
    title: campaign.title,
    thumbnail: campaign.thumbnail,
    brand: campaign.brand,
    influencer: campaign.creator,
    month: campaign.month,
    year: campaign.year,
    strategy: campaign.title,
  };
}

function normalizeCampaignIdentity(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function campaignIdentityKey(campaign: DriveCampaignContent) {
  return [
    campaign.title,
    campaign.creator,
    campaign.brand,
    campaign.month,
    campaign.year,
  ].map(normalizeCampaignIdentity).join("|");
}

export function uniqueCampaignsByIdentity(campaigns: DriveCampaignContent[]) {
  const seen = new Set<string>();
  return campaigns.filter((campaign) => {
    const key = campaignIdentityKey(campaign);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getHomeArchiveCampaigns(limit?: number): HomeCampaignCard[] {
  const sorted = uniqueCampaignsByIdentity(sortCampaignsByRecency(driveCampaignContent)).map(driveCampaignToHomeCard);
  return limit ? sorted.slice(0, limit) : sorted;
}
