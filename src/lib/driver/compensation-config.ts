import { driverCompensationConfigSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

import {
  DRIVER_COMPENSATION_COLLECTION,
  type SaveCommissionConfigInput,
} from "@/lib/driver/compensation-types";
import {
  buildDefaultCompensationConfig,
  getDriverOverrideConfigDocId,
  getNormalizedRule,
  getVendorDefaultConfigDocId,
} from "@/lib/driver/compensation-shared";

export async function getVendorCompensationConfig(vendorId: string) {
  const ref = getFirebaseAdminDb()
    .collection(DRIVER_COMPENSATION_COLLECTION)
    .doc(getVendorDefaultConfigDocId(vendorId));
  const snapshot = await ref.get();

  if (!snapshot.exists) {
    return buildDefaultCompensationConfig(vendorId);
  }

  return driverCompensationConfigSchema.parse(snapshot.data());
}

export async function saveVendorCompensationConfig(
  vendorId: string,
  input: SaveCommissionConfigInput
) {
  const existing = await getVendorCompensationConfig(vendorId);
  const now = Date.now();
  const config = driverCompensationConfigSchema.parse({
    ...existing,
    id: getVendorDefaultConfigDocId(vendorId),
    vendorId,
    scope: "vendor_default",
    bagsRule: getNormalizedRule(input.bagsRule),
    bottledRule: getNormalizedRule(input.bottledRule),
    bulkRule: getNormalizedRule(input.bulkRule),
    otherRule: getNormalizedRule(input.otherRule ?? input.bottledRule),
    priorityFeeToDriver: input.priorityFeeToDriver,
    createdAt: existing.createdAt ?? now,
    updatedAt: now,
  });

  await getFirebaseAdminDb()
    .collection(DRIVER_COMPENSATION_COLLECTION)
    .doc(config.id)
    .set(config);

  return config;
}

export async function getDriverCommissionOverride(vendorId: string, driverUid: string) {
  const snapshot = await getFirebaseAdminDb()
    .collection(DRIVER_COMPENSATION_COLLECTION)
    .doc(getDriverOverrideConfigDocId(vendorId, driverUid))
    .get();

  if (!snapshot.exists) {
    return null;
  }

  return driverCompensationConfigSchema.parse(snapshot.data());
}

export async function getEffectiveDriverCompensationConfig(
  vendorId: string,
  driverUid: string
) {
  const override = await getDriverCommissionOverride(vendorId, driverUid);
  if (override) {
    return {
      config: override,
      source: "driver_override" as const,
    };
  }

  return {
    config: await getVendorCompensationConfig(vendorId),
    source: "vendor_default" as const,
  };
}

export async function saveDriverCommissionOverride(
  vendorId: string,
  driverUid: string,
  input: SaveCommissionConfigInput
) {
  const existing = await getDriverCommissionOverride(vendorId, driverUid);
  const base = existing ?? buildDefaultCompensationConfig(vendorId);
  const now = Date.now();
  const config = driverCompensationConfigSchema.parse({
    ...base,
    id: getDriverOverrideConfigDocId(vendorId, driverUid),
    vendorId,
    scope: "driver_override",
    driverUid,
    bagsRule: getNormalizedRule(input.bagsRule),
    bottledRule: getNormalizedRule(input.bottledRule),
    bulkRule: getNormalizedRule(input.bulkRule),
    otherRule: getNormalizedRule(input.otherRule ?? input.bottledRule),
    priorityFeeToDriver: input.priorityFeeToDriver,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });

  await getFirebaseAdminDb()
    .collection(DRIVER_COMPENSATION_COLLECTION)
    .doc(config.id)
    .set(config);

  return config;
}
