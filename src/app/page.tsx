"use client";

/* eslint-disable @next/next/no-img-element */

import { motion } from "framer-motion";
import {
    ArrowUpRight, Zap,
    ArrowRight, Target, Layers, Plus, Minus,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroGrid from "@/components/HeroGrid";
import AmbientBackground from "@/components/AmbientBackground";
import SideDrawer from "@/components/SideDrawer";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getDb } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Section } from "@/components/Section";
import { Card, StatTile } from "@/components/Card";
import { BrandsTicker } from "@/components/BrandsTicker";
import { fallbackBrands } from "@/lib/brand-logo-sources";
import { PagedRowCarousel } from "@/components/PagedRowCarousel";
import { TalentRosterCarousel } from "@/components/TalentRosterCarousel";
import { CampaignRosterCarousel } from "@/components/CampaignRosterCarousel";
import { getCreatorPlatforms, type TalentCardCreator } from "@/lib/talent-display";
import { getPageContent } from "@/lib/cms";
import {
    buildRosterCreators,
    fetchFirebaseRosterCreators,
    rosterToTalentCards,
} from "@/lib/roster-creators";
import { getHomeArchiveCampaigns, type HomeCampaignCard } from "@/lib/campaign-archive";
import VideoPlayer from "@/components/VideoPlayer";
import { driveCaseStudies, caseStudyPlaybackUrl, driveThumbnailUrl } from "@/lib/drive-content";
import { CLIENT_TESTIMONIALS, resolveClientTestimonials } from "@/lib/client-testimonials";

type HomeBlog = {
    id: string;
    title: string;
    category: string;
    date: string;
    author: string;
    readTime: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    externalUrl?: string;
    isFeatured?: boolean;
};

type HomeStat = { value: string; label: string };
type HomeFaqItem = { q: string; a?: string } | string;

const DEFAULT_FAQ_ENTRIES = [
    { q: "How do you vet creator fit?", a: "We look at audience fit, category alignment, content style, platform history, deliverables, usage needs, and whether the partnership can feel native to the creator's community." },
    { q: "What campaign work do you manage?", a: "We handle sourcing, negotiation, deal terms, creative direction, content approvals, posting windows, partner communication, and campaign reporting." },
    { q: "Do you support global activations?", a: "Yes. We support creator and brand partnerships across multiple markets, with campaign planning adjusted for platform, region, timing, and audience behavior." },
];

type HomePageContent = {
    hero_badge: string;
    hero_title: string;
    hero_text: string;
    hero_image: string;
    hero_video: string;
    about_title: string;
    about_subtitle: string;
    about_intro: string;
    about_body: string;
    about_image: string;
    about_stats: HomeStat[];
    faqs: HomeFaqItem[];
};

const HOME_FALLBACK_CONTENT: HomePageContent = {
    hero_badge: "Brands we work with",
    hero_title: "Looking Beyond The Vision",
    hero_text: "We architect cultural moments that drive growth - through storytelling, data, and precision talent.",
    hero_image: "https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=2070&auto=format&fit=crop",
    hero_video: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-circuit-board-and-data-99613-large.mp4",
    about_title: "Why we do it",
    about_subtitle: "Beyond Vision",
    about_intro: "Creators are building real businesses around attention. We protect that momentum with deals, opportunities, and structure—so the work stays on the content.",
    about_body: "For brands: clear creator access, campaign planning, negotiation support, and partner communication built around audience trust.",
    about_image: "/images/why-we-do-it.png",
    about_stats: [
        { value: "GBP 4M+", label: "PAID TO CREATORS" },
        { value: "1BN+", label: "COMBINED REACH" },
    ],
    faqs: DEFAULT_FAQ_ENTRIES,
};

function polishHomeContent(content: Partial<HomePageContent>): HomePageContent {
    const next = { ...HOME_FALLBACK_CONTENT, ...content };
    const heroTitle = String(next.hero_title || "").toLowerCase();
    const heroText = String(next.hero_text || "").toLowerCase();

    if (
        heroTitle.includes("looking beyond") ||
        heroTitle.includes("next level") ||
        heroTitle.includes("creator management built") ||
        heroTitle.includes("attention economy")
    ) {
        next.hero_title = HOME_FALLBACK_CONTENT.hero_title;
    }

    if (!String(next.hero_text || "").trim()) {
        next.hero_text = HOME_FALLBACK_CONTENT.hero_text;
    }

    if (
        heroText.includes("partnerships, campaigns, contracts") ||
        heroText.includes("keep momentum on content") ||
        heroText.includes("next level") ||
        heroText.includes("transform") ||
        heroText.includes("dream") ||
        heroText.includes("architecting the future") ||
        heroText.includes("take your business") ||
        heroText.includes("exemplary") ||
        (heroText.includes("we help you") && heroText.includes("reality"))
    ) {
        next.hero_text = HOME_FALLBACK_CONTENT.hero_text;
    }

    const aboutIntro = String(next.about_intro || "").toLowerCase();
    const aboutBody = String(next.about_body || "").toLowerCase();

    if (String(next.about_intro || "").toLowerCase().includes("connecting brands with culture")) {
        next.about_intro = HOME_FALLBACK_CONTENT.about_intro;
    }

    if (String(next.about_body || "").toLowerCase().includes("win attention online")) {
        next.about_body = HOME_FALLBACK_CONTENT.about_body;
    }

    if (
        aboutIntro.includes("next level") ||
        (aboutIntro.includes("transform") && aboutIntro.includes("dream")) ||
        aboutIntro.includes("maintain a strong") ||
        aboutIntro.includes("exemplary image")
    ) {
        next.about_intro = HOME_FALLBACK_CONTENT.about_intro;
    }

    if (
        aboutBody.includes("next level") ||
        aboutBody.includes("transform dreams") ||
        aboutBody.includes("win attention")
    ) {
        next.about_body = HOME_FALLBACK_CONTENT.about_body;
    }

    const aboutImage = String(next.about_image || "").toLowerCase();
    if (
        aboutImage.includes("unsplash.com") ||
        aboutImage.includes("1552664730-d307ca884978")
    ) {
        next.about_image = HOME_FALLBACK_CONTENT.about_image;
    }

    return next;
}

