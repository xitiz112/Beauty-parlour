import type { Metadata } from "next";
import Link from "next/link";
import type { HeroSlide, RitualPick, SectionContent, TrustItem } from "@prisma/client";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { MediaField } from "@/components/admin/MediaField";
import {
  deleteHeroSlide,
  deleteRitualPick,
  deleteTrustItem,
  saveHeroSlide,
  saveRitualPick,
  saveTrustItem,
  updateSection,
} from "@/lib/actions";
import { getSections } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { HOME_SECTIONS, type SectionField } from "@/lib/site-defaults";

export const metadata: Metadata = { title: "Desk homepage" };

// Where each section's list content is edited, for sections whose items live on another admin page.
const MANAGED_ELSEWHERE: Record<string, { href: string; label: string }> = {
  services: { href: "/admin/services", label: "Services" },
  signature: { href: "/admin/content", label: "Content (packages & offer)" },
  about: { href: "/admin/settings", label: "Settings (first paragraph & image)" },
  gallery: { href: "/admin/gallery", label: "Gallery" },
  team: { href: "/admin/team", label: "Team" },
  reviews: { href: "/admin/reviews", label: "Reviews" },
  contact: { href: "/admin/settings", label: "Settings (address, phone, parking)" },
  instagram: { href: "/admin/content", label: "Content (Instagram photos)" },
};

const MULTILINE: SectionField[] = ["body", "details"];

type ServiceOption = { id: string; name: string; category: { name: string } };

function SectionForm({ section, content }: { section: (typeof HOME_SECTIONS)[number]; content: SectionContent }) {
  const elsewhere = MANAGED_ELSEWHERE[section.key];
  return (
    <details className="admin-section-card">
      <summary>
        <span>{section.name}</span>
        <span className={`admin-section-status${content.visible ? "" : " is-off"}`}>{content.visible ? "Visible" : "Hidden"}</span>
      </summary>
      <ActionForm action={updateSection}>
        <input type="hidden" name="key" value={section.key} />
        {(Object.entries(section.fields) as Array<[SectionField, string]>).map(([field, label]) => (
          <label key={field}>
            {label}
            {MULTILINE.includes(field) ? (
              <textarea name={field} defaultValue={content[field]} rows={field === "details" ? 3 : 4} />
            ) : (
              <input name={field} defaultValue={content[field]} />
            )}
          </label>
        ))}
        <label className="inline-check">
          <input type="checkbox" name="visible" defaultChecked={content.visible} /> Show this section on the homepage
        </label>
        {elsewhere ? (
          <p className="muted">
            Items in this section are edited in <Link href={elsewhere.href}>{elsewhere.label}</Link>.
          </p>
        ) : null}
        <button className="btn btn-primary" type="submit">
          Save {section.name.toLowerCase()}
        </button>
      </ActionForm>
    </details>
  );
}

function SlideFields({ slide, nextSort }: { slide?: HeroSlide; nextSort: number }) {
  return (
    <>
      {slide ? <input type="hidden" name="id" value={slide.id} /> : null}
      <MediaField
        label="Slide image"
        primaryName="image"
        initialPrimary={slide?.image}
        initialMediaUrls={slide?.mediaUrls}
        primaryRequired
      />
      <div className="admin-link-grid">
        <label>
          Alt text
          <input name="alt" defaultValue={slide?.alt} placeholder="What the photo shows" required />
        </label>
        <span />
        <label className="admin-link-sort">
          Order
          <input type="number" name="sortOrder" defaultValue={slide?.sortOrder ?? nextSort} />
        </label>
      </div>
      <label className="inline-check">
        <input type="checkbox" name="published" defaultChecked={slide?.published ?? true} /> Visible
      </label>
    </>
  );
}

function TrustFields({ item, nextSort }: { item?: TrustItem; nextSort: number }) {
  return (
    <>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="admin-trust-grid">
        <label>
          Value
          <input name="value" defaultValue={item?.value} placeholder="8 or Sanitized tools" required />
        </label>
        <label>
          Suffix
          <input name="suffix" defaultValue={item?.suffix} placeholder="+" maxLength={6} />
        </label>
        <label>
          Label
          <input name="label" defaultValue={item?.label} placeholder="Years in Jhamsikhel" required />
        </label>
        <label className="admin-link-sort">
          Order
          <input type="number" name="sortOrder" defaultValue={item?.sortOrder ?? nextSort} />
        </label>
      </div>
      <label className="inline-check">
        <input type="checkbox" name="published" defaultChecked={item?.published ?? true} /> Visible
      </label>
    </>
  );
}

