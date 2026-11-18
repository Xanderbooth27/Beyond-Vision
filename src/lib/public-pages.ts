// One page per case study and per roster creator, for Google (2026-11-18).
// Built from the same data the Case studies and Roster pages show.
import { driveCaseStudies, driveCreators, driveThumbnailUrl, type DriveCaseStudy, type DriveCreator } from "@/lib/drive-content";

const norm = (s = "") => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const tiktokHandle = (url = "") => (url.match(/tiktok\.com\/@([^/?]+)/i)?.[1] || "").toLowerCase();

// The roster has one creator listed twice (realglorious). Keep the first.
export const rosterCreators: DriveCreator[] = driveCreators.filter((c, i, all) => {
  const key = tiktokHandle(c.tiktokUrl) || norm(c.name);
  return all.findIndex((o) => (tiktokHandle(o.tiktokUrl) || norm(o.name)) === key) === i;
});

export const caseStudies: DriveCaseStudy[] = driveCaseStudies;

export function findCaseStudy(id: string) {
  return caseStudies.find((c) => c.id === id);
}

export function findCreator(id: string) {
  return rosterCreators.find((c) => c.id === id);
}

export function creatorForCase(c: DriveCaseStudy) {
  const handle = tiktokHandle(c.tiktokUrl);
  return rosterCreators.find((r) => norm(r.name) === norm(c.creator) || (handle && tiktokHandle(r.tiktokUrl) === handle));
}

export function casesForCreator(r: DriveCreator) {
  return caseStudies.filter((c) => creatorForCase(c)?.id === r.id);
}

export function creatorImage(r: DriveCreator) {
  return driveThumbnailUrl(r.driveFileId, 1200); // every creator has a photo in public/drive-content/creators
}

export function caseImage(c: DriveCaseStudy) {
  return driveThumbnailUrl(c.driveFileId);
}

// "6.7M" -> 6700000
export function parseCount(s = ""): number {
  const m = s.replace(/,/g, "").match(/([\d.]+)\s*([KkMm]?)/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2].toLowerCase() === "m" ? n * 1e6 : m[2].toLowerCase() === "k" ? n * 1e3 : n;
}

// Likes + comments over views, one decimal place. Null when views are unknown.
export function engagementRate(c: DriveCaseStudy): string | null {
  const views = parseCount(c.metrics.views);
  if (!views) return null;
  const rate = ((parseCount(c.metrics.likes) + parseCount(c.metrics.comments)) / views) * 100;
  return rate.toFixed(1);
}
