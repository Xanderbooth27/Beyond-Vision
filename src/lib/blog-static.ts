// The BV blog posts that live in the site's code (2026-11-18). Written from
// Cory's sheet (USD deals, never converted) and the published case studies.
// Approved by Xander before going live. No dashes in the copy.
export type StaticPost = {
  id: string;
  title: string;
  seoTitle: string;
  description: string;
  category: string;
  readTime: string;
  caseId: string;
  /** Designed cover (public/blog-covers). */
  cover: string;
  date: string;
  /** Markdown-lite: ### headings, - bullets, **bold**, [text](url). */
  body: string;
};

export const staticPosts: StaticPost[] = [
  {
    "id": "how-much-does-a-tiktok-creator-cost",
    "title": "How much does a TikTok creator cost in 2026?",
    "seoTitle": "How Much Does a TikTok Creator Cost in 2026? Real Rates From Our Deals",
    "description": "What brands actually pay TikTok creators in 2026, from the deals we run every month: typical ranges, what pushes the price up, and how to judge value.",
    "category": "Rates",
    "readTime": "5 min read",
    "caseId": "piperrockelle-toxic",
    "cover": "/blog-covers/rates.svg",
    "date": "2026-11-18",
    "body": "It is the first question every brand asks us, and most answers online are guesses. So here is what we see in our own deals.\n\n### The short answer\n\nAcross the 48 US dollar creator deals on our books right now, the middle half land between **$1,200 and $3,400** per campaign. The median is **$2,000**. The biggest single deals reach **$8,000**, usually for multiple videos with a creator who has several million followers.\n\nA campaign here usually means one TikTok video, sometimes two, posted on the creator's own account.\n\n### What pushes the price up\n\n**1. Views, not followers.** A creator with 5M followers whose videos get 200K views is worth less to you than a creator with 800K followers who regularly hits 1M. We price on what a creator's recent videos actually do.\n\n**2. How many videos.** Two videos rarely cost double. Most creators give a better rate for a package.\n\n**3. Usage rights.** If you want to run the video as a paid ad, or post it on your own channels, expect to pay more. Agree how long you can use it before anything is filmed.\n\n**4. Exclusivity.** Asking a creator not to work with competitors for a few months costs extra, because it stops them earning.\n\n**5. The niche.** Beauty, finance and tech creators usually charge more than comedy or general lifestyle creators with similar views, because their audiences buy more.\n\n### How to tell if a rate is good value\n\nWork out the cost per thousand views (CPM): divide the fee by the views you expect, then multiply by 1,000. A $2,000 video that gets 400K views has a CPM of $5.\n\nWhen we build a list of creators for a brand, we leave out anyone whose expected CPM is above $20. Many of our campaigns come in well under that, because a creator's best video can beat their average by a long way. One of our education campaigns reached 11M views on a single video.\n\n### What you should not pay for\n\n- Follower counts on their own. Check the last 10 videos.\n- Agency fees that sit on top of the creator's rate without any management behind them.\n- Vague deliverables. You should know the number of videos, the posting date, the review steps and the usage rights before you pay.\n\n### The easy way\n\nWe negotiate rates with creators every day, so we know what a fair price looks like for each one. [Tell us your budget](/contact?type=brand) and we will show you which creators fit it."
  },
  {
    "id": "how-to-run-a-tiktok-creator-campaign",
    "title": "How to run a TikTok creator campaign, step by step",
    "seoTitle": "How to Run a TikTok Creator Campaign: A Step by Step Guide for Brands",
    "description": "The seven steps we follow on every creator campaign, from the brief to the results, so your TikTok campaign posts on time and performs.",
    "category": "Guides",
    "readTime": "4 min read",
    "caseId": "africanamericanfam-darryring",
    "cover": "/blog-covers/steps.svg",
    "date": "2026-11-17",
    "body": "We run creator campaigns for brands every week. Every one follows the same seven steps. Here they are.\n\n### 1. Write a short brief\n\nOne page is enough. Say what the product is, who it is for, the one thing a viewer should remember, and anything the creator must not say. Leave room for the creator's own style. The videos that perform best sound like the creator, not like an ad.\n\n### 2. Pick creators by views, not followers\n\nLook at each creator's last 10 videos. You want steady views, real comments, and an audience that matches your buyer. A smaller creator with the right audience will beat a big one with the wrong audience.\n\n### 3. Agree the rate and the terms\n\nGet these in writing: how many videos, the posting date, how many rounds of changes, usage rights, and when payment is due. Most problems in creator campaigns come from something nobody wrote down.\n\n### 4. Drafting\n\nThe creator films a draft. Give them a clear deadline and a few days to get it right. Good creators will test different hooks.\n\n### 5. Review\n\nCheck the draft against the brief. Ask for changes on facts and must-haves, not on style. If you rewrite the creator's voice, their audience will notice.\n\n### 6. Posting\n\nAgree a posting time. Ask for the live link the same day and check that any required ad disclosure is in place.\n\n### 7. Report the results\n\nTrack views, likes, comments and shares after 7 days and again after 30. Work out the cost per thousand views so you can compare creators fairly next time.\n\n### Results from campaigns run this way\n\n- 11M views for an education app with one creator.\n- 10M views for an entertainment brand.\n- 6.7M views for a jewellery brand with a family creator.\n\n[See all our case studies](/case-studies), or [talk to us](/contact?type=brand) about your next campaign."
  },
  {
    "id": "what-makes-a-tiktok-brand-video-go-viral",
    "title": "What makes a TikTok brand video go viral? Lessons from 36M views",
    "seoTitle": "What Makes a TikTok Brand Video Go Viral? Lessons From 36M Views",
    "description": "What the best performing brand videos in our case studies have in common, and how to brief creators so your product gets the same reach.",
    "category": "Case studies",
    "readTime": "4 min read",
    "caseId": "ayeeshaad-gauth",
    "cover": "/blog-covers/viral.svg",
    "date": "2026-11-16",
    "body": "Our 10 published case studies add up to about 36M views. The top three alone, for Gauth, Toxic and DarryRing, brought in nearly 28M. Here is what the best ones had in common.\n\n### 1. The video is a story first, an ad second\n\nOur biggest result, 11M views for Gauth with AyeeShaad, opens on a relatable line: \"That one dude who didn't graduate\". It plays like any other video in the creator's feed, and the app is part of the story rather than an interruption.\n\n### 2. The hook lands in the first second\n\nEvery top video opens with something that makes you stop: a line of text on screen, a reaction, or a situation people recognise. \"POV: you finally paid lobola\" opened our 6.7M view DarryRing video with Africanamericanfam.\n\n### 3. It fits the creator's normal content\n\nThe DarryRing video works because it is a family moment, which is what that creator's audience already watches. If the sponsored video looks nothing like a creator's usual posts, views drop.\n\n### 4. The creator has freedom\n\nThe brands that got the best results gave a short brief and trusted the creator to make it work. Over-scripted videos feel like ads, and people scroll past ads.\n\n### 5. Comments are part of the result\n\nToxic with PiperRockelle reached 10M views and 3K comments. When people tag friends or ask questions in the comments, TikTok shows the video to more people.\n\n### How to brief for this\n\n- Give the creator the one message, not the script.\n- Ask for two or three hook ideas before filming.\n- Pick creators whose normal videos already get the reaction you want.\n\n[See the full case studies](/case-studies), or [ask us](/contact?type=brand) which creators fit your product."
  },
  {
    "id": "what-does-a-creator-management-agency-do",
    "title": "What does a creator management agency do?",
    "seoTitle": "What Does a Creator Management Agency Do? (And When You Need One)",
    "description": "What a creator management agency actually does for TikTok and Instagram creators: brand deals, rates, contracts and payment, and how to tell if you are ready for one.",
    "category": "For creators",
    "readTime": "4 min read",
    "caseId": "shakhed-sheglam",
    "cover": "/blog-covers/agency.svg",
    "date": "2026-11-15",
    "body": "If brands have started messaging you, you have probably wondered whether you need management. Here is what an agency like ours actually does, and when it is worth it.\n\n### We find the brand deals\n\nMost creators only see the brands that come to them. We pitch our creators to brands every day, so the deals come to you, and they come from brands that fit your content.\n\n### We get you the right rate\n\nCreators often undercharge, especially early on. We know what brands pay for creators with views like yours, because we negotiate those deals all the time.\n\n### We handle the boring parts\n\nBriefs, contracts, usage rights, deadlines, chasing invoices. We deal with the brand so you can focus on making videos.\n\n### We make sure you get paid\n\nLate payments are one of the biggest problems creators tell us about. We chase every invoice and pay you as soon as the brand pays.\n\n### We help you grow\n\nGood management is not only about the next deal. It is about which brands to say no to, so your audience keeps trusting you.\n\n### When are you ready?\n\nYou are probably ready for management if:\n\n- Brands are already messaging you and you are not sure what to charge.\n- Your videos regularly get 100K views or more.\n- Admin is taking time away from making content.\n\n### What to watch out for\n\n- Agencies that charge you a fee to join. Good agencies earn a share of the deals they bring, nothing up front.\n- Long contracts with no way out.\n- Agencies that cannot show you their past campaigns.\n\nOur creators have run campaigns with brands like DarryRing, Gauth, Sheglam and Insta360. [See our roster](/roster), or [apply to join](/contact?type=creator)."
  }
];

export function findStaticPost(id: string) {
  return staticPosts.find((p) => p.id === id);
}
