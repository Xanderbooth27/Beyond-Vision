"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import AboutMarquee from "@/components/AboutMarquee";
import AmbientBackground from "@/components/AmbientBackground";
import { BrandsTicker } from "@/components/BrandsTicker";
import { Card } from "@/components/Card";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Section } from "@/components/Section";
import { teamPlaceholders } from "@/lib/spec-data";
import { getPageContent } from "@/lib/cms";
import type { TeamMember } from "@/lib/team-members";

type AboutPageContent = {
  hero_badge: string;
  hero_title: string;
  hero_text: string;
  about_title: string;
  about_paragraphs: string[];
  philosophy_title: string;
  philosophy_quote: string;
  philosophy_text: string;
  mission_title: string;
  mission_text: string;
  team: TeamMember[];
};

export default function AboutPage() {
  const [pageContent, setPageContent] = useState<AboutPageContent>({
    hero_badge: "Who We Are",
    hero_title: "About Beyond Vision",
    hero_text:
      "We believe in \"Looking Beyond the Vision\" - surpassing expectations, unlocking opportunities, and redefining what success looks like. We don't just help you achieve your goals; we help you evolve them.",
    about_title: "About Beyond Vision",
    about_paragraphs: [
      "Beyond Vision manages the business around digital talent: brand partnerships, contract support, content operations, public appearances, PR, and long-term career positioning.",
      "For brands, we provide creator access, campaign planning, negotiation support, partner communication, approvals, posting schedules, and reporting.",
      "Since launching in March 2022, Beyond Vision has supported creators and brand partners across the United Kingdom, the United States, and global campaign markets.",
    ],
    philosophy_title: "Our Philosophy",
    philosophy_quote: "",
    philosophy_text:
      "From concept to completion, we handle every stage of your campaign. This includes talent sourcing, negotiations, creative direction, content approvals, timelines, and performance reporting. Our hands-on approach ensures campaigns run smoothly and deliver against clear KPIs.",
    mission_title: "Why Brands Choose Beyond Vision",
    mission_text:
      "We don't believe in cookie-cutter campaigns. Every brand we work with receives a bespoke strategy, a dedicated team, and a partnership mindset focused on growth, trust, and long-term success to successfully generate ROI every campaign.",
    team: teamPlaceholders,
  });
  useEffect(() => {
    getPageContent("about").then((data) => {
      if (data) {
        setPageContent((prev) => {
          const next = { ...prev, ...data };
          const heroText = String(next.hero_text || "").toLowerCase();
          if (
            heroText.includes("reach new heights") ||
            heroText.includes("creator management and brand partnership")
          ) {
            next.hero_text =
              "We believe in \"Looking Beyond the Vision\" - surpassing expectations, unlocking opportunities, and redefining what success looks like. We don't just help you achieve your goals; we help you evolve them.";
          }
          const philosophyQuote = String(next.philosophy_quote || "").toLowerCase();
          const philosophyText = String(next.philosophy_text || "").toLowerCase();
          if (
            philosophyQuote.includes("audience trust") ||
            philosophyText.includes("growth only compounds")
          ) {
            next.philosophy_quote = "";
            next.philosophy_text =
              "From concept to completion, we handle every stage of your campaign. This includes talent sourcing, negotiations, creative direction, content approvals, timelines, and performance reporting. Our hands-on approach ensures campaigns run smoothly and deliver against clear KPIs.";
          }
          const missionText = String(next.mission_text || "").toLowerCase();
          if (
            missionText.includes("transforms audiences") ||
            missionText.includes("help creators protect their time") ||
            String(next.mission_title || "").toLowerCase() === "why we do it"
          ) {
            next.mission_title = "Why Brands Choose Beyond Vision";
            next.mission_text =
              "We don't believe in cookie-cutter campaigns. Every brand we work with receives a bespoke strategy, a dedicated team, and a partnership mindset focused on growth, trust, and long-term success to successfully generate ROI every campaign.";
          }
          return next;
        });
      }
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative", overflow: "hidden" }}>
      <AmbientBackground />
      <Navbar />

      <main>
        <section
          className="home-hero about-hero section-margin"
          style={{
            minHeight: "clamp(720px, 88vh, 960px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="home-hero-grid-slot about-hero-grid-slot">
            <AboutMarquee />
          </div>

          <div
            className="section-container home-hero-content home-hero-layout about-hero-content"
            style={{
              position: "relative",
              zIndex: 2,
              paddingTop: "clamp(6rem, 12vh, 8rem)",
              paddingBottom: "clamp(4rem, 9vh, 6rem)",
            }}
          >
            <div className="home-hero-copy about-hero-copy-panel">
              <div className="accent-badge" style={{ marginBottom: "1.25rem", backdropFilter: "blur(20px)" }}>
                <span className="accent-badge-dot" />
                {pageContent.hero_badge}
              </div>
              <h1 className="title-xl" style={{ marginBottom: "1.1rem", maxWidth: "100%" }}>
                {pageContent.hero_title}
              </h1>
              <p
                className="description-text about-hero-subtext"
                style={{
                  color: "var(--bv-muted)",
                  fontSize: "clamp(0.9rem, 1vw, 0.98rem)",
                  lineHeight: 1.6,
                }}
              >
                {pageContent.hero_text}
              </p>
            </div>
          </div>
        </section>

        <Section title={pageContent.about_title} subtitle="Global partner">
          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "2rem", alignItems: "stretch" }} className="about-copy-grid">
            <Card padding="4rem" hover={false}>
              {(pageContent.about_paragraphs || []).map((paragraph: string, index: number) => (
                <p key={index} className="description-text" style={{ color: index === 0 ? "rgba(255,255,255,0.82)" : undefined, marginBottom: index === pageContent.about_paragraphs.length - 1 ? 0 : "1.5rem" }}>
                  {paragraph}
                </p>
              ))}
            </Card>
            <Card padding="3rem">
              <h2 className="title-md" style={{ marginBottom: "1.25rem", color: "var(--bv-text)" }}>{pageContent.philosophy_title}</h2>
              {String(pageContent.philosophy_quote || "").trim() ? (
                <p style={{ fontSize: "clamp(1.15rem, 2vw, 1.35rem)", color: "#fff", fontWeight: 800, lineHeight: 1.25, marginBottom: "1.25rem" }}>
                  &quot;{pageContent.philosophy_quote}&quot;
                </p>
              ) : null}
              <p className="description-text" style={{ lineHeight: 1.65 }}>
                {pageContent.philosophy_text}
              </p>
            </Card>
          </div>
        </Section>

        <section className="section-container about-impact-section" style={{ paddingTop: "2rem", paddingBottom: "5rem", position: "relative", zIndex: 10 }}>
          <div className="about-impact-card" style={{ borderRadius: "32px", border: "1px solid rgba(255,255,255,0.08)", background: "var(--bv-surface)", overflow: "hidden" }}>
            <div className="about-impact-inner" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: "3rem", padding: "clamp(2rem, 5vw, 4rem)", alignItems: "center" }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>Mission</div>
                <h2 className="section-title" style={{ marginBottom: "1.25rem" }}>{pageContent.mission_title}</h2>
                <Link href="/recent-campaigns">
                  <button className="btn-primary about-campaign-btn" style={{ width: "fit-content" }}>
                    Check Out Some of Our Recent Campaigns <ArrowUpRight size={18} />
                  </button>
                </Link>
              </div>
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "clamp(1rem, 1.8vw, 1.28rem)", lineHeight: 1.75, fontWeight: 700, margin: 0 }}>
                {pageContent.mission_text}
              </p>
            </div>
          </div>

          <div className="about-brands-block" style={{ marginTop: "2rem" }}>
            <BrandsTicker label="Brands we've worked with" />
          </div>
        </section>

      </main>
      <Footer />

      <style jsx>{`
        @media (max-width: 1024px) {
          .about-hero {
            min-height: clamp(620px, 86svh, 760px) !important;
          }

          .about-hero-grid-slot {
            inset: 0 !important;
            left: 0 !important;
            right: 0 !important;
            position: absolute !important;
            height: auto !important;
            margin-bottom: 0 !important;
            opacity: 0.32;
          }

          .about-hero-grid-slot::before {
            background:
              linear-gradient(to right, var(--bv-bg-deep) 0%, transparent 18%, transparent 82%, var(--bv-bg-deep) 100%),
              linear-gradient(to bottom, var(--bv-bg-deep) 0%, rgba(19, 19, 19, 0.38) 18%, rgba(19, 19, 19, 0.82) 72%, var(--bv-bg-deep) 100%) !important;
          }

          .about-hero-grid-slot::after {
            background: radial-gradient(ellipse 72% 48% at 50% 56%, rgba(8, 9, 10, 0.9) 0%, rgba(8, 9, 10, 0.62) 44%, transparent 74%) !important;
          }

          .about-hero .home-hero-layout {
            grid-template-columns: 1fr !important;
          }

          .about-copy-grid {
            grid-template-columns: 1fr !important;
          }
          .about-impact-inner {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .about-hero {
            min-height: auto !important;
          }

          .about-hero-grid-slot {
            display: none !important;
          }

          .about-hero-content {
            padding-top: 8rem !important;
            padding-bottom: 5rem !important;
          }

          .about-hero-copy-panel {
            padding: 0 !important;
          }

          .about-impact-section {
            padding-top: 1rem !important;
          }
          .about-campaign-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          a[href^="mailto:"] {
            overflow-wrap: anywhere;
          }
        }
      `}</style>
    </div>
  );
}
