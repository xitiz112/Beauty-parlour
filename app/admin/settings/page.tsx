import type { Metadata } from "next";
import { auth } from "@/auth";
import { ActionForm } from "@/components/admin/ActionForm";
import { updateDeskAccount, updateStudioSetting } from "@/lib/actions";
import { getStudio } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Desk settings" };

const studioFields: Array<{ key: keyof Awaited<ReturnType<typeof getStudio>>; label: string; multiline?: boolean }> = [
  { key: "name", label: "Studio name" },
  { key: "shortName", label: "Short name" },
  { key: "tagline", label: "Tagline" },
  { key: "city", label: "City" },
  { key: "neighborhood", label: "Neighborhood" },
  { key: "address", label: "Address" },
  { key: "landmark", label: "Landmark" },
  { key: "phone", label: "Phone" },
  { key: "phoneHref", label: "Phone link" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "whatsappHref", label: "WhatsApp link" },
  { key: "email", label: "Email" },
  { key: "instagram", label: "Instagram handle" },
  { key: "instagramHref", label: "Instagram link" },
  { key: "facebookHref", label: "Facebook link" },
  { key: "mapsEmbed", label: "Maps embed URL" },
  { key: "parking", label: "Parking note", multiline: true },
  { key: "walkIns", label: "Walk-in note", multiline: true },
  { key: "confirmNote", label: "Confirm note", multiline: true },
  { key: "aboutWords", label: "About copy", multiline: true },
  { key: "aboutImage", label: "About image URL" },
  { key: "heroImage", label: "Hero image URL" },
  { key: "googleScore", label: "Google score" },
  { key: "googleCount", label: "Google count" },
  { key: "ownerName", label: "Owner name" },
  { key: "ownerRole", label: "Owner role" },
];

export default async function AdminSettingsPage() {
  const session = await auth();
  const [studio, desk] = await Promise.all([
    getStudio(),
    session?.user?.id ? prisma.adminUser.findUnique({ where: { id: session.user.id } }) : Promise.resolve(null),
  ]);

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Studio</p>
        <h1>Settings</h1>
      </section>

      <ActionForm action={updateStudioSetting}>
        <h2>Studio details</h2>
        {studioFields.map((field) => (
          <label key={field.key}>
            {field.label}
            {field.multiline ? (
              <textarea name={field.key} defaultValue={studio[field.key]} required />
            ) : (
              <input name={field.key} defaultValue={studio[field.key]} required />
            )}
          </label>
        ))}
        <button className="btn btn-primary" type="submit">
          Save studio
        </button>
      </ActionForm>

      {desk ? (
        <ActionForm action={updateDeskAccount}>
          <h2>Desk login</h2>
          <p className="muted">Only your signed-in account can be changed here.</p>
          <label>
            Name
            <input name="name" defaultValue={desk.name} required />
          </label>
          <label>
            Email
            <input type="email" name="email" defaultValue={desk.email} required />
          </label>
          <label>
            Current password
            <input type="password" name="currentPassword" autoComplete="current-password" />
          </label>
          <label>
            New password
            <input type="password" name="newPassword" autoComplete="new-password" />
          </label>
          <label>
            Confirm new password
            <input type="password" name="confirmPassword" autoComplete="new-password" />
          </label>
          <button className="btn btn-primary" type="submit">
            Save desk account
          </button>
        </ActionForm>
      ) : (
        <p className="muted">Sign in again to edit the desk password.</p>
      )}
    </main>
  );
}
