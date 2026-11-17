"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ArrowUpRight, ExternalLink, Play } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Section } from "@/components/Section";
import { getPageContent } from "@/lib/cms";
import { getDb } from "@/lib/firebase";
import type { Campaign } from "@/lib/spec-data";
import { driveCaseStudies, driveThumbnailUrl, type DriveCaseStudy } from "@/lib/drive-content";

type CaseCampaign = {
  id: string;
  creator: string;
  brand: string;
  category: string;
  year?: string;
  href: string;
  thumbnail?: string;
  source: "drive" | "firebase";
  metrics: {
    views: string;
    likes: string;
    comments?: string;
    engagement: string;
  };
};

function normalizeKey(creator: string, brand: string) {
  return `${creator}-${brand}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fromDriveCase(item: DriveCaseStudy): CaseCampaign {
  return {
    id: item.id,
    creator: item.creator,
    brand: item.brand,
    category: item.category,
    year: item.year,
    href: item.tiktokUrl,
    thumbnail: driveThumbnailUrl(item.driveFileId),
    source: "drive",
    metrics: item.metrics,
  };
}

function mapCampaign(campaign: Campaign): CaseCampaign {
  return {
    id: campaign.id,
    creator: campaign.influencer,
    brand: campaign.brand,
    category: campaign.category || "Campaign",
    year: campaign.month?.match(/\d{4}/)?.[0],
    href: campaign.tiktokUrl || campaign.videoUrl || "#",
    thumbnail: campaign.thumbnail,
    source: "firebase",
    metrics: {
      views: campaign.metrics?.views || "Live",
      likes: campaign.metrics?.likes || "Live",
      engagement: campaign.metrics?.engagement || "Live",
    },
  };
}

export default function CaseStudiesPage() {
  const [dbCampaigns, setDbCampaigns] = useState<CaseCampaign[]>([]);
  const [pageContent, setPageContent] = useState({
    hero_badge: "Verified campaign data",
    hero_title: "Proven creator campaigns",
    hero_text: "Selected creator x brand work with strong performance signals, real campaign videos, and public-safe metrics for views, likes, comments, and engagement.",
    cta_text: "Start Your Campaign",
    section_title: "Strong data case studies",
    section_subtitle: "Drive verified",
  });

  useEffect(() => {
    getPageContent("case-studies").then((data) => {
      if (data) {
        setPageContent((prev) => ({
          ...prev,
          hero_badge: data.hero_badge || prev.hero_badge,
          hero_title: data.hero_title || prev.hero_title,
          hero_text: data.hero_text || prev.hero_text,
          cta_text: data.cta_text || prev.cta_text,
          section_title: data.section_title || prev.section_title,
          section_subtitle: data.section_subtitle || prev.section_subtitle,
        }));
      }
    });

    const fetchCampaigns = async () => {
      try {
        const q = query(collection(getDb(), "work_campaigns"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setDbCampaigns(snap.docs.map((doc) => mapCampaign({ id: doc.id, ...doc.data() } as Campaign)));
      } catch (error) {
        console.error("Case studies Firebase fallback active:", error);
      }
    };
    fetchCampaigns();
  }, []);

  const allCampaigns = useMemo(() => {
    const driveItems = driveCaseStudies.map(fromDriveCase);
    const seen = new Set(driveItems.map((item) => normalizeKey(item.creator, item.brand)));
    const firebaseItems = dbCampaigns.filter((item) => !seen.has(normalizeKey(item.creator, item.brand)));
    return [...driveItems, ...firebaseItems];
  }, [dbCampaigns]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative", overflow: "hidden" }}>
      <AmbientBackground />
      <Navbar />

      <main className="section-container-wide">
        <section className="case-hero section-margin">
          <div style={{ maxWidth: "780px" }}>
            <div className="accent-badge" style={{ marginBottom: "1.5rem" }}>
              <span className="accent-badge-dot" />
              {pageContent.hero_badge}
            </div>
            <h1 className="title-xl" style={{ marginBottom: "1.25rem" }}>
              {pageContent.hero_title}
            </h1>
            <p className="description-text" style={{ maxWidth: "680px", marginBottom: "2rem" }}>
              {pageContent.hero_text}
            </p>
            <Link href="/contact?type=brand">
              <button className="btn-primary" style={{ padding: "1rem 2.25rem" }}>
                {pageContent.cta_text} <ArrowUpRight size={18} />
              </button>
            </Link>
          </div>
        </section>

        <Section title={pageContent.section_title} subtitle={pageContent.section_subtitle}>
          <div className="case-grid">
            {allCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </Section>
      </main>

      <Footer />

      <style>{`
        .case-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          align-items: end;
          gap: 2rem;
          text-align: left;
          padding-top: calc(var(--section-y) + 48px);
          padding-bottom: 1rem;
          min-height: auto;
        }

        .case-hero-panel {
          display: grid;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .case-hero-stat {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          background: #171717;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .case-hero-stat strong {
          color: var(--accent);
          font-size: 1.15rem;
          line-height: 1;
        }

        .case-hero-stat span {
          color: rgba(255, 255, 255, 0.46);
          font-size: 0.68rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-align: right;
        }

        .case-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 1rem;
        }

        @media (max-width: 1280px) {
          .case-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }

        @media (max-width: 920px) {
          .case-hero { grid-template-columns: 1fr; }
          .case-hero-panel { max-width: 520px; }
          .case-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 640px) {
          .case-hero {
            padding-top: calc(var(--section-y) + 36px);
            gap: 1.5rem;
          }
          .case-hero-panel {
            max-width: none;
          }
          .case-hero-stat {
            align-items: flex-start;
            flex-direction: column;
            gap: 0.45rem;
          }
          .case-hero-stat span {
            text-align: left;
          }
          .case-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: CaseCampaign }) {
  return (
    <article className="campaign-card">
      <Link href={campaign.href} target="_blank" rel="noopener noreferrer" className="campaign-media" aria-label={`Open ${campaign.creator} x ${campaign.brand} campaign video`}>
        {campaign.thumbnail && (
          <img src={campaign.thumbnail} alt={`${campaign.creator} x ${campaign.brand}`} className="campaign-thumb" />
        )}
        <div className="campaign-scrim" />
        <div className="campaign-tags">
          <span>{campaign.category}</span>
        </div>
        <div className="campaign-play">
          <Play size={20} fill="currentColor" style={{ marginLeft: "2px" }} />
        </div>
        <div className="campaign-title">
          <p>{campaign.creator}</p>
          <h2>{campaign.brand}</h2>
        </div>
      </Link>

      <div className="campaign-body">
        <div className="campaign-meta">
          <span>{campaign.source === "drive" ? "Drive verified" : "Live campaign"}</span>
          <ExternalLink size={14} aria-hidden />
        </div>
        <div className="metric-grid">
          <MetricTile value={campaign.metrics.views} label="Views" />
          <MetricTile value={campaign.metrics.likes} label="Likes" />
          <MetricTile value={campaign.metrics.comments || "Live"} label="Comments" />
          <MetricTile value={campaign.metrics.engagement} label="Engagement" />
        </div>
      </div>

      <style>{`
        .campaign-card {
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
          border-radius: 18px;
          background: #101010;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.24s ease, border-color 0.24s ease, background 0.24s ease;
        }

        .campaign-card:hover {
          transform: translateY(-4px);
          background: #151515;
          border-color: rgba(255, 255, 255, 0.18);
        }

        .campaign-media {
          position: relative;
          display: block;
          aspect-ratio: 9 / 16;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 35%, rgba(255, 244, 87, 0.12), transparent 38%),
            linear-gradient(160deg, #1a1a1a 0%, #0d0d0d 100%);
        }

        .campaign-thumb {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.9;
          transition: transform 0.5s ease, opacity 0.24s ease;
        }

        .campaign-card:hover .campaign-thumb {
          transform: scale(1.04);
          opacity: 1;
        }

        .campaign-scrim {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to top, rgba(8, 8, 8, 0.98) 0%, rgba(8, 8, 8, 0.42) 45%, rgba(8, 8, 8, 0.12) 100%),
            linear-gradient(to bottom, rgba(8, 8, 8, 0.5), transparent 30%);
        }

        .campaign-tags {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          right: 0.75rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .campaign-tags span {
          padding: 0.32rem 0.62rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          font-size: 0.58rem;
          font-weight: 900;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .campaign-tags span:first-child {
          background: var(--accent);
          color: #000;
        }

        .campaign-play {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          width: 56px;
          height: 56px;
          margin: auto;
          border-radius: 50%;
          color: #000;
          background: var(--accent);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.34);
        }

        .campaign-title {
          position: absolute;
          left: 1rem;
          right: 1rem;
          bottom: 1rem;
        }

        .campaign-title p {
          color: rgba(255, 255, 255, 0.58);
          font-size: 0.66rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .campaign-title h2 {
          color: #fff;
          font-size: clamp(1.15rem, 2vw, 1.65rem);
          line-height: 1.02;
          overflow-wrap: anywhere;
        }

        .campaign-body {
          display: grid;
          gap: 0.8rem;
          padding: 0.85rem;
        }

        .campaign-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgba(255, 255, 255, 0.42);
          font-size: 0.62rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
      `}</style>
    </article>
  );
}

function MetricTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric-tile">
      <strong>{value}</strong>
      <span>{label}</span>
      <style>{`
        .metric-tile {
          min-width: 0;
          padding: 0.72rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .metric-tile strong {
          display: block;
          color: #fff;
          font-size: 0.98rem;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 0.35rem;
          overflow-wrap: anywhere;
        }

        .metric-tile span {
          display: block;
          color: rgba(255, 255, 255, 0.36);
          font-size: 0.53rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          line-height: 1.15;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
