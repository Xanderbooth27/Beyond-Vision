"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Handshake, Layers, ShieldCheck, Target, Zap } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/Card";
import { ExploreProtocolCTA } from "@/components/CTA";
import { getPageContent } from "@/lib/cms";

type ServiceItem = {
  id?: string;
  title: string;
  description: string;
  icon?: string;
};

const defaultServices: ServiceItem[] = [
  {
    id: "01",
    title: "Strategic Influencer Marketing",
    description:
      "We plan creator campaigns around audience fit, deliverables, usage rights, timelines, and measurable outcomes. The goal is the right creator, the right brief, and work audiences trust.",
    icon: "target",
  },
  {
    id: "02",
    title: "End-to-End Campaign Management",
    description:
      "We manage sourcing, negotiation, creative direction, content approvals, timelines, posting windows, partner communication, and performance reporting.",
    icon: "layers",
  },
  {
    id: "03",
    title: "Brand & Talent Partnerships",
    description:
      "We connect brands with creators whose audience, tone, and category make the collaboration feel native, with room to grow beyond one post.",
    icon: "handshake",
  },
  {
    id: "04",
    title: "Content & Creative Strategy",
    description:
      "We shape briefs, hooks, platform angles, and content cadence across TikTok, Instagram, YouTube, Twitch, Snapchat, and X.",
    icon: "zap",
  },
  {
    id: "05",
    title: "Performance-Driven Results",
    description:
      "Influencer marketing should be more than visibility. We track views, engagement quality, conversions, audience response, content usage, and partner learnings.",
    icon: "chart",
  },
  {
    id: "06",
    title: "Why Brands Choose Beyond Vision",
    description:
      "Brands choose Beyond Vision for creator access, clear communication, structured campaign operations, and partnerships built to protect audience trust.",
    icon: "shield",
  },
];

export default function ServicesPage() {
  const [pageContent, setPageContent] = useState({
    hero_badge: "What We Do",
    hero_title: "What We Do",
    hero_text:
      "We manage creator campaigns from brief to live content: talent sourcing, negotiation, creative direction, approvals, posting schedules, partner communication, and reporting.",
    services_list: defaultServices,
  });

  useEffect(() => {
    const fetchContent = async () => {
      const data = await getPageContent("services");
      if (data) {
        setPageContent((prev) => ({
          ...prev,
          ...data,
          services_list: Array.isArray(data.services_list) && data.services_list.length ? data.services_list : defaultServices,
        }));
      }
    };
    fetchContent();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative", overflow: "hidden" }}>
      <AmbientBackground />
      <Navbar />

      <main>
        <section className="section-container what-hero" style={{ paddingTop: "11rem", paddingBottom: "5rem" }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ maxWidth: "980px" }}>
            <div className="accent-badge" style={{ marginBottom: "2rem" }}>
              <span className="accent-badge-dot" />
              {pageContent.hero_badge}
            </div>
            <h1 className="title-xl" style={{ marginBottom: "2rem" }}>
              {pageContent.hero_title}
            </h1>
            <p className="description-text" style={{ maxWidth: "720px" }}>
              {pageContent.hero_text}
            </p>
          </motion.div>
        </section>

        <section className="section-container" style={{ paddingTop: "1rem", paddingBottom: "4rem" }}>
          <div className="services-list" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1.5rem" }}>
            {pageContent.services_list.map((service, index) => (
              <motion.div
                key={`${service.title}-${index}`}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.04 }}
              >
                <Card padding="0" hover={false} style={{ overflow: "hidden" }}>
                  <div className="service-row" style={{ minHeight: "100%", display: "grid", gridTemplateColumns: "72px 1fr", gap: "1.5rem", padding: "2rem", alignItems: "start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
                      <div style={{ width: "58px", height: "58px", borderRadius: "16px", background: "rgba(255,246,117,0.08)", border: "1px solid rgba(255,246,117,0.18)", color: "var(--accent)", display: "grid", placeItems: "center" }}>
                        {renderIcon(service.icon)}
                      </div>
                      <span style={{ color: "var(--accent)", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em" }}>
                        {(service.id || String(index + 1).padStart(2, "0"))} / {index < 3 ? "BRANDS" : "GROWTH"}
                      </span>
                    </div>

                    <div>
                      <h2 style={{ fontSize: "clamp(1.35rem, 2.4vw, 2.25rem)", lineHeight: 1, letterSpacing: "-0.035em", textTransform: "uppercase", marginBottom: "1.1rem" }}>
                        {service.title}
                      </h2>
                      <p className="description-text" style={{ fontSize: "1rem", lineHeight: 1.75, maxWidth: "900px", color: "rgba(255,255,255,0.62)" }}>
                        {service.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="section-container" style={{ paddingTop: "0", paddingBottom: "1rem" }}>
          <ExploreProtocolCTA />
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @media (max-width: 980px) {
          .services-list {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .what-hero {
            padding-top: 8rem !important;
            padding-bottom: 3rem !important;
          }
          .service-row {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}

function renderIcon(icon?: string) {
  const props = { size: 26, strokeWidth: 2.4 };
  switch (icon) {
    case "target":
      return <Target {...props} />;
    case "handshake":
    case "users":
      return <Handshake {...props} />;
    case "zap":
      return <Zap {...props} />;
    case "chart":
      return <BarChart3 {...props} />;
    case "shield":
      return <ShieldCheck {...props} />;
    case "layers":
    default:
      return <Layers {...props} />;
  }
}
