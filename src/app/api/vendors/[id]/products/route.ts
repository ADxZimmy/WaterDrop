import { NextResponse } from "next/server";
import { productSchema, vendorProfileSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const db = getFirebaseAdminDb();
    const vendorSnapshot = await db.collection("vendors").doc(id).get();

    if (!vendorSnapshot.exists) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const vendor = vendorProfileSchema.parse(vendorSnapshot.data());
    if (vendor.status !== "approved") {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const snapshot = await db
      .collection("products")
      .where("vendorId", "==", id)
      .where("isActive", "==", true)
      .get();

    const products = snapshot.docs.map((doc) => productSchema.parse(doc.data()));
    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
