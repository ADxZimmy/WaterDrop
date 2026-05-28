import { beforeEach, describe, expect, it, vi } from "vitest";

const cookiesMock = vi.hoisted(() => vi.fn());
const firebaseAdminMock = vi.hoisted(() => ({
  getFirebaseAdminAuth: vi.fn(),
  getFirebaseAdminDb: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/firebase/admin", () => firebaseAdminMock);

import { getAuthenticatedUser, requireRole } from "@/lib/auth/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

describe("auth server helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no session cookie exists", async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });

    await expect(getAuthenticatedUser()).resolves.toBeNull();
  });

  it("hydrates the authenticated user from the session cookie and profile doc", async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockImplementation((name: string) =>
        name === SESSION_COOKIE_NAME ? { value: "session-token" } : undefined
      ),
    });
    firebaseAdminMock.getFirebaseAdminAuth.mockReturnValue({
      verifySessionCookie: vi.fn().mockResolvedValue({
        uid: "user-1",
        email: "vendor@example.com",
      }),
    });
    firebaseAdminMock.getFirebaseAdminDb.mockReturnValue({
      collection() {
        return {
          doc() {
            return {
              async get() {
                return {
                  data: () => ({
                    role: "vendor",
                    firstName: "Ada",
                    lastName: "Okafor",
                    phone: "08000000000",
                  }),
                };
              },
            };
          },
        };
      },
    });

    await expect(getAuthenticatedUser()).resolves.toEqual({
      uid: "user-1",
      email: "vendor@example.com",
      role: "vendor",
      firstName: "Ada",
      lastName: "Okafor",
      phone: "08000000000",
    });
  });

  it("defaults the role to customer and swallows verification failures", async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "session-token" }),
    });
    firebaseAdminMock.getFirebaseAdminAuth.mockReturnValue({
      verifySessionCookie: vi.fn().mockResolvedValue({
        uid: "user-2",
        email: "customer@example.com",
      }),
    });
    firebaseAdminMock.getFirebaseAdminDb.mockReturnValue({
      collection() {
        return {
          doc() {
            return {
              async get() {
                return {
                  data: () => ({}),
                };
              },
            };
          },
        };
      },
    });

    await expect(getAuthenticatedUser()).resolves.toMatchObject({
      uid: "user-2",
      role: "customer",
    });

    firebaseAdminMock.getFirebaseAdminAuth.mockReturnValue({
      verifySessionCookie: vi.fn().mockRejectedValue(new Error("invalid session")),
    });

    await expect(getAuthenticatedUser()).resolves.toBeNull();
  });

  it("enforces required roles", async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "session-token" }),
    });
    firebaseAdminMock.getFirebaseAdminAuth.mockReturnValue({
      verifySessionCookie: vi.fn().mockResolvedValue({
        uid: "user-1",
        email: "admin@example.com",
      }),
    });
    firebaseAdminMock.getFirebaseAdminDb.mockReturnValue({
      collection() {
        return {
          doc() {
            return {
              async get() {
                return {
                  data: () => ({ role: "admin" }),
                };
              },
            };
          },
        };
      },
    });

    await expect(requireRole(["admin"])).resolves.toMatchObject({ role: "admin" });
    await expect(requireRole(["vendor"])).rejects.toThrow("Unauthorized");
  });
});
