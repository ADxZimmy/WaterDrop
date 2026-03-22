import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { driverCompensationRuleSchema } from "@/lib/domain/schemas";
import {
  getVendorCompensationConfig,
  saveVendorCompensationConfig,
} from "@/lib/driver/compensation";

const saveCommissionConfigSchema = z.object({
  bagsRule: driverCompensationRuleSchema,
  bottledRule: driverCompensationRuleSchema,
  bulkRule: driverCompensationRuleSchema,
  otherRule: driverCompensationRuleSchema.optional(),
  priorityFeeToDriver: z.boolean(),
});

export async function GET() {
  try {
    const user = await requireRole(["vendor"]);
    const config = await getVendorCompensationConfig(user.uid);
    return NextResponse.json({ config }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load commission settings";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireRole(["vendor"]);
    const input = saveCommissionConfigSchema.parse(await request.json());
    const config = await saveVendorCompensationConfig(user.uid, input);
    return NextResponse.json({ config }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save commission settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
