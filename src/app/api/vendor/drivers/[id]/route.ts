import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import {
  getDriverPayoutSummary,
  getEffectiveDriverCompensationConfig,
  getVendorDriver,
  updateVendorDriverStatus,
} from "@/lib/driver/compensation";

const vendorDriverStatusMutationSchema = z.object({
  status: z.enum(["pending", "active", "inactive"]),
});

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["vendor"]);
    const { id } = await context.params;
    const driver = await getVendorDriver(user.uid, id);

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const [payoutSummary, effectiveCompensation] = await Promise.all([
      getDriverPayoutSummary(id, user.uid),
      getEffectiveDriverCompensationConfig(user.uid, id),
    ]);

    return NextResponse.json(
      {
        driver,
        payoutSummary,
        commissionConfig: effectiveCompensation.config,
        commissionSource: effectiveCompensation.source,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load driver profile";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["vendor"]);
    const { id } = await context.params;
    const input = vendorDriverStatusMutationSchema.parse(await request.json());

    const updatedDriver = await updateVendorDriverStatus(user.uid, id, input.status);
    const driver = await getVendorDriver(user.uid, updatedDriver.uid);

    return NextResponse.json({ driver }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update driver status";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
