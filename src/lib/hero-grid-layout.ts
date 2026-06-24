import { normalizeCreatorName } from "@/lib/roster-creators";

/** One campaign row per creator; generic "Creator" labels group by campaign id prefix. */
export function campaignCreatorKey(creator: string, campaignId: string): string {
  const normalized = normalizeCreatorName(creator);
  if (!normalized || normalized === "creator") {
    const base = campaignId.replace(/-[ab]$/i, "").replace(/-\d+$/i, "");
    return `unknown:${base}`;
  }
  return normalized;
}

export function pickOnePerCreatorKey<T>(
  items: T[],
  getCreatorKey: (item: T) => string,
  getId: (item: T) => string,
  max: number
): T[] {
  const seenCreators = new Set<string>();
  const seenIds = new Set<string>();
  const out: T[] = [];

  for (const item of items) {
    const id = getId(item);
    if (seenIds.has(id)) continue;
    const creatorKey = getCreatorKey(item);
    if (seenCreators.has(creatorKey)) continue;
    seenIds.add(id);
    seenCreators.add(creatorKey);
    out.push(item);
    if (out.length >= max) break;
  }

  return out;
}

type PlacementRules<T> = {
  sameItem: (a: T, b: T) => boolean;
  sameGroup: (a: T, b: T) => boolean;
};

function conflicts<T>(
  rules: PlacementRules<T>,
  a: T | undefined,
  b: T
): boolean {
  if (!a) return false;
  return rules.sameItem(a, b) || rules.sameGroup(a, b);
}

function arrangeRing<T>(
  pool: T[],
  length: number,
  columnCount: number,
  rules: PlacementRules<T>
): T[] | null {
  if (length === 0) return [];
  if (pool.length === 0) return null;
  if (length > pool.length) return null;

  const result: T[] = [];
  const usedItems = new Set<T>();

  const tryPlace = (pos: number): boolean => {
    if (pos === length) return true;

    for (let i = 0; i < pool.length; i++) {
      const item = pool[i];
      if (usedItems.has(item)) continue;
      const col = pos % columnCount;
      const left = col > 0 ? result[pos - 1] : undefined;
      const top = pos >= columnCount ? result[pos - columnCount] : undefined;
      if (conflicts(rules, left, item) || conflicts(rules, top, item)) continue;

      result.push(item);
      usedItems.add(item);
      if (tryPlace(pos + 1)) return true;
      result.pop();
      usedItems.delete(item);
    }
    return false;
  };

  return tryPlace(0) ? result : null;
}

function rotatePool<T>(pool: T[], offset: number): T[] {
  if (!pool.length) return [];
  const o = offset % pool.length;
  return [...pool.slice(o), ...pool.slice(0, o)];
}

/** Row-major ring → one vertical list per column. */
export function ringToColumns<T>(ring: T[], columnCount: number): T[][] {
  const rows = Math.ceil(ring.length / columnCount);
  return Array.from({ length: columnCount }, (_, col) => {
    const colItems: T[] = [];
    for (let row = 0; row < rows; row++) {
      const idx = row * columnCount + col;
      if (idx < ring.length) colItems.push(ring[idx]);
    }
    return colItems;
  });
}

/**
 * Builds scrolling column tracks: no duplicate videos on screen, no same creator
 * adjacent (vertical, horizontal, or at the loop seam).
 */
export function buildSeparatedColumnTracks<T>(
  pool: T[],
  columnCount: number,
  minVisibleCells: number,
  rules: PlacementRules<T>,
  getKey: (item: T) => string
): T[][] {
  void getKey;

  if (!pool.length || columnCount < 1) {
    return Array.from({ length: Math.max(columnCount, 1) }, () => []);
  }

  let itemsPerColumn = Math.max(2, Math.ceil(minVisibleCells / columnCount));
  while (
    itemsPerColumn > 1 &&
    pool.length < itemsPerColumn * columnCount + itemsPerColumn
  ) {
    itemsPerColumn -= 1;
  }
  itemsPerColumn = Math.min(itemsPerColumn, pool.length);
  const ringSize = Math.min(columnCount * itemsPerColumn, pool.length);

  for (let attempt = 0; attempt < pool.length; attempt++) {
    const rotated = rotatePool(pool, attempt);
    const partA = arrangeRing(rotated, ringSize, columnCount, rules);
    if (!partA) continue;

    const columnsA = ringToColumns(partA, columnCount);

    const valid = columnsA.every((segment) => {
      if (segment.length !== itemsPerColumn) return false;
      for (let i = 1; i < segment.length; i++) {
        if (conflicts(rules, segment[i - 1], segment[i])) return false;
      }
      return !conflicts(rules, segment[segment.length - 1], segment[0]);
    });

    if (valid) return columnsA.map((segment) => [...segment, ...segment]);
  }

  const fallbackSize = Math.min(ringSize, pool.length);
  const fallbackRing = arrangeRing(pool, fallbackSize, columnCount, rules) ?? pool.slice(0, fallbackSize);
  const cols = ringToColumns(fallbackRing, columnCount);
  return cols.map((col) => [...col, ...col]);
}
