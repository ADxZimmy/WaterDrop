import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { productSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

const createProductInputSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  priceNaira: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  description: z.string().min(1),
});

export async function GET() {
  try {
    const user = await requireRole(["vendor"]);
    const snapshot = await getFirebaseAdminDb()
      .collection("products")
      .where("vendorId", "==", user.uid)
      .get();

    const products = snapshot.docs.map((doc) => productSchema.parse(doc.data()));
    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load products";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["vendor"]);
    const input = createProductInputSchema.parse(await request.json());
    const now = Date.now();
    const product = productSchema.parse({
      id: randomUUID(),
      vendorId: user.uid,
      name: input.name,
      category: input.category,
      priceNaira: input.priceNaira,
      stock: input.stock,
      description: input.description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    await getFirebaseAdminDb().collection("products").doc(product.id).set(product);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create product";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
