"use client";

import { useMemo } from "react";
import type { HomeCampaignCard } from "@/lib/campaign-archive";
import { CampaignCard } from "@/components/CampaignCard";
import styles from "@/components/TalentRosterCarousel.module.css";

function renderSet(
    items: HomeCampaignCard[],
    keyPrefix: string,
    opts: { ariaHidden?: boolean }
) {
    return (
        <div
            className={styles.marqueeSet}
            role={opts.ariaHidden ? "presentation" : "list"}
            aria-hidden={opts.ariaHidden ? true : undefined}
        >
            {items.map((campaign, i) => (
                <div
                    key={`${keyPrefix}-${campaign.id}-${i}`}
                    className={styles.cardWrap}
                    role="listitem"
                >
                    <CampaignCard campaign={campaign} />
                </div>
            ))}
        </div>
    );
}

export function CampaignRosterCarousel({ campaigns }: { campaigns: HomeCampaignCard[] }) {
    const items = useMemo(() => campaigns.filter(Boolean), [campaigns]);

    const durationSec = useMemo(() => {
        if (!items.length) return 40;
        return Math.min(90, Math.max(28, items.length * 7.5));
    }, [items.length]);

    if (!items.length) return null;

    return (
        <div
            className={styles.wrap}
            role="region"
            aria-label="Recent campaigns"
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
