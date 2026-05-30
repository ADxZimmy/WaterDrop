import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { userProfileSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getCustomerAccountPayload } from "@/lib/customer/account";

const updateCustomerAccountSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  phone: z.string().trim().max(40, "Phone number is too long.").optional(),
  avatarUrl: z.string().trim().max(500000, "Avatar image is too large.").nullable().optional(),
});

export async function GET() {
  try {
    const user = await requireRole(["customer"]);
    const account = await getCustomerAccountPayload({
      uid: user.uid,
      email: user.email,
      role: "customer",
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    });

    return NextResponse.json(account, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load customer account";
    const status = message === "Unauthenticated" ? 401 : message === "Unauthorized" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireRole(["customer"]);
    const input = updateCustomerAccountSchema.parse(await request.json());
    const docRef = getFirebaseAdminDb().collection("users").doc(user.uid);
    const snapshot = await docRef.get();
    const existingProfile = snapshot.exists ? userProfileSchema.parse(snapshot.data()) : null;
    const now = Date.now();
    const nextPhone = input.phone && input.phone.length > 0 ? input.phone : undefined;
    const nextAvatarUrl =
      input.avatarUrl === null || input.avatarUrl === ""
        ? undefined
        : input.avatarUrl ?? existingProfile?.avatarUrl;
    const profile = userProfileSchema.parse({
      uid: user.uid,
      role: "customer",
      email: existingProfile?.email ?? user.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: nextPhone,
      avatarUrl: nextAvatarUrl,
      createdAt: existingProfile?.createdAt ?? now,
      updatedAt: now,
    });

    await docRef.set(profile);

    const account = await getCustomerAccountPayload(
      {
        uid: user.uid,
        email: user.email,
        role: "customer",
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      },
      profile
    );

    return NextResponse.json(account, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update customer account";
    const status = message === "Unauthenticated" ? 401 : message === "Unauthorized" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