// --- Components for Drawer Content ---

function WhatWeDoDetail() {
    const services = [
        { label: "01 / CAMPAIGNS", title: "Strategic Influencer Marketing", desc: "Creator campaigns planned around audience fit, deliverables, usage rights, timelines, and measurable outcomes." },
        { label: "02 / OPERATIONS", title: "End-to-End Campaign Management", desc: "Sourcing, negotiation, creative direction, approvals, posting windows, partner communication, and reporting." },
        { label: "03 / PARTNERSHIPS", title: "Brand & Talent Partnerships", desc: "Longer-term creator relationships that feel native to the audience instead of one-off placements." },
        { label: "04 / CREATIVE", title: "Content & Creative Strategy", desc: "Briefs, hooks, platform angles, and content cadence shaped for TikTok, Instagram, YouTube, Twitch, Snapchat, and X." },
        { label: "05 / REPORTING", title: "Performance-Driven Results", desc: "Views, engagement quality, conversions, content usage, audience response, and partner learnings." },
        { label: "06 / MANAGEMENT", title: "Bespoke Growth Strategy", desc: "Structured support for brands and creators who want campaign momentum without losing audience trust." }
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            {services.map((s, i) => (
                <div key={i} style={{ padding: "2rem", background: "rgba(255,255,255,0.025)", borderRadius: "20px", border: "1px solid var(--bv-border)", boxShadow: "0 18px 44px rgba(0,0,0,0.2)" }}>
                    <div className="eyebrow" style={{ marginBottom: "0.85rem" }}>{s.label}</div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>{s.title}</h3>
                    <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
            ))}
        </div>
    );
}

function AboutUsDetail() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
            <div style={{ fontSize: "1.2rem", lineHeight: 1.7, color: "rgba(255,255,255,0.7)" }}>
                <p style={{ marginBottom: "2rem" }}>Beyond Vision manages creators across social platforms, brand partnerships, public appearances, PR, and long-term career growth.</p>
                <p>For brands, we manage creator access, campaign planning, negotiation support, and partner communication built around audience trust.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                <div style={{ padding: "2rem", background: "rgba(255,255,255,0.02)", borderRadius: "24px" }}>
                    <h4 style={{ fontWeight: 900, marginBottom: "1rem" }}>OUR MISSION</h4>
                    <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.4)" }}>To give creators the structure, deal support, and brand access needed to grow without losing control of their time.</p>
                </div>
                <div style={{ padding: "2rem", background: "rgba(255,255,255,0.02)", borderRadius: "24px" }}>
                    <h4 style={{ fontWeight: 900, marginBottom: "1rem" }}>OUR VISION</h4>
                    <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.4)" }}>A roster and partner network where creator value is protected and brand relationships compound over time.</p>
                </div>
            </div>
        </div>
    );
}

function getFaqQuestion(item: HomeFaqItem) {
    return typeof item === "string" ? item : item.q;
}

function getFaqAnswer(item: HomeFaqItem, index: number) {
    if (typeof item === "object" && item.a?.trim()) return item.a;
    const question = getFaqQuestion(item);
    return DEFAULT_FAQ_ENTRIES[index]?.a ?? DEFAULT_FAQ_ENTRIES.find((entry) => entry.q === question)?.a ?? "";
}

