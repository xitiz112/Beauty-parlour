import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { logoutAdmin } from "@/lib/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return <div className="admin-shell admin-shell-guest">{children}</div>;
  }

  return (
    <AdminShell userLabel={session.user.name || session.user.email || "Studio desk"} signOutAction={logoutAdmin}>
      {children}
    </AdminShell>
  );
}
