import { redirect } from "next/navigation";
import { VendorShell } from "@/components/layouts/vendor-shell";
import { buildRoleLoginPath } from "@/lib/auth/routing";
import { requireRole } from "@/lib/auth/server";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  try {
    const user = await requireRole(["vendor"]);
    return <VendorShell user={user}>{children}</VendorShell>;
  } catch {
    redirect(
      buildRoleLoginPath({
        role: "vendor",
        redirect: "/dashboard/vendor",
      })
    );
  }
}
