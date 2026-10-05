import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { FormActions } from "@/components/admin/AdminList";
import { editorKeys, MasterDetail, resolveSelection, type MDGroup } from "@/components/admin/MasterDetail";
import { MediaField } from "@/components/admin/MediaField";
import { deleteGalleryItem, saveGalleryItem } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Desk gallery" };

const BASE = "/admin/gallery";

export default async function AdminGalleryPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const items = await prisma.galleryItem.findMany({ orderBy: { sortOrder: "asc" } });

  const groups: MDGroup[] = [
    {
      key: "looks",
      label: "Looks",
      noun: "look",
      items: items.map((item) => ({
        id: item.id,
        title: item.caption,
        thumb: item.image,
        meta: `#${item.sortOrder}`,
        hidden: !item.published,
      })),
    },
  ];
  const selection = resolveSelection(groups, params);
  const item = items.find((entry) => entry.id === selection.item?.id);
  const { key, deleteFormId } = editorKeys(selection);

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Work</p>
        <h1>Gallery</h1>
      </section>
      <MasterDetail basePath={BASE} groups={groups} selection={selection}>
        <ActionForm key={key} action={saveGalleryItem} createdHref={`${BASE}?edit=`}>
          {item ? <input type="hidden" name="id" value={item.id} /> : null}
          <div className="admin-fields">
            <label>
              Caption
              <input name="caption" defaultValue={item?.caption} required />
            </label>
            <label>
              Order
              <input type="number" name="sortOrder" defaultValue={item?.sortOrder ?? items.length + 1} />
            </label>
          </div>
          <MediaField
            label="Photo"
            primaryFields={[{ name: "image", label: "Gallery photo", initialValue: item?.image ?? "", required: true }]}
            initialMediaUrls={item?.mediaUrls}
          />
          <label className="inline-check">
            <input type="checkbox" name="published" defaultChecked={item?.published ?? true} /> Published
          </label>
          <FormActions
            saveLabel={item ? "Save changes" : "Add look"}
            deleteFormId={item ? deleteFormId : undefined}
            deleteMessage="Delete this gallery look?"
          />
        </ActionForm>
        {item ? (
          <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteGalleryItem} className="admin-delete-form" successHref={BASE}>
            <input type="hidden" name="id" value={item.id} />
          </ActionForm>
        ) : null}
      </MasterDetail>
    </main>
  );
}
