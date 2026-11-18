import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DetailFrame, MoreCard } from "@/components/DetailPage";
import PostBody from "@/components/PostBody";
import { findStaticPost, staticPosts } from "@/lib/blog-static";
import { pageMeta, SITE_URL } from "@/lib/seo";
import BlogPostClient from "./BlogPostClient";

// The posts written into the site are built ahead of time; any other id is an
// older post from the admin's database and loads in the browser as before.
export function generateStaticParams() {
  return staticPosts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = findStaticPost((await params).id);
  if (!p) return {};
  const m = pageMeta(`/blog/${p.id}`, p.seoTitle, p.description);
  return { ...m, title: { absolute: p.seoTitle }, openGraph: { ...m.openGraph, type: "article", title: p.seoTitle, images: [{ url: p.cover, width: 1200, height: 900, alt: p.title }] } };
}

const longDate = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const p = findStaticPost((await params).id);
  if (!p) return <BlogPostClient />;
  const others = staticPosts.filter((o) => o.id !== p.id);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    image: `${SITE_URL}${p.cover}`,
    author: { "@type": "Organization", name: "Beyond Vision" },
    publisher: { "@type": "Organization", name: "Beyond Vision", logo: `${SITE_URL}/logo_main.jpg` },
    mainEntityOfPage: `${SITE_URL}/blog/${p.id}`,
  };

  return (
    <DetailFrame>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/blog" className="dp-back">← All posts</Link>
      <article>
        <div className="accent-badge" style={{ marginBottom: "1.25rem" }}>
          <span className="accent-badge-dot" />
          {p.category}
        </div>
        <h1 className="title-xl" style={{ marginBottom: "0.9rem", maxWidth: "22ch" }}>{p.title}</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2.2rem", fontSize: "0.9rem" }}>Beyond Vision, {longDate(p.date)}</p>
        <PostBody body={p.body} />
        <div className="dp-links" style={{ marginTop: "2rem" }}>
          <Link href={p.category === "For creators" ? "/contact?type=creator" : "/contact?type=brand"}>
            <button className="btn-primary" style={{ padding: "1rem 2rem" }}>
              {p.category === "For creators" ? "Apply to join" : "Plan a campaign"} <ArrowUpRight size={18} />
            </button>
          </Link>
        </div>
      </article>

      <section className="dp-more">
        <h2>More from the blog</h2>
        <div className="dp-grid">
          {others.map((o) => (
            <MoreCard key={o.id} href={`/blog/${o.id}`} title={o.title} sub={o.category} />
          ))}
        </div>
      </section>
    </DetailFrame>
  );
}
