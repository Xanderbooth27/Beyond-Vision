"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Play, Search } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import CampaignVideoModal from "@/components/CampaignVideoModal";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Section } from "@/components/Section";
import { ActionCTA } from "@/components/CTA";
import { getPageContent } from "@/lib/cms";
import { sortCampaignsByRecency, uniqueCampaignsByIdentity } from "@/lib/campaign-archive";
import { campaignPlaybackUrl, driveCampaignContent, driveOpenUrl, type DriveCampaignContent } from "@/lib/drive-content";

const CAMPAIGN_YEAR = "2026";

export default function RecentCampaignsPage() {
  const [pageContent, setPageContent] = useState({
    hero_badge: "Campaign Content",
    hero_title: "Recent Campaigns",
    hero_text: "A selection of our recently completed campaigns.",
    archive_title: "Selected campaigns",
    archive_subtitle: "Highlights from 2026",
    empty_title: "No 2026 campaigns yet.",
    empty_text: "Add campaign videos to the 2026 archive when they are ready.",
  });
  const [search, setSearch] = useState("");
  const [playingCampaign, setPlayingCampaign] = useState<DriveCampaignContent | null>(null);
  const archiveCampaigns = useMemo(() => uniqueCampaignsByIdentity(driveCampaignContent), []);

  useEffect(() => {
    getPageContent("recent-campaigns").then((data) => {
      if (data) {
        setPageContent((prev) => ({
          ...prev,
          hero_badge: data.hero_badge || prev.hero_badge,
          hero_title: data.hero_title || prev.hero_title,
          // Xander, 2026-11-17: the archive reads as a selection, not every deal,
          // so the wording here wins over the CMS.
          hero_text: prev.hero_text,
          archive_title: prev.archive_title,
          archive_subtitle: prev.archive_subtitle,
          empty_title: data.empty_title || prev.empty_title,
          empty_text: data.empty_text || prev.empty_text,
        }));
      }
    });
  }, []);

  const yearCampaigns = useMemo(
    () => sortCampaignsByRecency(archiveCampaigns.filter((campaign) => campaign.year === CAMPAIGN_YEAR)),
    [archiveCampaigns]
  );

  const visibleCampaigns = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return yearCampaigns.filter((campaign) => {
      if (!needle) return true;
      return [campaign.title, campaign.creator, campaign.brand, campaign.month, campaign.year].some((value) =>
        value.toLowerCase().includes(needle)
      );
    });
  }, [yearCampaigns, search]);

  const playingVideoSrc = playingCampaign ? campaignPlaybackUrl(playingCampaign) : undefined;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative" }}>
      <AmbientBackground />
      <Navbar />

      <main>
        <section className="campaign-hero section-container">
          <div style={{ maxWidth: "760px" }}>
            <div className="accent-badge" style={{ marginBottom: "1.5rem" }}>
              <span className="accent-badge-dot" />
              {pageContent.hero_badge}
            </div>
            <h1 className="title-xl" style={{ marginBottom: "1.25rem" }}>
              {pageContent.hero_title}
            </h1>
            <p className="description-text" style={{ maxWidth: "660px", marginBottom: "2rem" }}>
              {pageContent.hero_text}
            </p>
          </div>
        </section>

        <Section title={pageContent.archive_title} subtitle={pageContent.archive_subtitle} className="campaign-archive-section">
          <div className="campaign-toolbar">
            <div className="year-scroll" role="tablist" aria-label="Campaign year">
              <button
                type="button"
                role="tab"
                aria-selected
                className="year-chip year-chip--active"
              >
                {CAMPAIGN_YEAR}
              </button>
            </div>

            <label className="campaign-search-field">
              <Search size={16} aria-hidden />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search campaigns..."
                aria-label="Search campaigns"
              />
            </label>
          </div>

          {visibleCampaigns.length ? (
            <div className="campaign-grid">
              {visibleCampaigns.map((campaign) => (
                <CampaignContentCard
                  key={campaign.id}
                  campaign={campaign}
                  videoSrc={campaignPlaybackUrl(campaign)}
                  onWatch={() => setPlayingCampaign(campaign)}
                />
              ))}
            </div>
          ) : (
            <div className="campaign-empty">
              <h2>{pageContent.empty_title}</h2>
              <p>{pageContent.empty_text}</p>
            </div>
          )}
        </Section>

        <div className="campaign-cta-wrap">
          <ActionCTA
            subtitle="PARTNERSHIP"
            title="READY TO MOVE?"
            buttonText="Contact Us"
            href="/contact"
          />
        </div>
      </main>

      <Footer />

      <AnimatePresence mode="wait">
        {playingCampaign && playingVideoSrc ? (
          <CampaignVideoModal
            key={playingCampaign.id}
            campaign={playingCampaign}
            videoSrc={playingVideoSrc}
            onClose={() => setPlayingCampaign(null)}
          />
        ) : null}
      </AnimatePresence>

      <style>{`
        .campaign-hero {
          text-align: left;
          min-height: auto;
          padding-top: calc(var(--section-y) + 56px);
          padding-bottom: 0;
        }

        .campaign-hero-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.8rem;
        }

        .campaign-hero-row > div {
          min-height: 56px;
          min-width: 140px;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .campaign-hero-row strong,
        .campaign-hero-row span {
          display: block;
          line-height: 1.1;
        }

        .campaign-hero-row strong {
          color: #fff;
          font-size: 1rem;
          font-weight: 900;
        }

        .campaign-hero-row span {
          color: rgba(255, 255, 255, 0.42);
          font-size: 0.62rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          margin-top: 0.38rem;
          text-transform: uppercase;
        }

        .campaign-archive-section .section-heading-row {
          margin-bottom: 1.5rem;
          padding-bottom: 1.25rem;
        }

        .campaign-archive-section .eyebrow {
          font-size: 0.68rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          margin-bottom: 0.5rem;
        }

        .campaign-archive-section .section-container {
          padding-top: 4rem !important;
        }

        .campaign-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          margin-bottom: 2rem;
          padding-top: 0.15rem;
        }

        .campaign-search-field {
          position: relative;
          display: block;
          flex: 0 1 320px;
          width: 100%;
          max-width: 320px;
          min-width: 200px;
        }

        .campaign-search-field svg {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.38);
          pointer-events: none;
        }

        .campaign-search-field input {
          width: 100%;
          min-height: 40px;
          padding: 0.65rem 1rem 0.65rem 2.6rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: #fff;
          font: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          outline: none;
        }

        .campaign-search-field input::placeholder {
          color: rgba(255, 255, 255, 0.38);
        }

        .campaign-search-field input:focus {
          border-color: rgba(255, 255, 255, 0.14);
        }

        .year-scroll {
          display: flex;
          flex: 1 1 auto;
          flex-wrap: wrap;
          gap: 0.4rem;
          min-width: 0;
        }

        .year-chip {
          flex: 0 0 auto;
          min-height: 36px;
          padding: 0.5rem 0.85rem;
          border-radius: 999px;
          border: none;
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.55);
          cursor: default;
          font-size: 0.78rem;
          font-weight: 700;
          line-height: 1;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .year-chip--active {
          background: var(--accent);
          color: #000;
        }

        .campaign-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 1rem;
        }

        .campaign-card {
          min-width: 0;
          overflow: hidden;
          border-radius: 18px;
          background: #111;
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
          width: 100%;
          padding: 0;
          border: none;
          cursor: pointer;
          aspect-ratio: 9 / 16;
          overflow: hidden;
          background: #171717;
        }

        .campaign-media:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .campaign-media img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .campaign-card:hover .campaign-media img {
          transform: scale(1.04);
        }

        .campaign-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(8, 8, 8, 0.95), rgba(8, 8, 8, 0.08) 58%);
        }

        .campaign-scrim,
        .campaign-play,
        .campaign-month-badge {
          pointer-events: none;
        }

        .campaign-play {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: var(--accent);
          color: #000;
        }

        .campaign-month-badge {
          position: absolute;
          top: 0.8rem;
          left: 0.8rem;
          padding: 0.35rem 0.65rem;
          border-radius: 999px;
          background: var(--accent);
          color: #000;
          font-size: 0.62rem;
          font-weight: 900;
          line-height: 1;
          text-transform: uppercase;
        }

        .campaign-card-body {
          display: grid;
          gap: 0.75rem;
          padding: 1rem;
        }

        .campaign-card-body h2 {
          color: #fff;
          font-size: 1rem;
          line-height: 1.12;
          overflow-wrap: anywhere;
        }

        .campaign-card-body p {
          color: rgba(255, 255, 255, 0.42);
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          line-height: 1.2;
          text-transform: uppercase;
        }

        .campaign-watch-btn {
          min-height: 40px;
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.48rem;
          border-radius: 999px;
          padding: 0.7rem 0.85rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
          font-size: 0.66rem;
          font-weight: 900;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .campaign-watch-btn:hover:not(:disabled) {
          background: rgba(255, 244, 87, 0.1);
          border-color: rgba(255, 244, 87, 0.24);
        }

        .campaign-watch-btn:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .campaign-empty {
          padding: 4rem 1rem;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.08);
          text-align: center;
        }

        .campaign-empty h2 {
          font-size: clamp(1.4rem, 3vw, 2.2rem);
          margin-bottom: 0.75rem;
        }

        .campaign-empty p {
          max-width: 560px;
          margin: 0 auto;
          color: rgba(255, 255, 255, 0.54);
        }

        .campaign-cta-wrap {
          padding: 0 4rem;
          max-width: 1600px;
          margin: 0 auto;
        }

        @media (max-width: 1280px) {
          .campaign-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }

        @media (max-width: 1040px) {
          .campaign-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }

        @media (max-width: 900px) {
          .campaign-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .campaign-search-field {
            flex: none;
            max-width: none;
            min-width: 0;
          }

          .year-scroll {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 0.25rem;
            scrollbar-width: thin;
          }
        }

        @media (max-width: 760px) {
          .campaign-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .campaign-cta-wrap { padding: 0 1.5rem; }
        }

        @media (max-width: 520px) {
          .campaign-hero {
            padding-top: calc(var(--section-y) + 36px) !important;
          }
          .campaign-toolbar {
            gap: 1rem !important;
            margin-bottom: 1.5rem !important;
          }
          .campaign-grid { grid-template-columns: 1fr; }
          .campaign-hero-row > div { width: 100%; }
        }
      `}</style>
    </div>
  );
}

