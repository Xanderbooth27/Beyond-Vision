"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { useEffect, useState } from "react";

const letters = "BEYOND".split("");
const visionLetters = "VISION".split("");

export default function LoadingScreen() {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Fast progress for a more responsive feel
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                const diff = Math.random() * 20;
                return Math.min(prev + diff, 100);
            });
        }, 80);

        // Reduced total forced wait to 2s - much snappier
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2200);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, []);

    const containerVars: Variants = {
        exit: {
            opacity: 0,
            transition: { duration: 0.8, ease: [0.85, 0, 0.15, 1], delay: 0.2 }
        }
    };

    const textVars: Variants = {
        initial: { y: 60, opacity: 0 },
        animate: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    id="loading-screen-wrap"
                    variants={containerVars}
                    initial="initial"
                    animate="initial"
                    exit="exit"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 99999,
                        background: "var(--bv-bg-deep)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden"
                    }}
                >
                    {/* Fixed Pure CSS Glow - Lightest possible rendering */}
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "800px",
                        height: "800px",
                        background: "rgba(255,255,255,0.04)",
                        pointerEvents: "none"
                    }} />

                    {/* Progress Percentage */}
                    <motion.div
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: "absolute",
                            bottom: "8vh",
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 4,
                            textAlign: "center"
                        }}
                    >
                        <span style={{
                            fontSize: "0.6rem",
                            fontWeight: 900,
                            letterSpacing: "0.4em",
                            color: "rgba(255,255,255,0.3)",
                            textTransform: "uppercase"
                        }}>
                            Init System {Math.round(progress)}%
                        </span>
                        <div style={{ width: "180px", height: "1px", background: "rgba(255,255,255,0.05)", marginTop: "1rem", position: "relative" }}>
                            <motion.div
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    height: "100%",
                                    background: "var(--accent)",
                                    boxShadow: "0 0 10px var(--accent)"
                                }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.2 }}
                            />
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        exit={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 0.6 }}
                        style={{ position: "relative", zIndex: 3, textAlign: "center" }}
                    >
                        <div style={{ display: "flex", justifyContent: "center", overflow: "hidden", marginBottom: "-0.2rem" }}>
                            {letters.map((char, i) => (
                                <motion.span
                                    key={i}
                                    variants={textVars}
                                    initial="initial"
                                    animate="animate"
                                    transition={{ delay: i * 0.04 }}
                                    style={{
                                        display: "inline-block",
                                        fontSize: "clamp(2rem, 8vw, 6rem)",
                                        fontWeight: 900,
                                        letterSpacing: "-0.04em",
                                        color: "#fff",
                                        textTransform: "uppercase",
                                        lineHeight: 1
                                    }}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", overflow: "hidden" }}>
                            {visionLetters.map((char, i) => (
                                <motion.span
                                    key={i}
                                    variants={textVars}
                                    initial="initial"
                                    animate="animate"
                                    transition={{ delay: 0.2 + i * 0.04 }}
                                    style={{
                                        display: "inline-block",
                                        fontSize: "clamp(2rem, 8vw, 6rem)",
                                        fontWeight: 900,
                                        letterSpacing: "-0.04em",
                                        color: "var(--accent)",
                                        textTransform: "uppercase",
                                        lineHeight: 1
                                    }}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Fast Exit Flash */}
                    <motion.div
                        exit={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.4, times: [0, 0.4, 1] }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "#fff",
                            zIndex: 10,
                            pointerEvents: "none"
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
