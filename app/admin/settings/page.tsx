import type { Metadata } from "next";
import { auth } from "@/auth";
import { ActionForm } from "@/components/admin/ActionForm";
import { FormActions } from "@/components/admin/AdminList";
import { editorKeys, MasterDetail, resolveSelection, type MDGroup } from "@/components/admin/MasterDetail";
import { MediaField } from "@/components/admin/MediaField";
import { updateDeskAccount, updateStudioSetting } from "@/lib/actions";
import { getStudio } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Desk settings" };

type Studio = Awaited<ReturnType<typeof getStudio>>;
type StudioTextKey = { [K in keyof Studio]: Studio[K] extends string ? K : never }[keyof Studio];

type StudioField = { key: StudioTextKey; label: string; multiline?: boolean; wide?: boolean };

// Settings are one record; the left column picks which part of it to edit.
const SETTING_GROUPS: Array<{ id: string; title: string; subtitle: string; fields: StudioField[]; images?: boolean }> = [
  {
    id: "studio",
    title: "Studio & owner",
    subtitle: "Name, tagline, owner",
    fields: [
      { key: "name", label: "Studio name" },
      { key: "shortName", label: "Short name (logo)" },
      { key: "tagline", label: "Tagline", wide: true },
      { key: "ownerName", label: "Owner name" },
      { key: "ownerRole", label: "Owner role" },
    ],
  },
  {
    id: "contact",
    title: "Location & contact",
    subtitle: "Address, phone, WhatsApp, email, map",
    fields: [
      { key: "address", label: "Address", wide: true },
      { key: "landmark", label: "Landmark", wide: true },
      { key: "neighborhood", label: "Neighborhood" },
      { key: "city", label: "City" },
      { key: "phone", label: "Phone (as shown)" },
      { key: "phoneHref", label: "Phone link (tel:…)" },
      { key: "whatsapp", label: "WhatsApp (as shown)" },
      { key: "whatsappHref", label: "WhatsApp link (https://wa.me/…)" },
      { key: "email", label: "Email" },
      { key: "mapsEmbed", label: "Maps embed URL" },
    ],
  },
  {
    id: "social",
    title: "Instagram & reviews",
    subtitle: "Handle, links, Google rating",
    fields: [
      { key: "instagram", label: "Instagram handle" },
      { key: "instagramHref", label: "Instagram link" },
      { key: "facebookHref", label: "Facebook link", wide: true },
      { key: "googleScore", label: "Google score" },
      { key: "googleCount", label: "Google review count" },
    ],
  },
  {
    id: "about",
    title: "About & images",
    subtitle: "About copy, studio photos",
    images: true,
    fields: [{ key: "aboutWords", label: "About copy (first paragraph)", multiline: true, wide: true }],
  },
  {
    id: "notes",
    title: "Visit notes",
    subtitle: "Parking, walk-ins, confirmation",
    fields: [
      { key: "parking", label: "Parking note", multiline: true, wide: true },
      { key: "walkIns", label: "Walk-in note", multiline: true, wide: true },
      { key: "confirmNote", label: "Confirmation note", multiline: true, wide: true },
    ],
  },
];

const BASE = "/admin/settings";

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const session = await auth();
  const [studio, desk] = await Promise.all([
    getStudio(),
    session?.user?.id ? prisma.adminUser.findUnique({ where: { id: session.user.id } }) : Promise.resolve(null),
  ]);

  const groups: MDGroup[] = [
    {
      key: "settings",
      label: "Settings",
      noun: "setting",
      canAdd: false,
      items: [
        ...SETTING_GROUPS.map((group) => ({ id: group.id, title: group.title, subtitle: group.subtitle })),
        { id: "desk", title: "Your desk login", subtitle: desk?.email ?? "Sign in again to edit" },
      ],
    },
  ];
  const selection = resolveSelection(groups, params);
  const { key } = editorKeys(selection);
  const group = SETTING_GROUPS.find((entry) => entry.id === selection.item?.id);
  const shownKeys = new Set(group?.fields.map((field) => field.key));
  const allFields = SETTING_GROUPS.flatMap((entry) => entry.fields);

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Studio</p>
        <h1>Settings</h1>
      </section>

      <MasterDetail basePath={BASE} groups={groups} selection={selection}>
        {group ? (
          // The action saves every studio field at once, so fields from other parts ride along as hidden inputs.
          <ActionForm key={key} action={updateStudioSetting}>
            <div className="admin-fields">
              {group.fields.map((field) => (
                <label key={field.key} className={field.wide ? "is-wide" : undefined}>
                  {field.label}
                  {field.multiline ? (
                    <textarea name={field.key} defaultValue={studio[field.key]} rows={3} required />
                  ) : (
                    <input name={field.key} defaultValue={studio[field.key]} required />
                  )}
                </label>
              ))}
            </div>
            {allFields
              .filter((field) => !shownKeys.has(field.key))
              .map((field) => (
                <input key={field.key} type="hidden" name={field.key} value={studio[field.key]} />
              ))}
            {group.images ? (
              <MediaField
                label="Studio images"
                initialMediaUrls={studio.mediaUrls}
                primaryFields={[
                  { name: "aboutImage", label: "About image", initialValue: studio.aboutImage, required: true },
                  {
                    name: "heroImage",
                    label: "Fallback hero image (used when Homepage has no slides)",
                    initialValue: studio.heroImage,
                    required: true,
                  },
                ]}
              />
            ) : (
              <>
                <input type="hidden" name="aboutImage" value={studio.aboutImage} />
                <input type="hidden" name="heroImage" value={studio.heroImage} />
                <input type="hidden" name="mediaUrls" value={JSON.stringify(studio.mediaUrls)} />
              </>
            )}
            <FormActions />
          </ActionForm>
        ) : null}

        {selection.item?.id === "desk" ? (
          desk ? (
            <ActionForm key={key} action={updateDeskAccount}>
              <p className="admin-note">Only your signed-in account can be changed here. Other accounts are under Desk users.</p>
              <div className="admin-fields">
                <label>
                  Name
                  <input name="name" defaultValue={desk.name} required />
                </label>
                <label>
                  Email
                  <input type="email" name="email" defaultValue={desk.email} required />
                </label>
                <label className="is-wide">
                  Current password <span className="muted">(needed to change the password)</span>
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
              </div>
              <MediaField initialMediaUrls={desk.mediaUrls} label="Profile media" />
              <FormActions saveLabel="Save desk account" />
            </ActionForm>
          ) : (
            <p className="admin-note">Sign in again to edit your desk login.</p>
          )
        ) : null}
      </MasterDetail>
    </main>
  );
}
