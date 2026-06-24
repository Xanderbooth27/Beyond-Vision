"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowDownRight, Layers } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import AmbientBackground from "@/components/AmbientBackground";
import VideoPlayer from "@/components/VideoPlayer";
import { getPageContent } from "@/lib/cms";

interface Campaign {
    id: string;
    influencer: string;
    brand: string;
    platform: string;
    month: string;
    category: string;
    strategy: string;
    thumbnail: string;
    videoUrl?: string;
    metrics: {
        views: string;
        engagement: string;
    };
}

type WorkPageContent = {
    hero_badge: string;
    hero_title: string;
    hero_text: string;
    empty_msg: string;
    sync_msg: string;
};

const CATEGORIES = ["ALL", "TECH", "LIFESTYLE", "BEAUTY", "FASHION", "EDUCATION"];
const MONTHS = ["ALL", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function WorkPage() {
    const [pageContent, setPageContent] = useState<WorkPageContent>({
        hero_badge: "The Performance Portfolio",
        hero_title: "Impact-Driven Social-First Cases",
        hero_text: "Engineering viral growth through proprietary pattern logic and community-first storytelling for global visionaries.",
        empty_msg: "NO_CAMPAIGNS_FOUND_FOR_CRITERIA",
        sync_msg: "SYNCING_PERFORMANCE_DATA..."
    });
    
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("ALL");
    const [activeMonth, setActiveMonth] = useState("ALL");
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            const data = await getPageContent("work");
            if (data) setPageContent((prev) => ({ ...prev, ...data }));
        };
        fetchContent();
    }, []);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const q = query(collection(getDb(), "work_campaigns"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data() 
                } as Campaign));
                if (items.length) setCampaigns(items);
            } catch (error) {
                console.error("Error fetching work:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    const filteredCampaigns = campaigns.filter(c => {
        const catMatch = activeCategory === "ALL" || c.category.toUpperCase() === activeCategory.toUpperCase();
        const monthMatch = activeMonth === "ALL" || (c.month && c.month.toUpperCase() === activeMonth.toUpperCase());
        return catMatch && monthMatch;
    });

    return (
        <main style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative" }}>
            <AmbientBackground />
            <Navbar />

            {/* Cinematic Scanline Overlay */}
            <div style={{
                position: "fixed",
                inset: 0,
                background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02))",
                backgroundSize: "100% 4px, 3px 100%",
                pointerEvents: "none",
                zIndex: 5,
                opacity: 0.3
            }} />

            <div style={{ position: "relative", zIndex: 10 }}>
                {/* Hero Section - Balanced Protocol */}
                <section style={{
                    minHeight: "75vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    position: "relative",
                    paddingBottom: "8rem"
                }}>
                    <div className="work-hero" style={{
                        width: "100%",
                        maxWidth: "1400px",
                        padding: "0 4rem",
                        position: "relative",
                        zIndex: 10
                    }}>
                        <div style={{ maxWidth: "1000px" }}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    marginBottom: "3rem"
                                }}
                            >
                                <div style={{ width: "40px", height: "1px", background: "var(--accent)" }} />
                                <span style={{ fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "4px", color: "rgba(255,255,255,0.4)" }}>
                                    {pageContent.hero_badge}
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                                    fontWeight: 900,
                                    lineHeight: 1.1,
                                    letterSpacing: "-0.04em",
                                    textTransform: "uppercase",
                                    marginBottom: "3rem",
                                    color: "#fff",
                                    maxWidth: "800px"
                                }}
                            >
                                {pageContent.hero_title.split(" ").map((word: string, i: number) => (
                                    <span key={i} style={i === 1 ? { color: "var(--accent)" } : {}}>{word} </span>
                                ))}
                            </motion.h1>

                            <div style={{ display: "flex", gap: "4rem", alignItems: "flex-start" }} className="work-hero-footer">
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    style={{
                                        fontSize: "1.1rem",
                                        color: "rgba(255,255,255,0.4)",
                                        maxWidth: "450px",
                                        lineHeight: 1.8,
                                        fontWeight: 500
                                    }}
                                >
                                    {pageContent.hero_text}
                                </motion.p>
                                
                                <div style={{ display: "flex", gap: "3rem" }}>
                                    <div>
                                        <div style={{ fontSize: "0.6rem", fontWeight: 900, color: "rgba(255,255,255,0.2)", letterSpacing: "2px", marginBottom: "0.5rem" }}>ARCHIVE_STATUS</div>
                                        <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#4ade80" }}>[SYSTEM_ONLINE]</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.6rem", fontWeight: 900, color: "rgba(255,255,255,0.2)", letterSpacing: "2px", marginBottom: "0.5rem" }}>DEPLOYED_UNITS</div>
                                        <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#fff" }}>{campaigns.length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filter Grid - Tactical Cinematic Styling */}
                <section style={{
                    padding: "0",
                    position: "sticky",
                    top: "78px",
                    zIndex: 90,
                    background: "rgba(8, 9, 10, 0.8)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    backdropFilter: "blur(40px)"
                }}>
                    <div className="filter-wrapper" style={{ 
                        maxWidth: "1400px", 
                        margin: "0 auto", 
                        padding: "1rem 4rem", 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        gap: "2rem"
                    }}>
                        {/* Categories - Tactical Pills */}
                        <div style={{ 
                            display: "flex", 
                            gap: "0.5rem", 
                            overflowX: "auto", 
                            padding: "0.5rem 0",
                            scrollbarWidth: "none",
                            msOverflowStyle: "none"
                        }} className="filter-inner-scroll">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    style={{
                                        background: activeCategory === cat ? "rgba(255, 246, 117, 0.1)" : "transparent",
                                        border: activeCategory === cat ? "1px solid rgba(255, 246, 117, 0.3)" : "1px solid transparent",
                                        color: activeCategory === cat ? "var(--accent)" : "rgba(255,255,255,0.25)",
                                        padding: "0.6rem 1.4rem",
                                        borderRadius: "100px",
                                        fontSize: "0.7rem",
                                        fontWeight: 900,
                                        textTransform: "uppercase",
                                        letterSpacing: "2px",
                                        cursor: "pointer",
                                        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        
                        {/* Months - Diagnostic Track */}
                        <div style={{ 
                            display: "flex", 
                            gap: "1.5rem", 
                            alignItems: "center",
                            background: "rgba(255,255,255,0.02)",
                            padding: "0.5rem 1.5rem",
                            borderRadius: "100px",
                            border: "1px solid rgba(255,255,255,0.05)"
                        }} className="filter-months-wrapper">
                            <span style={{ fontSize: "0.6rem", fontWeight: 900, color: "rgba(255,255,255,0.15)", letterSpacing: "1px" }}>CYCLE:</span>
                            <div style={{ display: "flex", gap: "1rem" }} className="filter-months">
                                {MONTHS.slice(0, 7).map(month => (
                                    <button
                                        key={month}
                                        onClick={() => setActiveMonth(month)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: activeMonth.toUpperCase() === month.toUpperCase() ? "#fff" : "rgba(255,255,255,0.1)",
                                            fontSize: "0.65rem",
                                            fontWeight: 900,
                                            textTransform: "uppercase",
                                            letterSpacing: "1px",
                                            cursor: "pointer",
                                            transition: "color 0.3s"
                                        }}
                                    >{month === "ALL" ? "ALL" : month.substring(0, 3)}</button>
                                ))}
                            </div>
                            <div style={{ width: "1px", height: "15px", background: "rgba(255,255,255,0.1)" }} />
                            <Layers size={14} color="rgba(255,255,255,0.15)" />
                        </div>
                    </div>
                </section>

                {/* Campaign Grid - Premium Modular Aesthetic */}
                <section style={{ padding: "8rem 4rem" }} className="campaign-section">
                    <div className="campaign-grid" style={{
                        maxWidth: "1400px",
                        margin: "0 auto",
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "10rem 6rem"
                    }}>
                        {loading ? (
                            <div style={{ gridColumn: "span 2", padding: "10rem 0", textAlign: "center" }}>
                                <p style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "5px", color: "rgba(255,255,255,0.2)" }}>{pageContent.sync_msg}</p>
                            </div>
                        ) : filteredCampaigns.length > 0 ? (
                            filteredCampaigns.map((campaign, idx) => (
                                <motion.div
                                    key={campaign.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                    onMouseEnter={() => setHoveredCard(campaign.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    style={{ position: "relative" }}
                                >
                                    {/* Campaign ID Tag */}
                                    <div style={{ position: "absolute", top: "-4rem", left: "1.5rem", display: "flex", alignItems: "baseline", gap: "0.5rem" }} className="campaign-id-tag">
                                        <span style={{ fontSize: "3rem", fontWeight: 900, color: "rgba(255,255,255,0.03)", fontFamily: "monospace" }}>0{idx + 1}</span>
                                        <div style={{ width: "20px", height: "1px", background: "rgba(255,255,255,0.1)", marginBottom: "0.8rem" }} />
                                    </div>

                                    {/* Card Container */}
                                    <div style={{
                                        position: "relative",
                                        borderRadius: "32px",
                                        overflow: "hidden",
                                        background: "#121417",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        aspectRatio: "1/1.1",
                                        transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                                        transform: hoveredCard === campaign.id ? "scale(1.01) translateY(-10px)" : "scale(1)",
                                        zIndex: hoveredCard === campaign.id ? 20 : 1
                                    }}>
                                        <VideoPlayer src={campaign.videoUrl} poster={campaign.thumbnail} borderRadius="32px" />
                                        
                                        {/* Cinematic Info Bar */}
                                        <div style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: "2.5rem",
                                            background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)",
                                            display: hoveredCard === campaign.id ? "block" : "none"
                                        }} className="experience-overlay">
                                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1.5rem" }} className="experience-metrics">
                                                    <div>
                                                        <div style={{ fontSize: "0.6rem", fontWeight: 900, color: "rgba(255,255,255,0.4)", letterSpacing: "2px", marginBottom: "0.5rem" }}>AUDIENCE Reach</div>
                                                        <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff" }}>{campaign.metrics.views}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: "0.6rem", fontWeight: 900, color: "rgba(255,255,255,0.4)", letterSpacing: "2px", marginBottom: "0.5rem" }}>ENGAGEMENT Sync</div>
                                                        <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--accent)" }}>{campaign.metrics.engagement}</div>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>Deployment focused on {campaign.strategy} across {campaign.platform} ecosystems.</p>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Campaign Identification Header */}
                                    <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <h3 style={{ fontSize: "1.8rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em" }}>{campaign.brand}</h3>
                                            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", fontWeight: 700, marginTop: "0.4rem" }}>{campaign.influencer} <span style={{ color: "var(--accent)", margin: "0 0.5rem" }}>{"//"}</span> {campaign.month}</p>
                                        </div>
                                        <ArrowDownRight size={24} color="var(--accent)" style={{ opacity: hoveredCard === campaign.id ? 1 : 0.2, transition: "opacity 0.3s" }} className="campaign-arrow" />
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{ gridColumn: "span 2", textAlign: "center", padding: "10rem 0", color: "rgba(255,255,255,0.1)" }}>
                                <p style={{ fontSize: "0.8rem", fontWeight: 900, letterSpacing: "3px" }}>{pageContent.empty_msg}</p>
                            </div>
                        )}
                    </div>
                </section>

                <Footer />
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .work-hero, .filter-wrapper, .campaign-section { padding: 0 2rem !important; }
                    .work-hero-footer { flex-direction: column !important; gap: 3rem !important; }
                    .campaign-grid { 
                        grid-template-columns: 1fr !important;
                        gap: 8rem 0 !important;
                    }
                    .filter-months-wrapper { display: none !important; }
                    .campaign-id-tag { display: none !important; }
                    .experience-overlay { display: block !important; }
                    .campaign-arrow { opacity: 1 !important; }
                }

                @media (max-width: 600px) {
                    .filter-wrapper { padding: 0 1.5rem !important; }
                    .experience-metrics { flex-direction: column !important; gap: 1.5rem !important; }
                }
            `}</style>
        </main>
    );
}
