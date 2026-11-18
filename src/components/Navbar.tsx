"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

type NavSubLink = { label: string; href: string };

type NavLink =
    | { label: string; dropdown: NavSubLink[] }
    | { label: string; href: string };

function hasDropdown(link: NavLink): link is { label: string; dropdown: NavSubLink[] } {
    return "dropdown" in link;
}

export default function Navbar() {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!mobileMenuOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [mobileMenuOpen]);

    // Every main page one click away (Xander, 2026-11-18). Only About keeps a
    // small dropdown.
    const navLinks: NavLink[] = [
        { label: "For Brands", href: "/brands" },
        { label: "For Creators", href: "/for-creators" },
        { label: "Roster", href: "/roster" },
        { label: "Case Studies", href: "/case-studies" },
        { label: "Blog", href: "/blog" },
        {
            label: "About",
            dropdown: [
                { label: "About Us", href: "/about-us" },
                { label: "What We Do", href: "/what-we-do" },
            ],
        },
    ];

    const contactLink: NavLink = { label: "Contact", href: "/contact" };

    return (
        <nav
            className="site-nav"
            style={{
                position: "fixed",
                top: "1rem",
                left: "50%",
                transform: "translateX(-50%)",
                width: "calc(100% - 2rem)",
                maxWidth: "1180px",
                minHeight: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem 1rem",
                zIndex: 1000,
                borderRadius: "100px",
                background: "rgba(19, 19, 19, 0.92)",
                border: "1px solid var(--bv-border)",
                backdropFilter: "blur(18px)",
                boxShadow: "0 16px 60px rgba(0,0,0,0.34)"
            }}
        >
            {/* Left Group: Logo + Desktop Nav */}
            <div style={{ display: "flex", alignItems: "center", gap: "3rem" }}>
                <Link href="/" style={{ textDecoration: "none" }} className="logo-link">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.65rem",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            color: "#fff",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em"
                        }}
                    >
                        <img
                            src="/logo_main.jpg"
                            alt=""
                            aria-hidden="true"
                            style={{
                                width: "24px",
                                height: "24px",
                                display: "block",
                                objectFit: "contain",
                                borderRadius: "3px",
                                boxShadow: "0 0 18px rgba(255,255,255,0.06)"
                            }}
                        />
                        BEYOND VISION
                    </motion.div>
                </Link>

                <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "1.35rem" }}>
                    {navLinks.map((link) => (
                        <div
                            key={link.label}
                            onMouseEnter={() => hasDropdown(link) && setActiveDropdown(link.label)}
                            onMouseLeave={() => setActiveDropdown(null)}
                            style={{ position: "relative", display: "flex", alignItems: "center" }}
                        >
                            {hasDropdown(link) ? (
                                <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                    <span style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", color: activeDropdown === link.label ? "var(--accent)" : "rgba(255, 255, 255, 0.66)", transition: "all 0.3s", letterSpacing: "0.01em" }}>
                                        {link.label}
                                    </span>
                                    <ChevronDown size={14} color={activeDropdown === link.label ? "var(--accent)" : "rgba(255,255,255,0.34)"} />
                                    
                                    <AnimatePresence>
                                        {activeDropdown === link.label && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", paddingTop: "1.5rem", zIndex: 9999, width: "200px" }}
                                            >
                                                <div style={{ padding: "0.65rem", borderRadius: "18px", border: "1px solid var(--bv-border-strong)", background: "rgba(19,19,19,0.98)", boxShadow: "var(--bv-shadow-soft)" }}>
                                                    {link.dropdown.map((sub) => (
                                                        <Link key={sub.label} href={sub.href} style={{ textDecoration: "none" }}>
                                                            <div style={{ padding: "0.7rem 0.9rem", borderRadius: "10px", fontSize: "0.76rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", transition: "all 0.2s", letterSpacing: "0.01em" }} className="dropdown-item">
                                                                {sub.label}
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link href={link.href} style={{ textDecoration: "none" }}>
                                    <span style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", color: "rgba(255, 255, 255, 0.66)", transition: "all 0.3s", letterSpacing: "0.01em" }} className="nav-link">
                                        {link.label}
                                    </span>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Group: Contact + Mobile Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Link href={contactLink.href} className="desktop-nav nav-contact-capsule" style={{ textDecoration: "none" }}>
                    <span className="nav-contact-capsule-inner">{contactLink.label}</span>
                </Link>

                {/* Mobile Menu Button */}
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{ 
                        width: "48px", 
                        height: "48px", 
                        borderRadius: "50%", 
                        background: "rgba(255,255,255,0.05)", 
                        border: "1px solid var(--bv-border)", 
                        color: "#fff", 
                        display: "none", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        cursor: "pointer" 
                    }}
                    className="mobile-toggle"
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Drawer - Full Screen Immersive Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100dvh",
                            background: "var(--bv-bg-deep)",
                            zIndex: 10000, // Extreme Priority
                            padding: "max(7rem, calc(5.5rem + env(safe-area-inset-top))) max(1.25rem, env(safe-area-inset-right)) max(2.5rem, calc(2rem + env(safe-area-inset-bottom))) max(1.25rem, env(safe-area-inset-left))",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            overflowY: "auto"
                        }}
                    >
                        {/* Immersive Scanline for depth */}
                        <div style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.18)",
                            backgroundSize: "100% 4px, 3px 100%",
                            pointerEvents: "none",
                            opacity: 0.4,
                            zIndex: 1
                        }} />

                        {/* Top Menu Bar */}
                        <div className="mobile-drawer-topbar" style={{ position: "absolute", top: "max(1.5rem, calc(1rem + env(safe-area-inset-top)))", left: "max(1.25rem, env(safe-area-inset-left))", right: "max(1.25rem, env(safe-area-inset-right))", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", zIndex: 100 }}>
                             <div style={{ fontWeight: 900, fontSize: "0.7rem", letterSpacing: "3px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>BEYOND VISION MENU</div>
                             <button 
                                onClick={() => setMobileMenuOpen(false)}
                                style={{ 
                                    width: "54px", 
                                    height: "54px", 
                                    borderRadius: "50%", 
                                    background: "rgba(255,255,255,0.08)", 
                                    border: "1px solid var(--bv-border-strong)", 
                                    color: "#fff", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    cursor: "pointer",
                                    boxShadow: "0 0 24px rgba(0,0,0,0.35)"
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "relative", zIndex: 10 }}>
                            {navLinks.map((link, idx) => (
                                <motion.div 
                                    key={link.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + idx * 0.04 }}
                                >
                                    <div style={{ fontSize: "clamp(2rem, 8vw, 3.5rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.04em", lineHeight: 0.9 }}>
                                        {hasDropdown(link) ? (
                                            <span style={{ color: "var(--accent)", opacity: 0.9 }}>{link.label}</span>
                                        ) : (
                                            <Link href={link.href} onClick={() => setMobileMenuOpen(false)} style={{ color: "#fff", textDecoration: "none" }}>{link.label}</Link>
                                        )}
                                    </div>
                                    {hasDropdown(link) && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "1rem" }}>
                                            {link.dropdown.map((sub) => (
                                            <Link key={sub.label} href={sub.href} onClick={() => setMobileMenuOpen(false)} style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.62)", padding: "0.55rem 0.95rem", background: "rgba(255,255,255,0.03)", borderRadius: "100px", border: "1px solid var(--bv-border)", textDecoration: "none" }}>
                                                    {sub.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Bottom Utility Hub */}
                        <div style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "2.5rem", marginTop: "4rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} style={{ width: "100%", textDecoration: "none" }}>
                                    <button style={{ width: "100%", background: "var(--accent)", color: "#000", padding: "1.25rem", borderRadius: "100px", border: "none", fontWeight: 900, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer", boxShadow: "0 16px 36px rgba(0,0,0,0.45)" }}>
                                        Contact
                                    </button>
                                </Link>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.2)", fontSize: "0.6rem", fontWeight: 900, letterSpacing: "2px" }}>
                                    <span>BV_ARCHIVE_NODE_8</span>
                                    <span>IG: @BEYONDVISION</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                @media (max-width: 1024px) {
                    .desktop-nav { display: none !important; }
                    .nav-contact-capsule { display: none !important; }
                    .mobile-toggle { display: flex !important; }
                }
                
                .dropdown-item:hover {
                    background: rgba(255, 255, 255, 0.06);
                }
                .dropdown-item:hover span {
                    color: #fff !important;
                }
                .nav-contact-capsule-inner {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 36px;
                    padding: 0.5rem 1.25rem;
                    border-radius: 999px;
                    background: var(--accent);
                    color: #000;
                    font-size: 0.72rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    line-height: 1;
                    cursor: pointer;
                    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
                    transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
                }
                .nav-contact-capsule:hover .nav-contact-capsule-inner {
                    filter: brightness(1.04);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
                }
                .nav-contact-capsule:active .nav-contact-capsule-inner {
                    transform: translateY(0);
                }
                .nav-link:hover {
                    color: var(--accent) !important;
                }
                .nav-link {
                    position: relative;
                }
                .nav-link::after {
                    content: "";
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: -0.45rem;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.35);
                    opacity: 0;
                    transform: scaleX(0.5);
                    transition: opacity 0.2s ease, transform 0.2s ease;
                }
                .nav-link:hover::after {
                    opacity: 0.9;
                    transform: scaleX(1);
                }
                @media (max-width: 640px) {
                    .site-nav {
                        top: 0.75rem !important;
                        width: calc(100% - 1rem) !important;
                        padding: 0.4rem 0.55rem 0.4rem 0.9rem !important;
                    }
                    .logo-link div {
                        gap: 0.5rem !important;
                        font-size: 0.68rem !important;
                    }
                    .mobile-toggle {
                        width: 44px !important;
                        height: 44px !important;
                    }
                    .mobile-drawer-topbar {
                        align-items: flex-start !important;
                    }
                }
                @media (max-width: 390px) {
                    .logo-link div {
                        max-width: 190px;
                    }
                }
            `}</style>
        </nav>
    );
}
