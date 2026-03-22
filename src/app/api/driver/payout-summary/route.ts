import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { driverProfileSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getDriverPayoutSummary } from "@/lib/driver/compensation";

export async function GET() {
  try {
    const user = await requireRole(["driver"]);
    const snapshot = await getFirebaseAdminDb().collection("drivers").doc(user.uid).get();

    if (!snapshot.exists) {
      return NextResponse.json({ summary: null }, { status: 200 });
    }

    const driver = driverProfileSchema.parse(snapshot.data());
    const summary = await getDriverPayoutSummary(user.uid, driver.vendorId);
    return NextResponse.json({ summary }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load payout summary";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
