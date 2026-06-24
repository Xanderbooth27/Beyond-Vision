"use client";

import { useMemo } from "react";
import type { TalentCardCreator } from "@/lib/talent-display";
import { TalentCard } from "@/components/TalentCard";
import styles from "@/components/TalentRosterCarousel.module.css";

function renderSet(items: TalentCardCreator[], keyPrefix: string, opts: { ariaHidden?: boolean }) {
    return (
        <div
            className={styles.marqueeSet}
            role={opts.ariaHidden ? "presentation" : "list"}
            aria-hidden={opts.ariaHidden ? true : undefined}
        >
            {items.map((c, i) => (
                <div key={`${keyPrefix}-${c.id ?? c.creatorName}-${i}`} className={styles.cardWrap} role="listitem">
                    <TalentCard creator={c} />
                </div>
            ))}
        </div>
    );
}

export function TalentRosterCarousel({ creators }: { creators: TalentCardCreator[] }) {
    const items = useMemo(() => creators.filter(Boolean), [creators]);

    const durationSec = useMemo(() => {
        if (!items.length) return 40;
        // ~8s per card keeps motion calm; clamp so very small rosters do not fly by
        return Math.min(90, Math.max(28, items.length * 7.5));
    }, [items.length]);

    if (!items.length) return null;

    return (
        <div
            className={styles.wrap}
            role="region"
            aria-label="Featured talent"
            aria-roledescription="marquee"
        >
            <div className={styles.viewport}>
                <div
                    className={styles.track}
                    style={{ ["--marquee-duration" as string]: `${durationSec}s` }}
                >
                    {renderSet(items, "a", {})}
                    {renderSet(items, "b", { ariaHidden: true })}
                </div>
            </div>
        </div>
    );
}
