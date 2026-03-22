export type AdminSystemPendingApplication = {
  vendorId: string;
  businessName: string;
  businessType?: string;
  ownerName: string;
  submittedAt: number | null;
};

export type AdminSystemSnapshot = {
  summary: {
    grossRevenueNaira: number;
    totalVendors: number;
    approvedVendors: number;
    pendingVendorApplications: number;
    totalCustomers: number;
    totalDrivers: number;
    openOrders: number;
  };
  environment: {
    firebaseClientConfigured: boolean;
    firebaseAdminConfigured: boolean;
  };
  policies: {
    publicVendorRegistration: boolean;
    manualVendorCreation: boolean;
    vendorOnboarding: "self_service_review";
    paymentMethods: Array<"cod" | "manual_transfer">;
    vendorDocumentStorage: boolean;
    driverTelemetry: boolean;
  };
  pendingApplications: AdminSystemPendingApplication[];
};
