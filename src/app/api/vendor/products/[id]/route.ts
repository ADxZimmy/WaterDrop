import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { productSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

const updateProductInputSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    priceNaira: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    description: z.string().trim().min(1).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one product field must be provided.",
  });

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["vendor"]);
    const { id } = await context.params;
    const input = updateProductInputSchema.parse(await request.json());
    const productRef = getFirebaseAdminDb().collection("products").doc(id);
    const snapshot = await productRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existingProduct = productSchema.parse(snapshot.data());
    if (existingProduct.vendorId !== user.uid) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedProduct = productSchema.parse({
      ...existingProduct,
      ...input,
      updatedAt: Date.now(),
    });

    await productRef.set(updatedProduct);
    return NextResponse.json({ product: updatedProduct }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["vendor"]);
    const { id } = await context.params;
    const productRef = getFirebaseAdminDb().collection("products").doc(id);
    const snapshot = await productRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existingProduct = productSchema.parse(snapshot.data());
    if (existingProduct.vendorId !== user.uid) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await productRef.delete();
    return NextResponse.json({ deleted: true, id }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
