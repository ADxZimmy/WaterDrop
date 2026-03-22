import { redirect } from "next/navigation";
import { buildRoleLoginPath } from "@/lib/auth/routing";
import { requireRole } from "@/lib/auth/server";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireRole(["customer"]);
    return children;
  } catch {
    redirect(
      buildRoleLoginPath({
        role: "customer",
        redirect: "/dashboard/customer",
      })
    );
  }
}
