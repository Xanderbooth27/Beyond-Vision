// Shared frame and styles for the case study and creator pages.
import Link from "next/link";
import AmbientBackground from "@/components/AmbientBackground";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export function DetailFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bv-bg-deep)", color: "#F5F5F5", position: "relative", overflow: "hidden" }}>
      <AmbientBackground />
      <Navbar />
      <main className="section-container-wide dp">{children}</main>
      <Footer />
      <style>{`
        .dp { padding-top: calc(var(--section-y, 5rem) + 3rem); padding-bottom: 4rem; position: relative; z-index: 1; }
        .dp-back { display:inline-block; color: rgba(255,255,255,0.55); font-size: 0.9rem; margin-bottom: 1.5rem; text-decoration: none; }
        .dp-back:hover { color: #fff; }
        .dp-top { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 3rem; align-items: start; }
        .dp-media { position: relative; display: block; aspect-ratio: 9 / 16; border-radius: 18px; overflow: hidden; background: #111; border: 1px solid rgba(255,255,255,0.08); }
        .dp-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .dp-media span { position: absolute; left: 0.9rem; bottom: 0.9rem; background: rgba(0,0,0,0.7); padding: 0.45rem 0.8rem; border-radius: 999px; font-size: 0.8rem; color: #fff; }
        .dp-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem; margin: 2rem 0; }
        .dp-stat { background: #101010; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1rem; }
        .dp-stat b { display: block; font-size: 1.6rem; font-weight: 700; color: #fff; }
        .dp-stat small { color: rgba(255,255,255,0.55); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
        .dp-text { color: rgba(255,255,255,0.75); line-height: 1.7; max-width: 64ch; margin-bottom: 1.1rem; }
        .dp-links { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
        .dp-more { margin-top: 4rem; }
        .dp-more h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 1rem; }
        .dp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; }
        .dp-card { display: block; padding: 1rem 1.1rem; border-radius: 14px; background: #101010; border: 1px solid rgba(255,255,255,0.08); color: #fff; text-decoration: none; transition: border-color 0.2s; }
        .dp-card:hover { border-color: rgba(255,255,255,0.25); }
        .dp-card small { display: block; color: rgba(255,255,255,0.55); margin-top: 0.25rem; font-size: 0.82rem; }
        @media (max-width: 900px) {
          .dp-top { grid-template-columns: 1fr; gap: 2rem; }
          .dp-media { max-width: 320px; }
          .dp-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="dp-stat">
      <b>{value}</b>
      <small>{label}</small>
    </div>
  );
}

export function MoreCard({ href, title, sub }: { href: string; title: string; sub: string }) {
  return (
    <Link href={href} className="dp-card">
      {title}
      <small>{sub}</small>
    </Link>
  );
}
