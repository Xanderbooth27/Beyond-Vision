"use client";

import { Children, useMemo, type ReactNode } from "react";
import styles from "@/components/PagedRowCarousel.module.css";

export type PagedRowCarouselVariant = "testimonials" | "talent";

function renderSet(items: ReactNode[], keyPrefix: string, opts: { ariaHidden?: boolean }) {
    return (
        <div
            className={styles.marqueeSet}
            role={opts.ariaHidden ? "presentation" : "list"}
            aria-hidden={opts.ariaHidden ? true : undefined}
        >
            {items.map((child, i) => (
                <div key={`${keyPrefix}-${i}`} className={styles.cardWrap} role={opts.ariaHidden ? undefined : "listitem"}>
                    {child}
                </div>
            ))}
        </div>
    );
}

export function PagedRowCarousel({
    variant,
    children,
    rowGap = "1rem",
    itemGap = "1rem",
}: {
    variant: PagedRowCarouselVariant;
    children: ReactNode;
    rowGap?: string;
    itemGap?: string;
}) {
    const items = useMemo(() => Children.toArray(children).filter(Boolean), [children]);

    const durationSec = useMemo(() => {
        if (!items.length) return 40;
        return Math.min(100, Math.max(22, items.length * 6.5));
    }, [items.length]);

    const ariaLabel = variant === "testimonials" ? "Testimonials" : "Talent roster";

    if (!items.length) return null;

    return (
        <div className={styles.wrap} style={{ marginBottom: rowGap }}>
            <div className={styles.viewport} role="region" aria-label={ariaLabel} aria-roledescription="marquee">
                <div
                    className={styles.track}
                    style={{
                        ["--marquee-duration" as string]: `${durationSec}s`,
                        ["--carousel-gap" as string]: itemGap,
                    }}
                >
                    {renderSet(items, "a", {})}
                    {renderSet(items, "b", { ariaHidden: true })}
                </div>
            </div>
        </div>
    );
}
