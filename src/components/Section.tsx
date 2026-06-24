"use client";
import { ArrowUpRight } from "lucide-react";

interface SectionProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    onViewMore?: () => void;
    className?: string;
    id?: string;
    headerRight?: React.ReactNode;
    style?: React.CSSProperties;
    containerStyle?: React.CSSProperties;
    /** Smaller section heading for secondary bands (campaigns, case studies, testimonials). */
    titleTone?: "default" | "quiet";
}

export function Section({ title, subtitle, children, onViewMore, className = "", id, headerRight, style, containerStyle, titleTone = "default" }: SectionProps) {
    const titleClass = titleTone === "quiet" ? "section-title section-title--quiet" : "section-title";
    return (
        <section id={id} className={`section-margin ${className}`} style={{ position: "relative", zIndex: 10, ...style }}>
            <div className="section-container" style={containerStyle}>
                <div className="section-heading-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "clamp(2rem, 4vw, 3rem)", flexWrap: "wrap", gap: "2rem", borderBottom: "1px solid var(--bv-border)", paddingBottom: "1.25rem" }}>
                    <div>
                        {subtitle?.trim() ? (
                            <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>{subtitle}</div>
                        ) : null}
                        <h2 className={titleClass}>
                            {title}
                        </h2>
                    </div>
                    {(onViewMore || headerRight) && (
                        <div className="section-heading-actions" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            {headerRight}
                            {onViewMore && (
                                <button onClick={onViewMore} className="btn-secondary">
                                    View More <ArrowUpRight size={18} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {children}
            </div>
            <style jsx>{`
                @media (max-width: 640px) {
                    .section-heading-row {
                        align-items: flex-start !important;
                        gap: 1.25rem !important;
                    }
                    .section-heading-actions {
                        width: 100%;
                        align-items: stretch !important;
                    }
                    .section-heading-actions button {
                        width: 100%;
                    }
                }
            `}</style>
        </section>
    );
}
