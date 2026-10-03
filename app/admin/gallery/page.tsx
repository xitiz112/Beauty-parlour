import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { MediaField } from "@/components/admin/MediaField";
import { deleteGalleryItem, saveGalleryItem } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Desk gallery" };

export default async function AdminGalleryPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Work</p>
        <h1>Gallery</h1>
      </section>
      <ActionForm action={saveGalleryItem}>
        <h2>Add look</h2>
        <label>
          Caption
          <input name="caption" required />
        </label>
        <MediaField primaryName="image" primaryRequired />
        <label>
          Sort
          <input type="number" name="sortOrder" defaultValue={items.length + 1} />
        </label>
        <label className="inline-check">
          <input type="checkbox" name="published" defaultChecked /> Published
        </label>
        <button className="btn btn-primary" type="submit">
          Add
        </button>
      </ActionForm>
      {items.map((item) => (
        <div key={item.id}>
          <ActionForm action={saveGalleryItem}>
            <input type="hidden" name="id" value={item.id} />
            <label>
              Caption
              <input name="caption" defaultValue={item.caption} required />
            </label>
            <MediaField primaryName="image" initialPrimary={item.image} initialMediaUrls={item.mediaUrls} primaryRequired />
            <label>
              Sort
              <input type="number" name="sortOrder" defaultValue={item.sortOrder} />
            </label>
            <label className="inline-check">
              <input type="checkbox" name="published" defaultChecked={item.published} /> Published
            </label>
            <button className="btn btn-line" type="submit">
              Save
            </button>
          </ActionForm>
          <ActionForm action={deleteGalleryItem}>
            <input type="hidden" name="id" value={item.id} />
            <ConfirmSubmit label="Delete look" message="Delete this gallery look?" />
          </ActionForm>
        </div>
      ))}
    </main>
  );
}
