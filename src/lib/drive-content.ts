export type DriveCaseStudy = {
  id: string;
  creator: string;
  brand: string;
  category: string;
  year: string;
  driveFileId: string;
  tiktokUrl: string;
  metrics: {
    views: string;
    likes: string;
    comments: string;
    engagement: string;
  };
};

export type DriveCreator = {
  id: string;
  name: string;
  followers: string;
  driveFileId: string;
  tiktokUrl?: string;
  instagramUrl?: string;
};

export type DriveCampaignContent = {
  id: string;
  title: string;
  creator: string;
  brand: string;
  month: string;
  year: string;
  /** Legacy Google Drive file id (migration / optional fallback link). */
  driveFileId?: string;
  thumbnail: string;
  /** Cloudflare R2 public URL after migration; overrides default campaigns/{id}.mp4 path. */
  videoUrl?: string;
  /** The live post (TikTok / YouTube). Cards with no R2 video open this instead. */
  postUrl?: string;
};

/** Public R2 base (no trailing slash). Set NEXT_PUBLIC_R2_PUBLIC_URL in .env.local */
export function getR2PublicUrl() {
  const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").trim().replace(/\/$/, "");
  return base.startsWith("http") ? base : "";
}

/** R2 object key for a campaign video. */
export function campaignR2Key(id: string) {
  return `campaigns/${id}.mp4`;
}

/** Resolved playback URL for in-site VideoPlayer. */
export function campaignPlaybackUrl(campaign: DriveCampaignContent): string | undefined {
  if (campaign.videoUrl) return campaign.videoUrl;
  // Live-post cards have no file on R2; they open the post itself.
  if (campaign.postUrl) return undefined;
  const base = getR2PublicUrl();
  if (!base) return undefined;
  return `${base}/${campaignR2Key(campaign.id)}`;
}

/** Resolved playback URL for case-study videos on R2. */
export function caseStudyPlaybackUrl(caseStudy: DriveCaseStudy): string | undefined {
  const base = getR2PublicUrl();
  if (!base) return undefined;
  return `${base}/${campaignR2Key(caseStudy.id)}`;
}

