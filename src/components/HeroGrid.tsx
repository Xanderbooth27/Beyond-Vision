"use client";

/* eslint-disable @next/next/no-img-element */

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    campaignPlaybackUrl,
    driveCampaignContent,
} from "@/lib/drive-content";
import {
    buildSeparatedColumnTracks,
    campaignCreatorKey,
    pickOnePerCreatorKey,
} from "@/lib/hero-grid-layout";

const MAX_UNIQUE_CAMPAIGNS = 24;
const MIN_GRID_ITEMS = 20;

const CELL_HEIGHT = "520px";
const GRID_OPACITY = 0.35;
const GRID_SCALE = 1.1;
const MEDIA_FILTER = "saturate(1.28) contrast(1.06) brightness(1.06)";

function getColumnCount(): number {
    if (typeof window === "undefined") return 3;
    if (window.matchMedia("(min-width: 1280px)").matches) return 5;
    if (window.matchMedia("(min-width: 1024px)").matches) return 4;
    return 3;
}

type HeroGridItem = {
    id: string;
    creatorKey: string;
    videoSrc: string;
    poster: string;
};

function buildCampaignPool(): HeroGridItem[] {
    return pickOnePerCreatorKey(
        driveCampaignContent,
        (campaign) => campaignCreatorKey(campaign.creator, campaign.id),
        (campaign) => campaign.id,
        MAX_UNIQUE_CAMPAIGNS
    )
        .map((campaign) => {
            const videoSrc = campaignPlaybackUrl(campaign);
            if (!videoSrc) return null;
            return {
                id: campaign.id,
                creatorKey: campaignCreatorKey(campaign.creator, campaign.id),
                videoSrc,
                poster: campaign.thumbnail,
            };
        })
        .filter((item): item is HeroGridItem => Boolean(item));
}

const heroGridRules = {
    sameItem: (a: HeroGridItem, b: HeroGridItem) => a.id === b.id,
    sameGroup: (a: HeroGridItem, b: HeroGridItem) => a.creatorKey === b.creatorKey,
};

function HeroGridCell({
    item,
    playVideo,
    cellKey,
}: {
    item: HeroGridItem | null;
    playVideo: boolean;
    cellKey: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoFailed, setVideoFailed] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !item || !playVideo || videoFailed) {
            if (video) video.pause();
            return;
        }

        const root = containerRef.current;
        if (!root) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    void video.play().catch(() => undefined);
                } else {
                    video.pause();
                }
            },
            { root: null, threshold: 0.15 }
        );

        observer.observe(root);
        return () => observer.disconnect();
    }, [item, playVideo, videoFailed]);

    return (
        <div
            ref={containerRef}
            style={{
                height: CELL_HEIGHT,
                borderRadius: "18px",
                overflow: "hidden",
                backgroundColor: "var(--bv-surface)",
                boxShadow: "none",
                border: "1px solid var(--bv-border)",
                position: "relative",
            }}
        >
            {item ? (
                <>
                    <img
                        src={item.poster}
                        alt=""
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            position: "absolute",
                            inset: 0,
                            filter: MEDIA_FILTER,
                        }}
                    />
                    {playVideo && !videoFailed ? (
                        <video
                            ref={videoRef}
                            key={`${cellKey}-${item.id}`}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            poster={item.poster}
                            src={item.videoSrc}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                position: "absolute",
                                inset: 0,
                                filter: MEDIA_FILTER,
                            }}
                            onError={() => setVideoFailed(true)}
                        />
                    ) : null}
                </>
            ) : null}
        </div>
    );
}

export default function HeroGrid() {
    const reduceMotion = useReducedMotion();
    const [columnCount, setColumnCount] = useState(3);

    const pool = useMemo(() => buildCampaignPool(), []);

    useEffect(() => {
        const updateColumns = () => setColumnCount(getColumnCount());
        updateColumns();
        window.addEventListener("resize", updateColumns);
        return () => window.removeEventListener("resize", updateColumns);
    }, []);

    const columns = useMemo(
        () =>
            buildSeparatedColumnTracks(
                pool,
                columnCount,
                MIN_GRID_ITEMS,
                heroGridRules,
                (item) => item.id
            ),
        [pool, columnCount]
    );

    const playVideo = !reduceMotion;

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                gap: "1.35rem",
                padding: "1.25rem",
                opacity: GRID_OPACITY,
                pointerEvents: "none",
                transform: `rotate(-1deg) scale(${GRID_SCALE})`,
                filter: "saturate(1.12)",
                maskImage:
                    "linear-gradient(to bottom, transparent 0%, black 8%, black 62%, transparent 88%)",
                WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 0%, black 8%, black 62%, transparent 88%)",
                overflow: "hidden",
                zIndex: 1,
            }}
        >
            {columns.map((columnItems, colIndex) => (
                <motion.div
                    key={colIndex}
                    initial={{ y: reduceMotion ? "0%" : colIndex % 2 !== 0 ? "0%" : "-50%" }}
                    animate={{ y: reduceMotion ? "0%" : colIndex % 2 !== 0 ? "-50%" : "0%" }}
                    transition={{
                        duration: reduceMotion ? 0 : 52,
                        repeat: reduceMotion ? 0 : Infinity,
                        ease: "linear",
                    }}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.35rem",
                    }}
                >
                    {columnItems.map((item, i) => (
                        <HeroGridCell
                            key={`${colIndex}-${i}-${item.id}`}
                            cellKey={`${colIndex}-${i}`}
                            item={item}
                            playVideo={playVideo}
                        />
                    ))}
                </motion.div>
            ))}
        </div>
    );
}
