import {
  driverCompensationConfigSchema,
  orderDriverPayoutSchema,
  userProfileSchema,
  type DriverCompensationCategory,
  type DriverCompensationConfig,
  type DriverCompensationRule,
  type Order,
  type OrderDriverPayout,
  type UserProfile,
} from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

import type { AuthenticatedActor } from "@/lib/driver/compensation-types";

export function getDriverDisplayName(
  user: Partial<UserProfile> | null,
  fallbackUid: string,
  actor?: Pick<AuthenticatedActor, "email" | "firstName" | "lastName">
) {
  const firstName = typeof user?.firstName === "string" ? user.firstName.trim() : "";
  const lastName = typeof user?.lastName === "string" ? user.lastName.trim() : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  const actorFullName = [actor?.firstName, actor?.lastName]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ")
    .trim();

  if (actorFullName) {
    return actorFullName;
  }

  if (typeof user?.email === "string" && user.email.trim().length > 0) {
    return user.email;
  }

  if (typeof actor?.email === "string" && actor.email.trim().length > 0) {
    return actor.email;
  }

  return `Driver ${fallbackUid.slice(0, 6)}`;
}

function getDefaultRule(): DriverCompensationRule {
  return {
    mode: "percentage",
    value: 15,
  };
}

export function getNormalizedRule(rule: DriverCompensationRule | undefined): DriverCompensationRule {
  return {
    mode: rule?.mode ?? "percentage",
    value: typeof rule?.value === "number" ? rule.value : 15,
  };
}

export function getVendorDefaultConfigDocId(vendorId: string) {
  return `${vendorId}__default`;
}

export function getDriverOverrideConfigDocId(vendorId: string, driverUid: string) {
  return `${vendorId}__${driverUid}`;
}

export function buildDefaultCompensationConfig(vendorId: string): DriverCompensationConfig {
  const now = Date.now();

  return driverCompensationConfigSchema.parse({
    id: getVendorDefaultConfigDocId(vendorId),
    vendorId,
    scope: "vendor_default",
    bagsRule: getDefaultRule(),
    bottledRule: getDefaultRule(),
    bulkRule: getDefaultRule(),
    otherRule: getDefaultRule(),
    priorityFeeToDriver: false,
    createdAt: now,
    updatedAt: now,
  });
}

export function normalizeCompensationCategory(
  category: string | undefined
): DriverCompensationCategory {
  const normalized = category?.trim().toLowerCase() ?? "";

  if (normalized.includes("bag") || normalized.includes("sachet")) {
    return "bags";
  }

  if (normalized.includes("bottle")) {
    return "bottled";
  }

  if (normalized.includes("bulk")) {
    return "bulk";
  }

  return "other";
}

function getRuleForCategory(
  config: DriverCompensationConfig,
  category: DriverCompensationCategory
) {
  if (category === "bags") {
    return config.bagsRule;
  }

  if (category === "bottled") {
    return config.bottledRule;
  }

  if (category === "bulk") {
    return config.bulkRule;
  }

  return config.otherRule;
}

export function calculateDriverPayoutForOrder(
  order: Order,
  config: DriverCompensationConfig,
  source: OrderDriverPayout["source"]
): OrderDriverPayout {
  const itemTotal = order.items.reduce((total, item) => {
    const lineSubtotal = item.unitPriceNaira * item.quantity;
    const rule = getRuleForCategory(config, normalizeCompensationCategory(item.category));

    if (rule.mode === "percentage") {
      return total + (lineSubtotal * rule.value) / 100;
    }

    return total + rule.value * item.quantity;
  }, 0);

  const amountNaira = Math.round(
    itemTotal + (config.priorityFeeToDriver ? order.deliveryFeeNaira : 0)
  );

  return orderDriverPayoutSchema.parse({
    amountNaira,
    status: "accrued",
    source,
    calculatedAt: Date.now(),
  });
}

export async function loadUserProfiles(uids: string[]) {
  const uniqueUids = [...new Set(uids.filter(Boolean))];
  const db = getFirebaseAdminDb();
  const entries = await Promise.all(
    uniqueUids.map(async (uid) => {
      const snapshot = await db.collection("users").doc(uid).get();
      const parsed = userProfileSchema.safeParse(snapshot.data());
      return [uid, parsed.success ? parsed.data : null] as const;
    })
  );

  return new Map(entries);
}
