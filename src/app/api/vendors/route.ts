import { NextResponse } from "next/server";
import { productSchema, vendorProfileSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const db = getFirebaseAdminDb();
    const snapshot = await db
      .collection("vendors")
      .where("status", "==", "approved")
      .get();
    const productsSnapshot = await db
      .collection("products")
      .where("isActive", "==", true)
      .get();
    const productsByVendor = new Map<string, ReturnType<typeof productSchema.parse>[]>();

    productsSnapshot.docs.forEach((productDoc) => {
      const product = productSchema.parse(productDoc.data());
      const vendorProducts = productsByVendor.get(product.vendorId) ?? [];
      vendorProducts.push(product);
      productsByVendor.set(product.vendorId, vendorProducts);
    });

    const vendors = snapshot.docs.map((doc) => {
        const vendor = vendorProfileSchema.parse(doc.data());
        const products = productsByVendor.get(vendor.vendorId) ?? [];

        return {
          ...vendor,
          productCount: products.length,
          catalogCategories: [...new Set(products.map((product) => product.category))],
        };
      });

    return NextResponse.json(
      { vendors: vendors.filter((vendor) => vendor.productCount > 0) },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load vendors";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
