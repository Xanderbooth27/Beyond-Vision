"use client";

/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import type { HomeCampaignCard } from "@/lib/campaign-archive";
import type { PublicCreator } from "@/lib/roster-creators";

type StatTile = { value: string; label: string };

type BrandsAboutMediaGridProps = {
  campaigns: HomeCampaignCard[];
  creators: PublicCreator[];
  stats: StatTile[];
};

function TileLabel({ children }: { children: string }) {
  return (
    <span
      style={{
        position: "absolute",
        left: "1rem",
        bottom: "1rem",
        color: "#fff",
        fontSize: "0.75rem",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "1px",
        zIndex: 2,
      }}
    >
      {children}
    </span>
  );
}

function TileShell({
  label,
  href,
  children,
  style,
}: {
  label: string;
  href?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  const inner = (
    <div
      style={{
        minHeight: "220px",
        borderRadius: "24px",
        overflow: "hidden",
        position: "relative",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        ...style,
      }}
    >
      {children}
      <TileLabel>{label}</TileLabel>
    </div>
  );

  if (!href) return inner;

  return (
    <Link href={href} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
      {inner}
    </Link>
  );
}

export function BrandsAboutMediaGrid({ campaigns, creators, stats }: BrandsAboutMediaGridProps) {
  const campaignTiles = campaigns.slice(0, 4);
  const creatorTiles = creators.slice(0, 6);
  const statTiles = stats.slice(0, 3);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      <TileShell label="Our Logo" href="/about-us">
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle at 50% 35%, rgba(255,244,87,0.08), #0a0a0a 68%)",
            padding: "2.5rem",
          }}
        >
          <img
            src="/logo_main.jpg"
            alt="Beyond Vision"
            style={{
              width: "min(72%, 200px)",
              height: "auto",
              maxHeight: "75%",
              objectFit: "contain",
            }}
          />
        </div>
      </TileShell>

      <TileShell label="Campaign Content" href="/recent-campaigns">
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3px",
            background: "#0a0a0a",
          }}
        >
          {campaignTiles.length ? (
            campaignTiles.map((campaign) => (
              <div key={campaign.id} style={{ position: "relative", overflow: "hidden", minHeight: 0 }}>
                <img
                  src={campaign.thumbnail}
                  alt={`${campaign.brand} x ${campaign.influencer}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 45%)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: "0.45rem",
                    right: "0.45rem",
                    width: "26px",
                    height: "26px",
                    borderRadius: "999px",
                    background: "rgba(255,244,87,0.92)",
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-hidden
                >
                  <Play size={12} fill="currentColor" style={{ marginLeft: "1px" }} />
                </span>
              </div>
            ))
          ) : (
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              Campaign archive loading
            </div>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(8,9,10,0.35), transparent 40%)",
            pointerEvents: "none",
          }}
        />
      </TileShell>

      <TileShell label="Campaign Data" href="/case-studies">
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "1.25rem 1.35rem 2.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "0.85rem",
            background: "linear-gradient(145deg, rgba(255,244,87,0.06), rgba(8,9,10,0.95))",
          }}
        >
          {statTiles.map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  color: "var(--accent)",
                  fontWeight: 900,
                  fontSize: "clamp(1.35rem, 2.5vw, 1.85rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.58)",
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginTop: "0.35rem",
                  lineHeight: 1.3,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </TileShell>

      <TileShell label="Creators" href="/roster">
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "4px",
            background: "#0a0a0a",
          }}
        >
          {creatorTiles.length ? (
            creatorTiles.map((creator) => (
              <div key={creator.id} style={{ position: "relative", overflow: "hidden", minHeight: 0 }}>
                <img
                  src={creator.imageUrl}
                  alt={creator.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
            ))
          ) : (
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              Roster loading
            </div>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(8,9,10,0.5), transparent 35%)",
            pointerEvents: "none",
          }}
        />
      </TileShell>
    </div>
  );
}
