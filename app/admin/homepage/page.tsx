import type { Metadata } from "next";
import Link from "next/link";
import type { HeroSlide, RitualPick, SectionContent, TrustItem } from "@prisma/client";
import { ActionForm } from "@/components/admin/ActionForm";
import { FormActions } from "@/components/admin/AdminList";
import { editorKeys, MasterDetail, mdHref, resolveSelection, type MDGroup } from "@/components/admin/MasterDetail";
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
import { formatMoney } from "@/lib/time";

export const metadata: Metadata = { title: "Desk homepage" };

const BASE = "/admin/homepage";

// Where each section's list content is edited, for sections whose items live on another admin page.
const MANAGED_ELSEWHERE: Record<string, { href: string; label: string }> = {
  hero: { href: "/admin/homepage?group=slides", label: "Slideshow tab" },
  services: { href: "/admin/services", label: "Services" },
  rituals: { href: "/admin/homepage?group=rituals", label: "Rituals tab" },
  signature: { href: "/admin/content", label: "Content — packages & offer" },
  about: { href: "/admin/settings", label: "Settings — first paragraph & image" },
  gallery: { href: "/admin/gallery", label: "Gallery" },
  team: { href: "/admin/team", label: "Team" },
  reviews: { href: "/admin/reviews", label: "Reviews" },
  contact: { href: "/admin/settings", label: "Settings — address, phone, parking" },
  instagram: { href: "/admin/content", label: "Content — Instagram photos" },
};

const MULTILINE: SectionField[] = ["body", "details"];
// Short fields sit two to a row; long text spans the full width.
const SHORT: SectionField[] = ["eyebrow", "ctaLabel", "secondaryCtaLabel"];

type ServiceOption = { id: string; name: string; price: number; category: { name: string } };

function SectionFields({ section, content }: { section: (typeof HOME_SECTIONS)[number]; content: SectionContent }) {
  const elsewhere = MANAGED_ELSEWHERE[section.key];
  return (
    <>
      <input type="hidden" name="key" value={section.key} />
      <div className="admin-fields">
        {(Object.entries(section.fields) as Array<[SectionField, string]>).map(([field, label]) => (
          <label key={field} className={SHORT.includes(field) ? undefined : "is-wide"}>
            {label}
            {MULTILINE.includes(field) ? (
              <textarea name={field} defaultValue={content[field]} rows={field === "details" ? 3 : 4} />
            ) : (
              <input name={field} defaultValue={content[field]} />
            )}
          </label>
        ))}
      </div>
      <label className="inline-check">
        <input type="checkbox" name="visible" defaultChecked={content.visible} /> Show this section on the homepage
      </label>
      {elsewhere ? (
        <p className="admin-note">
          Items in this section: <Link href={elsewhere.href}>{elsewhere.label}</Link>
        </p>
      ) : null}
    </>
  );
}

function SlideFields({ slide, nextSort }: { slide?: HeroSlide; nextSort: number }) {
  return (
    <>
      {slide ? <input type="hidden" name="id" value={slide.id} /> : null}
      <MediaField
        label="Photo"
        primaryFields={[{ name: "image", label: "Slide photo", initialValue: slide?.image ?? "", required: true }]}
        initialMediaUrls={slide?.mediaUrls}
      />
      <div className="admin-fields">
        <label>
          Alt text
          <input name="alt" defaultValue={slide?.alt} placeholder="What the photo shows, for screen readers" required />
        </label>
        <label className="is-order">
          Order
          <input type="number" name="sortOrder" defaultValue={slide?.sortOrder ?? nextSort} />
        </label>
      </div>
      <label className="inline-check">
        <input type="checkbox" name="published" defaultChecked={slide?.published ?? true} /> Show in the slideshow
      </label>
    </>
  );
}

function TrustFields({ item, nextSort }: { item?: TrustItem; nextSort: number }) {
  return (
    <>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="admin-fields admin-fields-trust">
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
        <label className="is-order">
          Order
          <input type="number" name="sortOrder" defaultValue={item?.sortOrder ?? nextSort} />
        </label>
      </div>
      <label className="inline-check">
        <input type="checkbox" name="published" defaultChecked={item?.published ?? true} /> Show in the facts row
      </label>
    </>
  );
}

function RitualFields({ pick, services, nextSort }: { pick?: RitualPick; services: ServiceOption[]; nextSort: number }) {
  const menuPrice = services.find((service) => service.id === pick?.serviceId)?.price;
  return (
    <>
      {pick ? <input type="hidden" name="id" value={pick.id} /> : null}
      <div className="admin-fields">
        <label>
          Treatment
          <select name="serviceId" defaultValue={pick?.serviceId ?? ""} required>
            <option value="" disabled>
              Choose a treatment
            </option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.category.name} — {service.name} ({formatMoney(service.price)})
              </option>
            ))}
          </select>
        </label>
        <label className="is-order">
          Order
          <input type="number" name="sortOrder" defaultValue={pick?.sortOrder ?? nextSort} />
        </label>
        <label>
          Short note
          <input name="note" defaultValue={pick?.note} placeholder="Shown under the treatment name" required />
        </label>
        <label className="is-order">
          Price (Rs.)
          <input
            name="price"
            inputMode="numeric"
            defaultValue={pick?.price ?? ""}
            placeholder={menuPrice !== undefined ? String(menuPrice) : "Menu price"}
          />
        </label>
        <p className="admin-note is-wide">
          Leave the price blank to use the treatment’s menu price{menuPrice !== undefined ? ` (${formatMoney(menuPrice)})` : ""}.
        </p>
        <label className="is-wide">
          Description
          <textarea name="detail" defaultValue={pick?.detail} rows={2} placeholder="Shown when a visitor opens the row" required />
        </label>
      </div>
      <label className="inline-check">
        <input type="checkbox" name="published" defaultChecked={pick?.published ?? true} /> Show in featured rituals
      </label>
    </>
  );
}

