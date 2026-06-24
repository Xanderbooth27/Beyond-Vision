"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function SideDrawer({ isOpen, onClose, title, children }: SideDrawerProps) {
    // Prevent scroll on body when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.68)",
                            backdropFilter: "blur(10px)",
                            zIndex: 1000,
                            cursor: "pointer"
                        }}
                    />

                    {/* Drawer */}
                    <motion.div
                        className="side-drawer-panel"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        style={{
                            position: "fixed",
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: "100%",
                            maxWidth: "800px",
                            background: "var(--bv-bg-deep)",
                            borderLeft: "1px solid var(--bv-border)",
                            zIndex: 1001,
                            display: "flex",
                            flexDirection: "column",
                            boxShadow: "-20px 0 60px rgba(0, 0, 0, 0.8)"
                        }}
                    >
                        {/* Header */}
                        <div className="drawer-header" style={{
                            padding: "2rem 3rem",
                            borderBottom: "1px solid var(--bv-border)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "rgba(255, 255, 255, 0.015)"
                        }}>
                            <h2 style={{ 
                                fontSize: "1.5rem", 
                                fontWeight: 900, 
                                textTransform: "uppercase", 
                                letterSpacing: "0",
                                color: "var(--accent)"
                            }}>
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                style={{
                                    background: "var(--bv-surface)",
                                    border: "1px solid var(--bv-border)",
                                    color: "#fff",
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "3rem",
                            scrollbarWidth: "none"
                        }} className="drawer-content">
                            {children}
                        </div>
                    </motion.div>
                    <style jsx>{`
                        @media (max-width: 640px) {
                            .side-drawer-panel {
                                max-width: none !important;
                                border-left: none !important;
                            }
                            .drawer-header {
                                padding: 1.1rem 1rem !important;
                                gap: 1rem !important;
                            }
                            .drawer-header h2 {
                                font-size: 1rem !important;
                                line-height: 1.15 !important;
                                overflow-wrap: anywhere;
                            }
                            .drawer-content {
                                padding: 1.25rem 1rem 2rem !important;
                            }
                        }
                    `}</style>
                </>
            )}
        </AnimatePresence>
    );
}
