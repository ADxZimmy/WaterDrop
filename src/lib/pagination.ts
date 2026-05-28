export type PaginationResult<T> = {
  items: T[];
  nextCursor: string | null;
  total: number;
};

type PaginationOptions = {
  limit?: number;
  cursor?: string | null;
  maxLimit?: number;
};

export function clampPaginationLimit(
  limit: number | undefined,
  { defaultLimit = 20, maxLimit = 100 }: { defaultLimit?: number; maxLimit?: number } = {}
) {
  if (!Number.isFinite(limit)) {
    return defaultLimit;
  }

  return Math.min(Math.max(Math.trunc(limit as number), 1), maxLimit);
}

export function encodeOffsetCursor(offset: number) {
  return Buffer.from(String(offset), "utf8").toString("base64url");
}

export function decodeOffsetCursor(cursor: string | null | undefined) {
  if (!cursor) {
    return 0;
  }

  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const offset = Number.parseInt(decoded, 10);
    return Number.isFinite(offset) && offset >= 0 ? offset : 0;
  } catch {
    return 0;
  }
}

export function paginateArray<T>(
  items: T[],
  { limit, cursor, maxLimit = 100 }: PaginationOptions = {}
): PaginationResult<T> {
  const pageLimit = clampPaginationLimit(limit, { maxLimit });
  const offset = decodeOffsetCursor(cursor);
  const sliced = items.slice(offset, offset + pageLimit);
  const nextOffset = offset + sliced.length;

  return {
    items: sliced,
    nextCursor: nextOffset < items.length ? encodeOffsetCursor(nextOffset) : null,
    total: items.length,
  };
}
