import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { DetailFrame, MoreCard, Stat } from "@/components/DetailPage";
import { caseImage, casesForCreator, creatorImage, findCreator, rosterCreators } from "@/lib/public-pages";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return rosterCreators.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const r = findCreator((await params).id);
  if (!r) return {};
  const m = pageMeta(
    `/roster/${r.id}`,
    `${r.name}: Creator With ${r.followers} Followers`,
    `Book ${r.name} (${r.followers} followers) for TikTok and Instagram brand campaigns through Beyond Vision, a UK creator management agency.`,
    true,
  );
  // Link previews and Google Images show this page's own picture, not the logo.
  return { ...m, openGraph: { ...m.openGraph, images: [{ url: creatorImage(r), alt: r.name }] }, twitter: { ...m.twitter, images: [creatorImage(r)] } };
}

export default async function CreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const r = findCreator((await params).id);
  if (!r) notFound();
  const img = creatorImage(r);
  const cases = casesForCreator(r);
  const others = rosterCreators.filter((o) => o.id !== r.id);
  const platforms = [r.tiktokUrl && "TikTok", r.instagramUrl && "Instagram"].filter(Boolean).join(" and ") || "social";

  return (
    <DetailFrame>
      <Link href="/roster" className="dp-back">← All creators</Link>
      <div className="dp-top">
        <div>
          <div className="accent-badge" style={{ marginBottom: "1.25rem" }}>
            <span className="accent-badge-dot" />
            Beyond Vision roster
          </div>
          <h1 className="title-xl" style={{ marginBottom: "1.25rem" }}>{r.name}</h1>
          <p className="dp-text">
            {r.name} is a {platforms} creator with {r.followers} followers, represented by Beyond Vision for brand
            partnerships. We handle the brief, the rate and the content so brands get a campaign that fits {r.name}&apos;s
            audience.
          </p>
          <div className="dp-stats" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", maxWidth: 420 }}>
            <Stat value={r.followers} label="Followers" />
            <Stat value={String(cases.length || "New")} label={cases.length === 1 ? "Case study" : "Case studies"} />
          </div>
          <div className="dp-links">
            <Link href="/contact?type=brand">
              <button className="btn-primary" style={{ padding: "1rem 2rem" }}>
                Book {r.name} <ArrowUpRight size={18} />
              </button>
            </Link>
            {r.tiktokUrl && (
              <a href={r.tiktokUrl} target="_blank" rel="noopener noreferrer">
                <button className="btn-secondary" style={{ padding: "1rem 2rem", background: "transparent" }}>TikTok</button>
              </a>
            )}
            {r.instagramUrl && (
              <a href={r.instagramUrl} target="_blank" rel="noopener noreferrer">
                <button className="btn-secondary" style={{ padding: "1rem 2rem", background: "transparent" }}>Instagram</button>
              </a>
            )}
          </div>
        </div>
        {img && (
          <div className="dp-media">
            <img src={img} alt={`${r.name}, ${r.followers} follower creator`} />
          </div>
        )}
      </div>

      {cases.length > 0 && (
        <section className="dp-more">
          <h2>Campaigns with {r.name}</h2>
          <div className="dp-grid">
            {cases.map((c) => (
              <MoreCard key={c.id} href={`/case-studies/${c.id}`} title={`${c.brand} x ${c.creator}`} sub={`${c.metrics.views} views`} img={caseImage(c)} thumb />
            ))}
          </div>
        </section>
      )}

      <section className="dp-more">
        <h2>More creators</h2>
        <div className="dp-grid">
          {others.map((o) => (
            <MoreCard key={o.id} href={`/roster/${o.id}`} title={o.name} sub={`${o.followers} followers`} img={creatorImage(o)} />
          ))}
        </div>
      </section>
    </DetailFrame>
  );
}