export default async function AdminHomepagePage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const [sections, slides, trustItems, ritualPicks, services] = await Promise.all([
    getSections(),
    prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.trustItem.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.ritualPick.findMany({ orderBy: { sortOrder: "asc" }, include: { service: { select: { name: true, price: true } } } }),
    prisma.service.findMany({
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      select: { id: true, name: true, price: true, category: { select: { name: true } } },
    }),
  ]);

  const groups: MDGroup[] = [
    {
      key: "sections",
      label: "Sections",
      noun: "section",
      canAdd: false,
      items: HOME_SECTIONS.map((section) => ({
        id: section.key,
        title: section.name,
        subtitle: sections[section.key].title || sections[section.key].eyebrow || "—",
        hidden: !sections[section.key].visible,
      })),
    },
    {
      key: "slides",
      label: "Slideshow",
      noun: "slide",
      items: slides.map((slide) => ({
        id: slide.id,
        title: slide.alt,
        thumb: slide.image,
        meta: `#${slide.sortOrder}`,
        hidden: !slide.published,
      })),
    },
    {
      key: "facts",
      label: "Facts",
      noun: "fact",
      items: trustItems.map((item) => ({
        id: item.id,
        title: `${item.value}${item.suffix}`,
        subtitle: item.label,
        meta: `#${item.sortOrder}`,
        hidden: !item.published,
      })),
    },
    {
      key: "rituals",
      label: "Rituals",
      noun: "ritual",
      items: ritualPicks.map((pick) => ({
        id: pick.id,
        title: pick.service.name,
        subtitle: pick.note,
        meta: `${formatMoney(pick.price ?? pick.service.price)}${pick.price !== null ? " *" : ""}`,
        hidden: !pick.published,
      })),
    },
  ];
  const selection = resolveSelection(groups, params);
  const { key, deleteFormId } = editorKeys(selection);
  const groupKey = selection.group.key;
  const createdHref = `${BASE}?group=${groupKey}&edit=`;
  const listHref = mdHref(BASE, { group: groupKey });

  const section = groupKey === "sections" ? HOME_SECTIONS.find((entry) => entry.key === selection.item?.id) : undefined;
  const slide = groupKey === "slides" ? slides.find((entry) => entry.id === selection.item?.id) : undefined;
  const fact = groupKey === "facts" ? trustItems.find((entry) => entry.id === selection.item?.id) : undefined;
  const pick = groupKey === "rituals" ? ritualPicks.find((entry) => entry.id === selection.item?.id) : undefined;

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Site</p>
        <h1>Homepage</h1>
        <p className="muted">
          Each section’s text, the hero slideshow, the facts row, and the featured rituals.{" "}
          <Link href="/" target="_blank" rel="noopener noreferrer">
            View homepage ↗
          </Link>
        </p>
      </section>

      <MasterDetail basePath={BASE} groups={groups} selection={selection}>
        {section ? (
          <ActionForm key={key} action={updateSection}>
            <SectionFields section={section} content={sections[section.key]} />
            <FormActions />
          </ActionForm>
        ) : null}

        {groupKey === "slides" ? (
          <>
            <p className="admin-note">Photos rotate behind the hero heading in order. Wide landscape photos work best.</p>
            <ActionForm key={key} action={saveHeroSlide} createdHref={createdHref}>
              <SlideFields slide={slide} nextSort={slides.length + 1} />
              <FormActions
                saveLabel={slide ? "Save changes" : "Add slide"}
                deleteFormId={slide ? deleteFormId : undefined}
                deleteMessage="Delete this slide?"
              />
            </ActionForm>
            {slide ? (
              <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteHeroSlide} className="admin-delete-form" successHref={listHref}>
                <input type="hidden" name="id" value={slide.id} />
              </ActionForm>
            ) : null}
          </>
        ) : null}

        {groupKey === "facts" ? (
          <>
            <p className="admin-note">
              The strip under the hero. A number counts up as it scrolls into view; a “+” suffix shows as the plus icon.
            </p>
            <ActionForm key={key} action={saveTrustItem} createdHref={createdHref}>
              <TrustFields item={fact} nextSort={trustItems.length + 1} />
              <FormActions
                saveLabel={fact ? "Save changes" : "Add fact"}
                deleteFormId={fact ? deleteFormId : undefined}
                deleteMessage={`Delete “${fact?.label ?? ""}”?`}
              />
            </ActionForm>
            {fact ? (
              <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteTrustItem} className="admin-delete-form" successHref={listHref}>
                <input type="hidden" name="id" value={fact.id} />
              </ActionForm>
            ) : null}
          </>
        ) : null}

        {groupKey === "rituals" ? (
          <>
            <p className="admin-note">Treatments listed beside the studio photo. Name and duration come from the menu.</p>
            <ActionForm key={key} action={saveRitualPick} createdHref={createdHref}>
              <RitualFields pick={pick} services={services} nextSort={ritualPicks.length + 1} />
              <FormActions
                saveLabel={pick ? "Save changes" : "Add ritual"}
                deleteFormId={pick ? deleteFormId : undefined}
                deleteLabel="Remove"
                deleteMessage="Remove this treatment from featured rituals?"
              />
            </ActionForm>
            {pick ? (
              <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteRitualPick} className="admin-delete-form" successHref={listHref}>
                <input type="hidden" name="id" value={pick.id} />
              </ActionForm>
            ) : null}
          </>
        ) : null}
      </MasterDetail>
    </main>
  );
}
