import {
  orderSchema,
  productSchema,
  userProfileSchema,
  vendorProfileSchema,
  type Order,
  type Product,
  type UserProfile,
  type VendorProfile,
} from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import type { AdminVendorReviewRecord } from "@/lib/admin/vendor-review-types";

function getOwnerName(profile: Partial<UserProfile> | null, fallbackUid: string) {
  const firstName = typeof profile?.firstName === "string" ? profile.firstName.trim() : "";
  const lastName = typeof profile?.lastName === "string" ? profile.lastName.trim() : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  if (typeof profile?.email === "string" && profile.email.trim().length > 0) {
    return profile.email;
  }

  return `Vendor ${fallbackUid.slice(0, 6)}`;
}

async function loadOwnerProfiles(ownerUids: string[]) {
  const uniqueOwnerUids = [...new Set(ownerUids)];
  const db = getFirebaseAdminDb();
  const entries = await Promise.all(
    uniqueOwnerUids.map(async (uid) => {
      const snapshot = await db.collection("users").doc(uid).get();
      return [
        uid,
        snapshot.exists ? (userProfileSchema.parse(snapshot.data()) as UserProfile) : null,
      ] as const;
    })
  );

  return new Map(entries);
}

function buildMetricsByVendor(products: Product[], orders: Order[]) {
  const metrics = new Map<
    string,
    {
      productCount: number;
      activeProductCount: number;
      totalOrders: number;
      revenueNaira: number;
    }
  >();

  products.forEach((product) => {
    const current = metrics.get(product.vendorId) ?? {
      productCount: 0,
      activeProductCount: 0,
      totalOrders: 0,
      revenueNaira: 0,
    };

    current.productCount += 1;
    if (product.isActive) {
      current.activeProductCount += 1;
    }

    metrics.set(product.vendorId, current);
  });

  orders.forEach((order) => {
    const current = metrics.get(order.vendorId) ?? {
      productCount: 0,
      activeProductCount: 0,
      totalOrders: 0,
      revenueNaira: 0,
    };

    current.totalOrders += 1;
    if (order.status !== "cancelled") {
      current.revenueNaira += order.totalNaira;
    }

    metrics.set(order.vendorId, current);
  });

  return metrics;
}

function hydrateVendorReviewRecord(
  vendor: VendorProfile,
  ownerProfile: Partial<UserProfile> | null,
  metrics: {
    productCount: number;
    activeProductCount: number;
    totalOrders: number;
    revenueNaira: number;
  }
): AdminVendorReviewRecord {
  return {
    vendorId: vendor.vendorId,
    ownerUid: vendor.ownerUid,
    businessName: vendor.businessName,
    businessType: vendor.businessType,
    status: vendor.status,
    ownerName: getOwnerName(ownerProfile, vendor.ownerUid),
    ownerEmail:
      typeof ownerProfile?.email === "string" ? ownerProfile.email : "",
    ownerPhone:
      typeof ownerProfile?.phone === "string" ? ownerProfile.phone : undefined,
    address: vendor.address,
    nafdacNumber: vendor.nafdacNumber,
    cacNumber: vendor.cacNumber,
    taxId: vendor.taxId,
    description: vendor.description,
    deliveryRadiusKm: vendor.deliveryRadiusKm,
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt,
    submittedAt:
      typeof vendor.submittedAt === "number" ? vendor.submittedAt : vendor.createdAt,
    reviewedAt: typeof vendor.reviewedAt === "number" ? vendor.reviewedAt : null,
    reviewedBy: typeof vendor.reviewedBy === "string" ? vendor.reviewedBy : null,
    reviewNotes: typeof vendor.reviewNotes === "string" ? vendor.reviewNotes : null,
    totalOrders: metrics.totalOrders,
    revenueNaira: metrics.revenueNaira,
    productCount: metrics.productCount,
    activeProductCount: metrics.activeProductCount,
  };
}

export async function listAdminVendorReviewRecords() {
  const db = getFirebaseAdminDb();
  const [vendorsSnapshot, productsSnapshot, ordersSnapshot] = await Promise.all([
    db.collection("vendors").get(),
    db.collection("products").get(),
    db.collection("orders").get(),
  ]);

  const vendors = vendorsSnapshot.docs.map((doc) => vendorProfileSchema.parse(doc.data()));
  if (vendors.length === 0) {
    return [];
  }

  const ownerProfiles = await loadOwnerProfiles(vendors.map((vendor) => vendor.ownerUid));
  const metricsByVendor = buildMetricsByVendor(
    productsSnapshot.docs.map((doc) => productSchema.parse(doc.data())),
    ordersSnapshot.docs.map((doc) => orderSchema.parse(doc.data()))
  );
  const statusOrder = {
    pending: 0,
    rejected: 1,
    approved: 2,
  } satisfies Record<VendorProfile["status"], number>;

  return vendors
    .map((vendor) =>
      hydrateVendorReviewRecord(
        vendor,
        ownerProfiles.get(vendor.ownerUid) ?? null,
        metricsByVendor.get(vendor.vendorId) ?? {
          productCount: 0,
          activeProductCount: 0,
          totalOrders: 0,
          revenueNaira: 0,
        }
      )
    )
    .sort((left, right) => {
      const statusDiff = statusOrder[left.status] - statusOrder[right.status];
      if (statusDiff !== 0) {
        return statusDiff;
      }

      return (right.submittedAt ?? right.updatedAt) - (left.submittedAt ?? left.updatedAt);
    });
}

export async function getAdminVendorReviewRecord(vendorId: string) {
  const db = getFirebaseAdminDb();
  const vendorSnapshot = await db.collection("vendors").doc(vendorId).get();
  if (!vendorSnapshot.exists) {
    return null;
  }

  const vendor = vendorProfileSchema.parse(vendorSnapshot.data());
  const [ownerSnapshot, productsSnapshot, ordersSnapshot] = await Promise.all([
    db.collection("users").doc(vendor.ownerUid).get(),
    db.collection("products").where("vendorId", "==", vendorId).get(),
    db.collection("orders").where("vendorId", "==", vendorId).get(),
  ]);

  const ownerProfile = ownerSnapshot.exists
    ? (userProfileSchema.parse(ownerSnapshot.data()) as UserProfile)
    : null;
  const metricsByVendor = buildMetricsByVendor(
    productsSnapshot.docs.map((doc) => productSchema.parse(doc.data())),
    ordersSnapshot.docs.map((doc) => orderSchema.parse(doc.data()))
  );

  return hydrateVendorReviewRecord(
    vendor,
    ownerProfile,
    metricsByVendor.get(vendorId) ?? {
      productCount: 0,
      activeProductCount: 0,
      totalOrders: 0,
      revenueNaira: 0,
    }
  );
}
