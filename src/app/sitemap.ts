import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "@/lib/seo";
import { caseStudies, rosterCreators } from "@/lib/public-pages";
import { staticPosts } from "@/lib/blog-static";

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
  const posts: MetadataRoute.Sitemap = staticPosts.map((p) => ({ url: `${SITE_URL}/blog/${p.id}`, lastModified: new Date(p.date + "T12:00:00Z"), changeFrequency: "monthly", priority: 0.7 }));
  return [...main, ...posts, ...cases, ...creators];
}
