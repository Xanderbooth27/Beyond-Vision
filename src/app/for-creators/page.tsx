"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { ArrowUpRight, Award, Camera, DollarSign, Megaphone, Rocket, Shield, Store, TrendingUp, Zap } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import { BrandsTicker } from "@/components/BrandsTicker";
import { TalentRosterCarousel } from "@/components/TalentRosterCarousel";
import { Card, StatTile } from "@/components/Card";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Section } from "@/components/Section";
import { getPageContent } from "@/lib/cms";
import { getDb } from "@/lib/firebase";
import {
  buildRosterCreators,
  fetchFirebaseRosterCreators,
  rosterToTalentCards,
} from "@/lib/roster-creators";
import { creatorServices, creatorStats } from "@/lib/spec-data";
import type { TalentCardCreator } from "@/lib/talent-display";

type CreatorTestimonial = {
  id?: string;
  name: string;
  brand: string;
  quote: string;
};

type CreatorService = (typeof creatorServices)[number];
type CreatorStat = (typeof creatorStats)[number];

function filterCreatorStats(stats: CreatorStat[]): CreatorStat[] {
  return stats.filter(
    (stat) =>
      !(
        String(stat.value || "").trim() === "100+" &&
        /signed creator/i.test(String(stat.label || ""))
      )
  );
}

type CreatorPageContent = {
  hero_badge: string;
  hero_title: string;
  hero_text: string;
  cta_text: string;
  about_title: string;
  about_text: string;
  services_list: CreatorService[];
  stats: CreatorStat[];
  why_title: string;
  why_text: string;
};

const serviceIcons = [
  <TrendingUp key="social" size={28} />,
  <Rocket key="career" size={28} />,
  <Shield key="contract" size={28} />,
  <Camera key="appearance" size={28} />,
  <DollarSign key="sales" size={28} />,
  <Megaphone key="pr" size={28} />,
  <Store key="store" size={28} />,
  <Zap key="streaming" size={28} />,
];

const WHY_PREVIEW_PARAGRAPHS = [
  "Creators are driving culture—building audiences, shaping trends, and creating real impact.",
  "But too often, they don't see the full value of what they've built.",
  "Many are left managing everything alone—chasing brand deals, handling conversations, waiting on payments, and trying to turn attention into income without the right support behind them.",
];

const fallbackTestimonials: CreatorTestimonial[] = [
  { name: "@_vcy", brand: "3.5M+ Followers", quote: "I wanted to say thank you for the exceptional job at management. Alone I was barely making social media livable. But with you and Beyond Vision, I've been able to make a living through socials! Love you guys!" },
  { name: "@ayee_shaad", brand: "1.5M+ Followers", quote: "Beyond Vision has been loyal to me for nearly two years now and I'm more stable because of them, honest truth. Thank you!" },
  { name: "@prettyxboi", brand: "3.5M+ Followers", quote: "Beyond Vision is amazing. They don't just bring collabs, they bring in partnerships that last! They're amazing and are great with communication and that's honestly one of the biggest parts as to why I am with them!" },
];

