import { auth } from "@/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { logoutAdmin } from "@/lib/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return <div className="admin-shell">{children}</div>;
  }

  return (
    <div className="admin-shell">
      <header className="admin-bar">
        <strong>Liora desk</strong>
        <AdminNav />
        <form action={logoutAdmin}>
          <button className="btn btn-ghost" type="submit">
            Sign out
          </button>
        </form>
      </header>
      <div className="admin-main">{children}</div>
    </div>
  );
}
