import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { vendorProfileSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

const vendorProfileInputSchema = z.object({
  businessName: z.string().min(1),
  businessType: z.string().min(1),
  establishmentYear: z.number().int().min(1900).max(2100),
  address: z.string().min(1),
  nafdacNumber: z.string().min(1),
  cacNumber: z.string().min(1),
  taxId: z.string().min(1),
  description: z.string().min(1),
  deliveryRadiusKm: z.number().int().nonnegative(),
});

export async function GET() {
  try {
    const user = await requireRole(["vendor"]);
    const doc = await getFirebaseAdminDb().collection("vendors").doc(user.uid).get();

    if (!doc.exists) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const profile = vendorProfileSchema.parse(doc.data());
    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load vendor profile";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["vendor"]);
    const input = vendorProfileInputSchema.parse(await request.json());
    const now = Date.now();
    const existingDoc = await getFirebaseAdminDb().collection("vendors").doc(user.uid).get();
    const existing = existingDoc.exists
      ? vendorProfileSchema.parse(existingDoc.data())
      : null;
    const shouldPreserveApproval = existing?.status === "approved";

    const profile = vendorProfileSchema.parse({
      vendorId: existing?.vendorId ?? user.uid,
      ownerUid: user.uid,
      businessName: input.businessName,
      status: shouldPreserveApproval ? "approved" : "pending",
      businessType: input.businessType,
      establishmentYear: input.establishmentYear,
      address: input.address,
      nafdacNumber: input.nafdacNumber,
      cacNumber: input.cacNumber,
      taxId: input.taxId,
      description: input.description,
      deliveryRadiusKm: input.deliveryRadiusKm,
      submittedAt: shouldPreserveApproval ? existing?.submittedAt ?? existing?.createdAt ?? now : now,
      ...(shouldPreserveApproval && existing?.reviewedAt != null && { reviewedAt: existing.reviewedAt }),
      ...(shouldPreserveApproval && existing?.reviewedBy != null && { reviewedBy: existing.reviewedBy }),
      ...(shouldPreserveApproval && existing?.reviewNotes != null && { reviewNotes: existing.reviewNotes }),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });

    const toWrite = Object.fromEntries(
      Object.entries(profile).filter(([, v]) => v !== undefined)
    );
    await getFirebaseAdminDb().collection("vendors").doc(user.uid).set(toWrite, { merge: true });
    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save vendor profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