function CampaignContentCard({
  campaign,
  videoSrc,
  onWatch,
}: {
  campaign: DriveCampaignContent;
  videoSrc?: string;
  onWatch: () => void;
}) {
  // No stored video: open the live post, or the campaign's (public) Google Drive copy.
  const postUrl = !videoSrc
    ? campaign.postUrl || (campaign.driveFileId ? driveOpenUrl(campaign.driveFileId) : undefined)
    : undefined;
  const canWatch = Boolean(videoSrc || postUrl);

  const handleWatch = () => {
    if (postUrl) {
      window.open(postUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (!canWatch) return;
    onWatch();
  };

  return (
    <article className="campaign-card">
      <button
        type="button"
        className="campaign-media"
        onClick={handleWatch}
        disabled={!canWatch}
        aria-label={canWatch ? `Watch ${campaign.title}` : `${campaign.title} — video not available yet`}
      >
        <img src={campaign.thumbnail} alt="" />
        <span className="campaign-scrim" aria-hidden />
        <span className="campaign-month-badge">{campaign.month}</span>
        <span className="campaign-play" aria-hidden>
          <Play size={20} fill="currentColor" style={{ marginLeft: "2px" }} />
        </span>
      </button>
      <div className="campaign-card-body">
        <div>
          <h2>{campaign.title}</h2>
          <p>{campaign.year} / {campaign.month}</p>
        </div>
        <button type="button" className="campaign-watch-btn" onClick={handleWatch} disabled={!canWatch}>
          {postUrl && /youtu/.test(postUrl) ? "Watch on YouTube" : postUrl && /tiktok/.test(postUrl) ? "Watch on TikTok" : canWatch ? "Watch campaign" : "Video coming soon"}
        </button>
      </div>
    </article>
  );
}
