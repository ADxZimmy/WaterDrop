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

    const vendors = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const vendor = vendorProfileSchema.parse(doc.data());
        const productsSnapshot = await db
          .collection("products")
          .where("vendorId", "==", vendor.vendorId)
          .where("isActive", "==", true)
          .get();
        const products = productsSnapshot.docs.map((productDoc) =>
          productSchema.parse(productDoc.data())
        );

        return {
          ...vendor,
          productCount: products.length,
          catalogCategories: [...new Set(products.map((product) => product.category))],
        };
      })
    );

    return NextResponse.json(
      { vendors: vendors.filter((vendor) => vendor.productCount > 0) },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load vendors";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
