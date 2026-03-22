import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layouts/admin-shell";
import { buildAdminLoginPath } from "@/lib/auth/routing";
import { requireRole } from "@/lib/auth/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    const user = await requireRole(["admin"]);
    return <AdminShell user={user}>{children}</AdminShell>;
  } catch {
    redirect(buildAdminLoginPath({ redirect: "/admin" }));
  }
}
