"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { Card } from "@/components/Card";
import { PagedRowCarousel } from "@/components/PagedRowCarousel";

type Testimonial = {
    id: string;
    name?: string;
    brand?: string;
    quote?: string;
};

export function TestimonialsTicker({ type }: { type: "client" | "creator" }) {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const q = query(collection(getDb(), "testimonials"), where("type", "==", type));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    setTestimonials(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchTestimonials();
    }, [type]);

    if (!testimonials.length) return null;

    return (
        <div style={{ padding: "1rem 0" }}>
            <PagedRowCarousel variant="testimonials" itemGap="2rem" rowGap="1rem">
                {testimonials.map((item, i) => (
                    <Card
                        key={item.id || `${item.name}-${i}`}
                        padding="2.5rem"
                        style={{
                            width: "380px",
                            minHeight: "220px",
                            height: "100%",
                            flexShrink: 0,
                            whiteSpace: "normal",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <p style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7, margin: 0, flex: 1 }}>&quot;{item.quote}&quot;</p>
                        <div style={{ marginTop: "1.25rem", flexShrink: 0 }}>
                            <div style={{ color: "var(--accent)", fontWeight: 900, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px" }}>{item.name}</div>
                            <div style={{ color: "rgba(255,255,255,0.35)", fontWeight: 800, textTransform: "uppercase", fontSize: "0.7rem", marginTop: "0.5rem" }}>{item.brand}</div>
                        </div>
                    </Card>
                ))}
            </PagedRowCarousel>
        </div>
    );
}
