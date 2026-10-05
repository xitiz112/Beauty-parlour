import type { Metadata } from "next";
import Link from "next/link";
import type { NavLocation } from "@prisma/client";
import { ActionForm } from "@/components/admin/ActionForm";
import { FormActions } from "@/components/admin/AdminList";
import { editorKeys, MasterDetail, mdHref, resolveSelection, type MDGroup } from "@/components/admin/MasterDetail";
import {
  deleteNavLink,
  deleteSocialLink,
  saveNavLink,
  saveSocialLink,
  updateLayoutText,
} from "@/lib/actions";
import { getStudio } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { SOCIAL_PLATFORMS } from "@/lib/site-defaults";

export const metadata: Metadata = { title: "Desk header & footer" };

const BASE = "/admin/navigation";

const LINK_GROUPS: Array<{ location: NavLocation; label: string; hint: string }> = [
  {
    location: "header",
    label: "Header menu",
    hint: "The pill menu at the top of every page and the mobile menu. Use /#section links to scroll to a homepage section.",
  },
  { location: "footer_explore", label: "Footer links", hint: "The link column in the footer." },
  { location: "footer_legal", label: "Legal links", hint: "The small links beside the copyright line." },
];

export default async function AdminNavigationPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const [studio, navLinks, socialLinks] = await Promise.all([
    getStudio(),
    prisma.navLink.findMany({ orderBy: [{ sortOrder: "asc" }, { label: "asc" }] }),
    prisma.socialLink.findMany({ orderBy: [{ sortOrder: "asc" }, { label: "asc" }] }),
  ]);
  const platformLabel = (value: string) => SOCIAL_PLATFORMS.find((item) => item.value === value)?.label ?? value;

  const groups: MDGroup[] = [
    {
      key: "text",
      label: "Text",
      noun: "text",
      canAdd: false,
      items: [{ id: "layout", title: "Header & footer text", subtitle: `${studio.logoSubtitle} · ${studio.headerCtaLabel}` }],
    },
    ...LINK_GROUPS.map((group) => ({
      key: group.location,
      label: group.label,
      noun: "link",
      items: navLinks
        .filter((link) => link.location === group.location)
        .map((link) => ({
          id: link.id,
          title: link.label,
          subtitle: link.href,
          meta: `#${link.sortOrder}`,
          hidden: !link.published,
        })),
    })),
    {
      key: "social",
      label: "Social icons",
      noun: "social icon",
      items: socialLinks.map((social) => ({
        id: social.id,
        title: platformLabel(social.platform),
        subtitle: social.href,
        meta: `#${social.sortOrder}`,
        hidden: !social.published,
      })),
    },
  ];
  const selection = resolveSelection(groups, params);
  const { key, deleteFormId } = editorKeys(selection);
  const groupKey = selection.group.key;
  const createdHref = `${BASE}?group=${groupKey}&edit=`;
  const listHref = mdHref(BASE, { group: groupKey });
  const linkGroup = LINK_GROUPS.find((group) => group.location === groupKey);
  const link = linkGroup ? navLinks.find((entry) => entry.id === selection.item?.id) : undefined;
  const social = groupKey === "social" ? socialLinks.find((entry) => entry.id === selection.item?.id) : undefined;
  const groupSize = selection.group.items.length;

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Site</p>
        <h1>Header & footer</h1>
        <p className="muted">
          Address, phone, WhatsApp and tagline live in <Link href="/admin/settings">Settings</Link>.
        </p>
      </section>

      <MasterDetail basePath={BASE} groups={groups} selection={selection}>
        {groupKey === "text" ? (
          <ActionForm key={key} action={updateLayoutText}>
            <div className="admin-fields">
              <label>
                Logo subtitle
                <input name="logoSubtitle" defaultValue={studio.logoSubtitle} required />
              </label>
              <label>
                Header button label
                <input name="headerCtaLabel" defaultValue={studio.headerCtaLabel} required />
              </label>
              <label>
                Footer contact heading
                <input name="footerVisitTitle" defaultValue={studio.footerVisitTitle} required />
              </label>
              <label>
                Footer links heading
                <input name="footerExploreTitle" defaultValue={studio.footerExploreTitle} required />
              </label>
              <label>
                Footer social heading
                <input name="footerSocialTitle" defaultValue={studio.footerSocialTitle} required />
              </label>
              <label>
                Copyright text
                <input name="copyrightText" defaultValue={studio.copyrightText} required />
              </label>
            </div>
            <p className="admin-note">
              The copyright line reads “© {new Date().getFullYear()} {studio.name}. {studio.copyrightText}”
            </p>
            <label className="inline-check">
              <input type="checkbox" name="showHeaderPhone" defaultChecked={studio.showHeaderPhone} /> Show the phone number
              in the header (large screens)
            </label>
            <FormActions />
          </ActionForm>
        ) : null}

        {linkGroup ? (
          <>
            <p className="admin-note">{linkGroup.hint}</p>
            <ActionForm key={key} action={saveNavLink} createdHref={createdHref}>
              {link ? <input type="hidden" name="id" value={link.id} /> : null}
              <input type="hidden" name="location" value={linkGroup.location} />
              <div className="admin-fields">
                <label>
                  Label
                  <input name="label" defaultValue={link?.label} maxLength={60} required />
                </label>
                <label>
                  Order
                  <input type="number" name="sortOrder" defaultValue={link?.sortOrder ?? groupSize + 1} />
                </label>
                <label className="is-wide">
                  Link
                  <input name="href" defaultValue={link?.href} placeholder="/#services, /privacy or https://…" required />
                </label>
              </div>
              <div className="admin-link-options">
                <label className="inline-check">
                  <input type="checkbox" name="published" defaultChecked={link?.published ?? true} /> Visible
                </label>
                <label className="inline-check">
                  <input type="checkbox" name="opensBooking" defaultChecked={link?.opensBooking} /> Opens booking popup
                </label>
                <label className="inline-check">
                  <input type="checkbox" name="newTab" defaultChecked={link?.newTab} /> Open in new tab
                </label>
              </div>
              <FormActions
                saveLabel={link ? "Save changes" : "Add link"}
                deleteFormId={link ? deleteFormId : undefined}
                deleteMessage={`Delete the “${link?.label ?? ""}” link?`}
              />
            </ActionForm>
            {link ? (
              <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteNavLink} className="admin-delete-form" successHref={listHref}>
                <input type="hidden" name="id" value={link.id} />
              </ActionForm>
            ) : null}
          </>
        ) : null}

        {groupKey === "social" ? (
          <>
            <ActionForm key={key} action={saveSocialLink} createdHref={createdHref}>
              {social ? <input type="hidden" name="id" value={social.id} /> : null}
              <div className="admin-fields">
                <label>
                  Platform
                  <select name="platform" defaultValue={social?.platform ?? "instagram"} required>
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Order
                  <input type="number" name="sortOrder" defaultValue={social?.sortOrder ?? groupSize + 1} />
                </label>
                <label className="is-wide">
                  Profile link
                  <input name="href" type="url" defaultValue={social?.href} placeholder="https://…" required />
                </label>
                <label className="is-wide">
                  Screen-reader label <span className="muted">(optional)</span>
                  <input name="label" defaultValue={social?.label} placeholder="Defaults to the platform name" />
                </label>
              </div>
              <label className="inline-check">
                <input type="checkbox" name="published" defaultChecked={social?.published ?? true} /> Visible in the footer
              </label>
              <FormActions
                saveLabel={social ? "Save changes" : "Add icon"}
                deleteFormId={social ? deleteFormId : undefined}
                deleteMessage={`Delete the ${social?.label ?? ""} icon?`}
              />
            </ActionForm>
            {social ? (
              <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteSocialLink} className="admin-delete-form" successHref={listHref}>
                <input type="hidden" name="id" value={social.id} />
              </ActionForm>
            ) : null}
          </>
        ) : null}
      </MasterDetail>
    </main>
  );
}
