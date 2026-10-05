import type { Metadata } from "next";
import { auth } from "@/auth";
import { ActionForm } from "@/components/admin/ActionForm";
import { FormActions } from "@/components/admin/AdminList";
import { editorKeys, MasterDetail, resolveSelection, type MDGroup } from "@/components/admin/MasterDetail";
import { MediaField } from "@/components/admin/MediaField";
import { deleteAdminUser, saveAdminUser } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Desk accounts" };

const BASE = "/admin/users";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const [session, users] = await Promise.all([auth(), prisma.adminUser.findMany({ orderBy: { name: "asc" } })]);
  const currentId = session?.user?.id;

  const groups: MDGroup[] = [
    {
      key: "accounts",
      label: "Accounts",
      noun: "desk account",
      items: users.map((user) => ({
        id: user.id,
        title: user.name,
        subtitle: user.email,
        meta: user.id === currentId ? "You" : undefined,
      })),
    },
  ];
  const selection = resolveSelection(groups, params);
  const user = users.find((entry) => entry.id === selection.item?.id);
  const isSelf = user?.id === currentId;
  const { key, deleteFormId } = editorKeys(selection);

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Access</p>
        <h1>Desk accounts</h1>
        <p className="muted">Create and manage staff sign-ins. Passwords must be at least 12 characters.</p>
      </section>
      <MasterDetail basePath={BASE} groups={groups} selection={selection}>
        <ActionForm key={key} action={saveAdminUser} createdHref={`${BASE}?edit=`}>
          {user ? <input type="hidden" name="id" value={user.id} /> : null}
          <div className="admin-fields">
            <label>
              Name
              <input name="name" defaultValue={user?.name} required />
            </label>
            <label>
              Email
              <input type="email" name="email" defaultValue={user?.email} autoComplete="off" required />
            </label>
            <label className="is-wide">
              {user ? "New password" : "Temporary password"}
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                minLength={12}
                required={!user}
                placeholder={user ? "Leave blank to keep the current password" : "At least 12 characters"}
              />
            </label>
          </div>
          <MediaField initialMediaUrls={user?.mediaUrls} label="Profile media" />
          {isSelf ? (
            <p className="admin-note">This is your signed-in account, so it can’t be deleted from this session.</p>
          ) : null}
          <FormActions
            saveLabel={user ? "Save account" : "Create account"}
            deleteFormId={user && !isSelf ? deleteFormId : undefined}
            deleteMessage={`Delete desk account ${user?.email ?? ""}?`}
          />
        </ActionForm>
        {user && !isSelf ? (
          <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteAdminUser} className="admin-delete-form" successHref={BASE}>
            <input type="hidden" name="id" value={user.id} />
          </ActionForm>
        ) : null}
      </MasterDetail>
    </main>
  );
}
