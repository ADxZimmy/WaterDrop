import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { listAdminOrderRecords } from "@/lib/admin/ops";
import { clampPaginationLimit } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin"]);
    const searchParams = request.nextUrl.searchParams;
    const limit = clampPaginationLimit(Number(searchParams.get("limit")), {
      defaultLimit: 25,
      maxLimit: 100,
    });
    const cursor = searchParams.get("cursor");
    const result = await listAdminOrderRecords({ limit, cursor });
    return NextResponse.json(
      {
        orders: result.items,
        pageInfo: {
          nextCursor: result.nextCursor,
          total: result.total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load admin orders";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
