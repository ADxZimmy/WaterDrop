import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { cartSchema, orderItemSchema, productSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

const addCartItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

const updateCartItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().nonnegative(),
});

const removeCartItemInputSchema = z.object({
  productId: z.string().min(1),
});

export async function GET() {
  try {
    const user = await requireRole(["customer"]);
    const doc = await getFirebaseAdminDb().collection("carts").doc(user.uid).get();

    if (!doc.exists) {
      return NextResponse.json({ cart: null }, { status: 200 });
    }

    const cart = cartSchema.parse(doc.data());
    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load cart";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["customer"]);
    const input = addCartItemInputSchema.parse(await request.json());
    const productDoc = await getFirebaseAdminDb().collection("products").doc(input.productId).get();

    if (!productDoc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productSchema.parse(productDoc.data());
    const vendorDoc = await getFirebaseAdminDb().collection("vendors").doc(product.vendorId).get();
    const vendorName = (vendorDoc.data()?.businessName as string | undefined) ?? "Water Vendor";
    const cartRef = getFirebaseAdminDb().collection("carts").doc(user.uid);
    const existingDoc = await cartRef.get();
    const existing = existingDoc.exists ? cartSchema.parse(existingDoc.data()) : null;

    if (existing && existing.vendorId !== product.vendorId && existing.items.length > 0) {
      return NextResponse.json(
        { error: "Cart currently supports one vendor at a time. Clear the cart before adding from another vendor." },
        { status: 409 }
      );
    }

    const nextItems = existing?.items ?? [];
    const existingIndex = nextItems.findIndex((item) => item.productId === product.id);
    const updatedItems =
      existingIndex >= 0
        ? nextItems.map((item, index) =>
            index === existingIndex
              ? orderItemSchema.parse({
                  ...item,
                  quantity: item.quantity + input.quantity,
                })
              : item
          )
        : [
            ...nextItems,
            orderItemSchema.parse({
              productId: product.id,
              name: product.name,
              category: product.category,
              quantity: input.quantity,
              unitPriceNaira: product.priceNaira,
            }),
          ];

    const cart = cartSchema.parse({
      customerUid: user.uid,
      vendorId: product.vendorId,
      vendorName,
      items: updatedItems,
      updatedAt: Date.now(),
    });

    await cartRef.set(cart);
    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add item to cart";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireRole(["customer"]);
    const input = updateCartItemInputSchema.parse(await request.json());
    const cartRef = getFirebaseAdminDb().collection("carts").doc(user.uid);
    const existingDoc = await cartRef.get();

    if (!existingDoc.exists) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const existing = cartSchema.parse(existingDoc.data());
    const items =
      input.quantity === 0
        ? existing.items.filter((item) => item.productId !== input.productId)
        : existing.items.map((item) =>
            item.productId === input.productId
              ? orderItemSchema.parse({ ...item, quantity: input.quantity })
              : item
          );

    if (items.length === 0) {
      await cartRef.delete();
      return NextResponse.json({ cart: null }, { status: 200 });
    }

    const cart = cartSchema.parse({
      ...existing,
      items,
      updatedAt: Date.now(),
    });

    await cartRef.set(cart);
    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update cart";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireRole(["customer"]);
    const body = await request.json().catch(() => null);

    if (!body) {
      await getFirebaseAdminDb().collection("carts").doc(user.uid).delete();
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const input = removeCartItemInputSchema.parse(body);
    const cartRef = getFirebaseAdminDb().collection("carts").doc(user.uid);
    const existingDoc = await cartRef.get();

    if (!existingDoc.exists) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const existing = cartSchema.parse(existingDoc.data());
    const items = existing.items.filter((item) => item.productId !== input.productId);

    if (items.length === 0) {
      await cartRef.delete();
      return NextResponse.json({ cart: null }, { status: 200 });
    }

    const cart = cartSchema.parse({
      ...existing,
      items,
      updatedAt: Date.now(),
    });

    await cartRef.set(cart);
    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to remove cart item";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
