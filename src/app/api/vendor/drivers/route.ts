import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { listVendorDrivers } from "@/lib/driver/compensation";
import { clampPaginationLimit } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["vendor"]);
    const searchParams = request.nextUrl.searchParams;
    const limit = clampPaginationLimit(Number(searchParams.get("limit")), {
      defaultLimit: 12,
      maxLimit: 50,
    });
    const cursor = searchParams.get("cursor");
    const result = await listVendorDrivers(user.uid, { limit, cursor });
    return NextResponse.json(
      {
        drivers: result.items,
        pageInfo: {
          nextCursor: result.nextCursor,
          total: result.total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load drivers";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
