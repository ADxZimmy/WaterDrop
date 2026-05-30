import { describe, expect, it } from "vitest";

import {
  buildAdminLoginPath,
  buildPublicLoginPath,
  buildRoleLoginPath,
  canRoleAccessPath,
  formatRoleLabel,
  getRoleHomePath,
  getSafePostLoginDestination,
  inferRoleFromProtectedPath,
  normalizePublicRole,
  normalizeRole,
  publicAuthRoles,
} from "@/lib/auth/routing";

describe("auth routing helpers", () => {
  it("normalizes only supported roles", () => {
    expect(normalizeRole("admin")).toBe("admin");
    expect(normalizeRole("vendor")).toBe("vendor");
    expect(normalizeRole("guest")).toBeNull();
    expect(normalizePublicRole("admin")).toBeNull();
    expect(normalizePublicRole("driver")).toBe("driver");
    expect(publicAuthRoles).toEqual(["customer", "vendor", "driver"]);
  });

  it("maps roles to labels and home paths", () => {
    expect(formatRoleLabel("customer")).toBe("Customer");
    expect(getRoleHomePath("customer")).toBe("/dashboard/customer/marketplace");
    expect(getRoleHomePath("vendor")).toBe("/dashboard/vendor");
    expect(getRoleHomePath("admin")).toBe("/admin");
  });

  it("infers protected roles from dashboard and admin paths", () => {
    expect(inferRoleFromProtectedPath("/admin/settings?tab=users")).toBe("admin");
    expect(inferRoleFromProtectedPath("/dashboard/vendor/orders/1")).toBe("vendor");
    expect(inferRoleFromProtectedPath("/dashboard/driver")).toBe("driver");
    expect(inferRoleFromProtectedPath("/dashboard/customer/profile#security")).toBe("customer");
    expect(inferRoleFromProtectedPath("/auth/login")).toBeNull();
  });

  it("permits access only within a role's protected namespace", () => {
    expect(canRoleAccessPath("vendor", "/dashboard/vendor/orders")).toBe(true);
    expect(canRoleAccessPath("vendor", "/dashboard/customer")).toBe(false);
    expect(canRoleAccessPath("admin", "/admin/vendors")).toBe(true);
    expect(canRoleAccessPath("customer", "/dashboard/customer/orders")).toBe(true);
    expect(canRoleAccessPath("driver", "dashboard/driver")).toBe(false);
  });

  it("falls back to the role home path when the requested destination is unsafe", () => {
    expect(getSafePostLoginDestination("customer", "/dashboard/customer/orders")).toBe(
      "/dashboard/customer/orders"
    );
    expect(getSafePostLoginDestination("customer", "/admin")).toBe(
      "/dashboard/customer/marketplace"
    );
  });

  it("builds public, admin, and role-aware login URLs", () => {
    expect(
      buildPublicLoginPath({ role: "vendor", redirect: "/dashboard/vendor/orders" })
    ).toBe("/auth/login?role=vendor&redirect=%2Fdashboard%2Fvendor%2Forders");
    expect(buildAdminLoginPath({ redirect: "/admin/settings" })).toBe(
      "/auth/admin?redirect=%2Fadmin%2Fsettings"
    );
    expect(buildRoleLoginPath({ role: "admin", redirect: "/admin" })).toBe(
      "/auth/admin?redirect=%2Fadmin"
    );
    expect(buildRoleLoginPath({ role: "customer", redirect: "/dashboard/customer" })).toBe(
      "/auth/login?role=customer&redirect=%2Fdashboard%2Fcustomer"
    );
  });
});
