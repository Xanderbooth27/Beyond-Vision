// One landing page (influencer marketing agency UK, TikTok agency, talent
// management). Copy lives in lib/landing-pages.ts.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { DetailFrame, MoreCard } from "@/components/DetailPage";
import PostBody from "@/components/PostBody";
import { findLanding } from "@/lib/landing-pages";
import { caseImage, caseStudies, creatorImage, rosterCreators } from "@/lib/public-pages";
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

      {p.faqs.length > 0 && (
        <section className="dp-more lp-faq">
          {/* FAQPage data lets Google show these as drop-downs in results. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: p.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
              }),
            }}
          />
          <h2>Questions</h2>
          {p.faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
          <style>{`
            .lp-faq { max-width: 68ch; }
            .lp-faq details { border-bottom: 1px solid rgba(255,255,255,0.1); padding: 1rem 0; }
            .lp-faq summary { cursor: pointer; font-weight: 700; color: #fff; list-style: none; display: flex; justify-content: space-between; gap: 1rem; }
            .lp-faq summary::-webkit-details-marker { display: none; }
            .lp-faq summary::after { content: "+"; color: var(--accent); font-size: 1.3rem; line-height: 1; }
            .lp-faq details[open] summary::after { content: "-"; }
            .lp-faq p { color: rgba(255,255,255,0.75); line-height: 1.7; margin-top: 0.6rem; }
          `}</style>
        </section>
      )}

      <section className="dp-more">
        <h2>{p.forCreators ? "Creators on our roster" : "Recent case studies"}</h2>
        <div className="dp-grid">
          {p.forCreators
            ? rosterCreators.slice(0, 10).map((r) => <MoreCard key={r.id} href={`/roster/${r.id}`} title={r.name} sub={`${r.followers} followers`} img={creatorImage(r)} />)
            : caseStudies.map((c) => <MoreCard key={c.id} href={`/case-studies/${c.id}`} title={`${c.brand} x ${c.creator}`} sub={`${c.metrics.views} views`} img={caseImage(c)} thumb />)}
        </div>
      </section>
    </DetailFrame>
  );
}
