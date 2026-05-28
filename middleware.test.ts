import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { middleware } from "./middleware";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

describe("middleware", () => {
  it("redirects unauthenticated admin requests to the admin login page", () => {
    const request = new NextRequest("https://waterdrop.test/admin/settings");

    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://waterdrop.test/auth/admin?redirect=%2Fadmin%2Fsettings"
    );
  });

  it("redirects unauthenticated dashboard requests to the matching public login role", () => {
    const request = new NextRequest("https://waterdrop.test/dashboard/vendor/orders?tab=open");

    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://waterdrop.test/auth/login?role=vendor&redirect=%2Fdashboard%2Fvendor%2Forders%3Ftab%3Dopen"
    );
  });

  it("lets authenticated protected requests continue", () => {
    const request = new NextRequest("https://waterdrop.test/dashboard/customer");
    request.cookies.set(SESSION_COOKIE_NAME, "session-token");

    const response = middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
