"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, HeartHandshake, Rocket, Target } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/Card";
import { Section } from "@/components/Section";
import { getPageContent } from "@/lib/cms";

const introParagraphs = [
  "Creators are driving culture—building audiences, shaping trends, and creating real impact.",
  "But too often, they don't see the full value of what they've built.",
  "Many are left managing everything alone. Chasing brand deals, handling conversations, waiting on payments, and trying to turn attention into income without the right support behind them.",
  "It's inconsistent, time-consuming, and not built for long-term success.",
];

const missionParagraphs = [
  "We built Beyond Vision to change that.",
  "To give creators the structure, access, and backing they need to turn their audience into something scalable—something that generates consistent income and grows beyond platforms, trends, and one-off opportunities.",
];

const beliefCards = [
  {
    title: "What We Believe",
    icon: <Target size={34} />,
    body: "We believe creators should operate like real brands, not freelancers chasing the next deal. With the right system behind them, attention becomes leverage—and leverage becomes long-term growth.",
  },
  {
    title: "Our Mission",
    icon: <Rocket size={34} />,
    body: "To turn creators into scalable, independent brands with real income, real ownership, and long-term opportunity.",
  },
  {
    title: "If You're Serious About Growth",
    icon: <HeartHandshake size={34} />,
    body: "If you're ready to move beyond one-off deals and build something bigger, we're here to build it with you.",
  },
];

type WhyPageContent = {
  hero_badge: string;
  hero_title: string;
  intro_paragraphs: string[];
  mission_paragraphs: string[];
  belief_cards: typeof beliefCards;
  cta_text: string;
};

const defaultContent: WhyPageContent = {
  hero_badge: "Why We Built This",
  hero_title: "Why We Do It",
  intro_paragraphs: introParagraphs,
  mission_paragraphs: missionParagraphs,
  belief_cards: beliefCards,
  cta_text: "Build With Us",
};

function normalizeWhyContent(data: Record<string, unknown>): WhyPageContent {
  const next = { ...defaultContent, ...data } as WhyPageContent;

  if (String(next.hero_title || "").toLowerCase().includes("creators are driving culture")) {
    next.hero_title = defaultContent.hero_title;
  }

  const legacyIntro =
    [data.hero_text, data.hero_text_2].filter(Boolean).join(" ") ||
    String(data.main_statement || "");
  if (
    !Array.isArray(next.intro_paragraphs) ||
    next.intro_paragraphs.length < 2 ||
    legacyIntro.toLowerCase().includes("managing everything alone")
  ) {
    next.intro_paragraphs = defaultContent.intro_paragraphs;
    next.mission_paragraphs = defaultContent.mission_paragraphs;
  }

  if (!Array.isArray(next.belief_cards) || next.belief_cards.length === 0) {
    next.belief_cards = defaultContent.belief_cards;
  }

  return next;
}

export default function CreatorsWhyWeDoItPage() {
  const [pageContent, setPageContent] = useState<WhyPageContent>(defaultContent);

  useEffect(() => {
    getPageContent("creators-why-we-do-it").then((data) => {
      if (data) setPageContent(normalizeWhyContent(data as Record<string, unknown>));
    });
  }, []);

  const intro = pageContent.intro_paragraphs?.length
    ? pageContent.intro_paragraphs
    : defaultContent.intro_paragraphs;
  const mission = pageContent.mission_paragraphs?.length
    ? pageContent.mission_paragraphs
    : defaultContent.mission_paragraphs;
  const cards = pageContent.belief_cards?.length
    ? pageContent.belief_cards
    : defaultContent.belief_cards;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative", overflow: "hidden" }}>
      <AmbientBackground />
      <Navbar />

      <section className="section-container" style={{ paddingTop: "calc(var(--section-y) + 48px)", paddingBottom: "var(--section-y)" }}>
        <div style={{ maxWidth: "820px" }}>
          <div className="accent-badge" style={{ marginBottom: "2rem" }}>
            <HeartHandshake size={14} />
            {pageContent.hero_badge}
          </div>
          <h1 className="title-xl" style={{ marginBottom: "2rem" }}>
            {pageContent.hero_title}
          </h1>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.35rem" }}>
            {intro.map((paragraph) => (
              <p key={paragraph} className="description-text" style={{ maxWidth: "760px", lineHeight: 1.7, color: "rgba(255,255,255,0.78)" }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <Section title="Beyond Vision" subtitle="">
        <Card padding="2.5rem" hover={false} style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.35rem" }}>
            {mission.map((paragraph) => (
              <p
                key={paragraph}
                className="description-text"
                style={{
                  maxWidth: "760px",
                  lineHeight: 1.7,
                  color: paragraph.startsWith("We built") ? "#fff" : "rgba(255,255,255,0.78)",
                  fontWeight: paragraph.startsWith("We built") ? 800 : 400,
                  fontSize: paragraph.startsWith("We built") ? "1.1rem" : undefined,
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Card>
        <div className="creator-belief-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
          {cards.map((card) => (
            <Card key={card.title} padding="2rem">
              {"icon" in card && card.icon ? (
                <div style={{ color: "rgba(255,255,255,0.75)", marginBottom: "1.25rem" }}>{card.icon}</div>
              ) : null}
              <h2 className="title-md" style={{ marginBottom: "1rem" }}>
                {card.title}
              </h2>
              <p className="description-text" style={{ fontSize: "1rem", lineHeight: 1.65 }}>
                {card.body}
              </p>
            </Card>
          ))}
        </div>
        <div style={{ marginTop: "4rem", textAlign: "center" }}>
          <Link href="/contact?type=creator">
            <button className="btn-primary">
              {pageContent.cta_text} <ArrowUpRight size={18} />
            </button>
          </Link>
        </div>
      </Section>

      <Footer />
      <style jsx>{`
        @media (max-width: 640px) {
          .creator-belief-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
        }
      `}</style>
    </main>
  );
}