function HomeFaqAccordion({ items }: { items: HomeFaqItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {items.map((item, index) => {
                const open = openIndex === index;
                const question = getFaqQuestion(item);
                const answer = getFaqAnswer(item, index);

                return (
                    <Card key={`${question}-${index}`} padding="0" hover={false} style={{ overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <button
                            type="button"
                            onClick={() => setOpenIndex(open ? null : index)}
                            aria-expanded={open}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "1rem",
                                padding: "1.15rem 1.35rem",
                                background: "transparent",
                                border: "none",
                                color: "#fff",
                                cursor: "pointer",
                                textAlign: "left",
                            }}
                        >
                            <span style={{ fontWeight: 800, fontSize: "0.92rem", lineHeight: 1.45 }}>{question}</span>
                            {open ? <Minus size={16} color="var(--bv-muted)" aria-hidden /> : <Plus size={16} color="var(--bv-muted)" aria-hidden />}
                        </button>
                        {open && answer ? (
                            <p
                                style={{
                                    margin: 0,
                                    padding: "0 1.35rem 1.15rem",
                                    color: "rgba(255,255,255,0.58)",
                                    fontSize: "0.88rem",
                                    lineHeight: 1.65,
                                    borderTop: "1px solid rgba(255,255,255,0.06)",
                                    paddingTop: "0.85rem",
                                }}
                            >
                                {answer}
                            </p>
                        ) : null}
                    </Card>
                );
            })}
        </div>
    );
}

function QnADetail() {
    const faqs = [
        { q: "How do you select talent for campaigns?", a: "We look at audience fit, category alignment, content style, platform history, deliverables, usage needs, and whether the partnership can feel native to the creator's community." },
        { q: "What campaign work do you manage?", a: "We handle sourcing, negotiation, deal terms, creative direction, content approvals, posting windows, partner communication, and campaign reporting." },
        { q: "Do you handle global activations?", a: "Yes. We support creator and brand partnerships across multiple markets, with campaign planning adjusted for platform, region, timing, and audience behavior." },
        { q: "What is your typical campaign timeline?", a: "Most campaigns move from brief to live content in 4-6 weeks, depending on creator availability, concept approvals, usage rights, and posting requirements." }
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {faqs.map((f, i) => (
                <div key={i} style={{ padding: "2.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "24px" }}>
                    <h4 style={{ color: "var(--bv-text)", fontWeight: 800, marginBottom: "0.75rem", fontSize: "1rem" }}>{f.q}</h4>
                    <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f.a}</p>
                </div>
            ))}
        </div>
    );
}

function RecentCampaignsDetail({ campaigns }: { campaigns: HomeCampaignCard[] }) {
    if (!campaigns.length) {
        return (
            <Card padding="1.5rem" style={{ textAlign: "center" }} hover={false}>
                <h3 style={{ textTransform: "none", marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 800 }}>No campaigns in the archive yet.</h3>
                <p className="description-text">Campaign videos appear here once they are added to the Recent Campaigns archive.</p>
            </Card>
        );
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem" }}>
            {campaigns.map((c) => (
                <div key={c.id} style={{ padding: "2.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <img src={c.thumbnail} style={{ width: "100%", borderRadius: "20px", marginBottom: "2rem" }} alt="" />
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "1rem" }}>{c.brand} x {c.influencer}</h3>
                    <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
                        <div style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.88)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.45rem 0.85rem", borderRadius: "100px", fontSize: "0.68rem", fontWeight: 750 }}>{c.month} {c.year}</div>
                        <div style={{ background: "rgba(255,255,255,0.05)", padding: "0.5rem 1rem", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 900 }}>{c.strategy}</div>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{c.title}</p>
                </div>
            ))}
            <Link href="/recent-campaigns" style={{ textAlign: "center", color: "var(--bv-muted)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2rem" }}>
                View All Campaign History <ArrowRight size={16} />
            </Link>
        </div>
    );
}

function OurTalentDetail({ talent }: { talent: TalentCardCreator[] }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {talent.map((t, i) => (
                <div key={i} style={{ padding: "1.25rem", background: "rgba(255,255,255,0.025)", borderRadius: "20px", textAlign: "left", border: "1px solid var(--bv-border)" }}>
                    <img src={t.profileImageUrl} style={{ width: "100%", aspectRatio: "1", borderRadius: "18px", objectFit: "cover", marginBottom: "1.25rem", border: "1px solid var(--bv-border-strong)", boxShadow: "0 10px 28px rgba(0,0,0,0.3)" }} alt="" />
                    <div className="eyebrow" style={{ marginBottom: "0.65rem" }}>{t.category || "Creator"}</div>
                    <h4 style={{ fontWeight: 900, marginBottom: "0.45rem" }}>{t.creatorName || t.displayName}</h4>
                    <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.52)", fontWeight: 750 }}>{t.socialLinks?.tiktokFollowers || "Audience"} followers</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
                         {getCreatorPlatforms(t).map((platform) => (
                            <span key={platform} style={{ fontSize: "0.62rem", fontWeight: 850, color: "rgba(255,255,255,0.56)", border: "1px solid var(--bv-border)", borderRadius: "999px", padding: "0.35rem 0.55rem" }}>{platform}</span>
                         ))}
                    </div>
                </div>
            ))}
            <div style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: "3rem" }}>
                <Link href="/roster" style={{ background: "var(--accent)", color: "#000", padding: "1rem 3rem", borderRadius: "100px", fontWeight: 900, textTransform: "uppercase", fontSize: "0.8rem" }}>
                    Access Full Talent Roster
                </Link>
            </div>
        </div>
    );
}

