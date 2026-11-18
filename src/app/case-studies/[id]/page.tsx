import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { DetailFrame, MoreCard, Stat } from "@/components/DetailPage";
import { caseImage, caseStudies, creatorForCase, engagementRate, findCaseStudy } from "@/lib/public-pages";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = findCaseStudy((await params).id);
  if (!c) return {};
  return pageMeta(
    `/case-studies/${c.id}`,
    `${c.brand} x ${c.creator}: TikTok Campaign Case Study`,
    `How Beyond Vision's ${c.category.toLowerCase()} campaign for ${c.brand} with ${c.creator} reached ${c.metrics.views} views and ${c.metrics.likes} likes on TikTok.`,
    true,
  );
}

export default async function CaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const c = findCaseStudy((await params).id);
  if (!c) notFound();
  const creator = creatorForCase(c);
  const er = engagementRate(c);
  const others = caseStudies.filter((o) => o.id !== c.id);

  return (
    <DetailFrame>
      <Link href="/case-studies" className="dp-back">← All case studies</Link>
      <div className="dp-top">
        <div>
          <div className="accent-badge" style={{ marginBottom: "1.25rem" }}>
            <span className="accent-badge-dot" />
            {c.category} campaign, {c.year}
          </div>
          <h1 className="title-xl" style={{ marginBottom: "1.25rem" }}>
            {c.brand} x {c.creator}
          </h1>
          <p className="dp-text">
            Beyond Vision ran a TikTok campaign for {c.brand} with{" "}
            {creator ? <Link href={`/roster/${creator.id}`}>{c.creator}</Link> : c.creator}
            {creator ? `, a ${creator.followers} follower creator on our roster` : ""}. The video reached{" "}
            {c.metrics.views} views, {c.metrics.likes} likes and {c.metrics.comments} comments
            {er ? `, an engagement rate of about ${er}%` : ""}.
          </p>
          <p className="dp-text">
            We matched {c.brand} with a creator whose audience fits the product, agreed the brief and the rate, and
            managed the content from draft to posting. The numbers below are from the live post.
          </p>
          <div className="dp-stats">
            <Stat value={c.metrics.views} label="Views" />
            <Stat value={c.metrics.likes} label="Likes" />
            <Stat value={c.metrics.comments} label="Comments" />
            <Stat value={er ? `${er}%` : c.metrics.engagement} label={er ? "Engagement rate" : "Engagement"} />
          </div>
          <div className="dp-links">
            <Link href="/contact?type=brand">
              <button className="btn-primary" style={{ padding: "1rem 2rem" }}>
                Run a campaign like this <ArrowUpRight size={18} />
              </button>
            </Link>
            <a href={c.tiktokUrl} target="_blank" rel="noopener noreferrer">
              <button className="btn-secondary" style={{ padding: "1rem 2rem", background: "transparent" }}>
                Watch on TikTok
              </button>
            </a>
          </div>
        </div>
        <a className="dp-media" href={c.tiktokUrl} target="_blank" rel="noopener noreferrer">
          <img src={caseImage(c)} alt={`${c.creator} x ${c.brand} TikTok campaign`} />
          <span>{c.metrics.views} views</span>
        </a>
      </div>

      <section className="dp-more">
        <h2>More case studies</h2>
        <div className="dp-grid">
          {others.map((o) => (
            <MoreCard key={o.id} href={`/case-studies/${o.id}`} title={`${o.brand} x ${o.creator}`} sub={`${o.metrics.views} views, ${o.category}`} />
          ))}
        </div>
      </section>
    </DetailFrame>
  );
}
