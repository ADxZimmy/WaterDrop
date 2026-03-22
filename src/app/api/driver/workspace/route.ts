import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { getDriverWorkspacePayload } from "@/lib/driver/workspace";

export async function GET() {
  try {
    const user = await requireRole(["driver"]);
    const workspace = await getDriverWorkspacePayload(user);
    return NextResponse.json({ workspace }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load driver workspace";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
