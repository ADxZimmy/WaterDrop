import {
  driverProfileSchema,
  userProfileSchema,
  vendorProfileSchema,
} from "@/lib/domain/schemas";
import { ORDER_ACTIVE_STATUSES } from "@/lib/orders/status";
import {
  getDriverAssignedOrder,
  getDriverPayoutSummary,
  listDriverAssignedOrders,
} from "@/lib/driver/compensation";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import type {
  DriverWorkspaceAssignedOrder,
  DriverWorkspaceAssignmentSummary,
  DriverOrderReferencePayload,
  DriverWorkspaceCapabilities,
  DriverWorkspacePayload,
  DriverWorkspaceUser,
  DriverWorkspaceVendor,
} from "@/lib/driver/workspace-types";

type AuthenticatedDriver = {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

const DRIVER_WORKSPACE_CAPABILITIES: DriverWorkspaceCapabilities = {
  driverAssignments: true,
  turnByTurnNavigation: false,
  payoutTracking: true,
  selfServiceSecurity: false,
};

const EMPTY_ASSIGNMENT_SUMMARY: DriverWorkspaceAssignmentSummary = {
  totalAssignedOrders: 0,
  activeAssignedOrders: 0,
  deliveredAssignedOrders: 0,
  cancelledAssignedOrders: 0,
  latestAssignedOrderUpdatedAt: null,
};

const EMPTY_PAYOUT_SUMMARY = {
  availableBalanceNaira: 0,
  requestedBalanceNaira: 0,
  lifetimePaidNaira: 0,
};

function buildWorkspaceUser(
  authenticatedUser: AuthenticatedDriver,
  rawUserDoc: unknown
): DriverWorkspaceUser {
  const parsedProfile = userProfileSchema.safeParse(rawUserDoc);
  const profile = parsedProfile.success ? parsedProfile.data : null;

  return {
    uid: authenticatedUser.uid,
    email: profile?.email ?? authenticatedUser.email,
    firstName: profile?.firstName ?? authenticatedUser.firstName,
    lastName: profile?.lastName ?? authenticatedUser.lastName,
    phone: profile?.phone ?? authenticatedUser.phone,
    createdAt: profile?.createdAt ?? null,
  };
}

function buildWorkspaceVendor(rawVendorDoc: unknown): DriverWorkspaceVendor | null {
  const parsedVendor = vendorProfileSchema.safeParse(rawVendorDoc);
  if (!parsedVendor.success) {
    return null;
  }

  const vendor = parsedVendor.data;
  return {
    vendorId: vendor.vendorId,
    businessName: vendor.businessName,
    businessType: vendor.businessType,
    address: vendor.address,
    status: vendor.status,
    reviewNotes: vendor.reviewNotes,
  };
}

function buildAssignmentSummary(
  orders: Array<{
    status: DriverOrderReferencePayload["order"]["status"];
    updatedAt: number;
  }>
): DriverWorkspaceAssignmentSummary {
  if (orders.length === 0) {
    return EMPTY_ASSIGNMENT_SUMMARY;
  }

  return {
    totalAssignedOrders: orders.length,
    activeAssignedOrders: orders.filter((order) => ORDER_ACTIVE_STATUSES.has(order.status))
      .length,
    deliveredAssignedOrders: orders.filter((order) => order.status === "delivered").length,
    cancelledAssignedOrders: orders.filter((order) => order.status === "cancelled").length,
    latestAssignedOrderUpdatedAt: orders.reduce(
      (latest, order) => Math.max(latest, order.updatedAt),
      0
    ),
  };
}

function buildActiveOrders(
  orders: DriverOrderReferencePayload["order"][]
): DriverWorkspaceAssignedOrder[] {
  return orders
    .filter((order) => ORDER_ACTIVE_STATUSES.has(order.status))
    .slice(0, 5)
    .map((order) => ({
      id: order.id,
      customerName: order.customerName,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      totalNaira: order.totalNaira,
      updatedAt: order.updatedAt,
      payoutAmountNaira: order.driverPayout?.amountNaira ?? null,
    }));
}

async function loadDriverContext(authenticatedUser: AuthenticatedDriver) {
  const db = getFirebaseAdminDb();
  const [userSnapshot, driverSnapshot] = await Promise.all([
    db.collection("users").doc(authenticatedUser.uid).get(),
    db.collection("drivers").doc(authenticatedUser.uid).get(),
  ]);

  const user = buildWorkspaceUser(authenticatedUser, userSnapshot.data());

  if (!driverSnapshot.exists) {
    return {
      user,
      driver: null,
      vendor: null,
    };
  }

  const driver = driverProfileSchema.parse(driverSnapshot.data());
  const vendorSnapshot = await db.collection("vendors").doc(driver.vendorId).get();

  return {
    user,
    driver,
    vendor: buildWorkspaceVendor(vendorSnapshot.data()),
  };
}

export async function getDriverWorkspacePayload(
  authenticatedUser: AuthenticatedDriver
): Promise<DriverWorkspacePayload> {
  const context = await loadDriverContext(authenticatedUser);

  if (!context.driver) {
    return {
      user: context.user,
      driver: null,
      vendor: null,
      assignments: EMPTY_ASSIGNMENT_SUMMARY,
      payouts: EMPTY_PAYOUT_SUMMARY,
      activeOrders: [],
      recentPayoutRequests: [],
      capabilities: DRIVER_WORKSPACE_CAPABILITIES,
    };
  }

  const [orders, payoutSummary] = await Promise.all([
    listDriverAssignedOrders(context.driver.uid, context.driver.vendorId),
    getDriverPayoutSummary(context.driver.uid, context.driver.vendorId),
  ]);

  return {
    user: context.user,
    driver: context.driver,
    vendor: context.vendor,
    assignments: buildAssignmentSummary(orders),
    payouts: {
      availableBalanceNaira: payoutSummary.availableBalanceNaira,
      requestedBalanceNaira: payoutSummary.requestedBalanceNaira,
      lifetimePaidNaira: payoutSummary.lifetimePaidNaira,
    },
    activeOrders: buildActiveOrders(orders),
    recentPayoutRequests: payoutSummary.recentPayoutRequests,
    capabilities: DRIVER_WORKSPACE_CAPABILITIES,
  };
}

export async function getDriverOrderReferencePayload(
  authenticatedUser: AuthenticatedDriver,
  orderId: string
): Promise<DriverOrderReferencePayload | null> {
  const context = await loadDriverContext(authenticatedUser);
  if (!context.driver) {
    return null;
  }

  const order = await getDriverAssignedOrder(
    context.driver.uid,
    context.driver.vendorId,
    orderId
  );
  if (!order) {
    return null;
  }

  return {
    driver: context.driver,
    vendor: context.vendor,
    order,
    capabilities: DRIVER_WORKSPACE_CAPABILITIES,
    mapsUrl: order.deliveryAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          order.deliveryAddress
        )}`
      : undefined,
  };
}
