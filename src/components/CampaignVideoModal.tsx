"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import type { DriveCampaignContent } from "@/lib/drive-content";

type CampaignVideoModalProps = {
  campaign: DriveCampaignContent;
  videoSrc: string;
  onClose: () => void;
};

export default function CampaignVideoModal({ campaign, videoSrc, onClose }: CampaignVideoModalProps) {
  const [mounted] = useState(() => typeof document !== "undefined");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      className="campaign-video-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-video-modal-title"
    >
      <motion.div
        className="campaign-video-modal"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="campaign-video-modal-close" onClick={onClose} aria-label="Close video">
          <X size={18} />
        </button>

        <div className="campaign-video-modal-frame">
          <VideoPlayer
            src={videoSrc}
            poster={campaign.thumbnail}
            aspectRatio="9/16"
            borderRadius="18px"
            controlsAlwaysVisible
          />
        </div>

        <div className="campaign-video-modal-meta">
          <span className="campaign-video-modal-eyebrow">{campaign.month} {campaign.year}</span>
          <h2 id="campaign-video-modal-title">{campaign.title}</h2>
          <p>
            {campaign.creator} <span aria-hidden>×</span> {campaign.brand}
          </p>
        </div>
      </motion.div>

      <style jsx global>{`
        .campaign-video-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100000;
          display: grid;
          place-items: center;
          padding: 1.25rem;
          background: rgba(4, 4, 6, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .campaign-video-modal {
          position: relative;
          width: min(400px, 100%);
          max-height: calc(100vh - 2.5rem);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
          border-radius: 22px;
          background: linear-gradient(165deg, #161616 0%, #0c0c0e 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.55);
        }

        .campaign-video-modal-close {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          z-index: 5;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #fff;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .campaign-video-modal-close:hover {
          background: rgba(255, 244, 87, 0.12);
          border-color: rgba(255, 244, 87, 0.28);
        }

        .campaign-video-modal-frame {
          width: 100%;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #000;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
        }

        .campaign-video-modal-meta {
          padding: 0 0.15rem 0.25rem;
          padding-right: 2.25rem;
        }

        .campaign-video-modal-eyebrow {
          display: block;
          margin-bottom: 0.4rem;
          font-size: 0.65rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
        }

        .campaign-video-modal-meta h2 {
          color: #fff;
          font-size: 1.08rem;
          line-height: 1.2;
          margin-bottom: 0.35rem;
          font-weight: 800;
        }

        .campaign-video-modal-meta p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.78rem;
          font-weight: 650;
          line-height: 1.35;
        }

        .campaign-video-modal-meta p span {
          color: rgba(255, 255, 255, 0.28);
          margin: 0 0.2rem;
        }

        @media (max-width: 480px) {
          .campaign-video-modal-backdrop {
            padding: 0.75rem;
            align-items: flex-end;
          }

          .campaign-video-modal {
            width: 100%;
            max-height: 92vh;
            border-radius: 20px 20px 0 0;
          }
        }
      `}</style>
    </motion.div>,
    document.body
  );
}