function RitualFields({ pick, services, nextSort }: { pick?: RitualPick; services: ServiceOption[]; nextSort: number }) {
  return (
    <>
      {pick ? <input type="hidden" name="id" value={pick.id} /> : null}
      <div className="admin-link-grid">
        <label>
          Treatment
          <select name="serviceId" defaultValue={pick?.serviceId ?? ""} required>
            <option value="" disabled>
              Choose a treatment
            </option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.category.name} — {service.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Short note
          <input name="note" defaultValue={pick?.note} placeholder="Shown under the name" required />
        </label>
        <label className="admin-link-sort">
          Order
          <input type="number" name="sortOrder" defaultValue={pick?.sortOrder ?? nextSort} />
        </label>
      </div>
      <label>
        Description <span className="muted">(shown when the row is opened)</span>
        <textarea name="detail" defaultValue={pick?.detail} rows={2} required />
      </label>
      <label className="inline-check">
        <input type="checkbox" name="published" defaultChecked={pick?.published ?? true} /> Visible
      </label>
    </>
  );
}

export default async function AdminHomepagePage() {
  const [sections, slides, trustItems, ritualPicks, services] = await Promise.all([
    getSections(),
    prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.trustItem.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.ritualPick.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.service.findMany({
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      select: { id: true, name: true, category: { select: { name: true } } },
    }),
  ]);

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Site</p>
        <h1>Homepage</h1>
        <p className="muted">Every section’s text, the hero slideshow, the facts row, and the featured rituals.</p>
      </section>

      <section className="admin-link-section">
        <h2>Sections</h2>
        <p className="muted">Open a section to edit its text or hide it. Leave a button label empty to hide that button.</p>
        {HOME_SECTIONS.map((section) => (
          <SectionForm key={section.key} section={section} content={sections[section.key]} />
        ))}
      </section>

      <section className="admin-link-section">
        <h2>Hero slideshow</h2>
        <p className="muted">Photos rotate behind the hero heading, in order. Wide landscape photos work best.</p>
        {slides.map((slide) => (
          <div key={slide.id} className={`admin-link-card${slide.published ? "" : " is-hidden"}`}>
            <ActionForm action={saveHeroSlide}>
              <SlideFields slide={slide} nextSort={slides.length + 1} />
              <button className="btn btn-line" type="submit">
                Save
              </button>
            </ActionForm>
            <ActionForm action={deleteHeroSlide} className="admin-link-delete">
              <input type="hidden" name="id" value={slide.id} />
              <ConfirmSubmit label="Delete" message="Delete this slide?" />
            </ActionForm>
          </div>
        ))}
        <ActionForm action={saveHeroSlide} className="admin-form admin-link-add">
          <h3>Add slide</h3>
          <SlideFields nextSort={slides.length + 1} />
          <button className="btn btn-primary" type="submit">
            Add slide
          </button>
        </ActionForm>
      </section>

      <section className="admin-link-section">
        <h2>Facts row</h2>
        <p className="muted">
          The strip under the hero. A number value counts up when it scrolls into view; a “+” suffix shows as the plus icon.
        </p>
        {trustItems.map((item) => (
          <div key={item.id} className={`admin-link-card${item.published ? "" : " is-hidden"}`}>
            <ActionForm action={saveTrustItem}>
              <TrustFields item={item} nextSort={trustItems.length + 1} />
              <button className="btn btn-line" type="submit">
                Save
              </button>
            </ActionForm>
            <ActionForm action={deleteTrustItem} className="admin-link-delete">
              <input type="hidden" name="id" value={item.id} />
              <ConfirmSubmit label="Delete" message={`Delete “${item.label}”?`} />
            </ActionForm>
          </div>
        ))}
        <ActionForm action={saveTrustItem} className="admin-form admin-link-add">
          <h3>Add fact</h3>
          <TrustFields nextSort={trustItems.length + 1} />
          <button className="btn btn-primary" type="submit">
            Add fact
          </button>
        </ActionForm>
      </section>

      <section className="admin-link-section">
        <h2>Featured rituals</h2>
        <p className="muted">Treatments listed beside the studio photo. Name, duration, and price come from the menu.</p>
        {ritualPicks.map((pick) => (
          <div key={pick.id} className={`admin-link-card${pick.published ? "" : " is-hidden"}`}>
            <ActionForm action={saveRitualPick}>
              <RitualFields pick={pick} services={services} nextSort={ritualPicks.length + 1} />
              <button className="btn btn-line" type="submit">
                Save
              </button>
            </ActionForm>
            <ActionForm action={deleteRitualPick} className="admin-link-delete">
              <input type="hidden" name="id" value={pick.id} />
              <ConfirmSubmit label="Remove" message="Remove this treatment from featured rituals?" />
            </ActionForm>
          </div>
        ))}
        <ActionForm action={saveRitualPick} className="admin-form admin-link-add">
          <h3>Add ritual</h3>
          <RitualFields services={services} nextSort={ritualPicks.length + 1} />
          <button className="btn btn-primary" type="submit">
            Add ritual
          </button>
        </ActionForm>
      </section>
    </main>
  );
}
