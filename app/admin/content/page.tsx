import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { FormActions } from "@/components/admin/AdminList";
import { editorKeys, MasterDetail, mdHref, resolveSelection, type MDGroup } from "@/components/admin/MasterDetail";
import { MediaField } from "@/components/admin/MediaField";
import {
  deleteInstagramPost,
  deleteOffer,
  deleteSignature,
  saveInstagramPost,
  saveOffer,
  saveSignature,
} from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { datetimeLocalValue, formatDate, formatFromPrice } from "@/lib/time";

export const metadata: Metadata = { title: "Desk content" };

const BASE = "/admin/content";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const [offers, signatures, posts, categories] = await Promise.all([
    prisma.offer.findMany({ orderBy: { expiresAt: "desc" } }),
    prisma.signature.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.instagramPost.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { services: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  const groups: MDGroup[] = [
    {
      key: "packages",
      label: "Packages",
      noun: "package",
      items: signatures.map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: item.treatmentName,
        thumb: item.image,
        meta: formatFromPrice(item.fromPrice).replace("From ", ""),
      })),
    },
    {
      key: "offers",
      label: "Offers",
      noun: "offer",
      items: offers.map((offer) => ({
        id: offer.id,
        title: offer.title,
        subtitle: offer.expiresAt ? `Until ${formatDate(offer.expiresAt)}` : "No end date",
        hidden: !offer.active,
      })),
    },
    {
      key: "instagram",
      label: "Instagram",
      noun: "Instagram post",
      items: posts.map((post) => ({ id: post.id, title: post.alt, thumb: post.image, meta: `#${post.sortOrder}` })),
    },
  ];
  const selection = resolveSelection(groups, params);
  const { key, deleteFormId } = editorKeys(selection);
  const groupKey = selection.group.key;
  const createdHref = `${BASE}?group=${groupKey}&edit=`;
  const listHref = mdHref(BASE, { group: groupKey });

  const signature = groupKey === "packages" ? signatures.find((entry) => entry.id === selection.item?.id) : undefined;
  const offer = groupKey === "offers" ? offers.find((entry) => entry.id === selection.item?.id) : undefined;
  const post = groupKey === "instagram" ? posts.find((entry) => entry.id === selection.item?.id) : undefined;

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Site</p>
        <h1>Packages, offers & Instagram</h1>
      </section>

      <MasterDetail basePath={BASE} groups={groups} selection={selection}>
        {groupKey === "packages" ? (
          <>
            <ActionForm key={key} action={saveSignature} createdHref={createdHref}>
              {signature ? <input type="hidden" name="id" value={signature.id} /> : null}
              <div className="admin-fields">
                <label className="is-wide">
                  Name
                  <input name="name" defaultValue={signature?.name} required />
                </label>
                <label>
                  Category
                  <select name="categorySlug" defaultValue={signature?.categorySlug ?? ""} required>
                    <option value="" disabled>
                      Choose category
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Treatment <span className="muted">(must match the menu)</span>
                  <input name="treatmentName" list="treatment-names" defaultValue={signature?.treatmentName} required />
                </label>
                <label>
                  From price (Rs.)
                  <input type="number" name="fromPrice" defaultValue={signature?.fromPrice ?? 0} min={0} />
                </label>
                <label>
                  Order
                  <input type="number" name="sortOrder" defaultValue={signature?.sortOrder ?? signatures.length + 1} />
                </label>
                <label className="is-wide">
                  Story
                  <textarea name="story" defaultValue={signature?.story} rows={3} required />
                </label>
                <label className="is-wide">
                  Included in this treatment <span className="muted">(one per line)</span>
                  <textarea
                    name="inclusions"
                    rows={3}
                    defaultValue={signature?.inclusions.join("\n")}
                    placeholder={"Consultation\nMain treatment\nFinishing"}
                  />
                </label>
              </div>
              <MediaField
                label="Photo"
                primaryFields={[{ name: "image", label: "Package photo", initialValue: signature?.image ?? "", required: true }]}
                initialMediaUrls={signature?.mediaUrls}
              />
              <FormActions
                saveLabel={signature ? "Save changes" : "Add package"}
                deleteFormId={signature ? deleteFormId : undefined}
                deleteMessage="Delete this homepage package?"
              />
            </ActionForm>
            {signature ? (
              <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteSignature} className="admin-delete-form" successHref={listHref}>
                <input type="hidden" name="id" value={signature.id} />
              </ActionForm>
            ) : null}
            <datalist id="treatment-names">
              {categories.flatMap((category) =>
                category.services.map((service) => (
                  <option key={service.id} value={service.name}>
                    {category.name}
                  </option>
                )),
              )}
            </datalist>
          </>
        ) : null}

        {groupKey === "offers" ? (
          <>
            <ActionForm key={key} action={saveOffer} createdHref={createdHref}>
              {offer ? <input type="hidden" name="id" value={offer.id} /> : null}
              <div className="admin-fields">
                <label className="is-wide">
                  Title
                  <input name="title" defaultValue={offer?.title} required />
                </label>
                <label className="is-wide">
                  Detail
                  <textarea name="detail" defaultValue={offer?.detail} rows={3} required />
                </label>
                <label>
                  Small label
                  <input name="eyebrow" defaultValue={offer?.eyebrow ?? ""} placeholder="Offer · through 30 November" />
                </label>
                <label>
                  Button label
                  <input name="cta" defaultValue={offer?.cta} required />
                </label>
                <label>
                  Expires <span className="muted">(optional)</span>
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    defaultValue={offer?.expiresAt ? datetimeLocalValue(offer.expiresAt) : ""}
                  />
                </label>
              </div>
              <MediaField initialMediaUrls={offer?.mediaUrls} />
              <label className="inline-check">
                <input type="checkbox" name="active" defaultChecked={offer?.active ?? true} /> Active (shown on the homepage)
              </label>
              <FormActions
                saveLabel={offer ? "Save changes" : "Add offer"}
                deleteFormId={offer ? deleteFormId : undefined}
                deleteMessage="Delete this offer?"
              />
            </ActionForm>
            {offer ? (
              <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteOffer} className="admin-delete-form" successHref={listHref}>
                <input type="hidden" name="id" value={offer.id} />
              </ActionForm>
            ) : null}
          </>
        ) : null}

        {groupKey === "instagram" ? (
          <>
            <ActionForm key={key} action={saveInstagramPost} createdHref={createdHref}>
              {post ? <input type="hidden" name="id" value={post.id} /> : null}
              <MediaField
                label="Photo"
                primaryFields={[{ name: "image", label: "Post photo", initialValue: post?.image ?? "", required: true }]}
                initialMediaUrls={post?.mediaUrls}
              />
              <div className="admin-fields">
                <label>
                  Alt text
                  <input name="alt" defaultValue={post?.alt} placeholder="What the photo shows" required />
                </label>
                <label>
                  Order
                  <input type="number" name="sortOrder" defaultValue={post?.sortOrder ?? posts.length + 1} />
                </label>
              </div>
              <FormActions
                saveLabel={post ? "Save changes" : "Add post"}
                deleteFormId={post ? deleteFormId : undefined}
                deleteMessage="Delete this Instagram post?"
              />
            </ActionForm>
            {post ? (
              <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteInstagramPost} className="admin-delete-form" successHref={listHref}>
                <input type="hidden" name="id" value={post.id} />
              </ActionForm>
            ) : null}
          </>
        ) : null}
      </MasterDetail>
    </main>
  );
}
