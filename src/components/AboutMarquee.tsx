"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
    buildRosterCreators,
    fetchFirebaseRosterCreators,
    normalizeCreatorName,
    type PublicCreator,
} from "@/lib/roster-creators";
import { buildSeparatedColumnTracks } from "@/lib/hero-grid-layout";
import styles from "@/components/AboutMarquee.module.css";

const MIN_VISIBLE_CELLS = 15;
const MAX_ROSTER_IN_GRID = 24;
const ABOUT_COLUMN_COUNT = 3;

const creatorRules = {
    sameItem: (a: PublicCreator, b: PublicCreator) => a.id === b.id,
    sameGroup: (a: PublicCreator, b: PublicCreator) =>
        normalizeCreatorName(a.name) === normalizeCreatorName(b.name),
};

function CreatorCard({ creator }: { creator: PublicCreator }) {
    return (
        <div className={styles.card}>
            <img src={creator.imageUrl} alt={creator.name} className={styles.image} />
        </div>
    );
}

export default function AboutMarquee() {
    const [creators, setCreators] = useState<PublicCreator[]>([]);

    useEffect(() => {
        fetchFirebaseRosterCreators().then((dbCreators) => {
            setCreators(buildRosterCreators(dbCreators));
        });
    }, []);

    const rosterPool = useMemo(
        () => creators.slice(0, MAX_ROSTER_IN_GRID),
        [creators]
    );

    const columnTracks = useMemo(
        () =>
            buildSeparatedColumnTracks(
                rosterPool,
                ABOUT_COLUMN_COUNT,
                MIN_VISIBLE_CELLS,
                creatorRules,
                (creator) => creator.id
            ),
        [rosterPool]
    );

    const scrollDurationSec = useMemo(() => {
        if (!rosterPool.length) return 72;
        return Math.min(88, Math.max(52, rosterPool.length * 5.5));
    }, [rosterPool.length]);

    if (!creators.length) return null;

    return (
        <div className={styles.root} role="region" aria-label="Creator roster preview" aria-roledescription="carousel">
            {columnTracks.map((track, colIndex) => (
                <div key={colIndex} className={styles.columnViewport}>
                    <div
                        className={`${styles.columnTrack} ${colIndex === 1 ? styles.columnTrackReverse : ""}`}
                        style={{ ["--scroll-duration" as string]: `${scrollDurationSec}s` }}
                    >
                        {track.map((creator, i) => (
                            <CreatorCard key={`${colIndex}-${i}-${creator.id}`} creator={creator} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
