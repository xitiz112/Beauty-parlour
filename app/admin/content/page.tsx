import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
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
import { datetimeLocalValue } from "@/lib/time";

export const metadata: Metadata = { title: "Desk content" };

export default async function AdminContentPage() {
  const [offers, signatures, posts, categories] = await Promise.all([
    prisma.offer.findMany({ orderBy: { expiresAt: "desc" } }),
    prisma.signature.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.instagramPost.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { services: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Site</p>
        <h1>Offers, signatures, Instagram</h1>
      </section>

      <h2>Offers</h2>
      <ActionForm action={saveOffer}>
        <h3>Add offer</h3>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Detail
          <textarea name="detail" required />
        </label>
        <MediaField />
        <div className="form-row two">
          <label>
            Button label
            <input name="cta" required />
          </label>
          <label>
            Eyebrow
            <input name="eyebrow" />
          </label>
        </div>
        <label>
          Expires
          <input type="datetime-local" name="expiresAt" />
        </label>
        <label className="inline-check">
          <input type="checkbox" name="active" defaultChecked /> Active
        </label>
        <button className="btn btn-primary" type="submit">
          Add offer
        </button>
      </ActionForm>
      {offers.map((offer) => (
        <div key={offer.id}>
          <ActionForm action={saveOffer}>
            <input type="hidden" name="id" value={offer.id} />
            <label>
              Title
              <input name="title" defaultValue={offer.title} required />
            </label>
            <label>
              Detail
              <textarea name="detail" defaultValue={offer.detail} required />
            </label>
            <MediaField initialMediaUrls={offer.mediaUrls} />
            <div className="form-row two">
              <label>
                Button label
                <input name="cta" defaultValue={offer.cta} required />
              </label>
              <label>
                Eyebrow
                <input name="eyebrow" defaultValue={offer.eyebrow || ""} />
              </label>
            </div>
            <label>
              Expires
              <input
                type="datetime-local"
                name="expiresAt"
                defaultValue={offer.expiresAt ? datetimeLocalValue(offer.expiresAt) : ""}
              />
            </label>
            <label className="inline-check">
              <input type="checkbox" name="active" defaultChecked={offer.active} /> Active
            </label>
            <button className="btn btn-line" type="submit">
              Save offer
            </button>
          </ActionForm>
          <ActionForm action={deleteOffer}>
            <input type="hidden" name="id" value={offer.id} />
            <ConfirmSubmit label="Delete offer" message="Delete this offer?" />
          </ActionForm>
        </div>
      ))}

      <h2>Homepage packages</h2>
      <p className="muted">Category slug and treatment name must match a real menu item so “Book this” still prefills.</p>
      <ActionForm action={saveSignature}>
        <h3>Add signature</h3>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Story
          <textarea name="story" required />
        </label>
        <label>
          Included in this treatment <span className="muted">(one per line)</span>
          <textarea name="inclusions" rows={3} placeholder={"Consultation\nMain treatment\nFinishing"} />
        </label>
        <MediaField primaryName="image" primaryRequired />
        <div className="form-row two">
          <label>
            Category slug
            <select name="categorySlug" required>
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.slug}
                </option>
              ))}
            </select>
          </label>
          <label>
            Treatment name
            <input name="treatmentName" list="treatment-names" required />
          </label>
        </div>
        <div className="form-row two">
          <label>
            From price (Rs.)
            <input type="number" name="fromPrice" defaultValue={0} min={0} />
          </label>
          <label>
            Sort
            <input type="number" name="sortOrder" defaultValue={signatures.length + 1} />
          </label>
        </div>
        <button className="btn btn-primary" type="submit">
          Add signature
        </button>
      </ActionForm>
      {signatures.map((item) => (
        <div key={item.id}>
          <ActionForm action={saveSignature}>
            <input type="hidden" name="id" value={item.id} />
            <label>
              Name
              <input name="name" defaultValue={item.name} required />
            </label>
            <label>
              Story
              <textarea name="story" defaultValue={item.story} required />
            </label>
            <label>
              Included in this treatment <span className="muted">(one per line)</span>
              <textarea name="inclusions" rows={3} defaultValue={item.inclusions.join("\n")} />
            </label>
            <MediaField primaryName="image" initialPrimary={item.image} initialMediaUrls={item.mediaUrls} primaryRequired />
            <div className="form-row two">
              <label>
                Category slug
                <select name="categorySlug" defaultValue={item.categorySlug} required>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.slug}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Treatment name
                <input name="treatmentName" list="treatment-names" defaultValue={item.treatmentName} required />
              </label>
            </div>
            <div className="form-row two">
              <label>
                From price (Rs.)
                <input type="number" name="fromPrice" defaultValue={item.fromPrice} min={0} />
              </label>
              <label>
                Sort
                <input type="number" name="sortOrder" defaultValue={item.sortOrder} />
              </label>
            </div>
            <button className="btn btn-line" type="submit">
              Save signature
            </button>
          </ActionForm>
          <ActionForm action={deleteSignature}>
            <input type="hidden" name="id" value={item.id} />
            <ConfirmSubmit label="Delete signature" message="Delete this homepage signature?" />
          </ActionForm>
        </div>
      ))}
      <datalist id="treatment-names">
        {categories.flatMap((category) =>
          category.services.map((service) => (
            <option key={service.id} value={service.name}>
              {category.slug} — {service.name}
            </option>
          )),
        )}
      </datalist>

      <h2>Instagram posts</h2>
      <ActionForm action={saveInstagramPost}>
        <h3>Add post</h3>
        <MediaField primaryName="image" primaryRequired />
        <label>
          Alt text
          <input name="alt" required />
        </label>
        <label>
          Sort
          <input type="number" name="sortOrder" defaultValue={posts.length + 1} />
        </label>
        <button className="btn btn-primary" type="submit">
          Add post
        </button>
      </ActionForm>
      {posts.map((post) => (
        <div key={post.id}>
          <ActionForm action={saveInstagramPost}>
            <input type="hidden" name="id" value={post.id} />
            <MediaField primaryName="image" initialPrimary={post.image} initialMediaUrls={post.mediaUrls} primaryRequired />
            <label>
              Alt text
              <input name="alt" defaultValue={post.alt} required />
            </label>
            <label>
              Sort
              <input type="number" name="sortOrder" defaultValue={post.sortOrder} />
            </label>
            <button className="btn btn-line" type="submit">
              Save post
            </button>
          </ActionForm>
          <ActionForm action={deleteInstagramPost}>
            <input type="hidden" name="id" value={post.id} />
            <ConfirmSubmit label="Delete post" message="Delete this Instagram post?" />
          </ActionForm>
        </div>
      ))}
    </main>
  );
}
