"use client";

// Homepage hero wall (Xander, 2026-11-16): real posted BV campaigns behind the
// headline. Every clip is one continuous shot (no scene cut inside it), 2.5 to
// 8 seconds, silent, fading up from dark and back down at its ends, so a loop
// is a soft dip, never a jump. Columns flow continuously, alternating up and
// down. Clips live in /public/hero-clips (about 8 MB in total).

import { useEffect, useState } from "react";

const CLIP = (name: string) => `/hero-clips/${name}.webm`;

// Ten deals, at most two clips each, ordered so brands alternate.
const DEALS: string[][] = [
    [CLIP("temu-aknation444-s1"), CLIP("temu-aknation444-s2")],
    [CLIP("polybuzz-nikscopes-s1"), CLIP("polybuzz-nikscopes-s2")],
    [CLIP("darryring-ayeshaad-s1"), CLIP("darryring-ayeshaad-s2")],
    [CLIP("aliexpress-africanamericanfam-s1"), CLIP("aliexpress-africanamericanfam-s2")],
    [CLIP("polybuzz-baysolive-s1"), CLIP("polybuzz-baysolive-s2")],
    [CLIP("temu-rodrivals-s1"), CLIP("temu-rodrivals-s2")],
    [CLIP("darryring-alixasmr-s1"), CLIP("darryring-alixasmr-s2")],
    [CLIP("polybuzz-ninjszn-s1"), CLIP("polybuzz-ninjszn-s2")],
    [CLIP("darryring-sandiec-s1"), CLIP("darryring-sandiec-s2")],
    [CLIP("polybuzz-slfcinz-s1")],
];

const COLUMNS = 6;
const PER_COLUMN = 4;
const CLIP_OPACITY = 0.3;
const LOOP_SECONDS = 60;

// Four different deals per column; neighbouring columns share none. Each tile
// starts at its own point so the fades never pulse together.
function columnClips(c: number): string[] {
    return Array.from({ length: PER_COLUMN }, (_, r) => {
        const n = c * PER_COLUMN + r;
        const deal = DEALS[n % DEALS.length];
        return `${deal[Math.floor(n / DEALS.length) % deal.length]}#t=${(c * 3 + r * 5) % 4}`;
    });
}

export default function HeroGrid() {
    const [motionOk, setMotionOk] = useState(true);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setMotionOk(!mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    return (
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
            <style>{`
                @keyframes bvHeroUp { from { transform: translateY(0); } to { transform: translateY(-50%); } }
                @keyframes bvHeroDown { from { transform: translateY(-50%); } to { transform: translateY(0); } }
                @media (max-width: 760px) { .bv-hero-edge { display: none; } }
            `}</style>
            <div style={{ position: "absolute", inset: 0, display: "flex", gap: "10px", padding: "0 10px", opacity: CLIP_OPACITY }}>
                {Array.from({ length: COLUMNS }, (_, c) => {
                    const clips = columnClips(c);
                    const strip = [...clips, ...clips]; // twice, so the loop has no seam
                    const speed = Math.round(LOOP_SECONDS * (0.9 + (c % 3) * 0.1));
                    return (
                        <div
                            key={c}
                            className={c === 0 || c === COLUMNS - 1 ? "bv-hero-edge" : undefined}
                            style={{ flex: "1 1 0", minWidth: 0, position: "relative", overflow: "hidden" }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    animation: motionOk ? `${c % 2 === 0 ? "bvHeroUp" : "bvHeroDown"} ${speed}s linear infinite` : "none",
                                    animationDelay: `-${c * 7}s`,
                                }}
                            >
                                {strip.map((src, i) => (
                                    <div
                                        key={i}
                                        style={{ position: "relative", aspectRatio: "9 / 16", marginBottom: "10px", borderRadius: "14px", overflow: "hidden", background: "#141414" }}
                                    >
                                        <video
                                            src={src}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            preload="auto"
                                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* A dark glow behind the headline so it always reads. */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(ellipse 46% 52% at 50% 50%, rgba(11,11,11,.95) 0%, rgba(11,11,11,.8) 45%, rgba(11,11,11,.45) 100%)",
                }}
            />
        </div>
    );
}
