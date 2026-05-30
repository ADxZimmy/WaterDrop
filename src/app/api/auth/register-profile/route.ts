import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import {
  customerAddressSchema,
  customerPreferencesSchema,
  paymentMethodSchema,
  userProfileSchema,
  userRoleSchema,
} from "@/lib/domain/schemas";
import { formatRoleLabel } from "@/lib/auth/routing";
import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@/lib/firebase/admin";
import { normalizeCustomerAddresses } from "@/lib/customer/preferences";

const publicUserRoleSchema = z.enum(["customer", "vendor", "driver"]);
const customerOnboardingSchema = z
  .object({
    deliveryAddress: z
      .object({
        label: z.string().min(1),
        street: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        postalCode: z.string().min(1),
        country: z.string().min(1).default("Nigeria"),
      })
      .optional(),
    preferredPaymentMethod: paymentMethodSchema.optional(),
  })
  .optional();

const registerProfileInputSchema = z.object({
  role: publicUserRoleSchema,
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  customerOnboarding: customerOnboardingSchema,
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!session) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const decoded = await getFirebaseAdminAuth().verifySessionCookie(
      session,
      true
    );
    const input = registerProfileInputSchema.parse(await request.json());
    const now = Date.now();
    const db = getFirebaseAdminDb();
    const userRef = db.collection("users").doc(decoded.uid);
    const existingProfileDoc = await userRef.get();
    const existingRole = userRoleSchema.safeParse(existingProfileDoc.data()?.role);

    if (existingRole.success && existingRole.data !== input.role) {
      return NextResponse.json(
        {
          error: `This account is already registered as ${formatRoleLabel(existingRole.data)}.`,
        },
        { status: 409 }
      );
    }

    const profile = userProfileSchema.parse({
      uid: decoded.uid,
      role: existingRole.success ? existingRole.data : input.role,
      email: decoded.email ?? input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      createdAt:
        typeof existingProfileDoc.data()?.createdAt === "number"
          ? existingProfileDoc.data()?.createdAt
          : now,
      updatedAt: now,
    });

    await userRef.set(profile, { merge: true });

    if (input.role === "customer" && input.customerOnboarding) {
      const preferencesRef = db.collection("customerPreferences").doc(decoded.uid);
      const existingPreferencesDoc = await preferencesRef.get();
      const existingPreferences = existingPreferencesDoc.exists
        ? customerPreferencesSchema.safeParse(existingPreferencesDoc.data())
        : null;
      const onboardingAddress = input.customerOnboarding.deliveryAddress
        ? customerAddressSchema.parse({
            id: randomUUID(),
            ...input.customerOnboarding.deliveryAddress,
            isDefault: true,
          })
        : null;
      const existingAddresses =
        existingPreferences?.success ? existingPreferences.data.addresses : [];
      const addresses = onboardingAddress
        ? normalizeCustomerAddresses([
            ...existingAddresses.map((address) => ({ ...address, isDefault: false })),
            onboardingAddress,
          ])
        : existingAddresses;

      const preferences = customerPreferencesSchema.parse({
        customerUid: decoded.uid,
        addresses,
        preferredPaymentMethod:
          input.customerOnboarding.preferredPaymentMethod ??
          (existingPreferences?.success
            ? existingPreferences.data.preferredPaymentMethod
            : "cod"),
        createdAt:
          existingPreferences?.success ? existingPreferences.data.createdAt : now,
        updatedAt: now,
      });

      await preferencesRef.set(preferences, { merge: true });
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to register profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
