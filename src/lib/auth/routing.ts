import type { UserRole } from "@/lib/domain/schemas";

export type PublicUserRole = Exclude<UserRole, "admin">;

export const publicAuthRoles: PublicUserRole[] = [
  "customer",
  "vendor",
  "driver",
];

const roleHomePaths: Record<UserRole, string> = {
  customer: "/dashboard/customer",
  vendor: "/dashboard/vendor",
  driver: "/dashboard/driver",
  admin: "/admin",
};

const roleSessionPaths: Record<UserRole, string> = {
  customer: "/dashboard/customer/session",
  vendor: "/dashboard/vendor/session",
  driver: "/dashboard/driver/session",
  admin: "/admin",
};

function stripSearchAndHash(path: string) {
  return path.split(/[?#]/, 1)[0] || path;
}

export function normalizeRole(value: string | null | undefined): UserRole | null {
  if (value === "customer" || value === "vendor" || value === "driver" || value === "admin") {
    return value;
  }

  return null;
}

export function normalizePublicRole(
  value: string | null | undefined
): PublicUserRole | null {
  const role = normalizeRole(value);
  if (role && role !== "admin") {
    return role;
  }

  return null;
}

export function formatRoleLabel(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function getRoleHomePath(role: UserRole) {
  return roleHomePaths[role];
}

export function getRoleSessionPath(role: UserRole) {
  return roleSessionPaths[role];
}

export function inferRoleFromProtectedPath(path: string | null | undefined): UserRole | null {
  if (!path) {
    return null;
  }

  const pathname = stripSearchAndHash(path);
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return "admin";
  }

  if (pathname === "/dashboard/vendor" || pathname.startsWith("/dashboard/vendor/")) {
    return "vendor";
  }

  if (pathname === "/dashboard/driver" || pathname.startsWith("/dashboard/driver/")) {
    return "driver";
  }

  if (pathname === "/dashboard/customer" || pathname.startsWith("/dashboard/customer/")) {
    return "customer";
  }

  return null;
}

export function canRoleAccessPath(role: UserRole, path: string | null | undefined) {
  if (!path || !path.startsWith("/")) {
    return false;
  }

  const pathname = stripSearchAndHash(path);
  const homePath = getRoleHomePath(role);
  return pathname === homePath || pathname.startsWith(`${homePath}/`);
}

export function getSafePostLoginDestination(
  role: UserRole,
  requestedPath: string | null | undefined
) {
  if (canRoleAccessPath(role, requestedPath)) {
    return requestedPath as string;
  }

  return getRoleHomePath(role);
}

export function buildPublicLoginPath(options?: {
  role?: PublicUserRole | null;
  redirect?: string | null;
}) {
  const params = new URLSearchParams();

  if (options?.role) {
    params.set("role", options.role);
  }

  if (options?.redirect) {
    params.set("redirect", options.redirect);
  }

  const query = params.toString();
  return query ? `/auth/login?${query}` : "/auth/login";
}

export function buildAdminLoginPath(options?: { redirect?: string | null }) {
  const params = new URLSearchParams();

  if (options?.redirect) {
    params.set("redirect", options.redirect);
  }

  const query = params.toString();
  return query ? `/auth/admin?${query}` : "/auth/admin";
}

export function buildRoleLoginPath(options?: {
  role?: UserRole | null;
  redirect?: string | null;
}) {
  if (options?.role === "admin") {
    return buildAdminLoginPath({ redirect: options.redirect });
  }

  return buildPublicLoginPath({
    role: normalizePublicRole(options?.role ?? null),
    redirect: options?.redirect,
  });
}
