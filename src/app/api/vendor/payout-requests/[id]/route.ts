import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { reviewVendorPayoutRequest } from "@/lib/driver/compensation";

const reviewPayoutRequestSchema = z.object({
  action: z.enum(["paid", "rejected"]),
  reviewNote: z.string().trim().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["vendor"]);
    const { id } = await context.params;
    const input = reviewPayoutRequestSchema.parse(await request.json());
    const payoutRequest = await reviewVendorPayoutRequest(
      user.uid,
      user.uid,
      id,
      input.action,
      input.reviewNote
    );

    return NextResponse.json({ payoutRequest }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to review payout request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
