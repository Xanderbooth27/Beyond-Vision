// Landing pages for the searches brands and creators type (2026-11-18).
// Approved by Xander before going live. No dashes in the copy.
export type LandingPage = {
  id: string;
  title: string;
  seoTitle: string;
  description: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  forCreators: boolean;
};

export const landingPages: LandingPage[] = [
  {
    "id": "influencer-marketing-agency-uk",
    "title": "Influencer marketing agency, based in the UK",
    "seoTitle": "Influencer Marketing Agency UK | Beyond Vision",
    "description": "Beyond Vision is a UK influencer marketing agency running TikTok and Instagram creator campaigns for brands, from casting and rates to content and results.",
    "body": "We run TikTok and Instagram creator campaigns for brands in the UK and the US. You tell us the product and the budget. We find the creators, agree the rates, manage the content and report the results.\n\n### What you get\n\n- **The right creators.** We pick creators by the views their recent videos get and by who watches them, not by follower count.\n- **Fair rates.** We negotiate creator fees every day, so we know what a fair price is. Across our deals the median fee is $2,000 per campaign.\n- **Content that sounds like the creator.** We brief creators on the one thing viewers should remember, then let them make it their own. That is what gets watched.\n- **One point of contact.** Briefs, contracts, drafts, posting dates and payments all go through us.\n- **Clear results.** Views, likes, comments and cost per thousand views for every video.\n\n### Results\n\nOur 10 published case studies add up to 36M views. Our biggest single video reached 11M views for Gauth. [See the case studies](/case-studies).\n\n### Our creators\n\n25 creators on our own roster, with about 78M followers between them, across comedy, family, beauty, lifestyle, gaming and more. [Meet the roster](/roster).\n\n### How it works\n\n1. Tell us about the product, the audience and the budget.\n2. We send you a shortlist of creators with their recent views and rates.\n3. You pick, we agree terms and brief the creators.\n4. Creators film drafts, you review them, they post.\n5. We send you the results after 7 and 30 days.",
    "ctaLabel": "Plan a campaign",
    "ctaHref": "/contact?type=brand",
    "forCreators": false
  },
  {
    "id": "tiktok-marketing-agency",
    "title": "TikTok marketing agency for brands",
    "seoTitle": "TikTok Marketing Agency for Brands | Beyond Vision",
    "description": "Get your product in front of the right TikTok audience. Beyond Vision casts TikTok creators, negotiates rates and manages campaigns that get real views.",
    "body": "TikTok rewards videos that feel native. Ads that look like ads get skipped. We get your product into videos made by creators whose audiences already trust them.\n\n### Why creators, not ads\n\nPeople on TikTok follow creators, not brands. A product shown by a creator people already watch gets attention an ad cannot buy. Our best performing brand video reached 11M views. Our top three together brought in nearly 28M.\n\n### What we do\n\n- **Casting.** We shortlist TikTok creators whose recent videos get steady views and whose audience matches your buyer.\n- **Rates and terms.** We agree the fee, the number of videos, the posting date and the usage rights before anything is filmed.\n- **Briefing.** One clear message, room for the creator's style, two or three hook ideas before filming.\n- **Review and posting.** You approve every draft. We confirm the post goes live on time with the right disclosure.\n- **Reporting.** Views, likes, comments and cost per thousand views, so you know what worked.\n\n### What it costs\n\nMost of our TikTok creator campaigns land between $1,200 and $3,400 per creator. We leave out creators whose expected cost per thousand views is above $20. [Read how creator pricing works](/blog/how-much-does-a-tiktok-creator-cost).\n\n### Recent TikTok campaigns\n\nGauth, DarryRing, Toxic, Sheglam, Facemoji, Duet, Insta360 and OLOV. [See the results](/case-studies).",
    "ctaLabel": "Start a TikTok campaign",
    "ctaHref": "/contact?type=brand",
    "forCreators": false
  },
  {
    "id": "talent-management-agency",
    "title": "Talent management for TikTok and Instagram creators",
    "seoTitle": "Talent Management Agency for TikTok and Instagram Creators | Beyond Vision",
    "description": "Beyond Vision manages TikTok and Instagram creators: brand deals, rate negotiation, contracts and fast payment. See if you are ready for management.",
    "body": "We manage creators so they can focus on making videos. We bring the brand deals, agree the rates, handle the contracts and make sure you get paid.\n\n### What we do for you\n\n- **Brand deals.** We pitch you to brands every day, so the right deals come to you.\n- **Better rates.** We know what brands pay creators with views like yours.\n- **Contracts and admin.** Briefs, usage rights, deadlines and invoices, handled.\n- **Payment.** We chase every invoice and pay you as soon as the brand pays.\n- **Growth.** Advice on which brands to work with, and which to turn down, so your audience keeps trusting you.\n\n### Who we work with\n\n25 creators on our roster, from 300K to 15M followers, across the UK and the US. [Meet them](/roster).\n\n### Are you ready?\n\nYou are probably ready for management if brands already message you, your videos regularly get 100K views or more, and admin is taking time away from making content. [Read more](/blog/what-does-a-creator-management-agency-do).",
    "ctaLabel": "Apply to join",
    "ctaHref": "/contact?type=creator",
    "forCreators": true
  }
];

export function findLanding(id: string) {
  return landingPages.find((p) => p.id === id);
}
