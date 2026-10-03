import type { Metadata } from "next";
import { auth } from "@/auth";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { MediaField } from "@/components/admin/MediaField";
import { deleteAdminUser, saveAdminUser } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Desk accounts" };

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.adminUser.findMany({ orderBy: { name: "asc" } });

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Access</p>
        <h1>Desk accounts</h1>
        <p className="muted">Create and manage staff sign-ins. Passwords must be at least 12 characters.</p>
      </section>

      <ActionForm action={saveAdminUser}>
        <h2>Add desk account</h2>
        <MediaField label="Profile media" />
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Email
          <input type="email" name="email" autoComplete="off" required />
        </label>
        <label>
          Temporary password
          <input type="password" name="password" autoComplete="new-password" minLength={12} required />
        </label>
        <button className="btn btn-primary" type="submit">Create account</button>
      </ActionForm>

      <h2>Existing accounts</h2>
      {users.map((user) => (
        <section className="price-block" key={user.id}>
          <ActionForm action={saveAdminUser}>
            <input type="hidden" name="id" value={user.id} />
            <MediaField initialMediaUrls={user.mediaUrls} label="Profile media" />
            <label>
              Name
              <input name="name" defaultValue={user.name} required />
            </label>
            <label>
              Email
              <input type="email" name="email" defaultValue={user.email} required />
            </label>
            <label>
              New password <span className="muted">Leave blank to keep the existing password.</span>
              <input type="password" name="password" autoComplete="new-password" minLength={12} />
            </label>
            <button className="btn btn-line" type="submit">Save account</button>
          </ActionForm>
          {user.id === session?.user?.id ? (
            <p className="muted">This is your current signed-in account, so it cannot be deleted from this session.</p>
          ) : (
            <ActionForm action={deleteAdminUser}>
              <input type="hidden" name="id" value={user.id} />
              <ConfirmSubmit label="Delete account" message={`Delete desk account ${user.email}?`} />
            </ActionForm>
          )}
        </section>
      ))}
    </main>
  );
}
