import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { cartSchema, orderSchema, paymentMethodSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getOrderPageInfo, getOrderPageParams } from "@/lib/orders/order-pagination";

const createOrderInputSchema = z.object({
  deliveryFeeNaira: z.number().nonnegative(),
  paymentMethod: paymentMethodSchema,
  deliveryAddress: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const user = await requireRole(["customer"]);
    const { cursor, limit } = getOrderPageParams(request.url);
    let query = getFirebaseAdminDb()
      .collection("orders")
      .where("customerUid", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(limit + 1);

    if (cursor) {
      query = query.startAfter(cursor.createdAt);
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map((doc) => orderSchema.parse(doc.data()));
    const page = getOrderPageInfo(orders, limit);

    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load orders";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["customer"]);
    const input = createOrderInputSchema.parse(await request.json());
    const cartDoc = await getFirebaseAdminDb().collection("carts").doc(user.uid).get();

    if (!cartDoc.exists) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const cart = cartSchema.parse(cartDoc.data());
    if (cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const subtotalNaira = cart.items.reduce(
      (sum, item) => sum + item.unitPriceNaira * item.quantity,
      0
    );
    const now = Date.now();
    const order = orderSchema.parse({
      id: randomUUID(),
      customerUid: user.uid,
      vendorId: cart.vendorId,
      vendorName: cart.vendorName,
      items: cart.items,
      subtotalNaira,
      deliveryFeeNaira: input.deliveryFeeNaira,
      totalNaira: subtotalNaira + input.deliveryFeeNaira,
      paymentMethod: input.paymentMethod,
      status: "pending",
      deliveryAddress: input.deliveryAddress,
      createdAt: now,
      updatedAt: now,
    });

    await getFirebaseAdminDb().collection("orders").doc(order.id).set(order);
    await getFirebaseAdminDb().collection("carts").doc(user.uid).delete();

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