function CaseStudiesDetail() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            <div style={{ padding: "3rem", background: "rgba(255,255,255,0.02)", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.25rem", color: "var(--bv-text)" }}>GAUTH GLOBAL DEPLOYMENT</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "2rem" }}>A comprehensive analysis of how Beyond Vision orchestrated a multi-market deployment for Gauth, a leading AI education tool.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div style={{ padding: "1.5rem", background: "rgba(0,0,0,0.3)", borderRadius: "20px" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 900 }}>45M+</div>
                        <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "rgba(255,255,255,0.3)" }}>TOTAL_VIEWS</div>
                    </div>
                    <div style={{ padding: "1.5rem", background: "rgba(0,0,0,0.3)", borderRadius: "20px" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 900 }}>320%</div>
                        <div style={{ fontSize: "0.6rem", fontWeight: 800, color: "rgba(255,255,255,0.3)" }}>VELOCITY_INCREASE</div>
                    </div>
                </div>
            </div>
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <Link href="/case-studies" style={{ color: "var(--bv-muted)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    View All Case Studies <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
}

function BrandsDetail() {
    const brands = fallbackBrands.map(({ name, domain }) => ({ name, domain }));

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div>
                <div className="eyebrow" style={{ marginBottom: "0.85rem" }}>Selected partnerships</div>
                <p className="description-text" style={{ fontSize: "1rem" }}>Campaign and partner relationships across music, fashion, tech, entertainment, and creator commerce.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem" }}>
                {brands.map((b, i) => (
                    <div key={i} style={{ padding: "1.25rem", background: "rgba(255,255,255,0.025)", borderRadius: "16px", border: "1px solid var(--bv-border)", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                        <div style={{ minHeight: "34px", display: "flex", alignItems: "center", color: "rgba(255,255,255,0.78)", fontSize: "0.78rem", fontWeight: 850, textTransform: "uppercase", letterSpacing: "0.03em" }}>{b.name}</div>
                        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.34)" }}>{b.domain}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Main Home Component ---

export default function Home() {
    const [drawerContent, setDrawerContent] = useState<{ id: string; title: string } | null>(null);
    const [creators, setCreators] = useState<TalentCardCreator[]>([]);
    const [blogs, setBlogs] = useState<HomeBlog[]>([]);
    const [pageContent, setPageContent] = useState<HomePageContent>(HOME_FALLBACK_CONTENT);

    const archiveCampaigns = useMemo(() => getHomeArchiveCampaigns(), []);
    const featuredCaseStudy = useMemo(
        () => driveCaseStudies.find((item) => item.id === "africanamericanfam-darryring") ?? driveCaseStudies[0],
        [],
    );
    const featuredVideoSrc = useMemo(() => caseStudyPlaybackUrl(featuredCaseStudy), [featuredCaseStudy]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const pageData = await getPageContent("home");
                if (pageData) {
                    setPageContent((prev) =>
                        polishHomeContent({ ...prev, ...(pageData as Partial<HomePageContent>) })
                    );
                }

                // Featured talent — same roster as /roster
                const dbRoster = await fetchFirebaseRosterCreators();
                const roster = buildRosterCreators(dbRoster);
                if (roster.length) setCreators(rosterToTalentCards(roster));

                // Fetch Blogs
                const blogSnap = await getDocs(query(collection(getDb(), "blog_posts"), orderBy("createdAt", "desc"), limit(3)));
                const blogData = blogSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as HomeBlog));
                if (blogData.length) setBlogs(blogData);
            } catch (error) {
                console.error("Data fetch error:", error);
            }
        };
        fetchData();
    }, []);

    const openDrawer = (id: string, title: string) => {
        setDrawerContent({ id, title });
    };

    const renderDrawerContent = () => {
        if (!drawerContent) return null;
        switch (drawerContent.id) {
            case "what-we-do": return <WhatWeDoDetail />;
            case "about": return <AboutUsDetail />;
            case "qna": return <QnADetail />;
            case "campaigns": return <RecentCampaignsDetail campaigns={archiveCampaigns} />;
            case "talent": return <OurTalentDetail talent={creators} />;
            case "case-studies": return <CaseStudiesDetail />;
            case "brands": return <BrandsDetail />;
            default: return <p style={{ color: "rgba(255,255,255,0.4)" }}>Details loading...</p>;
        }
    };

    return (
        <main style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "var(--bv-text)", position: "relative" }}>
            <AmbientBackground />
            <Navbar />

            {/* --- Hero Section --- */}
            <section className="home-hero home-hero-centered" style={{ minHeight: "clamp(920px, 100vh, 1080px)", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                {/* Background Video */}
                <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                    <video 
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.08, filter: "saturate(1.05) contrast(1.05)" }}
                        poster={pageContent.hero_image}
                    >
                        <source src={pageContent.hero_video} type="video/mp4" />
                    </video>
                    <div style={{ position: "absolute", inset: 0, background: "rgba(19, 19, 19, 0.52)" }} />
                </div>

                <div className="home-hero-grid-slot home-hero-centered-grid-slot">
                    <HeroGrid />
                </div>
                
                <div
                    className="section-container home-hero-content home-hero-layout home-hero-centered-content"
                    style={{
                        position: "relative",
                        zIndex: 2,
                        paddingTop: "clamp(6rem, 12vh, 8rem)",
                        paddingBottom: "clamp(4rem, 9vh, 6.5rem)",
                    }}
                >
                    <div className="home-hero-copy home-hero-centered-copy">
                        <motion.h1 
                            initial={{ opacity: 0, y: 40 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.8 }} 
                            className="title-xl" 
                            style={{ marginBottom: "1.1rem", maxWidth: "100%" }}
                        >
                            {pageContent.hero_title}
                            {/* Read by Google and screen readers, not shown: says what we are. */}
                            <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
                                {": Beyond Vision, UK creator management agency for TikTok and Instagram creators"}
                            </span>
                        </motion.h1>

                        <p
                            className="description-text home-hero-centered-subtext"
                            style={{ width: "100%", maxWidth: "52ch", marginBottom: "1.75rem", color: "var(--bv-muted)", fontSize: "clamp(0.9rem, 1vw, 0.98rem)", marginLeft: "auto", marginRight: "auto" }}
                        >
                            {pageContent.hero_text}
                        </p>

                        <div className="home-hero-actions" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
                            <Link href="/for-creators">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    style={{
                                        background: "transparent",
                                        padding: "1rem 2.25rem",
                                    }}
                                >
                                    FOR CREATORS
                                </button>
                            </Link>
                            <Link href="/brands">
                                <button
                                    type="button"
                                    className="btn-primary"
                                    style={{ padding: "1rem 2.25rem" }}
                                >
                                    FOR BRANDS
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

            </section>

            {/* --- What We Do --- */}
            <Section 
                title="What we do" 
                subtitle="Capabilities" 
                onViewMore={() => openDrawer("what-we-do", "Creator + Brand Capabilities")}
                containerStyle={{
                    paddingTop: "calc(var(--section-y) * 0.82)",
                    paddingBottom: "calc(var(--section-y) * 0.52)",
                }}
            >
                <div className="home-services-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "1.25rem" }}>
                    <MiniCard label="01 / CAMPAIGNS" icon={<Target size={16} strokeWidth={2} aria-hidden />} title="Influencer campaigns" desc="Audience fit, deliverables, usage, timelines, and reporting—planned like a real channel, not a one-off post." />
                    <MiniCard label="02 / MANAGEMENT" icon={<Layers size={16} strokeWidth={2} aria-hidden />} title="Campaign operations" desc="Sourcing, negotiation, approvals, posting windows, and partner comms—so nothing slips between brief and live." />
                    <MiniCard label="03 / CREATIVE" icon={<Zap size={16} strokeWidth={2} aria-hidden />} title="Content strategy" desc="Hooks, platform angles, and cadence tuned to where the audience already trusts the creator." />
                </div>
            </Section>

            {/* --- Brands --- */}
            <section style={{ background: "transparent", padding: "calc(var(--section-y) * 0.52) var(--bv-space-3) calc(var(--section-y) * 0.62)", position: "relative", overflow: "hidden", borderTop: "1px solid var(--bv-border)", borderBottom: "1px solid var(--bv-border)" }}>
                <BrandsTicker />
                <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", marginTop: "1.75rem", position: "relative", zIndex: 1 }}>
                    <button type="button" onClick={() => openDrawer("brands", "Brand Relationships")} className="btn-secondary" style={{ margin: 0 }}>Explore brand relationships <ArrowRight size={16} /></button>
                </div>
            </section>

            {/* --- About Us --- */}
            <Section 
                title={pageContent.about_title} 
                subtitle={pageContent.about_subtitle} 
                onViewMore={() => openDrawer("about", "Agency Model")}
                containerStyle={{ paddingTop: "calc(var(--section-y) * 1.02)", paddingBottom: "calc(var(--section-y) * 0.88)" }}
            >
                <div className="home-about-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "clamp(2.5rem, 5vw, 4rem)", alignItems: "center" }}>
                    <div>
                        <p className="description-text" style={{ fontSize: "1.02rem", color: "rgba(255,255,255,0.9)", marginBottom: "1rem", lineHeight: 1.6, maxWidth: "52ch" }}>
                            {pageContent.about_intro}
                        </p>
                        <p className="description-text" style={{ marginBottom: "2rem", maxWidth: "52ch" }}>
                            {pageContent.about_body}
                        </p>
                        <div className="home-stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                            {(pageContent.about_stats || []).slice(0, 2).map((stat) => (
                                <StatTile key={stat.label} label={stat.label} value={stat.value} />
                            ))}
                        </div>
                    </div>
                    <div style={{ position: "relative" }}>
                        <div style={{ width: "100%", height: "min(440px, 52vw)", maxHeight: "480px", borderRadius: "var(--bv-radius-lg)", overflow: "hidden", background: "var(--bv-surface)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "none", position: "relative" }}>
                            <img
                                src={pageContent.about_image}
                                alt=""
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    objectPosition: "48% 18%",
                                    transform: "scale(1.28)",
                                    transformOrigin: "50% 22%",
                                    opacity: 0.92,
                                }}
                            />
                        </div>
                        <div style={{ position: "absolute", bottom: "-1.25rem", left: "-1.25rem", padding: "0.85rem 1.15rem", background: "var(--accent)", color: "#000", borderRadius: "var(--bv-radius-md)", fontWeight: 800, fontSize: "0.8rem", boxShadow: "0 10px 28px rgba(0,0,0,0.4)" }}>
                            EST. 2022
                        </div>
                    </div>
                </div>
            </Section>

            {/* --- Recent Campaigns --- */}
            <Section 
                title="Recent campaigns" 
                subtitle="Portfolio" 
                titleTone="quiet"
                onViewMore={() => window.location.href = "/recent-campaigns"}
                containerStyle={{ paddingTop: "calc(var(--section-y) * 0.72)", paddingBottom: "calc(var(--section-y) * 0.58)" }}
            >
                {archiveCampaigns.length ? (
                    <CampaignRosterCarousel campaigns={archiveCampaigns} />
                ) : (
                    <Card padding="1.5rem" style={{ textAlign: "center" }} hover={false}>
                        <h3 style={{ textTransform: "none", marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 800 }}>Campaign archive ready.</h3>
                        <p className="description-text" style={{ margin: "0 auto", maxWidth: "620px" }}>New campaign results are being prepared for publication.</p>
                    </Card>
                )}
            </Section>

            {/* --- Our Talent --- */}
            <Section
                title="Featured talent"
                subtitle="Roster"
                onViewMore={() => window.location.href = "/roster"}
                containerStyle={{ paddingTop: "calc(var(--section-y) * 0.95)", paddingBottom: "calc(var(--section-y) * 0.62)" }}
            >
                <p className="description-text" style={{ maxWidth: "52ch", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                    {creators.length
                        ? `${creators.length} creators on our roster—synced live with the full directory.`
                        : "Our full creator roster—synced with the directory on the roster page."}
                </p>
                <TalentRosterCarousel creators={creators} />
            </Section>

            {/* --- Case Studies --- */}
            <Section 
                title="Case studies" 
                subtitle="Deep dives" 
                titleTone="quiet"
                onViewMore={() => window.location.href = "/case-studies"}
                containerStyle={{ paddingTop: "calc(var(--section-y) * 0.62)", paddingBottom: "calc(var(--section-y) * 0.55)" }}
            >
                <div className="home-case-study" style={{ background: "#151515", borderRadius: "var(--bv-radius-lg)", padding: "2rem", border: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 380px)", gap: "2.5rem", alignItems: "center", boxShadow: "none" }}>
                    <div>
                        <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>Featured case study</div>
                        <h3 className="title-md" style={{ marginBottom: "1.25rem", textTransform: "none" }}>
                            {featuredCaseStudy.creator} x {featuredCaseStudy.brand}
                        </h3>
                        <p className="description-text" style={{ marginBottom: "1.4rem" }}>
                            A verified {featuredCaseStudy.category.toLowerCase()} campaign with real creative, public video, thumbnail, and performance metrics from the case-study archive.
                        </p>
                        <div className="home-case-metrics">
                            <div>
                                <strong>{featuredCaseStudy.metrics.views}</strong>
                                <span>Views</span>
                            </div>
                            <div>
                                <strong>{featuredCaseStudy.metrics.likes}</strong>
                                <span>Likes</span>
                            </div>
                            <div>
                                <strong>{featuredCaseStudy.metrics.engagement}</strong>
                                <span>Engagement</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "2rem" }}>
                            <Link href="/case-studies">
                                <button className="btn-secondary">View More <ArrowUpRight size={16} /></button>
                            </Link>
                            <Link href={featuredCaseStudy.tiktokUrl} target="_blank" rel="noopener noreferrer">
                                <button className="btn-secondary">Watch Video <ArrowUpRight size={16} /></button>
                            </Link>
                        </div>
                    </div>
                    <div className="home-case-media-wrap">
                        <div className="home-case-media">
                            <VideoPlayer
                                src={featuredVideoSrc}
                                poster={driveThumbnailUrl(featuredCaseStudy.driveFileId)}
                                aspectRatio="9 / 16"
                                borderRadius="24px"
                                controlsAlwaysVisible
                            />
                        </div>
                        <div className="home-case-media-caption">
                            <span>{featuredCaseStudy.year}</span>
                            <span>Video case</span>
                            <strong>{featuredCaseStudy.category}</strong>
                        </div>
                    </div>
                </div>
            </Section>

            {/* --- Testimonials --- */}
            <Section
                title="Client testimonials"
                subtitle="Social proof"
                titleTone="quiet"
                containerStyle={{ paddingTop: "calc(var(--section-y) * 0.68)", paddingBottom: "calc(var(--section-y) * 0.5)" }}
            >
                <TestimonialsInfiniteScroll />
            </Section>

            {/* --- QnA & Blog --- */}
            <div className="section-container home-qna-blog" style={{ padding: "calc(var(--section-y) * 0.82) var(--bv-space-3) calc(var(--section-y) * 0.7)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
                <div>
                    <h2 className="title-md" style={{ marginBottom: "2rem" }}>Creator + Brand Q&A</h2>
                    <HomeFaqAccordion items={pageContent.faqs || DEFAULT_FAQ_ENTRIES} />
                </div>
                <div>
                    <h2 className="title-md" style={{ marginBottom: "2rem" }}>Industry Notes</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        {blogs.length ? (
                            blogs.map((b, i) => (
                                <div key={i} style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                    <div style={{ width: "80px", height: "80px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", flexShrink: 0 }}>
                                        <img src={b.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} alt="" />
                                    </div>
                                    <div>
                                        <h5 style={{ fontWeight: 900, textTransform: "uppercase" }}>{b.title}</h5>
                                        <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginTop: "0.4rem" }}>{b.date} • {b.category}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Card padding="1.5rem" hover={false}>
                                <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>Coming soon</div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, textTransform: "none", marginBottom: "0.75rem" }}>Creator economy notes are being prepared.</h3>
                                <p className="description-text" style={{ fontSize: "0.98rem" }}>New posts on creator management, brand partnerships, campaign planning, and audience trust will appear here once published.</p>
                            </Card>
                        )}
                        <button onClick={() => window.location.href = "/blog"} className="btn-secondary" style={{ width: "fit-content" }}>View Industry Notes <ArrowRight size={16} /></button>
                    </div>
                </div>
            </div>

            <div className="home-final-cta" style={{ width: "100%", position: "relative", zIndex: 12, background: "var(--bv-surface)", borderTop: "1px solid var(--bv-border)", borderBottom: "1px solid var(--bv-border)", padding: "calc(var(--section-y) * 0.75) var(--bv-space-3)", boxShadow: "none" }}>
                <div style={{ maxWidth: "1180px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "2.5rem" }}>
                    <div style={{ flex: "1 1 420px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.85rem" }}>
                            <div style={{ width: "6px", height: "6px", background: "var(--accent)", borderRadius: "50%" }} />
                            <span style={{ fontSize: "0.75rem", fontWeight: 650, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                                Next steps
                            </span>
                        </div>
                        <h2 className="section-title" style={{ maxWidth: "20ch" }}>
                            Work with Beyond Vision
                        </h2>
                    </div>
                    
                    <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", alignItems: "center" }}>
                        <Link href="/about-us">
                            <button style={{ 
                                background: "rgba(0,0,0,0.24)",
                                color: "#fff",
                                padding: "1.2rem 3rem",
                                borderRadius: "100px",
                                border: "1px solid var(--bv-border-strong)",
                                fontWeight: 750, 
                                fontSize: "0.85rem", 
                                textTransform: "uppercase", 
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                            }} onMouseEnter={(e) => (e.currentTarget.style.background = "#222")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.24)")}>
                                ABOUT US
                            </button>
                        </Link>
                        <Link href="/blog">
                            <button
                                type="button"
                                className="btn-primary"
                                style={{ 
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.6rem"
                                }}
                            >
                                READ INDUSTRY NOTES <ArrowUpRight size={18} />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .home-case-metrics {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 0.75rem;
                    max-width: 620px;
                }

                .home-case-metrics > div {
                    padding: 0.9rem;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.035);
                    border: 1px solid rgba(255, 255, 255, 0.07);
                }

                .home-case-metrics strong {
                    display: block;
                    color: #fff;
                    font-size: clamp(1.2rem, 2vw, 1.6rem);
                    line-height: 1;
                    margin-bottom: 0.45rem;
                }

                .home-case-metrics span {
                    display: block;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 0.6rem;
                    font-weight: 900;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                .home-case-media-wrap {
                    position: relative;
                    width: min(100%, 330px);
                    justify-self: center;
                    display: flex;
                    flex-direction: column;
                    gap: 0.9rem;
                }

                .home-case-media {
                    position: relative;
                    aspect-ratio: 9 / 16;
                    min-height: 0;
                    overflow: hidden;
                    border-radius: 24px;
                    background:
                        radial-gradient(circle at 50% 20%, rgba(255, 244, 87, 0.12), transparent 35%),
                        #080808;
                    border: 1px solid var(--bv-border-accent);
                    box-shadow: 0 28px 80px rgba(0, 0, 0, 0.38);
                }

                .home-case-media :global(.bv-video-player) {
                    width: 100%;
                    height: 100%;
                }

                .home-case-media-caption {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    padding: 0.8rem 0.95rem;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                }

                .home-case-media-caption span,
                .home-case-media-caption strong {
                    font-size: 0.64rem;
                    font-weight: 900;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                .home-case-media-caption span {
                    color: rgba(255, 255, 255, 0.62);
                }

                .home-case-media-caption strong {
                    color: var(--accent);
                }

                @media (max-width: 1024px) {
                    .home-about-grid,
                    .home-case-study {
                        grid-template-columns: 1fr !important;
                        gap: 2.5rem !important;
                    }
                    .home-qna-blog {
                        grid-template-columns: 1fr !important;
                        gap: 4rem !important;
                        padding: 4rem 1.5rem !important;
                    }
                    .home-final-cta {
                        padding: 3rem 1.5rem !important;
                    }
                }
                @media (max-width: 640px) {
                    .home-hero-centered .home-hero-layout > .home-hero-copy {
                        width: calc(100vw - 48px) !important;
                        max-width: calc(100vw - 48px) !important;
                    }
                    .home-hero-centered .home-hero-content h1,
                    .home-hero-centered .home-hero-content p,
                    .home-hero-centered .home-hero-actions {
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    .home-hero-centered .home-hero-content h1 {
                        font-size: clamp(2.25rem, 9vw, 3.5rem) !important;
                    }
                    .home-stats-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .home-case-study {
                        padding: 1.5rem !important;
                    }
                    .home-case-metrics {
                        grid-template-columns: 1fr !important;
                    }
                    .home-case-media {
                        width: min(100%, 290px);
                    }
                    .home-final-cta a,
                    .home-final-cta button {
                        width: 100%;
                    }
                }
            `}</style>

            <Footer />

            <SideDrawer 
                isOpen={!!drawerContent} 
                onClose={() => setDrawerContent(null)} 
                title={drawerContent?.title || ""}
            >
                {renderDrawerContent()}
            </SideDrawer>
        </main>
    );
}

// --- Helper Components ---

function TestimonialsInfiniteScroll() {
    const [items, setItems] = useState(CLIENT_TESTIMONIALS);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const snap = await getDocs(query(collection(getDb(), "testimonials"), orderBy("createdAt", "desc")));
                const data = snap.docs.map((doc) => doc.data() as { quote: string; name: string; brand: string; type?: string });
                setItems(resolveClientTestimonials(data));
            } catch (error) {
                console.error("Home testimonials fallback active:", error);
            }
        };
        fetchTestimonials();
    }, []);

    const visibleItems = items.slice(0, 7);

    return (
        <div className="testimonials-strip" style={{ margin: "0 -2rem", padding: "0.75rem 2rem 1.25rem" }}>
            <PagedRowCarousel variant="testimonials" itemGap="1rem" rowGap="1rem">
                {visibleItems.map((t, i) => (
                    <TestimonialCard key={`${t.name}-${t.brand}-${i}`} {...t} />
                ))}
            </PagedRowCarousel>
        </div>
    );
}

function TestimonialCard({ quote, name, brand }: { quote: string; name: string; brand: string }) {
    return (
        <Card
            padding="1.35rem"
            style={{
                width: "300px",
                minHeight: "220px",
                height: "100%",
                flexShrink: 0,
                whiteSpace: "normal",
                display: "flex",
                flexDirection: "column",
                borderRadius: "var(--bv-radius-md)",
                background: "#151515",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "none",
            }}
        >
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{ width: "28px", height: "2px", background: "rgba(255,244,87,0.55)", marginBottom: "1rem", borderRadius: "1px", flexShrink: 0 }} />
                <p style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.6, flex: 1, fontSize: "0.875rem", fontStyle: "normal", margin: 0 }}>
                    &ldquo;{quote}&rdquo;
                </p>
            </div>
            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--bv-border)", flexShrink: 0 }}>
                <h5 style={{ fontWeight: 750, fontSize: "0.86rem", color: "#fff", textTransform: "uppercase", letterSpacing: "0.01em", margin: 0 }}>{name}</h5>
                <p style={{ fontSize: "0.74rem", color: "var(--bv-muted)", fontWeight: 650, marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{brand}</p>
            </div>
        </Card>
    );
}

function MiniCard({ icon, label, title, desc }: { icon: ReactNode; label: string; title: string; desc: string }) {
    return (
        <Card padding="1.15rem 1.2rem" style={{ minHeight: "unset", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div className="eyebrow" style={{ marginBottom: "0.45rem", fontSize: "0.68rem", letterSpacing: "0.14em" }}>{label}</div>
            <div
                style={{
                    color: "var(--accent)",
                    background: "rgba(255, 244, 87, 0.06)",
                    width: "32px",
                    height: "32px",
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "var(--bv-radius-sm)",
                    marginBottom: "0.65rem",
                    border: "1px solid rgba(255, 244, 87, 0.12)",
                }}
            >
                {icon}
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 750, textTransform: "none", marginBottom: "0.45rem", color: "var(--bv-text)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{title}</h3>
            <p className="card-body" style={{ fontSize: "0.8125rem", lineHeight: 1.55 }}>{desc}</p>
        </Card>
    );
}
