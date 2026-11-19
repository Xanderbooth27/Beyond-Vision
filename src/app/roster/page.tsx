"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Instagram, Mail, Music2, X } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Section } from "@/components/Section";
import { ActionCTA } from "@/components/CTA";
import { rosterCreators } from "@/lib/public-pages";
import { getPageContent } from "@/lib/cms";
import { CONTACT_EMAIL } from "@/lib/content-defaults";
import {
  buildRosterCreators,
  fetchFirebaseRosterCreators,
  type PublicCreator,
} from "@/lib/roster-creators";

function isValidEmail(email?: string) {
  const value = email?.trim();
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

function creatorEnquiryAction(creator: PublicCreator) {
  if (isValidEmail(creator.email)) {
    return {
      href: `mailto:${creator.email}?subject=${encodeURIComponent(`Brand enquiry — ${creator.name}`)}`,
      label: "Email",
      hint: `Opens your email app to reach ${creator.name}'s team.`,
    };
  }

  return {
    href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Brand enquiry — ${creator.name}`)}`,
    label: "Email",
    hint: `Reach the Beyond Vision team about ${creator.name}.`,
    contactHref: `/contact?type=brand&talent=${encodeURIComponent(creator.name)}`,
  };
}

export default function RosterPage() {
  const [dbCreators, setDbCreators] = useState<PublicCreator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<PublicCreator | null>(null);
  const [pageContent, setPageContent] = useState({
    hero_badge: "Verified roster",
    hero_title: "Creators we represent",
    hero_text: "A public-safe view of current Beyond Vision creators, built for quick brand discovery and clean partnership enquiries.",
  });

  useEffect(() => {
    getPageContent("roster").then((data) => {
      if (data) {
        setPageContent((prev) => ({
          ...prev,
          hero_badge: data.hero_badge || prev.hero_badge,
          hero_title: data.hero_title || prev.hero_title,
          hero_text: data.hero_text || prev.hero_text,
        }));
      }
    });

    fetchFirebaseRosterCreators().then(setDbCreators);
  }, []);

  const creators = useMemo(() => buildRosterCreators(dbCreators), [dbCreators]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative", overflow: "hidden" }}>
      <AmbientBackground />
      <Navbar />

      <main>
        <section className="roster-hero section-container">
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
            <div className="roster-hero-row">
              <Link href="/contact?type=brand" className="btn-secondary">
                Enquire <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <Section title="Creators on roster" subtitle="Exclusive creators" className="roster-section">
          <motion.div layout className="roster-grid">
            {creators.map((creator, index) => (
              <CreatorCard key={creator.id} creator={creator} index={index} onWorkWithMe={() => setSelectedCreator(creator)} />
            ))}
          </motion.div>
        </Section>
      </main>

      <AnimatePresence>
        {selectedCreator && (
          <CreatorModal creator={selectedCreator} onClose={() => setSelectedCreator(null)} />
        )}
      </AnimatePresence>

      <div className="roster-cta-wrap">
        <ActionCTA
          subtitle="PARTNERSHIP"
          title="READY TO MOVE?"
          buttonText="Contact Us"
          href="/contact?type=brand"
        />
      </div>
      <Footer />

      <style>{`
        .roster-hero {
          text-align: left;
          min-height: auto;
          padding-top: calc(var(--section-y) + 56px);
          padding-bottom: 0;
        }

        .roster-hero-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.8rem;
        }

        .roster-section .section-container {
          padding-top: 4rem !important;
        }

        .roster-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 1rem;
        }

        .roster-cta-wrap {
          padding: 0 4rem;
          max-width: 1600px;
          margin: 0 auto;
        }

        @media (max-width: 1280px) {
          .roster-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }

        @media (max-width: 1040px) {
          .roster-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }

        @media (max-width: 760px) {
          .roster-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .roster-cta-wrap { padding: 0 1.5rem; }
        }

        @media (max-width: 520px) {
          .roster-grid { grid-template-columns: 1fr; }
          .roster-hero-row { align-items: stretch; }
          .roster-hero-row a { width: 100%; }
        }

        .social-link {
          min-height: 36px;
          min-width: 58px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.55rem 0.72rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.055);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 0.68rem;
          font-weight: 900;
          line-height: 1;
          text-transform: uppercase;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .social-link:hover {
          background: rgba(255, 244, 87, 0.1);
          border-color: rgba(255, 244, 87, 0.26);
          transform: translateY(-1px);
        }

      `}</style>
    </div>
  );
}

// Each roster creator with their own page (lib/public-pages). The name links to it.
const HAS_PAGE = new Set(rosterCreators.map((r) => r.id));

function CreatorCard({ creator, index, onWorkWithMe }: { creator: PublicCreator; index: number; onWorkWithMe: () => void }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.28), duration: 0.42 }}
      className="creator-card"
    >
      <div className="creator-image-wrap">
        <img src={creator.imageUrl} alt={creator.name} className="creator-image" />
      </div>

      <div className="creator-info">
        <div>
          <h2>{HAS_PAGE.has(creator.id) ? <Link href={`/roster/${creator.id}`} className="creator-name-link">{creator.name}</Link> : creator.name}</h2>
          <p>{creator.followers} audience</p>
          <div className="creator-social-row">
            {creator.tiktokUrl && <SocialLink href={creator.tiktokUrl} label="TikTok" icon="tiktok" />}
            {creator.instagramUrl && <SocialLink href={creator.instagramUrl} label="Instagram" icon="instagram" />}
          </div>
        </div>
        <button type="button" className="creator-cta" onClick={onWorkWithMe}>
          Work With Me! <ArrowUpRight size={15} />
        </button>
      </div>

      <style>{`
        .creator-card {
          min-width: 0;
          overflow: hidden;
          border-radius: 18px;
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.15rem;
          text-align: center;
          transition: transform 0.24s ease, border-color 0.24s ease, background 0.24s ease;
        }

        .creator-name-link { color: inherit; text-decoration: none; }
        .creator-name-link:hover { text-decoration: underline; text-underline-offset: 3px; }

        .creator-card:hover {
          transform: translateY(-4px);
          background: #151515;
          border-color: rgba(255, 255, 255, 0.18);
        }

        .creator-image-wrap {
          position: relative;
          width: min(100%, 190px);
          aspect-ratio: 1;
          margin: 0 auto;
          overflow: hidden;
          border-radius: 50%;
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .creator-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .creator-card:hover .creator-image {
          transform: scale(1.04);
        }

        .creator-info {
          display: grid;
          gap: 1.1rem;
          padding-top: 1rem;
        }

        .creator-info p {
          color: rgba(255, 255, 255, 0.45);
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.02em;
          line-height: 1;
          margin-bottom: 0.45rem;
          text-transform: uppercase;
        }

        .creator-info h2 {
          color: var(--accent);
          font-size: 1.28rem;
          line-height: 1.12;
          overflow-wrap: anywhere;
        }

        .creator-social-row {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          min-height: 36px;
          margin-top: 0.7rem;
        }

        .creator-cta {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          padding: 0.78rem 0.9rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
          cursor: pointer;
          font-size: 0.66rem;
          font-weight: 900;
          letter-spacing: 0.05em;
          line-height: 1.1;
          text-align: center;
          text-transform: uppercase;
          transition: background 0.24s ease, border-color 0.24s ease;
        }

        .creator-cta:hover {
          background: rgba(255, 244, 87, 0.1);
          border-color: rgba(255, 244, 87, 0.24);
        }
      `}</style>
    </motion.article>
  );
}