export function drivePreviewUrl(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function driveOpenUrl(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function driveThumbnailUrl(fileId: string, size = 1000) {
  const caseItem = driveCaseStudies.find((item) => item.driveFileId === fileId);
  if (caseItem) return `/drive-content/cases/${caseItem.id}.png`;

  const creatorItem = driveCreators.find((item) => item.driveFileId === fileId);
  if (creatorItem) return `/drive-content/creators/${creatorItem.id}.png`;

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

/**
 * Manual workflow for new videos:
 * 1. Upload MP4 to R2 as campaigns/{id}.mp4 (or run scripts/migrate-drive-campaigns-to-r2.mjs)
 * 2. Add row below with id, metadata, thumbnail under public/drive-content/campaign-content/
 * 3. Optional videoUrl override if the R2 key differs from campaigns/{id}.mp4
 */
export const driveCampaignContent: DriveCampaignContent[] = [
  // Completed campaigns from the manual sheet, best two per brand by views (2026-11-17).
  {
    id: "xero-phantom-blade-zero",
    title: "Xero x Phantom Blade Zero",
    creator: "Xero",
    brand: "Phantom Blade Zero",
    month: "October",
    year: "2026",
    thumbnail: "/drive-content/campaign-content/xero-phantom-blade-zero.jpg",
    postUrl: "https://www.tiktok.com/@yexero/video/7691259616121933087",
  },
  {
    id: "ayeeshaad-gauth",
    title: "AyeeShaad x Gauth",
    creator: "AyeeShaad",
    brand: "Gauth",
    month: "August",
    year: "2026",
    thumbnail: "/drive-content/campaign-content/ayeeshaad-gauth.jpg",
    postUrl: "https://www.tiktok.com/@ayee_shaad/video/7672895859633212686",
  },
  {
    id: "ayeeshaad-darryring",
    title: "AyeeShaad x DarryRing",
    creator: "AyeeShaad",
    brand: "DarryRing",
    month: "October",
    year: "2026",
    thumbnail: "/drive-content/campaign-content/ayeeshaad-darryring.jpg",
    postUrl: "https://www.tiktok.com/@ayee_shaad/video/7699694133870464270",
  },
  {
    id: "flyguycarter-facemoji",
    title: "Flyguycarter x Facemoji",
    creator: "Flyguycarter",
    brand: "Facemoji",
    month: "September",
    year: "2026",
    thumbnail: "/drive-content/campaign-content/flyguycarter-facemoji.jpg",
    postUrl: "https://www.youtube.com/watch?v=QNcB7YuElPg",
  },
  {
    id: "sizebysize-halara",
    title: "Sizebysize x Halara",
    creator: "Sizebysize",
    brand: "Halara",
    month: "August",
    year: "2026",
    thumbnail: "/drive-content/campaign-content/sizebysize-halara.jpg",
    postUrl: "https://www.youtube.com/watch?v=LEkt3cTd7os",
  },
  {
    id: "ntswitches-exitlag",
    title: "Ntswitches x ExitLag",
    creator: "Ntswitches",
    brand: "ExitLag",
    month: "August",
    year: "2026",
    thumbnail: "/drive-content/campaign-content/ntswitches-exitlag.jpg",
    postUrl: "https://www.youtube.com/watch?v=fihcssC0gwo",
  },
  {
    id: "nikscopes-polybuzz",
    title: "Nikscopes x PolyBuzz",
    creator: "Nikscopes",
    brand: "PolyBuzz",
    month: "July",
    year: "2026",
    thumbnail: "/drive-content/campaign-content/nikscopes-polybuzz.jpg",
    postUrl: "https://www.tiktok.com/@nikscopes/video/7660579415188835615",
  },
  {
    id: "may-img-2330-a",
    title: "Campaign Upload",
    creator: "Creator",
    brand: "May Campaign",
    month: "May",
    year: "2026",
    driveFileId: "16v-RqKnioEP7Cg0Diw3-xxffujwt03xL",
    thumbnail: "/drive-content/campaign-content/may-img-2330-a.png",
  },
  {
    id: "may-img-2330-b",
    title: "Campaign Upload",
    creator: "Creator",
    brand: "May Campaign",
    month: "May",
    year: "2026",
    driveFileId: "1ggnogfUZexuFR2yPshTTr4pYmdBNwWHM",
    thumbnail: "/drive-content/campaign-content/may-img-2330-b.png",
  },
  {
    id: "ayeeshaad-emochi",
    title: "AyeeShaad x Emochi",
    creator: "AyeeShaad",
    brand: "Emochi",
    month: "May",
    year: "2026",
    driveFileId: "16P_-WcPwK3LjcCvjbiGYrWlUIilb4OoF",
    thumbnail: "/drive-content/campaign-content/ayeeshaad-emochi.png",
  },
  {
    id: "patrick-minor-pet-live",
    title: "Patrick Minor x Pet Live",
    creator: "Patrick Minor",
    brand: "Pet Live",
    month: "May",
    year: "2026",
    driveFileId: "1fdXvK9WPxUGXVi7W0ENuhDr5D-iPamsC",
    thumbnail: "/drive-content/campaign-content/patrick-minor-pet-live.png",
  },
  {
    id: "supercars-temu",
    title: "Supercars x Temu",
    creator: "Supercars",
    brand: "Temu",
    month: "March",
    year: "2026",
    driveFileId: "12REeqzec0D5TFT9yC-ImRor5Td0umMA5",
    thumbnail: "/drive-content/campaign-content/supercars-temu.png",
  },
  {
    id: "studyfairy-terabox",
    title: "Studyfairy x Terabox",
    creator: "Studyfairy",
    brand: "Terabox",
    month: "March",
    year: "2026",
    driveFileId: "1vMS_tECVA8Pcg03P29w_ahOyNU41dC6w",
    thumbnail: "/drive-content/campaign-content/studyfairy-terabox.png",
  },
  {
    id: "ry2ky-shein",
    title: "Ry2ky x Shein",
    creator: "Ry2ky",
    brand: "Shein",
    month: "March",
    year: "2026",
    driveFileId: "1u8OgPdWB_Vh9LPfsx3LAHIGYFUQRuzu7",
    thumbnail: "/drive-content/campaign-content/ry2ky-shein.png",
  },
  {
    id: "ayeeshaad-whiteout-survival",
    title: "AyeeShaad x Whiteout Survival",
    creator: "AyeeShaad",
    brand: "Whiteout Survival",
    month: "March",
    year: "2026",
    driveFileId: "1nhqKHz1nnJRyIDN7VTq9DW72uLo7ZMAi",
    thumbnail: "/drive-content/campaign-content/ayeeshaad-whiteout-survival.png",
  },
  {
    id: "ayeeshaad-duet",
    title: "AyeeShaad x Duet",
    creator: "AyeeShaad",
    brand: "Duet",
    month: "March",
    year: "2026",
    driveFileId: "1WOKFL-tMsMVY9vRYkUP1yxnzgg_EN-as",
    thumbnail: "/drive-content/campaign-content/ayeeshaad-duet.png",
  },
  {
    id: "janette-huckleberry",
    title: "Janette x HuckleBerry",
    creator: "Janette",
    brand: "HuckleBerry",
    month: "February",
    year: "2026",
    driveFileId: "15iY0psygAg7kC5NRusUnaxXJYqEXnk5a",
    thumbnail: "/drive-content/campaign-content/janette-huckleberry.png",
  },
  {
    id: "sandie-vivavideoapp",
    title: "SandieC x VivaVideoApp",
    creator: "SandieC",
    brand: "VivaVideoApp",
    month: "February",
    year: "2026",
    driveFileId: "1ZSHVsN-lq8TIm7K78K2Yr2ZOsex79qcr",
    thumbnail: "/drive-content/campaign-content/sandie-vivavideoapp.png",
  },
  {
    id: "sarai-jones-halara",
    title: "Sarai Jones x Halara",
    creator: "Sarai Jones",
    brand: "Halara",
    month: "February",
    year: "2026",
    driveFileId: "1CeXUP1FAQM22F8saYzKsr68z_1v5XWD4",
    thumbnail: "/drive-content/campaign-content/sarai-jones-halara.png",
  },
  {
    id: "cam-thrifts-ai-stylist",
    title: "Cam Thrifts x AI Stylist",
    creator: "Cam Thrifts",
    brand: "AI Stylist",
    month: "January",
    year: "2026",
    driveFileId: "1lcU9w8EfiMGlHFkl7BxaEgfZILbbdWoO",
    thumbnail: "/drive-content/campaign-content/cam-thrifts-ai-stylist.png",
  },
  {
    id: "ashleykeno-monkey",
    title: "AshleyKeno x Monkey",
    creator: "AshleyKeno",
    brand: "Monkey",
    month: "January",
    year: "2026",
    driveFileId: "157mRJIz3LRrEFemzPe_r_LVWFsitkJ67",
    thumbnail: "/drive-content/campaign-content/ashleykeno-monkey.png",
  },
  {
    id: "br-rm-polybuzz",
    title: "Br.rm x PolyBuzz",
    creator: "Br.rm",
    brand: "PolyBuzz",
    month: "January",
    year: "2026",
    driveFileId: "1WEcfyUPqxuqykaCPyuhmynSvCTg_0iFG",
    thumbnail: "/drive-content/campaign-content/br-rm-polybuzz.png",
  },
  {
    id: "diarra-sylla-i-envy",
    title: "Diarra Sylla x i-ENVY",
    creator: "Diarra Sylla",
    brand: "i-ENVY",
    month: "January",
    year: "2026",
    driveFileId: "1VuQ0i6-79K4lABXRqEACb2PyRA7R-sO4",
    thumbnail: "/drive-content/campaign-content/diarra-sylla-i-envy.png",
  },
  {
    id: "lifeaseva-iclever",
    title: "LifeAsEva x Iclever",
    creator: "LifeAsEva",
    brand: "Iclever",
    month: "January",
    year: "2026",
    driveFileId: "1O_0k-I0-X-2-GFBkHeL96JEOQIVZmtL3",
    thumbnail: "/drive-content/campaign-content/lifeaseva-iclever.png",
  },
];

export const driveCaseStudies: DriveCaseStudy[] = [
  {
    id: "africanamericanfam-darryring",
    creator: "Africanamericanfam",
    brand: "DarryRing",
    category: "Family",
    year: "2025",
    driveFileId: "1tE8-wWdGFmSr5R7JfIhGjfQj_9AhP5I2",
    tiktokUrl: "https://www.tiktok.com/@africanamericanfam/video/7521035194556566789",
    metrics: { views: "6.7M", likes: "620K", comments: "4K", engagement: "650K" },
  },
  {
    id: "ayeeshaad-gauth",
    creator: "AyeeShaad",
    brand: "Gauth",
    category: "Education",
    year: "2025",
    driveFileId: "1o5cKQ26D-k5WTStm2Yc79y-qUGSU_GQ3",
    tiktokUrl: "https://www.tiktok.com/@ayee_shaad/video/7574906051292581175",
    metrics: { views: "11M", likes: "300K", comments: "800", engagement: "330K" },
  },
  {
    id: "brrm-duet",
    creator: "Br.rm",
    brand: "Duet",
    category: "Music",
    year: "2025",
    driveFileId: "1QHVJdke9Q6tX0vUBZzoXlOmyBdi44cqR",
    tiktokUrl: "https://www.tiktok.com/@br.rm/video/7510377601626590507",
    metrics: { views: "1M", likes: "15K", comments: "100", engagement: "20K" },
  },
  {
    id: "c4pr1i-toxic",
    creator: "C4pr1i",
    brand: "Toxic",
    category: "Entertainment",
    year: "2025",
    driveFileId: "17KXnhum4a1PE6uudGDjnQH2cN1LvmFy-",
    tiktokUrl: "https://vm.tiktok.com/ZNRDfN675/",
    metrics: { views: "3M", likes: "130K", comments: "1.2K", engagement: "145K" },
  },
  {
    id: "haidartlass-facemoji",
    creator: "Haidartlass",
    brand: "Facemoji",
    category: "Tech",
    year: "2025",
    driveFileId: "15jgifrS4CjoU_hjhV-W6-W8ZxAOhhx0r",
    tiktokUrl: "https://vm.tiktok.com/ZNdqUDENr/",
    metrics: { views: "1M", likes: "20K", comments: "500", engagement: "30K" },
  },
  {
    id: "shakhed-sheglam",
    creator: "Shakhed",
    brand: "Sheglam",
    category: "Beauty",
    year: "2025",
    driveFileId: "1Swripma3xr400IbYFKk7UkXPS_Qa28uB",
    tiktokUrl: "https://www.tiktok.com/@shakhed/video/7512895120019164438",
    metrics: { views: "600K", likes: "50K", comments: "150", engagement: "55K" },
  },
  {
    id: "shakhed-darryring",
    creator: "Shakhed",
    brand: "DarryRing",
    category: "Beauty",
    year: "2025",
    driveFileId: "1LcoZkZo1kxsbZOvT_k0yTpqFFRkuvyzC",
    tiktokUrl: "https://vm.tiktok.com/ZNdsop2dB/",
    metrics: { views: "1.2M", likes: "80K", comments: "300", engagement: "85K" },
  },
  {
    id: "jrobdarcel-insta360",
    creator: "JrobDarcel",
    brand: "Insta360",
    category: "Tech",
    year: "2024",
    driveFileId: "1j7oE1WjEpFE4XhYrzA0IN4VhcJmk6tUZ",
    tiktokUrl: "https://www.tiktok.com/@jrobdarcel/video/7436176860196850990",
    metrics: { views: "250K", likes: "30K", comments: "500", engagement: "50K" },
  },
  {
    id: "piperrockelle-toxic",
    creator: "PiperRockelle",
    brand: "Toxic",
    category: "Entertainment",
    year: "2025",
    driveFileId: "19hy_7Megx2fNqBu-X_2DePGkJyP2hVON",
    tiktokUrl: "https://www.tiktok.com/@piperrockelle/video/7488115358520429866",
    metrics: { views: "10M", likes: "300K", comments: "3K", engagement: "340K" },
  },
  {
    id: "patrick-minor-olov",
    creator: "Patrick Minor",
    brand: "OLOV",
    category: "Lifestyle",
    year: "2024",
    driveFileId: "1aX-I-gHOcpysCXU89RuG6rcNHnqUzjBZ",
    tiktokUrl: "https://www.tiktok.com/@ayypatrick/video/7442928811622026527",
    metrics: { views: "1.2M", likes: "50K", comments: "50", engagement: "60K" },
  },
];

export const driveCreators: DriveCreator[] = [
  { id: "julia-grop", name: "Julia Grop", followers: "400K", driveFileId: "1ek5Z-a70juZG1XZ_8FIvdoDJHwH_AuTh" },
  { id: "depeet", name: "Depeet", followers: "3.5M", driveFileId: "105xXICP4y2NmUPMUWZ-s6yGOjC25HNZ6", tiktokUrl: "https://www.tiktok.com/@depeet?lang=en-GB", instagramUrl: "https://www.instagram.com/depeettv/" },
  { id: "realglorious", name: "realglorious", followers: "600K", driveFileId: "1FVlNc3vBxqrD5CpgXfN_MQfXBhqOudY6", tiktokUrl: "https://www.tiktok.com/@realgloriouss", instagramUrl: "https://www.instagram.com/realglorious" },
  { id: "queen-cheryl", name: "Queen Cheryl", followers: "5.5M+", driveFileId: "12P863sbuA1hU2nM7TPdoVdYuuDTS05PB", tiktokUrl: "https://www.tiktok.com/@oliver6060", instagramUrl: "https://www.instagram.com/therealoliver6060/?hl=en" },
  { id: "king-quran", name: "King Quran", followers: "3.5M+", driveFileId: "1TJixbM-OJaeRBYGYylYWPEV1fMe9E-ZZ", tiktokUrl: "https://www.tiktok.com/@kingqurannewpage?lang=en", instagramUrl: "https://www.instagram.com/leolove_3/" },
  { id: "wayne-flexo", name: "Wayne Flexo", followers: "5M+", driveFileId: "1dL2Wti3EyaE8hoC_rAsxeviw1TrF0ji3", tiktokUrl: "https://www.tiktok.com/@wayneflexo?lang=en", instagramUrl: "https://www.instagram.com/wayne.fx/" },
  { id: "uhidkuh", name: "Uhidkuh", followers: "1M", driveFileId: "1_hRSutg9Bbe796c-c0Ox2J4eGV5c2l4_", tiktokUrl: "https://www.tiktok.com/@uh.idk.uh", instagramUrl: "https://www.instagram.com/uhidkuh/" },
  { id: "jaden-dunn", name: "Jaden Dunn", followers: "4M", driveFileId: "1Q4_C0WkHrUAINZ7gisopJYY0UaAL8Gvm", tiktokUrl: "https://www.tiktok.com/@jadendunn", instagramUrl: "https://www.instagram.com/jdndunn/" },
  { id: "shafar-sjc", name: "Shafar_sjc", followers: "15M", driveFileId: "13vXG2aA36GcMUo1GDW2IHslil6uD_Oz5", tiktokUrl: "https://www.tiktok.com/@shafar_sjc", instagramUrl: "https://www.instagram.com/shafar_sjc/" },
  { id: "rodrivals", name: "RodRivals", followers: "2.5M", driveFileId: "1sO63kfhz8sR_b72DDuSI15FTxjof1VcN", tiktokUrl: "https://www.tiktok.com/@rodrivals", instagramUrl: "https://www.instagram.com/angelrodrivals" },
  { id: "ohhthatszayy", name: "Ohhthatszayy", followers: "1.4M", driveFileId: "1u-DXCu6Y4jA9ImKZ5pVs01HZnttbTTcg", tiktokUrl: "https://www.tiktok.com/@.thisisnotzay2.0", instagramUrl: "https://www.instagram.com/ohhthats.zayyy_/" },
  { id: "realglorious-500k", name: "RealGlorious", followers: "500K", driveFileId: "18L8GSCnmw-782rT-wGYtbOGjdqfL7r3S", tiktokUrl: "https://www.tiktok.com/@realgloriouss", instagramUrl: "https://www.instagram.com/realglorious" },
  { id: "rafreacts", name: "RafReacts", followers: "3M", driveFileId: "1hHZt9pm03tDcYq_aTVFVBk6Id92De4--", tiktokUrl: "https://www.tiktok.com/@rafreacts", instagramUrl: "https://www.instagram.com/rafreacts/?hl=en" },
  { id: "minicomedian", name: "MiniComedian", followers: "800K", driveFileId: "1xtRqs8D7jzInadvQilwirUiNiK6JYUq5" },
  { id: "laidpodcast", name: "laidpodcast", followers: "500K", driveFileId: "1uw_kdo-YN0Es3J6qy5X-oIXO4ykTdpog", tiktokUrl: "https://www.tiktok.com/@lifeafteridopodcast", instagramUrl: "https://www.instagram.com/lifeafteridopodcast" },
  { id: "joshua-nuka", name: "Joshua Nuka", followers: "400K", driveFileId: "1xErr9cPRgHyIugwueoxyrZdKtcwZESPR", tiktokUrl: "https://www.tiktok.com/@joshua_nuka" },
  { id: "ceo-richie", name: "Ceo Richie", followers: "300K", driveFileId: "1SZHQXaY2Q-Atw4n1fgMlofk68GxUTuLH", tiktokUrl: "https://www.tiktok.com/@ceo_richie", instagramUrl: "https://www.instagram.com/ceo_richie" },
  { id: "famousdebo", name: "FamousDebo", followers: "4M", driveFileId: "1_jRBYnqSetWJPTJCWzeZLPv5Mhdrg7dq", tiktokUrl: "https://www.tiktok.com/@_famousdebo38?lang=en", instagramUrl: "https://www.instagram.com/_famousdebo/?hl=en" },
  { id: "mya-torres", name: "Mya Torres", followers: "2.6M", driveFileId: "16KcKmiHoG5ubQuSOWVCEsQnshCbXxm8T", tiktokUrl: "https://www.tiktok.com/@im.mya", instagramUrl: "https://www.instagram.com/im.myat/?hl=en" },
  { id: "thegrigsbyfamily", name: "TheGrigsbyFamily", followers: "2.8M", driveFileId: "1kEVYCh4jB-H9YUxJMsYf7n0QZvn5_pR0", tiktokUrl: "https://www.tiktok.com/@thegrigsbyfamily", instagramUrl: "https://www.instagram.com/collins_grigsby/" },
  { id: "prettyxboi", name: "Prettyxboi", followers: "4M", driveFileId: "1EEUIirKA3L-jwOtqPAcKm-7dq12R_YGU", tiktokUrl: "https://www.tiktok.com/@prettyxboi?lang=en", instagramUrl: "https://www.instagram.com/ortizxadrian?igshid=NjIwNzIyMDk2Mg%3D%3D" },
  { id: "sauceyaustin", name: "SauceyAustin", followers: "7.8M", driveFileId: "15tO6oju2VMm2V51lfD13CfCCNiNvabtN", tiktokUrl: "https://www.tiktok.com/@saucey_austin?lang=en", instagramUrl: "https://www.instagram.com/gxlden_a.team/" },
  { id: "nikeishalouise", name: "nikeishalouise", followers: "300K", driveFileId: "1F3vVbp42akT14nRarXCtfq9OmbwAfKHb", tiktokUrl: "https://www.tiktok.com/@nikeishalouise", instagramUrl: "https://www.instagram.com/nikeishalouise/?hl=en" },
  { id: "diarra-sylla", name: "Diarra Sylla", followers: "7M", driveFileId: "1kFfNxdVHg3syY72UrL99WGVMmEwXPybt", tiktokUrl: "https://www.tiktok.com/@diarrasyllalofficiel?lang=en", instagramUrl: "https://www.instagram.com/diarrasyllalofficiel/" },
  { id: "ryan-hoffmann", name: "Ryan Hoffmann", followers: "1.2M", driveFileId: "local-ryan-hoffmann", tiktokUrl: "https://www.tiktok.com/@ryxnhxffmxnn" },
  { id: "ayeeshaad", name: "AyeeShaad", followers: "1.4M", driveFileId: "18zhEnFyfXgGsPH-0oc6Pd3o99O8OERkz", tiktokUrl: "https://www.tiktok.com/@ayee_shaad" },
];
