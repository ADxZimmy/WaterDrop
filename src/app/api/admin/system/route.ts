import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { getAdminAnalyticsPayload } from "@/lib/admin/ops";
import { listAdminVendorReviewRecords } from "@/lib/admin/vendor-review";
import type { AdminSystemSnapshot } from "@/lib/admin/system-types";

function hasEnvironmentVariables(keys: string[]) {
  return keys.every((key) => {
    const value = process.env[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

async function buildAdminSystemSnapshot(): Promise<AdminSystemSnapshot> {
  const [analytics, vendors] = await Promise.all([
    getAdminAnalyticsPayload(),
    listAdminVendorReviewRecords(),
  ]);
  const pendingApplications = vendors.filter((vendor) => vendor.status === "pending");

  return {
    summary: {
      grossRevenueNaira: analytics.summary.grossRevenueNaira,
      totalVendors: analytics.summary.totalVendors,
      approvedVendors: analytics.summary.approvedVendors,
      pendingVendorApplications: pendingApplications.length,
      totalCustomers: analytics.summary.totalCustomers,
      totalDrivers: analytics.summary.totalDrivers,
      openOrders: analytics.summary.activeOrders,
    },
    environment: {
      firebaseClientConfigured: hasEnvironmentVariables([
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID",
      ]),
      firebaseAdminConfigured: hasEnvironmentVariables([
        "FIREBASE_PROJECT_ID",
        "FIREBASE_CLIENT_EMAIL",
        "FIREBASE_PRIVATE_KEY",
      ]),
    },
    policies: {
      publicVendorRegistration: true,
      manualVendorCreation: false,
      vendorOnboarding: "self_service_review",
      paymentMethods: ["cod", "manual_transfer"],
      vendorDocumentStorage: false,
      driverTelemetry: false,
    },
    pendingApplications: pendingApplications.slice(0, 5).map((vendor) => ({
      vendorId: vendor.vendorId,
      businessName: vendor.businessName,
      businessType: vendor.businessType,
      ownerName: vendor.ownerName,
      submittedAt: vendor.submittedAt,
    })),
  };
}

export async function GET() {
  try {
    await requireRole(["admin"]);
    const system = await buildAdminSystemSnapshot();
    return NextResponse.json({ system }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load admin system snapshot";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