export default function CreatorsLandingPage() {
  const [pageContent, setPageContent] = useState<CreatorPageContent>({
    hero_badge: "Exclusive Talent Management",
    hero_title: "Turn Your Content Into A Career",
    hero_text:
      "Management for creators who need support with campaigns, contracts, scheduling, partner communication, appearances, and long-term growth.",
    cta_text: "Apply to Work With Us",
    about_title: "About Beyond Vision",
    about_text: "Beyond Vision gives creators a team around the business side of influence: brand deals, negotiations, content operations, public appearances, PR, and creator-owned revenue.",
    services_list: creatorServices,
    stats: creatorStats,
    why_title: "Why We Do It",
    why_text:
      "Creators are driving culture—building audiences, shaping trends, and creating real impact. But too often, they don't see the full value of what they've built. Many are left managing everything alone—chasing brand deals, handling conversations, waiting on payments, and trying to turn attention into income without the right support behind them.",
  });
  const [creators, setCreators] = useState<TalentCardCreator[]>(() => rosterToTalentCards(buildRosterCreators([])));
  const [testimonials, setTestimonials] = useState<CreatorTestimonial[]>(fallbackTestimonials);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getPageContent("creators");
        if (data) {
          const next = { ...(data as Partial<CreatorPageContent>) };
          const whyText = String(next.why_text || "").toLowerCase();
          if (
            whyText.includes("but most are not seeing the full value") ||
            whyText.includes("workload behind that attention is heavy")
          ) {
            next.why_text =
              "Creators are driving culture—building audiences, shaping trends, and creating real impact. But too often, they don't see the full value of what they've built. Many are left managing everything alone—chasing brand deals, handling conversations, waiting on payments, and trying to turn attention into income without the right support behind them.";
          }
          setPageContent((prev) => ({ ...prev, ...next }));
        }

        const dbRoster = await fetchFirebaseRosterCreators();
        setCreators(rosterToTalentCards(buildRosterCreators(dbRoster)));

        const testimonialSnap = await getDocs(query(collection(getDb(), "testimonials"), limit(6)));
        const testimonialItems = testimonialSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as CreatorTestimonial & { type?: string }))
          .filter((item) => item.type === "creator" || !item.type);
        if (testimonialItems.length) setTestimonials(testimonialItems);

      } catch (error) {
        console.error("Creator page fallback active:", error);
      }
    };
    fetchContent();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative", overflow: "hidden" }}>
      <AmbientBackground />
      <Navbar />

      <main>
        <section className="section-container section-margin creators-hero" style={{ textAlign: "left", minHeight: "auto", paddingTop: "calc(var(--section-y) + 48px)", paddingBottom: "var(--section-y)" }}>
          <div style={{ maxWidth: "820px" }}>
            <div className="accent-badge" style={{ marginBottom: "1.5rem" }}>
              <Award size={14} />
              {pageContent.hero_badge}
            </div>
            <h1 className="title-xl" style={{ marginBottom: "1.25rem" }}>
              {pageContent.hero_title}
            </h1>
            <p className="description-text" style={{ maxWidth: "640px", marginBottom: "2rem" }}>
              {pageContent.hero_text}
            </p>
            <Link href="/contact?type=creator">
              <button className="btn-primary">{pageContent.cta_text} <ArrowUpRight size={18} /></button>
            </Link>
          </div>
        </section>

        <Section title={pageContent.about_title} subtitle="Creator infrastructure">
          <Card padding="4rem" hover={false}>
            <p style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", lineHeight: 1.35, fontWeight: 900, color: "#fff" }}>
              {pageContent.about_text}
            </p>
          </Card>
        </Section>

        <Section title="What we offer" subtitle="Full-service management">
          <div className="creator-services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1.5rem" }}>
            {(pageContent.services_list?.length ? pageContent.services_list : creatorServices).map((service: CreatorService, index: number) => (
              <Card key={service.title} padding="2rem" style={{ minHeight: "260px", display: "flex", flexDirection: "column" }}>
                <div className="accent-badge-text" style={{ marginBottom: "1rem" }}>
                  {String(index + 1).padStart(2, "0")} / MANAGEMENT
                </div>
                <div style={{ color: "var(--accent)", background: "rgba(255,255,255,0.06)", width: "fit-content", padding: "0.9rem", borderRadius: "14px", marginBottom: "1.5rem", border: "1px solid var(--bv-border)" }}>
                  {serviceIcons[index % serviceIcons.length]}
                </div>
                <h3 style={{ fontSize: "1.3rem", textTransform: "uppercase", marginBottom: "1rem" }}>{service.title}</h3>
                <p className="description-text" style={{ fontSize: "0.98rem" }}>{service.description}</p>
              </Card>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "4rem" }}>
            <Link href="/creators-what-we-offer">
              <button className="btn-secondary">Learn More <ArrowUpRight size={16} /></button>
            </Link>
          </div>
        </Section>

        <Section title="Brands we work with" subtitle="Brand access">
          <BrandsTicker />
        </Section>

        <Section title="Why creators choose us" subtitle="Proof points">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "1.5rem" }}>
            {filterCreatorStats(pageContent.stats?.length ? pageContent.stats : creatorStats).map((stat: CreatorStat) => (
              <StatTile key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </Section>

        <Section title={pageContent.why_title} subtitle="Creator value">
          <Card padding="2.5rem" style={{ textAlign: "left" }} hover={false}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem", maxWidth: "880px", marginBottom: "2rem" }}>
              {WHY_PREVIEW_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph} className="description-text" style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.7, margin: 0 }}>
                  {paragraph}
                </p>
              ))}
            </div>
            <Link href="/creators-why-we-do-it">
              <button className="btn-secondary">View More <ArrowUpRight size={16} /></button>
            </Link>
          </Card>
        </Section>

        <Section title="Featured creators" subtitle="Roster preview" onViewMore={() => { window.location.href = "/roster"; }}>
          <p className="description-text" style={{ maxWidth: 640, marginBottom: "2.5rem", lineHeight: 1.65 }}>
            Creators we work with across TikTok, Instagram, and long-form content—built for brands that care about audience fit and clear deliverables.
          </p>
          <TalentRosterCarousel creators={creators} />
        </Section>


        <Section title="Creator testimonials" subtitle="Creator notes">
          <div className="creator-testimonial-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.5rem", alignItems: "stretch" }}>
            {testimonials.slice(0, 6).map((testimonial) => (
              <Card
                key={`${testimonial.name}-${testimonial.brand}`}
                padding="2rem"
                hover={false}
                style={{ height: "100%", display: "flex", flexDirection: "column" }}
              >
                <p style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: "0 0 2rem", flex: 1 }}>&quot;{testimonial.quote}&quot;</p>
                <div style={{ marginTop: "auto", flexShrink: 0 }}>
                  <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.35rem" }}>{testimonial.name}</h3>
                  <p style={{ color: "var(--bv-muted)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{testimonial.brand}</p>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <section className="section-container" style={{ paddingTop: 0, paddingBottom: "5rem" }}>
          <Card padding="3rem" hover={false} style={{ display: "flex", justifyContent: "space-between", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div className="accent-badge-text" style={{ marginBottom: "1rem" }}>NEXT STEPS</div>
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "-0.04em" }}>Ready To Grow?</h2>
            </div>
            <Link href="/contact?type=creator">
              <button className="btn-primary">{pageContent.cta_text} <ArrowUpRight size={18} /></button>
            </Link>
          </Card>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        @media (max-width: 1180px) {
          .creator-services-grid,
          .creator-testimonial-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 680px) {
          .creators-hero {
            padding-top: 8rem !important;
          }
          .creator-services-grid,
          .creator-testimonial-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
