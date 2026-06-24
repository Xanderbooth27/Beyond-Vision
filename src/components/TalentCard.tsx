"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TalentCardCreator } from "@/lib/talent-display";
import { formatAudienceLine, formatNicheLabel, getCreatorPlatforms } from "@/lib/talent-display";
import styles from "@/components/TalentCard.module.css";

export function TalentCard({ creator }: { creator: TalentCardCreator }) {
    const name = creator.creatorName?.trim() || creator.displayName?.trim() || "Creator";
    const niche = formatNicheLabel(creator);
    const audience = formatAudienceLine(creator);
    const platforms = getCreatorPlatforms(creator);
    const src = creator.profileImageUrl?.trim() || "/spec-references/creator-roster-grid.png";

    return (
        <article className={styles.card}>
            <img className={styles.image} src={src} alt={name} />
            <div className={styles.info}>
                <h3 className={styles.name}>{name}</h3>
                <p className={styles.category}>{niche}</p>
                <p className={styles.audience}>{audience}</p>
                <div className={styles.platformRow}>
                    {platforms.map((p) => (
                        <span key={p} className={styles.platformPill}>
                            {p}
                        </span>
                    ))}
                </div>
                <Link href="/roster" className={styles.cta}>
                    View profile <ArrowRight size={14} strokeWidth={2.5} aria-hidden />
                </Link>
            </div>
        </article>
    );
}
