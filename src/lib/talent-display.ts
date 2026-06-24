import type { CreatorProfile } from "@/lib/spec-data";

export type TalentCardCreator = Partial<CreatorProfile> & { id?: string };

export function getCreatorPlatforms(creator: TalentCardCreator): string[] {
    const platforms: string[] = ["TikTok"];
    if (creator.socialLinks?.instagramUrl || creator.instagramUsername) platforms.push("Instagram");
    if (creator.highlightVideoUrl) platforms.push("Video");
    return platforms.slice(0, 3);
}

function cleanFollower(s: string | undefined): string | null {
    if (!s) return null;
    const t = s.trim();
    if (!t || /^tbc$/i.test(t) || /^audience$/i.test(t)) return null;
    return t;
}

export function formatNicheLabel(creator: TalentCardCreator): string {
    const niche = creator.specificNiche?.trim();
    if (niche) return niche;
    const cat = creator.category?.trim();
    if (cat) return cat.replace(/\s*\/\s*/g, " · ");
    return "Creator";
}

export function formatAudienceLine(creator: TalentCardCreator): string {
    const tt = cleanFollower(creator.socialLinks?.tiktokFollowers);
    const ig = cleanFollower(creator.socialLinks?.instagramFollowers);
    if (tt && ig) {
        const primary = tt.endsWith("+") ? tt : `${tt}+`;
        return `${primary} combined audience · TikTok & Instagram`;
    }
    if (tt) {
        return tt.endsWith("+") ? `${tt} audience` : `${tt}+ audience`;
    }
    if (ig) {
        return ig.endsWith("+") ? `${ig} audience` : `${ig}+ audience`;
    }
    return "Combined audience · see roster for full stats";
}
