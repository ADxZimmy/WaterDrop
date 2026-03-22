import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import {
  confirmDriverArrival,
  confirmDriverDelivery,
  reportDriverDeliveryFailedAttempt,
} from "@/lib/driver/compensation";
import { getDriverOrderReferencePayload } from "@/lib/driver/workspace";

const updateDriverOrderSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("confirm_arrival"),
  }),
  z.object({
    action: z.literal("confirm_delivery"),
    recipientName: z.string().trim().min(1).max(120),
    note: z.string().trim().max(280).optional(),
  }),
  z.object({
    action: z.literal("report_failed_attempt"),
    note: z.string().trim().min(1).max(280),
  }),
]);

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["driver"]);
    const { id } = await context.params;
    const reference = await getDriverOrderReferencePayload(user, id);

    if (!reference) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ reference }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load driver order reference";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["driver"]);
    const { id } = await context.params;
    const input = updateDriverOrderSchema.parse(await request.json());

    if (input.action === "confirm_arrival") {
      await confirmDriverArrival(id, user.uid);
    } else if (input.action === "confirm_delivery") {
      await confirmDriverDelivery(id, user.uid, input.recipientName, input.note);
    } else {
      await reportDriverDeliveryFailedAttempt(id, user.uid, input.note);
    }

    const reference = await getDriverOrderReferencePayload(user, id);
    if (!reference) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ reference }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update driver order reference";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
