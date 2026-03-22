import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/server";
import { vendorProfileSchema } from "@/lib/domain/schemas";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";
import { getAdminVendorReviewRecord } from "@/lib/admin/vendor-review";

const updateVendorStatusSchema = z
  .object({
    status: z.enum(["pending", "approved", "rejected"]),
    reviewNotes: z.string().trim().max(500).optional(),
  })
  .superRefine((input, context) => {
    if (input.status === "rejected" && (!input.reviewNotes || input.reviewNotes.trim().length === 0)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Review notes are required when rejecting a vendor.",
        path: ["reviewNotes"],
      });
    }
  });

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);
    const { id } = await context.params;
    const vendor = await getAdminVendorReviewRecord(id);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ vendor }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load vendor";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(["admin"]);
    const { id } = await context.params;
    const input = updateVendorStatusSchema.parse(await request.json());
    const vendorRef = getFirebaseAdminDb().collection("vendors").doc(id);
    const snapshot = await vendorRef.get();

    if (!snapshot.exists) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const existingVendor = vendorProfileSchema.parse(snapshot.data());
    const now = Date.now();
    const nextReviewNotes = input.reviewNotes?.trim() || undefined;
    const base = {
      ...existingVendor,
      status: input.status,
      updatedAt: now,
      submittedAt:
        typeof existingVendor.submittedAt === "number"
          ? existingVendor.submittedAt
          : existingVendor.createdAt,
    };
    const updatedVendor = vendorProfileSchema.parse(
      input.status === "pending"
        ? (() => {
            const pendingVendor = { ...base } as Record<string, unknown>;
            delete pendingVendor.reviewedAt;
            delete pendingVendor.reviewedBy;
            delete pendingVendor.reviewNotes;
            return pendingVendor;
          })()
        : {
            ...base,
            reviewedAt: now,
            reviewedBy: admin.uid,
            ...(nextReviewNotes != null && { reviewNotes: nextReviewNotes }),
          }
    );

    const toWrite = Object.fromEntries(
      Object.entries(updatedVendor).filter(([, v]) => v !== undefined)
    );
    await vendorRef.set(toWrite);

    const vendor = await getAdminVendorReviewRecord(id);
    return NextResponse.json({ vendor }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update vendor";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
