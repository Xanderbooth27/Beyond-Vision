"use client";

import { useState, useEffect } from "react";
import { getPageContent } from "@/lib/cms";
import { CONTACT_EMAIL } from "@/lib/content-defaults";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Instagram, Linkedin, Twitter } from "lucide-react";
import type { ReactNode } from "react";

export default function Footer() {
    type FooterContent = {
        hq_label: string;
        hq_address: string;
        email: string;
        copyright: string;
        logo_text: string;
        footer_tagline: string;
    };

    const [footerContent, setFooterContent] = useState<FooterContent>({
        hq_label: "GLOBAL_HQ",
        hq_address: "Dover, Delaware",
        email: CONTACT_EMAIL,
        copyright: "\u00A9 2026 BEYOND VISION PERFORMANCE. ALL RIGHTS RESERVED.",
        logo_text: "BEYOND VISION",
        footer_tagline: "The global authority in social performance.",
    });

    useEffect(() => {
        const fetchContent = async () => {
            const data = await getPageContent("global");
            if (data) setFooterContent((prev) => ({ ...prev, ...(data as Partial<FooterContent>) }));
        };
        fetchContent();
    }, []);

    const sections = [
        {
            title: "Navigation",
            links: [
                { label: "Home", href: "/" },
                { label: "Recent Campaigns", href: "/recent-campaigns" },
                { label: "Work", href: "/work" },
                { label: "Our Roster", href: "/roster" },
                { label: "Our Talent", href: "/our-talent" },
                { label: "Case Studies", href: "/case-studies" },
            ],
        },
        {
            title: "Solutions",
            links: [
                { label: "For Brands", href: "/brands" },
                { label: "For Creators", href: "/for-creators" },
                { label: "What We Do For Creators", href: "/creators-what-we-offer" },
                { label: "Why We Do It", href: "/creators-why-we-do-it" },
                { label: "What We Do", href: "/what-we-do" },
                { label: "About Us", href: "/about-us" },
            ],
        },
        {
            title: "Company",
            links: [
                { label: "Blog", href: "/blog" },
                { label: "Blogs", href: "/blogs" },
                { label: "Contact", href: "/contact" },
                { label: "Careers", href: "#" },
                { label: "Terms", href: "#" },
            ],
        },
    ];

    return (
        <footer style={{ 
            background: "var(--bv-bg-deep)", 
            padding: "4rem 0 3rem",
            borderTop: "1px solid var(--bv-border)",
            position: "relative",
            zIndex: 10,
            overflow: "hidden"
        }}>
            {/* Ambient Background Glow in Footer */}
            <div style={{
                position: "absolute",
                bottom: "-200px",
                right: "0",
                width: "600px",
                height: "600px",
                background: "rgba(255, 255, 255, 0.035)",
                filter: "blur(100px)",
                zIndex: -1
            }} />

            <div className="footer-container" style={{ padding: "0 4rem", maxWidth: "1600px", margin: "0 auto" }}>
                {/* Information Grid */}
                <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "4rem", marginBottom: "3.5rem" }}>
                    
                    {/* Brand Identity Side */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                        <Link href="/" style={{ fontSize: "1.35rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <img
                                src="/logo_main.jpg"
                                alt=""
                                aria-hidden="true"
                                style={{
                                    width: "34px",
                                    height: "34px",
                                    objectFit: "contain",
                                    borderRadius: "4px",
                                    boxShadow: "0 0 20px rgba(255,255,255,0.06)"
                                }}
                            />
                            {footerContent.logo_text}
                        </Link>
                        
                        <p style={{ color: "var(--bv-muted)", lineHeight: 1.7, fontSize: "1rem", maxWidth: "340px" }}>
                            {footerContent.footer_tagline}
                        </p>
                        
                        <div style={{ display: "flex", gap: "1.2rem" }}>
                            <SocialIcon icon={<Instagram size={20} />} href="https://www.instagram.com/beyondvisionltd/" />
                            <SocialIcon icon={<Twitter size={20} />} href="https://twitter.com" />
                            <SocialIcon icon={<Linkedin size={20} />} href="https://www.linkedin.com/company/beyond-vision-ltd/" />
                            <SocialIcon icon={<Mail size={20} />} href={`mailto:${CONTACT_EMAIL}`} />
                        </div>
                    </div>

                    {/* Links Sections */}
                    {sections.map(section => (
                        <div key={section.title}>
                            <h4 style={{ fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", marginBottom: "1.5rem" }}>
                                {section.title}
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                                {section.links.map(link => (
                                    <Link key={link.label} href={link.href} style={{ color: "var(--bv-muted)", fontSize: "0.95rem", fontWeight: 700, transition: "all 0.3s ease" }} className="footer-link">
                                        <motion.span whileHover={{ color: "#ffffff", x: 6 }} style={{ display: "inline-block" }}>
                                            {link.label}
                                        </motion.span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar Footer Line */}
                <div className="footer-bottom" style={{ 
                    borderTop: "1px solid var(--bv-border)", 
                    paddingTop: "2rem", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--bv-faint)", fontWeight: 700, letterSpacing: "0.05em" }}>
                            {footerContent.copyright}
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "3rem" }} className="footer-coords">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <div style={{ width: "8px", height: "8px", background: "#4ade80", borderRadius: "50%", boxShadow: "0 0 15px rgba(74, 222, 128, 0.3)" }} />
                            <span style={{ fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--bv-faint)" }}>
                                {footerContent.hq_label} / {footerContent.hq_address}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .footer-link:hover {
                    color: #e8e8e8 !important;
                }
                
                @media (max-width: 1024px) {
                    .footer-container { padding: 0 1.5rem !important; }
                    .footer-grid {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 2.5rem !important;
                    }
                    .footer-cta {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 4rem !important;
                    }
                    .footer-btns { width: 100% !important; align-items: flex-start !important; }
                    .footer-bottom { 
                        flex-direction: column-reverse !important; 
                        gap: 2rem !important;
                        align-items: flex-start !important;
                    }
                }

                @media (max-width: 600px) {
                    footer { padding: 3rem 0 2rem !important; }
                    .footer-container { padding: 0 1rem !important; }
                    .footer-grid {
                        grid-template-columns: 1fr !important;
                        gap: 2rem !important;
                        margin-bottom: 2.5rem !important;
                    }
                    .footer-grid > div:first-child {
                        gap: 1.5rem !important;
                    }
                    .footer-grid a {
                        overflow-wrap: anywhere;
                    }
                    .footer-bottom {
                        padding-top: 1.5rem !important;
                    }
                    .footer-bottom span {
                        line-height: 1.45 !important;
                        overflow-wrap: anywhere;
                    }
                    .footer-coords,
                    .footer-bottom > div,
                    .footer-bottom > div > div {
                        width: 100% !important;
                        gap: 1rem !important;
                        align-items: flex-start !important;
                    }
                }
            `}</style>
        </footer>
    );
}

function SocialIcon({ icon, href }: { icon: ReactNode, href: string }) {
    return (
        <Link href={href} target="_blank" rel="noopener noreferrer">
            <motion.div 
                whileHover={{ y: -4, background: "rgba(255, 255, 255, 0.08)", borderColor: "rgba(255, 255, 255, 0.2)" }}
                style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "14px", 
                    background: "var(--bv-surface)", 
                    border: "1px solid var(--bv-border)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    color: "var(--bv-muted)",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
            >
                {icon}
            </motion.div>
        </Link>
    );
}
