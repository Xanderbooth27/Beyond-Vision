"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface NewsletterCTAProps {
    subtitle?: string;
    title?: string;
    boxTitle?: string;
    boxText?: string;
}

export function NewsletterCTA({ 
    subtitle = "STAY_SYNCED", 
    title = "THE PATTERN LOGIC", 
    boxTitle = "Stay Synced.", 
    boxText = "Join 20k+ global brand managers receiving our proprietary bi-weekly social economy analyses." 
}: NewsletterCTAProps) {
    const [email, setEmail] = useState("");

    return (
        <div className="newsletter-cta" style={{ marginBottom: "6rem", paddingBottom: "6rem", borderBottom: "1px solid var(--bv-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "8px", height: "8px", background: "var(--accent)", borderRadius: "50%" }} />
                <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)" }}>
                    {subtitle}
                </span>
            </div>
            <h2 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 0, lineHeight: 0.95, marginBottom: "3rem", color: "var(--bv-yellow)" }}>
                {title}
            </h2>

            <div style={{ padding: "clamp(2.5rem, 5vw, 4.5rem)", borderRadius: "var(--bv-radius-lg)", background: "var(--accent)", color: "#000", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.45)" }}>
                <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 900, color: "#000", marginBottom: "2rem", textTransform: "uppercase", letterSpacing: "-0.02em" }}>{boxTitle}</h2>
                <p style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.2rem)", fontWeight: 800, maxWidth: "600px", margin: "0 auto 4rem", lineHeight: 1.5 }}>
                    {boxText}
                </p>
                <form className="newsletter-form" onSubmit={(e) => e.preventDefault()} style={{ maxWidth: "600px", margin: "0 auto", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ENTER EMAIL ADDRESS..." 
                        style={{ flex: "1 1 300px", padding: "1.2rem 1.5rem", background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.14)", borderRadius: "100px", color: "#000", outline: "none", fontSize: "0.9rem", fontWeight: 900 }}
                    />
                    <button style={{ flex: "0 0 auto", background: "#000", color: "var(--accent)", padding: "1.2rem 3rem", borderRadius: "100px", border: "none", fontWeight: 900, fontSize: "0.9rem", textTransform: "uppercase", cursor: "pointer", width: "100%", maxWidth: "max-content" }}>JOIN US</button>
                </form>
            </div>
            <style jsx>{`
                @media (max-width: 640px) {
                    .newsletter-cta {
                        margin-bottom: 3rem !important;
                        padding-bottom: 3rem !important;
                    }
                    .newsletter-form input,
                    .newsletter-form button {
                        max-width: none !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
}

interface ActionCTAProps {
    subtitle?: string;
    title?: string;
    buttonText?: string;
    href?: string;
}

export function ActionCTA({ 
    subtitle = "NEXT STEPS", 
    title = "READY TO MOVE?", 
    buttonText = "Contact Us", 
    href = "/contact" 
}: ActionCTAProps) {
    return (
        <div className="action-cta" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "6rem", flexWrap: "wrap", gap: "3rem" }}>
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.5rem" }}>
                    <div style={{ width: "8px", height: "8px", background: "var(--accent)", borderRadius: "50%" }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)" }}>
                        {subtitle}
                    </span>
                </div>
                <h2 style={{ fontSize: "clamp(2rem, 8vw, 6rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 0, lineHeight: 0.95, color: "var(--bv-yellow)" }}>
                    {title}
                </h2>
            </div>
            <Link href={href}>
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary"
                    style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}
                >
                    {buttonText} <ArrowUpRight size={20} />
                </motion.button>
            </Link>
            <style jsx>{`
                @media (max-width: 640px) {
                    .action-cta {
                        align-items: stretch !important;
                        gap: 1.75rem !important;
                        margin-bottom: 3rem !important;
                    }
                    .action-cta > div,
                    .action-cta a {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
export function ExploreProtocolCTA() {
    return (
        <div className="explore-cta" style={{ padding: "5rem 0", borderTop: "1px solid var(--bv-border)" }}>
            <div className="explore-cta-inner" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "4rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.5rem" }}>
                        <div style={{ width: "8px", height: "8px", background: "var(--accent)", borderRadius: "50%" }} />
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)" }}>
                            NEXT STEPS
                        </span>
                    </div>
                    <h2 style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 0, lineHeight: 0.95, color: "var(--bv-yellow)" }}>
                        WORK WITH BEYOND VISION
                    </h2>
                </div>
                
                <div className="explore-cta-actions" style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    <Link href="/about-us">
                        <button style={{ 
                            background: "rgba(255,255,255,0.025)", 
                            color: "#fff", 
                            padding: "1.2rem 3rem", 
                            borderRadius: "100px", 
                            border: "1px solid var(--bv-border-strong)", 
                            fontWeight: 900, 
                            fontSize: "0.9rem", 
                            textTransform: "uppercase", 
                            cursor: "pointer" 
                        }}>
                            ABOUT US
                        </button>
                    </Link>
                    <Link href="/blog">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ 
                                display: "flex",
                                alignItems: "center",
                                gap: "0.8rem"
                            }}
                            className="btn-primary"
                        >
                            READ INDUSTRY NOTES <ArrowUpRight size={18} />
                        </motion.button>
                    </Link>
                </div>
            </div>
            <style jsx>{`
                @media (max-width: 640px) {
                    .explore-cta {
                        padding: 3rem 0 !important;
                    }
                    .explore-cta-inner {
                        gap: 2rem !important;
                    }
                    .explore-cta-inner > div,
                    .explore-cta-actions,
                    .explore-cta-actions a,
                    .explore-cta-actions button {
                        width: 100%;
                    }
                    .explore-cta-actions {
                        gap: 1rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
