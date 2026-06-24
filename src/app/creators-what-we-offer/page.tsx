"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowUpRight, BadgeDollarSign, BriefcaseBusiness, Handshake, Layers, Store, Users, Zap } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/Card";
import { Section } from "@/components/Section";
import { getPageContent } from "@/lib/cms";

const offerSections = [
  {
    title: "High-Value Brand Deals, Without the Hassle",
    icon: <Handshake size={34} />,
    body: "We manage your entire brand deal pipeline from start to finish.",
    points: [
      "We run your inbox and handle all brand communication",
      "You get full visibility with access when needed",
      "We negotiate and secure long-term, high-value partnerships",
      "We leverage our network to open doors you would not get alone",
      "We prioritise repeat deals - not one-offs",
      "You do not chase deals - we bring them to you.",
    ],
  },
  {
    title: "Get Paid Immediately",
    icon: <BadgeDollarSign size={34} />,
    body: "Once a deal is confirmed, we pay you upfront - often within 24 hours - before the brand even pays us. No delays. No chasing invoices. Just consistent cash flow.",
    points: [],
  },
  {
    title: "Your Own Store - Fully Managed",
    icon: <Store size={34} />,
    body: "We build and operate your creator store from the ground up.",
    points: [
      "You choose a niche or product direction",
      "We handle sourcing, suppliers, and logistics",
      "We cover upfront costs and operational fees",
      "We test products, samples, and designs",
      "We manage the entire backend",
      "You focus on your brand - we build the business behind it.",
    ],
  },
  {
    title: "Built for Long-Term Income",
    icon: <Layers size={34} />,
    body: "This is not short-term cash - it is long-term growth.",
    points: [
      "Long-term brand partnerships",
      "Recurring income streams",
      "Strategic career direction",
      "Scalable monetisation systems",
    ],
  },
  {
    title: "Access to the Right Rooms",
    icon: <Users size={34} />,
    body: "Our network gives you access to brands, opportunities, and deals that most creators never see. We position you where it matters - in front of decision-makers.",
    points: [],
  },
  {
    title: "How It Works",
    icon: <BriefcaseBusiness size={34} />,
    body: "Ready to turn your content into a business? Apply to work with us or book a call to get started.",
    points: [
      "We onboard and understand your brand",
      "We take over deal flow, outreach, and operations",
      "You receive opportunities, income, and growth - without the stress",
    ],
  },
];

type OfferSection = {
  title: string;
  icon: ReactNode;
  body: string;
  points: string[] | string;
};

type CreatorsOfferContent = {
  hero_badge: string;
  hero_title: string;
  hero_text: string;
  cta_text: string;
  section_title: string;
  section_subtitle: string;
  offer_sections: OfferSection[];
};

export default function CreatorsWhatWeOfferPage() {
  const [pageContent, setPageContent] = useState<CreatorsOfferContent>({
    hero_badge: "Creator Infrastructure",
    hero_title: "We Turn Creators Into Scalable Brands",
    hero_text: "From brand deals to owned revenue streams - we handle everything behind the scenes so you can focus on creating.",
    cta_text: "Apply to Work With Us",
    section_title: "What We Do For Creators",
    section_subtitle: "Full offer",
    offer_sections: offerSections,
  });

  useEffect(() => {
    getPageContent("creators-what-we-offer").then((data) => {
      if (!data) return;
      const next = { ...data };
      if (String(next.section_subtitle || "").toUpperCase() === "FULL_PAGE_OFFER") {
        next.section_subtitle = "Full offer";
      }
      setPageContent((prev) => ({ ...prev, ...next }));
    });
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative", overflow: "hidden" }}>
      <AmbientBackground />
      <Navbar />

      <section className="section-container creators-offer-hero" style={{ minHeight: "78vh", display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: "980px" }}>
          <div className="accent-badge" style={{ marginBottom: "2rem" }}>
            <Zap size={14} />
            {pageContent.hero_badge}
          </div>
          <h1 className="title-xl" style={{ marginBottom: "1.25rem" }}>
            {pageContent.hero_title}
          </h1>
          <p className="description-text" style={{ maxWidth: "760px", fontSize: "1.25rem", marginBottom: "3rem" }}>
            {pageContent.hero_text}
          </p>
          <Link href="/contact?type=creator">
            <button className="btn-primary">
              {pageContent.cta_text} <ArrowUpRight size={18} />
            </button>
          </Link>
        </div>
      </section>

      <Section title={pageContent.section_title} subtitle={pageContent.section_subtitle}>
        <div className="creators-offer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
          {(pageContent.offer_sections?.length ? pageContent.offer_sections : offerSections).map((section: OfferSection) => (
            <Card key={section.title} padding="3rem">
              <div style={{ color: "var(--accent)", marginBottom: "1.5rem" }}>{section.icon}</div>
              <h2 style={{ fontSize: "1.5rem", textTransform: "uppercase", marginBottom: "1.5rem", lineHeight: 1 }}>
                {section.title}
              </h2>
              <p className="description-text" style={{ fontSize: "1rem", marginBottom: section.points.length ? "1.5rem" : 0 }}>
                {section.body}
              </p>
              {parsePoints(section.points).length > 0 && (
                <div style={{ display: "grid", gap: "0.9rem" }}>
                  {parsePoints(section.points).map((point) => (
                    <div key={point} style={{ display: "flex", gap: "0.8rem", color: "rgba(255,255,255,0.68)", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--accent)", fontWeight: 900 }}>/</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
        <div style={{ marginTop: "clamp(2.5rem, 4vw, 4rem)" }}>
          <Link href="/roster" style={{ textDecoration: "none", display: "block" }}>
            <Card
              padding="2rem"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1.5rem",
                flexWrap: "wrap",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.15rem)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  color: "#fff",
                }}
              >
                View Creators that we work with
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--accent)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Roster <ArrowUpRight size={18} />
              </span>
            </Card>
          </Link>
        </div>
      </Section>

      <Footer />
      <style jsx>{`
        @media (max-width: 640px) {
          .creators-offer-hero {
            min-height: auto !important;
            padding-top: 8rem !important;
          }
          .creators-offer-hero p {
            font-size: 1rem !important;
            margin-bottom: 2rem !important;
          }
          .creators-offer-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
        }
      `}</style>
    </main>
  );
}

function parsePoints(points: string[] | string | undefined) {
  if (Array.isArray(points)) return points;
  if (typeof points === "string") return points.split("\n").map((point) => point.trim()).filter(Boolean);
  return [];
}
