"use client";

// Counts visits for the BV dashboard's Website page. No cookies and nothing
// personal: just the page, where the visitor came from, and the clicks that
// matter (email, phone, forms, socials, outside links, campaign videos).
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ENDPOINT = "https://dash.beyondvisionltd.org/api/site-track";

function send(ev: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!/(^|\.)beyondvisionltd\.org$/.test(location.hostname)) return;
  if (location.pathname.startsWith("/admin")) return;
  const body = JSON.stringify(ev);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, body)) return;
  } catch {}
  fetch(ENDPOINT, { method: "POST", body, keepalive: true, mode: "no-cors" }).catch(() => {});
}

const SOCIALS: [RegExp, string][] = [
  [/instagram\.com$/, "Instagram"],
  [/tiktok\.com$/, "TikTok"],
  [/linkedin\.com$/, "LinkedIn"],
  [/youtube\.com$|youtu\.be$/, "YouTube"],
  [/(^|\.)x\.com$|twitter\.com$/, "X"],
  [/calendly\.com$/, "Booked a call"],
];

function clickLabel(a: HTMLAnchorElement): string | null {
  const href = a.getAttribute("href") || "";
  if (href.startsWith("mailto:")) return "Email";
  if (href.startsWith("tel:")) return "Phone";
  let url: URL;
  try { url = new URL(a.href); } catch { return null; }
  if (url.hostname === location.hostname) return null; // moving around our own site is a page view
  const host = url.hostname.replace(/^www\./, "");
  for (const [re, name] of SOCIALS) if (re.test(host)) return name;
  return "Link: " + host;
}

export default function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let first = true;
    try {
      first = !sessionStorage.getItem("bv-seen");
      sessionStorage.setItem("bv-seen", "1");
    } catch {}
    const params = new URLSearchParams(location.search);
    send({
      t: "pv",
      p: pathname,
      // Only the landing page carries where they came from.
      r: first ? document.referrer : "",
      u: first ? params.get("utm_source") || "" : "",
      m: window.matchMedia("(max-width: 768px)").matches ? 1 : 0,
    });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const l = clickLabel(a);
      if (l) send({ t: "click", p: location.pathname, l });
    };
    const onSubmit = () => send({ t: "click", p: location.pathname, l: "Form sent: " + location.pathname });
    const played = new WeakSet<EventTarget>();
    const onPlay = (e: Event) => {
      if (!e.target || played.has(e.target)) return;
      const v = e.target as HTMLVideoElement;
      if (v.muted && v.autoplay) return; // background clips, not a visitor choosing to watch
      played.add(e.target);
      send({ t: "click", p: location.pathname, l: "Played a video" });
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    document.addEventListener("play", onPlay, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("play", onPlay, true);
    };
  }, []);

  return null;
}
