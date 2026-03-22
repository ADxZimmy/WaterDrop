import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import {
  customerAddressSchema,
  customerPreferencesSchema,
  paymentMethodSchema,
} from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { normalizeCustomerAddresses } from "@/lib/customer/preferences";

const updateCustomerPreferencesSchema = z.object({
  addresses: z.array(customerAddressSchema).optional(),
  preferredPaymentMethod: paymentMethodSchema.optional(),
});

export async function GET() {
  try {
    const user = await requireRole(["customer"]);
    const snapshot = await getFirebaseAdminDb()
      .collection("customerPreferences")
      .doc(user.uid)
      .get();

    if (!snapshot.exists) {
      return NextResponse.json({ preferences: null }, { status: 200 });
    }

    const preferences = customerPreferencesSchema.parse(snapshot.data());
    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load customer preferences";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireRole(["customer"]);
    const input = updateCustomerPreferencesSchema.parse(await request.json());
    const docRef = getFirebaseAdminDb()
      .collection("customerPreferences")
      .doc(user.uid);
    const snapshot = await docRef.get();
    const existing = snapshot.exists
      ? customerPreferencesSchema.parse(snapshot.data())
      : null;
    const now = Date.now();

    const preferences = customerPreferencesSchema.parse({
      customerUid: user.uid,
      addresses: normalizeCustomerAddresses(input.addresses ?? existing?.addresses ?? []),
      preferredPaymentMethod:
        input.preferredPaymentMethod ??
        existing?.preferredPaymentMethod ??
        "cod",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });

    await docRef.set(preferences);
    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save customer preferences";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
