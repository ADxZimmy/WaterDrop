import { redirect } from "next/navigation";
import { CustomerShell } from "@/components/layouts/customer-shell";
import { buildRoleLoginPath } from "@/lib/auth/routing";
import { requireRole } from "@/lib/auth/server";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  try {
    const user = await requireRole(["customer"]);
    return <CustomerShell user={user}>{children}</CustomerShell>;
  } catch {
    redirect(
      buildRoleLoginPath({
        role: "customer",
        redirect: "/dashboard/customer",
      })
    );
  }
}
