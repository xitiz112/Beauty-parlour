import type { Metadata } from "next";
import Link from "next/link";
import type { NavLink, NavLocation, SocialLink } from "@prisma/client";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
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

const LINK_GROUPS: Array<{ location: NavLocation; title: string; hint: string }> = [
  {
    location: "header",
    title: "Header menu",
    hint: "The pill menu at the top of every page, and the mobile menu. Use /#section links to scroll to a homepage section.",
  },
  { location: "footer_explore", title: "Footer links", hint: "The link column in the footer." },
  { location: "footer_legal", title: "Footer legal links", hint: "The small links beside the copyright line." },
];

function NavLinkFields({ link, location, nextSort }: { link?: NavLink; location: NavLocation; nextSort: number }) {
  return (
    <>
      {link ? <input type="hidden" name="id" value={link.id} /> : null}
      <input type="hidden" name="location" value={location} />
      <div className="admin-link-grid">
        <label>
          Label
          <input name="label" defaultValue={link?.label} maxLength={60} required />
        </label>
        <label>
          Link
          <input name="href" defaultValue={link?.href} placeholder="/#services or https://…" required />
        </label>
        <label className="admin-link-sort">
          Order
          <input type="number" name="sortOrder" defaultValue={link?.sortOrder ?? nextSort} />
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
    </>
  );
}

function SocialLinkFields({ social, nextSort }: { social?: SocialLink; nextSort: number }) {
  return (
    <>
      {social ? <input type="hidden" name="id" value={social.id} /> : null}
      <div className="admin-link-grid">
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
          Profile link
          <input name="href" type="url" defaultValue={social?.href} placeholder="https://…" required />
        </label>
        <label className="admin-link-sort">
          Order
          <input type="number" name="sortOrder" defaultValue={social?.sortOrder ?? nextSort} />
        </label>
      </div>
      <div className="admin-link-options">
        <label>
          Screen-reader label <span className="muted">(optional)</span>
          <input name="label" defaultValue={social?.label} placeholder="Defaults to the platform name" />
        </label>
        <label className="inline-check">
          <input type="checkbox" name="published" defaultChecked={social?.published ?? true} /> Visible
        </label>
      </div>
    </>
  );
}

export default async function AdminNavigationPage() {
  const [studio, navLinks, socialLinks] = await Promise.all([
    getStudio(),
    prisma.navLink.findMany({ orderBy: [{ sortOrder: "asc" }, { label: "asc" }] }),
    prisma.socialLink.findMany({ orderBy: [{ sortOrder: "asc" }, { label: "asc" }] }),
  ]);

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Site</p>
        <h1>Header & footer</h1>
        <p className="muted">
          Address, phone, WhatsApp and tagline live in <Link href="/admin/settings">Settings</Link>.
        </p>
      </section>

      <h2>Text</h2>
      <ActionForm action={updateLayoutText}>
        <div className="form-row two">
          <label>
            Logo subtitle
            <input name="logoSubtitle" defaultValue={studio.logoSubtitle} required />
          </label>
          <label>
            Header button label
            <input name="headerCtaLabel" defaultValue={studio.headerCtaLabel} required />
          </label>
        </div>
        <label className="inline-check">
          <input type="checkbox" name="showHeaderPhone" defaultChecked={studio.showHeaderPhone} /> Show phone number in the
          header (large screens)
        </label>
        <div className="form-row two">
          <label>
            Footer contact heading
            <input name="footerVisitTitle" defaultValue={studio.footerVisitTitle} required />
          </label>
          <label>
            Footer links heading
            <input name="footerExploreTitle" defaultValue={studio.footerExploreTitle} required />
          </label>
        </div>
        <div className="form-row two">
          <label>
            Footer social heading
            <input name="footerSocialTitle" defaultValue={studio.footerSocialTitle} required />
          </label>
          <label>
            Copyright text <span className="muted">(after “© {new Date().getFullYear()} {studio.name}.”)</span>
            <input name="copyrightText" defaultValue={studio.copyrightText} required />
          </label>
        </div>
        <button className="btn btn-primary" type="submit">
          Save text
        </button>
      </ActionForm>

      {LINK_GROUPS.map((group) => {
        const links = navLinks.filter((link) => link.location === group.location);
        return (
          <section key={group.location} className="admin-link-section">
            <h2>{group.title}</h2>
            <p className="muted">{group.hint}</p>
            {links.length === 0 ? <p className="muted">No links yet — this area is hidden on the site.</p> : null}
            {links.map((link) => (
              <div key={link.id} className={`admin-link-card${link.published ? "" : " is-hidden"}`}>
                <ActionForm action={saveNavLink}>
                  <NavLinkFields link={link} location={group.location} nextSort={links.length + 1} />
                  <button className="btn btn-line" type="submit">
                    Save
                  </button>
                </ActionForm>
                <ActionForm action={deleteNavLink} className="admin-link-delete">
                  <input type="hidden" name="id" value={link.id} />
                  <ConfirmSubmit label="Delete" message={`Delete the “${link.label}” link?`} />
                </ActionForm>
              </div>
            ))}
            <ActionForm action={saveNavLink} className="admin-form admin-link-add">
              <h3>Add link</h3>
              <NavLinkFields location={group.location} nextSort={links.length + 1} />
              <button className="btn btn-primary" type="submit">
                Add link
              </button>
            </ActionForm>
          </section>
        );
      })}

      <section className="admin-link-section">
        <h2>Social icons</h2>
        <p className="muted">The round icons in the footer. Hidden icons stay saved but don’t show on the site.</p>
        {socialLinks.map((social) => (
          <div key={social.id} className={`admin-link-card${social.published ? "" : " is-hidden"}`}>
            <ActionForm action={saveSocialLink}>
              <SocialLinkFields social={social} nextSort={socialLinks.length + 1} />
              <button className="btn btn-line" type="submit">
                Save
              </button>
            </ActionForm>
            <ActionForm action={deleteSocialLink} className="admin-link-delete">
              <input type="hidden" name="id" value={social.id} />
              <ConfirmSubmit label="Delete" message={`Delete the ${social.label} icon?`} />
            </ActionForm>
          </div>
        ))}
        <ActionForm action={saveSocialLink} className="admin-form admin-link-add">
          <h3>Add social icon</h3>
          <SocialLinkFields nextSort={socialLinks.length + 1} />
          <button className="btn btn-primary" type="submit">
            Add icon
          </button>
        </ActionForm>
      </section>
    </main>
  );
}
