/**
 * Canonical brand → domain map for Logo.dev (https://img.logo.dev).
 * localFallback points at bundled placeholders when CDN/key is unavailable.
 */

export type BrandLogoSource = {
    name: string;
    domain: string;
    localFallback: string;
};

export const BRAND_LOGO_SOURCES: readonly BrandLogoSource[] = [
    { name: "BBC", domain: "bbc.com", localFallback: "/brand-logos/bbc.png" },
    { name: "Bloom Nutrition", domain: "bloomnu.com", localFallback: "/brand-logos/bloom-nutrition.png" },
    { name: "Casetify", domain: "casetify.com", localFallback: "/brand-logos/casetify.png" },
    { name: "Dossier", domain: "dossier.co", localFallback: "/brand-logos/dossier.png" },
    { name: "Fashion Nova", domain: "fashionnova.com", localFallback: "/brand-logos/fashion-nova.png" },
    { name: "Fortnite", domain: "fortnite.com", localFallback: "/brand-logos/fortnite.png" },
    { name: "GFuel", domain: "gfuel.com", localFallback: "/brand-logos/gfuel.png" },
    { name: "Halara", domain: "thehalara.com", localFallback: "/brand-logos/halara.png" },
    { name: "Hulu", domain: "hulu.com", localFallback: "/brand-logos/hulu.png" },
    { name: "Insta360", domain: "insta360.com", localFallback: "/brand-logos/insta360.png" },
    { name: "Logitech", domain: "logitech.com", localFallback: "/brand-logos/logitech.png" },
    { name: "Marvel Rivals", domain: "marvelrivals.com", localFallback: "/brand-logos/marvel-rivals.png" },
    { name: "NordVPN", domain: "nordvpn.com", localFallback: "/brand-logos/nordvpn.png" },
    { name: "Once Human", domain: "oncehuman.game", localFallback: "/brand-logos/once-human.png" },
    { name: "Prime Video", domain: "primevideo.com", localFallback: "/brand-logos/prime-video.png" },
    { name: "Romwe", domain: "romwe.com", localFallback: "/brand-logos/romwe.png" },
    { name: "Shein", domain: "shein.com", localFallback: "/brand-logos/shein.png" },
    { name: "Snapchat", domain: "snapchat.com", localFallback: "/brand-logos/snapchat.png" },
    { name: "Sony Music", domain: "sonymusic.com", localFallback: "/brand-logos/sony-music.png" },
    { name: "Streamlabs", domain: "streamlabs.com", localFallback: "/brand-logos/streamlabs.png" },
    { name: "TikTok", domain: "tiktok.com", localFallback: "/brand-logos/tiktok.png" },
    { name: "Universal Studios", domain: "universalstudios.com", localFallback: "/brand-logos/universal-studios.png" },
    { name: "Wander", domain: "wander.com", localFallback: "/brand-logos/wander.png" },
    { name: "Wondershare", domain: "wondershare.com", localFallback: "/brand-logos/wondershare.png" },
] as const;

function normalizeBrandName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}

const EXCLUDED_BRAND_NAMES = new Set(["emi"]);

export function isExcludedBrand(name: string): boolean {
    return EXCLUDED_BRAND_NAMES.has(normalizeBrandName(name));
}

export function filterBrandList<T extends BrandLogoInput>(brands: T[]): T[] {
    return brands.filter((brand) => !isExcludedBrand(brand.name));
}

const sourceByNormalizedName = new Map<string, BrandLogoSource>();
for (const row of BRAND_LOGO_SOURCES) {
    sourceByNormalizedName.set(normalizeBrandName(row.name), row);
}

export function findBrandLogoSource(name: string): BrandLogoSource | undefined {
    return sourceByNormalizedName.get(normalizeBrandName(name));
}

export function hostnameFromUrl(url: string): string | null {
    const trimmed = url.trim();
    if (!trimmed) return null;
    try {
        const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
        const host = new URL(withProto).hostname.replace(/^www\./i, "");
        return host || null;
    } catch {
        return null;
    }
}

export function buildLogoDevUrl(domain: string): string | null {
    const token = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY?.trim();
    const d = domain.trim();
    if (!token || !d) return null;
    const host = encodeURIComponent(d);
    return `https://img.logo.dev/${host}?token=${encodeURIComponent(token)}&size=256&format=png`;
}

export type BrandLogoInput = {
    name: string;
    logo?: string;
    website?: string;
    domain?: string;
};

/**
 * Resolves image URL: prefers explicit https logo, then Logo.dev by domain, then static path / local placeholder.
 */
export function resolveBrandLogoMeta(brand: BrandLogoInput): { src: string; onErrorFallback: string | null } {
    const mapped = findBrandLogoSource(brand.name);
    const localFallback = mapped?.localFallback ?? "/brand-logos/bbc.png";

    const rawLogo = brand.logo?.trim();
    if (rawLogo) {
        if (/^https?:\/\//i.test(rawLogo)) {
            return { src: rawLogo, onErrorFallback: localFallback };
        }
        if (rawLogo.startsWith("/")) {
            return { src: rawLogo, onErrorFallback: null };
        }
    }

    const domain =
        brand.domain?.trim() ||
        (brand.website ? hostnameFromUrl(brand.website) : null) ||
        mapped?.domain ||
        null;

    const logoDev = domain ? buildLogoDevUrl(domain) : null;
    if (logoDev) {
        return { src: logoDev, onErrorFallback: localFallback };
    }

    return { src: localFallback, onErrorFallback: null };
}

/** Default ticker rows when Firestore has no `brand_logos` documents. `logo` empty → Logo.dev by domain, else local SVG. */
export const fallbackBrands: { name: string; logo: string; domain: string }[] = BRAND_LOGO_SOURCES.map((row) => ({
    name: row.name,
    logo: row.localFallback,
    domain: row.domain,
}));
