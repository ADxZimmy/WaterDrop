import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { buildRoleLoginPath, getRoleSessionPath } from "@/lib/auth/routing";

export default async function DashboardSessionPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(buildRoleLoginPath({ redirect: "/dashboard/session" }));
  }

  redirect(getRoleSessionPath(user.role));
}
