import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/server";
import { orderSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["customer"]);
    const { id } = await context.params;
    const snapshot = await getFirebaseAdminDb().collection("orders").doc(id).get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderSchema.parse(snapshot.data());
    if (order.customerUid !== user.uid) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load order";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
