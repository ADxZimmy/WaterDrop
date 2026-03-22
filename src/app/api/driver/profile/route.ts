import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { driverProfileSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

const driverProfileInputSchema = z.object({
  vendorId: z.string().min(1),
  vehicleType: z.string().min(1),
  licensePlate: z.string().min(1),
});

const driverInventoryInputSchema = z.object({
  loadedUnits: z.number().int().nonnegative(),
});

export async function GET() {
  try {
    const user = await requireRole(["driver"]);
    const doc = await getFirebaseAdminDb().collection("drivers").doc(user.uid).get();

    if (!doc.exists) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const profile = driverProfileSchema.parse(doc.data());
    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load driver profile";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["driver"]);
    const contentType = request.headers.get("content-type") ?? "";
    const body = await request.json();
    const now = Date.now();
    const existingDoc = await getFirebaseAdminDb().collection("drivers").doc(user.uid).get();
    const existing = existingDoc.data();

    if (contentType.includes("application/json") && "loadedUnits" in body) {
      const input = driverInventoryInputSchema.parse(body);
      const profile = driverProfileSchema.parse({
        uid: user.uid,
        vendorId: existing?.vendorId ?? "",
        status: existing?.status ?? "pending",
        vehicleType: existing?.vehicleType,
        licensePlate: existing?.licensePlate,
        loadedUnits: input.loadedUnits,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });

      await getFirebaseAdminDb().collection("drivers").doc(user.uid).set(profile, { merge: true });
      return NextResponse.json({ profile }, { status: 200 });
    }

    const input = driverProfileInputSchema.parse(body);
    const profile = driverProfileSchema.parse({
      uid: user.uid,
      vendorId: input.vendorId,
      status: existing?.status ?? "active",
      vehicleType: input.vehicleType,
      licensePlate: input.licensePlate,
      loadedUnits: existing?.loadedUnits ?? 0,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });

    await getFirebaseAdminDb().collection("drivers").doc(user.uid).set(profile, { merge: true });
    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save driver profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
