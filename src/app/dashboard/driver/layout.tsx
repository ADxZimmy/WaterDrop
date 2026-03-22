import { redirect } from "next/navigation";
import { DriverShell } from "@/components/layouts/driver-shell";
import { buildRoleLoginPath } from "@/lib/auth/routing";
import { requireRole } from "@/lib/auth/server";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  try {
    const user = await requireRole(["driver"]);
    return <DriverShell user={user}>{children}</DriverShell>;
  } catch {
    redirect(
      buildRoleLoginPath({
        role: "driver",
        redirect: "/dashboard/driver",
      })
    );
  }
}
