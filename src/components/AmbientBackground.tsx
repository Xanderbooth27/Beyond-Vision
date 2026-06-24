"use client";

/** Flat canvas only — avoids tint seams vs `html`/`body`/`main`. */
export default function AmbientBackground() {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
                background: "var(--bv-bg-deep)",
            }}
        />
    );
}
