"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomeCampaignCard } from "@/lib/campaign-archive";
import styles from "@/components/CampaignCard.module.css";

export function CampaignCard({ campaign }: { campaign: HomeCampaignCard }) {
    const headline = `${campaign.brand} × ${campaign.influencer}`;

    return (
        <article className={styles.card}>
            <img className={styles.image} src={campaign.thumbnail} alt={headline} />
            <div className={styles.info}>
                <h3 className={styles.name}>{headline}</h3>
                <p className={styles.category}>Campaign</p>
                <p className={styles.meta}>{campaign.title}</p>
                <div className={styles.platformRow}>
                    <span className={styles.platformPill}>{campaign.month}</span>
                    <span className={styles.platformPill}>{campaign.year}</span>
                </div>
                <Link href="/recent-campaigns" className={styles.cta}>
                    Watch campaign <ArrowRight size={14} strokeWidth={2.5} aria-hidden />
                </Link>
            </div>
        </article>
    );
}
