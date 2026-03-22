import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import {
  createDriverPayoutRequest,
  listDriverPayoutRequests,
} from "@/lib/driver/compensation";

const createPayoutRequestSchema = z.object({
  destinationLabel: z.string().trim().min(1),
});

export async function GET() {
  try {
    const user = await requireRole(["driver"]);
    const requests = await listDriverPayoutRequests(user.uid);
    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load payout requests";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["driver"]);
    const input = createPayoutRequestSchema.parse(await request.json());
    const payoutRequest = await createDriverPayoutRequest(user, input.destinationLabel);
    return NextResponse.json({ payoutRequest }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create payout request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
