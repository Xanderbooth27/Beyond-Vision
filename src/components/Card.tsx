"use client";

import { motion, useReducedMotion } from "framer-motion";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: string;
    hover?: boolean;
    style?: React.CSSProperties;
}

export function Card({ children, className = "", padding = "1.25rem", hover = true, style = {} }: CardProps) {
    const reduceMotion = useReducedMotion();
    return (
        <motion.div
            whileHover={hover && !reduceMotion ? { y: -3, transition: { duration: 0.2 } } : {}}
            className={`card-glass ${className}`}
            style={{ padding, ...style }}
        >
            {children}
        </motion.div>
    );
}

interface StatTileProps {
    label: string;
    value: string;
    className?: string;
}

export function StatTile({ label, value, className = "" }: StatTileProps) {
    return (
        <Card padding="1.5rem" className={className}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(1.65rem, 3vw, 2.25rem)", fontWeight: 800, color: "var(--bv-text)", marginBottom: "0.65rem" }}>
                    {value}
                </div>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--bv-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {label}
                </div>
            </div>
        </Card>
    );
}
