import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { userProfileSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@/lib/firebase/admin";

export async function GET() {
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

    const userDoc = await getFirebaseAdminDb()
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!userDoc.exists) {
      return NextResponse.json(
        {
          uid: decoded.uid,
          email: decoded.email ?? "",
          role: "customer",
        },
        { status: 200 }
      );
    }

    const profile = userProfileSchema.parse(userDoc.data());
    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to resolve user";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
