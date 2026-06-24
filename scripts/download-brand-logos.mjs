/**
 * One-off: download PNG logos from Logo.dev into public/brand-logos/.
 * Run from repo root (PowerShell):
 *   $env:LOGO_DEV_KEY="your_publishable_key"; node scripts/download-brand-logos.mjs
 *
 * Never commit keys. Keep LOGO_DEV_KEY only in your shell or .env.local (not loaded here by default).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const LOGO_DEV_KEY = process.env.LOGO_DEV_KEY?.trim();
if (!LOGO_DEV_KEY) {
    console.error("Missing LOGO_DEV_KEY env var (Logo.dev publishable token).");
    process.exit(1);
}

const brandLogos = [
    { name: "BBC", domain: "bbc.com", file: "bbc.png" },
    { name: "Bloom Nutrition", domain: "bloomnu.com", file: "bloom-nutrition.png" },
    { name: "CASETiFY", domain: "casetify.com", file: "casetify.png" },
    { name: "Dossier", domain: "dossier.co", file: "dossier.png" },
    { name: "EMI", domain: "emimusic.com", file: "emi.png" },
    { name: "Fashion Nova", domain: "fashionnova.com", file: "fashion-nova.png" },
    { name: "Fortnite", domain: "fortnite.com", file: "fortnite.png" },
    { name: "G FUEL", domain: "gfuel.com", file: "gfuel.png" },
    { name: "Halara", domain: "thehalara.com", file: "halara.png" },
    { name: "Hulu", domain: "hulu.com", file: "hulu.png" },
    { name: "Insta360", domain: "insta360.com", file: "insta360.png" },
    { name: "Logitech", domain: "logitech.com", file: "logitech.png" },
    { name: "Marvel Rivals", domain: "marvelrivals.com", file: "marvel-rivals.png" },
    { name: "NordVPN", domain: "nordvpn.com", file: "nordvpn.png" },
    { name: "Once Human", domain: "oncehuman.game", file: "once-human.png" },
    { name: "Prime Video", domain: "primevideo.com", file: "prime-video.png" },
    { name: "ROMWE", domain: "romwe.com", file: "romwe.png" },
    { name: "SHEIN", domain: "shein.com", file: "shein.png" },
    { name: "Snapchat", domain: "snapchat.com", file: "snapchat.png" },
    { name: "Sony Music", domain: "sonymusic.com", file: "sony-music.png" },
    { name: "Streamlabs", domain: "streamlabs.com", file: "streamlabs.png" },
    { name: "TikTok", domain: "tiktok.com", file: "tiktok.png" },
    { name: "Universal Studios", domain: "universalstudios.com", file: "universal-studios.png" },
    { name: "Wander", domain: "wander.com", file: "wander.png" },
    { name: "Wondershare", domain: "wondershare.com", file: "wondershare.png" },
];

const outDir = path.join(root, "public", "brand-logos");
fs.mkdirSync(outDir, { recursive: true });

for (const brand of brandLogos) {
    const url = `https://img.logo.dev/${encodeURIComponent(brand.domain)}?token=${encodeURIComponent(LOGO_DEV_KEY)}&size=512&format=png`;
    const outFile = path.join(outDir, brand.file);

    console.log(`Downloading ${brand.name}...`);
    const res = await fetch(url);

    if (!res.ok) {
        console.warn(`  Failed: ${brand.name} (${res.status})`);
        continue;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outFile, buffer);
}

console.log("Done. PNGs written to public/brand-logos/");
