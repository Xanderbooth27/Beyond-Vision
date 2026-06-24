import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import {
  driveCreators,
  driveThumbnailUrl,
  type DriveCreator,
} from "@/lib/drive-content";
import type { CreatorProfile } from "@/lib/spec-data";
import type { TalentCardCreator } from "@/lib/talent-display";

export type PublicCreator = {
  id: string;
  name: string;
  followers: string;
  imageUrl: string;
  email?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  demographics?: {
    country?: string;
    topCountries?: string;
    genderSplit?: string;
    ageGroups?: string;
  };
};

export function normalizeCreatorName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function fromDriveCreator(creator: DriveCreator): PublicCreator {
  return {
    id: creator.id,
    name: creator.name,
    followers: creator.followers,
    imageUrl: driveThumbnailUrl(creator.driveFileId, 1200),
    tiktokUrl: creator.tiktokUrl,
    instagramUrl: creator.instagramUrl,
  };
}

export function publicFromFirebase(creator: CreatorProfile): PublicCreator | null {
  const name = creator.creatorName?.trim() || creator.displayName?.trim();
  const followers =
    creator.socialLinks?.tiktokFollowers?.trim() ||
    creator.socialLinks?.instagramFollowers?.trim();
  const imageUrl = creator.profileImageUrl?.trim();

  if (!name || !imageUrl) return null;

  return {
    id: creator.id || normalizeCreatorName(name),
    name,
    followers: followers && !/^0$/i.test(followers) ? followers : "Creator roster",
    imageUrl,
    email: creator.email?.trim() || undefined,
    tiktokUrl: creator.socialLinks?.tiktokUrl?.trim() || undefined,
    instagramUrl: creator.socialLinks?.instagramUrl?.trim() || undefined,
    demographics: {
      country: creator.country?.trim() || undefined,
      topCountries: creator.audienceDemographics?.topCountries?.trim() || undefined,
      genderSplit: creator.audienceDemographics?.genderSplit?.trim() || undefined,
      ageGroups: creator.audienceDemographics?.ageGroups?.trim() || undefined,
    },
  };
}

function mergeCreator(primary: PublicCreator, secondary: PublicCreator): PublicCreator {
  return {
    ...primary,
    email: primary.email || secondary.email,
    tiktokUrl: primary.tiktokUrl || secondary.tiktokUrl,
    instagramUrl: primary.instagramUrl || secondary.instagramUrl,
    demographics: {
      ...secondary.demographics,
      ...primary.demographics,
    },
  };
}

export function dedupeCreators(list: PublicCreator[]) {
  const seen = new Map<string, number>();
  const out: PublicCreator[] = [];

  for (const creator of list) {
    const key = normalizeCreatorName(creator.name);
    const existingIndex = seen.get(key);
    if (existingIndex === undefined) {
      seen.set(key, out.length);
      out.push(creator);
      continue;
    }

    out[existingIndex] = mergeCreator(out[existingIndex], creator);
  }

  return out;
}

/** Same roster list used on /roster: drive archive + matching Firebase enrichments. */
export function buildRosterCreators(dbCreators: PublicCreator[]): PublicCreator[] {
  const driveItems = driveCreators.map(fromDriveCreator);
  const driveNames = new Set(driveItems.map((creator) => normalizeCreatorName(creator.name)));
  const matchingDbItems = dbCreators.filter((creator) =>
    driveNames.has(normalizeCreatorName(creator.name))
  );
  return dedupeCreators([...driveItems, ...matchingDbItems]);
}

export async function fetchFirebaseRosterCreators(): Promise<PublicCreator[]> {
  try {
    const q = query(collection(getDb(), "creators"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => publicFromFirebase({ id: doc.id, ...doc.data() } as CreatorProfile))
      .filter((creator): creator is PublicCreator => Boolean(creator));
  } catch (error) {
    console.error("Roster Firebase enrichment unavailable:", error);
    return [];
  }
}

export function publicCreatorToTalentCard(creator: PublicCreator): TalentCardCreator {
  const followers = creator.followers?.trim();
  const hasFollowerStat = Boolean(followers && followers !== "Creator roster");

  const card: TalentCardCreator = {
    id: creator.id,
    creatorName: creator.name,
    displayName: creator.name,
    profileImageUrl: creator.imageUrl,
  };

  if (creator.tiktokUrl || creator.instagramUrl || (hasFollowerStat && followers)) {
    card.socialLinks = {
      ...(creator.tiktokUrl ? { tiktokUrl: creator.tiktokUrl } : {}),
      ...(creator.instagramUrl ? { instagramUrl: creator.instagramUrl } : {}),
      ...(hasFollowerStat && followers ? { tiktokFollowers: followers } : {}),
    } as TalentCardCreator["socialLinks"];
  }

  return card;
}

export function rosterToTalentCards(roster: PublicCreator[]): TalentCardCreator[] {
  return roster.map(publicCreatorToTalentCard);
}
