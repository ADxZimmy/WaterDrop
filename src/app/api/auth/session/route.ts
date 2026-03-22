import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from "@/lib/auth/constants";
import { userRoleSchema, type UserRole } from "@/lib/domain/schemas";
import { formatRoleLabel } from "@/lib/auth/routing";
import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@/lib/firebase/admin";

const SESSION_TTL_SECONDS = Math.floor(SESSION_TTL_MS / 1000);
const createSessionInputSchema = z.object({
  idToken: z.string().min(1),
  expectedRole: userRoleSchema.optional(),
});

function resolveStoredRole(value: unknown): UserRole | null {
  const result = userRoleSchema.safeParse(value);
  return result.success ? result.data : null;
}

export async function POST(request: Request) {
  try {
    const input = createSessionInputSchema.parse(await request.json());
    const adminAuth = getFirebaseAdminAuth();
    const decoded = await adminAuth.verifyIdToken(input.idToken);
    const userDoc = await getFirebaseAdminDb()
      .collection("users")
      .doc(decoded.uid)
      .get();
    const resolvedRole = resolveStoredRole(userDoc.data()?.role) ?? "customer";

    if (input.expectedRole && resolvedRole !== input.expectedRole) {
      return NextResponse.json(
        {
          error: `This account is registered as ${formatRoleLabel(resolvedRole)}. Select ${formatRoleLabel(resolvedRole)} to continue.`,
        },
        { status: 403 }
      );
    }

    const sessionCookie = await adminAuth.createSessionCookie(input.idToken, {
      expiresIn: SESSION_TTL_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    return NextResponse.json({ ok: true, role: resolvedRole });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create session";
    const status = error instanceof z.ZodError ? 400 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
