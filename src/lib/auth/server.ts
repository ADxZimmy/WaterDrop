import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { UserRole } from "@/lib/domain/schemas";
import { getFirebaseAdminAuth, getFirebaseAdminDb } from "@/lib/firebase/admin";

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!session) {
      return null;
    }

    const decoded = await getFirebaseAdminAuth().verifySessionCookie(session, true);
    const userDoc = await getFirebaseAdminDb()
      .collection("users")
      .doc(decoded.uid)
      .get();
    const userData = userDoc.data();

    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      role: (userData?.role ?? "customer") as UserRole,
      firstName: typeof userData?.firstName === "string" ? userData.firstName : undefined,
      lastName: typeof userData?.lastName === "string" ? userData.lastName : undefined,
      phone: typeof userData?.phone === "string" ? userData.phone : undefined,
    };
  } catch {
    return null;
  }
}

export async function requireRole(requiredRoles: UserRole[]) {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("Unauthenticated");
  }

  if (!requiredRoles.includes(user.role)) {
    throw new Error("Unauthorized");
  }

  return user;
}
