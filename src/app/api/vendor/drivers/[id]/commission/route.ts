import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { driverCompensationRuleSchema } from "@/lib/domain/schemas";
import {
  getDriverCommissionOverride,
  getEffectiveDriverCompensationConfig,
  getVendorDriver,
  saveDriverCommissionOverride,
} from "@/lib/driver/compensation";

const saveCommissionConfigSchema = z.object({
  bagsRule: driverCompensationRuleSchema,
  bottledRule: driverCompensationRuleSchema,
  bulkRule: driverCompensationRuleSchema,
  otherRule: driverCompensationRuleSchema.optional(),
  priorityFeeToDriver: z.boolean(),
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

    const [override, effective] = await Promise.all([
      getDriverCommissionOverride(user.uid, id),
      getEffectiveDriverCompensationConfig(user.uid, id),
    ]);

    return NextResponse.json(
      {
        driver,
        override,
        effectiveConfig: effective.config,
        effectiveSource: effective.source,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load driver commission settings";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["vendor"]);
    const { id } = await context.params;
    const driver = await getVendorDriver(user.uid, id);

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const input = saveCommissionConfigSchema.parse(await request.json());
    const config = await saveDriverCommissionOverride(user.uid, id, input);
    return NextResponse.json({ config }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save driver commission settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
