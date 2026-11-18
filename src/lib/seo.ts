import type { Metadata } from "next";

// The one real address of the site. The apex redirects to www, so every
// canonical link and sitemap entry uses www.
export const SITE_URL = "https://www.beyondvisionltd.org";

export const OG_IMAGE = { url: "/logo_main.jpg", width: 1080, height: 1080, alt: "Beyond Vision logo" };

// Google title, description and canonical for one page. Pages are client
// components, so each route folder has a small layout.tsx that exports this.
// absolute: for pages under a folder whose layout sets its own title (the
// " | Beyond Vision" ending is then added here, not by the root template).
export function pageMeta(path: string, title: string, description: string, absolute = false): Metadata {
  return {
    title: absolute ? { absolute: `${title} | Beyond Vision` } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: "Beyond Vision", locale: "en_GB", title: `${title} | Beyond Vision`, description, url: path, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: `${title} | Beyond Vision`, description, images: [OG_IMAGE.url] },
  };
}

// Every public page, for the sitemap.
export const PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/brands", priority: 0.9 },
  { path: "/for-creators", priority: 0.9 },
  { path: "/case-studies", priority: 0.8 },
  { path: "/roster", priority: 0.8 },
  { path: "/recent-campaigns", priority: 0.7 },
  { path: "/what-we-do", priority: 0.7 },
  { path: "/about-us", priority: 0.6 },
  { path: "/contact", priority: 0.6 },
  { path: "/creators-what-we-offer", priority: 0.6 },
  { path: "/creators-why-we-do-it", priority: 0.5 },
  { path: "/work", priority: 0.5 },
  { path: "/blog", priority: 0.5 },
];
