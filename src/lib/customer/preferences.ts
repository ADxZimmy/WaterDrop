import type { CustomerAddress } from "@/lib/domain/schemas";

export function formatCustomerAddress(address: CustomerAddress) {
  return [
    address.street.trim(),
    address.city.trim(),
    address.state.trim(),
    address.postalCode.trim(),
    address.country.trim(),
  ]
    .filter(Boolean)
    .join(", ");
}

export function normalizeCustomerAddresses(addresses: CustomerAddress[]) {
  if (addresses.length === 0) {
    return [];
  }

  const sanitizedAddresses = addresses.map((address) => ({
    ...address,
    isDefault: Boolean(address.isDefault),
  }));

  const defaultIndex = sanitizedAddresses.findIndex((address) => address.isDefault);
  const resolvedDefaultIndex = defaultIndex >= 0 ? defaultIndex : 0;

  return sanitizedAddresses.map((address, index) => ({
    ...address,
    isDefault: index === resolvedDefaultIndex,
  }));
}

export function getDefaultCustomerAddress(addresses: CustomerAddress[]) {
  return (
    normalizeCustomerAddresses(addresses).find((address) => address.isDefault) ?? null
  );
}
