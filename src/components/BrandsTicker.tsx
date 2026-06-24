"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { fallbackBrands, filterBrandList, resolveBrandLogoMeta, type BrandLogoInput } from "@/lib/brand-logo-sources";

export { fallbackBrands };

type RemoteBrand = BrandLogoInput & { id: string };

function BrandImage({ brand, src, fallback }: { brand: BrandLogoInput; src: string; fallback: string | null }) {
    const [currentSrc, setCurrentSrc] = useState(src);

    return (
        <img
            src={currentSrc}
            alt={`${brand.name} logo`}
            onError={() => {
                if (fallback && currentSrc !== fallback) {
                    setCurrentSrc(fallback);
                }
            }}
            loading="lazy"
            decoding="async"
            style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                objectPosition: "center",
                opacity: 0.82,
            }}
        />
    );
}

function BrandMark({ brand }: { brand: BrandLogoInput }) {
    const meta = resolveBrandLogoMeta(brand);

    return (
        <span
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                maxWidth: "120px",
                height: "32px",
                overflow: "hidden",
            }}
        >
            <BrandImage key={meta.src} brand={brand} src={meta.src} fallback={meta.onErrorFallback} />
        </span>
    );
}

export function BrandsTicker({ label = "Brands we work with" }: { label?: string }) {
    const [brands, setBrands] = useState<BrandLogoInput[]>(() => filterBrandList(fallbackBrands));
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const snap = await getDocs(query(collection(getDb(), "brand_logos"), orderBy("order", "asc")));
                const items = snap.docs.map(
                    (doc) =>
                        ({
                            id: doc.id,
                            ...doc.data(),
                        }) as RemoteBrand,
                );
                if (items.length) {
                    setBrands(
                        filterBrandList(
                            items.map(({ name, logo, website, domain }) => ({
                                name,
                                logo: typeof logo === "string" ? logo : "",
                                website,
                                domain,
                            })),
                        ),
                    );
                }
            } catch (error) {
                console.error("BrandsTicker fallback active:", error);
            }
        };
        fetchBrands();
    }, []);

    const marqueeDuration = reduceMotion ? 0 : 68;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem", width: "100%", maxWidth: "var(--container-max)", margin: "0 auto" }}>
            <div style={{ textAlign: "left", maxWidth: "min(56ch, 100%)" }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 750, color: "var(--bv-muted)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.45rem" }}>
                    {label}
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    position: "relative",
                    padding: "1rem 0",
                    border: "1px solid var(--bv-border)",
                    borderRadius: "var(--bv-radius-md)",
                    background: "rgba(23, 23, 23, 0.65)",
                    boxShadow: "none",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "48px",
                        zIndex: 2,
                        background: "linear-gradient(to right, rgba(19,19,19,0.95), transparent)",
                        pointerEvents: "none",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: "48px",
                        zIndex: 2,
                        background: "linear-gradient(to left, rgba(19,19,19,0.95), transparent)",
                        pointerEvents: "none",
                    }}
                />

                <motion.div
                    animate={reduceMotion ? { x: 0 } : { x: [0, -2500] }}
                    transition={reduceMotion ? { duration: 0 } : { repeat: Infinity, duration: marqueeDuration, ease: "linear" }}
                    style={{ display: "flex", gap: "3rem", alignItems: "center", paddingLeft: "1.25rem", paddingRight: "1.25rem" }}
                >
                    {[...brands, ...brands].map((brand, i) => (
                        <div
                            key={`${brand.name}-${i}`}
                            style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}
                        >
                            <div
                                style={{
                                    width: "148px",
                                    minHeight: "44px",
                                    padding: "8px 14px",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "rgba(255,255,255,0.03)",
                                }}
                            >
                                <BrandMark brand={brand} />
                            </div>
                            <span
                                style={{
                                    position: "absolute",
                                    width: 1,
                                    height: 1,
                                    padding: 0,
                                    margin: -1,
                                    overflow: "hidden",
                                    clipPath: "inset(50%)",
                                    whiteSpace: "nowrap",
                                    border: 0,
                                }}
                            >
                                {brand.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
