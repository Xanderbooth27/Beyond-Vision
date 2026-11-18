import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "@/lib/seo";
import { caseStudies, rosterCreators } from "@/lib/public-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const main: MetadataRoute.Sitemap = PAGES.map((p) => ({
    url: `${SITE_URL}${p.path === "/" ? "" : p.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p.priority,
  }));
  const cases: MetadataRoute.Sitemap = caseStudies.map((c) => ({ url: `${SITE_URL}/case-studies/${c.id}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 }));
  const creators: MetadataRoute.Sitemap = rosterCreators.map((r) => ({ url: `${SITE_URL}/roster/${r.id}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 }));
  return [...main, ...cases, ...creators];
}
