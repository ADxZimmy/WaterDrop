import { clampPaginationLimit } from "@/lib/pagination";

export const ORDER_PAGE_DEFAULT_LIMIT = 20;
export const ORDER_PAGE_MAX_LIMIT = 50;

export type OrderPageCursor = {
  createdAt: number;
};

export function getOrderPageParams(requestUrl: string) {
  const url = new URL(requestUrl);
  const rawLimit = Number.parseInt(url.searchParams.get("limit") ?? "", 10);

  return {
    cursor: decodeOrderCursor(url.searchParams.get("cursor")),
    limit: clampPaginationLimit(rawLimit, {
      defaultLimit: ORDER_PAGE_DEFAULT_LIMIT,
      maxLimit: ORDER_PAGE_MAX_LIMIT,
    }),
  };
}

export function encodeOrderCursor(createdAt: number) {
  const cursor: OrderPageCursor = { createdAt };
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeOrderCursor(cursor: string | null): OrderPageCursor | null {
  if (!cursor) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    return typeof parsed?.createdAt === "number" && Number.isFinite(parsed.createdAt)
      ? { createdAt: parsed.createdAt }
      : null;
  } catch {
    return null;
  }
}

export function getOrderPageInfo<T extends { createdAt: number }>(items: T[], limit: number) {
  const pageItems = items.slice(0, limit);
  const lastItem = pageItems.at(-1);

  return {
    orders: pageItems,
    pageInfo: {
      nextCursor: items.length > limit && lastItem ? encodeOrderCursor(lastItem.createdAt) : null,
      limit,
    },
  };
}
