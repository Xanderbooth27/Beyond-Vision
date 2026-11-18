// One landing page (influencer marketing agency UK, TikTok agency, talent
// management). Copy lives in lib/landing-pages.ts.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { DetailFrame, MoreCard } from "@/components/DetailPage";
import PostBody from "@/components/PostBody";
import { findLanding } from "@/lib/landing-pages";
import { caseStudies, creatorImage, rosterCreators } from "@/lib/public-pages";
import { pageMeta } from "@/lib/seo";

export function landingMeta(id: string): Metadata {
  const p = findLanding(id);
  if (!p) return {};
  const m = pageMeta(`/${p.id}`, p.seoTitle, p.description);
  return { ...m, title: { absolute: p.seoTitle } };
}

export function LandingView({ id }: { id: string }) {
  const p = findLanding(id);
  if (!p) notFound();
  const button = (
    <Link href={p.ctaHref}>
      <button className="btn-primary" style={{ padding: "1rem 2rem" }}>
        {p.ctaLabel} <ArrowUpRight size={18} />
      </button>
    </Link>
  );
  return (
    <DetailFrame>
      <div className="accent-badge" style={{ marginBottom: "1.25rem" }}>
        <span className="accent-badge-dot" />
        {p.forCreators ? "For creators" : "For brands"}
      </div>
      <h1 className="title-xl" style={{ marginBottom: "1.5rem", maxWidth: "20ch" }}>{p.title}</h1>
      <PostBody body={p.body} />
      <div className="dp-links" style={{ marginTop: "2rem" }}>{button}</div>

      <section className="dp-more">
        <h2>{p.forCreators ? "Creators on our roster" : "Recent case studies"}</h2>
        <div className="dp-grid">
          {p.forCreators
            ? rosterCreators.slice(0, 10).map((r) => <MoreCard key={r.id} href={`/roster/${r.id}`} title={r.name} sub={`${r.followers} followers`} img={creatorImage(r)} />)
            : caseStudies.map((c) => <MoreCard key={c.id} href={`/case-studies/${c.id}`} title={`${c.brand} x ${c.creator}`} sub={`${c.metrics.views} views`} />)}
        </div>
      </section>
    </DetailFrame>
  );
}