function CreatorModal({ creator, onClose }: { creator: PublicCreator; onClose: () => void }) {
  const enquiry = creatorEnquiryAction(creator);

  return (
    <motion.div
      className="creator-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.article
        className="creator-modal"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28, scale: 0.98 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close creator profile">
          <X size={18} />
        </button>

        <div className="modal-photo-wrap">
          <img src={creator.imageUrl} alt={creator.name} className="modal-photo" />
        </div>

        <div className="modal-content">
          <div>
            <span className="modal-eyebrow">Exclusive creator</span>
            <h2>{HAS_PAGE.has(creator.id) ? <Link href={`/roster/${creator.id}`} className="creator-name-link">{creator.name}</Link> : creator.name}</h2>
            <p>{creator.followers} audience</p>
          </div>

          <div className="modal-actions">
            {creator.tiktokUrl && <SocialLink href={creator.tiktokUrl} label="TikTok" icon="tiktok" />}
            {creator.instagramUrl && <SocialLink href={creator.instagramUrl} label="Instagram" icon="instagram" />}
            <a href={enquiry.href} className="modal-email">
              <Mail size={16} /> {enquiry.label}
            </a>
            {enquiry.contactHref ? (
              <Link href={enquiry.contactHref} className="modal-contact-link">
                Contact form <ArrowUpRight size={14} />
              </Link>
            ) : null}
          </div>
          <p className="modal-contact-hint">{enquiry.hint}</p>
        </div>
      </motion.article>

      <style>{`
        .creator-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 5000;
          display: grid;
          place-items: center;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.74);
          backdrop-filter: blur(18px);
        }

        .creator-modal {
          position: relative;
          width: min(980px, 100%);
          max-height: min(760px, calc(100vh - 3rem));
          overflow: auto;
          display: grid;
          grid-template-columns: 0.8fr 1fr;
          gap: 0;
          border-radius: 22px;
          background: #111;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.48);
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 2;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #fff;
          cursor: pointer;
        }

        .modal-photo-wrap {
          min-height: 560px;
          background: #181818;
        }

        .modal-photo {
          width: 100%;
          height: 100%;
          min-height: 560px;
          object-fit: cover;
        }

        .modal-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 2rem;
          padding: 3rem;
        }

        .modal-eyebrow {
          display: block;
          color: var(--accent);
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          margin-bottom: 0.65rem;
          text-transform: uppercase;
        }

        .modal-content h2 {
          font-size: clamp(2rem, 4vw, 3.4rem);
          line-height: 0.98;
          margin-bottom: 0.8rem;
        }

        .modal-content p {
          color: rgba(255, 255, 255, 0.55);
          font-weight: 800;
          text-transform: uppercase;
        }

        .modal-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .modal-email {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          padding: 0.75rem 1rem;
          border-radius: 999px;
          background: var(--accent);
          color: #000;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: filter 0.2s ease, transform 0.2s ease;
        }

        .modal-email:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }

        .modal-contact-link {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.75rem 1rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.055);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .modal-contact-link:hover {
          background: rgba(255, 244, 87, 0.1);
          border-color: rgba(255, 244, 87, 0.26);
        }

        .modal-contact-hint {
          margin: 0;
          max-width: 28rem;
          color: rgba(255, 255, 255, 0.42);
          font-size: 0.82rem;
          line-height: 1.55;
          font-weight: 600;
        }

        @media (max-width: 820px) {
          .creator-modal {
            grid-template-columns: 1fr;
          }

          .modal-photo-wrap,
          .modal-photo {
            min-height: 320px;
          }

          .modal-content {
            padding: 1.5rem;
          }
        }

        @media (max-width: 520px) {
          .creator-modal-backdrop {
            padding: 0.75rem;
            place-items: start center;
          }
        }
      `}</style>
    </motion.div>
  );
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: "tiktok" | "instagram" }) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className="social-link" aria-label={label}>
      {icon === "instagram" ? <Instagram size={17} /> : <Music2 size={17} />}
      <span>{icon === "instagram" ? "IG" : "TT"}</span>
    </Link>
  );
}
