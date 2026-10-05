import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { FormActions } from "@/components/admin/AdminList";
import { editorKeys, MasterDetail, mdHref, resolveSelection, type MDGroup } from "@/components/admin/MasterDetail";
import { MediaField } from "@/components/admin/MediaField";
import { deleteService, deleteServiceCategory, saveService, saveServiceCategory } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/time";

export const metadata: Metadata = { title: "Desk services" };

const BASE = "/admin/services";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { services: { orderBy: { sortOrder: "asc" } } },
  });
  const services = categories.flatMap((category) => category.services.map((service) => ({ ...service, category })));

  const groups: MDGroup[] = [
    {
      key: "treatments",
      label: "Treatments",
      noun: "treatment",
      items: services.map((service) => ({
        id: service.id,
        title: service.name,
        subtitle: `${service.durationMinutes} min`,
        thumb: service.image || service.category.image,
        meta: formatMoney(service.price),
        hidden: !service.published,
        section: service.category.name,
      })),
    },
    {
      key: "categories",
      label: "Categories",
      noun: "category",
      items: categories.map((category) => ({
        id: category.id,
        title: category.name,
        subtitle: `${category.services.length} treatment${category.services.length === 1 ? "" : "s"}`,
        thumb: category.image,
        meta: category.featured ? "Featured" : undefined,
      })),
    },
  ];
  const selection = resolveSelection(groups, params);
  const { key, deleteFormId } = editorKeys(selection);
  const groupKey = selection.group.key;
  const createdHref = `${BASE}?group=${groupKey}&edit=`;
  const listHref = mdHref(BASE, { group: groupKey });

  const service = groupKey === "treatments" ? services.find((entry) => entry.id === selection.item?.id) : undefined;
  const category = groupKey === "categories" ? categories.find((entry) => entry.id === selection.item?.id) : undefined;

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Menu</p>
        <h1>Treatments</h1>
      </section>

      <MasterDetail basePath={BASE} groups={groups} selection={selection}>
        {groupKey === "treatments" ? (
          categories.length === 0 ? (
            <p className="admin-note">Add a category first — every treatment belongs to one.</p>
          ) : (
            <>
              <ActionForm key={key} action={saveService} createdHref={createdHref}>
                {service ? <input type="hidden" name="id" value={service.id} /> : null}
                <div className="admin-fields">
                  <label>
                    Name
                    <input name="name" defaultValue={service?.name} required />
                  </label>
                  <label>
                    Category
                    <select name="categoryId" defaultValue={service?.categoryId ?? categories[0].id}>
                      {categories.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Minutes
                    <input type="number" name="durationMinutes" defaultValue={service?.durationMinutes ?? 60} min={1} required />
                  </label>
                  <label>
                    Price (Rs.)
                    <input type="number" name="price" defaultValue={service?.price ?? 0} min={0} required />
                  </label>
                  <label className="is-wide">
                    Description
                    <textarea name="description" defaultValue={service?.description ?? ""} rows={3} />
                  </label>
                  <label>
                    Order <span className="muted">(within its category)</span>
                    <input
                      type="number"
                      name="sortOrder"
                      defaultValue={service?.sortOrder ?? (categories[0]?.services.length ?? 0) + 1}
                    />
                  </label>
                </div>
                <MediaField
                  label="Photos"
                  primaryFields={[{ name: "image", label: "Card photo", initialValue: service?.image ?? "" }]}
                  initialMediaUrls={service?.mediaUrls}
                />
                <label className="inline-check">
                  <input type="checkbox" name="published" defaultChecked={service?.published ?? true} /> Published on the menu
                </label>
                <FormActions
                  saveLabel={service ? "Save changes" : "Add treatment"}
                  deleteFormId={service ? deleteFormId : undefined}
                  deleteMessage="Delete this treatment? If it has appointments it will be unpublished instead."
                />
              </ActionForm>
              {service ? (
                <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteService} className="admin-delete-form" successHref={listHref}>
                  <input type="hidden" name="id" value={service.id} />
                </ActionForm>
              ) : null}
            </>
          )
        ) : null}

        {groupKey === "categories" ? (
          <>
            <ActionForm key={key} action={saveServiceCategory} createdHref={createdHref}>
              {category ? <input type="hidden" name="id" value={category.id} /> : null}
              <div className="admin-fields">
                <label>
                  Name
                  <input name="name" defaultValue={category?.name} required />
                </label>
                {category ? (
                  <label>
                    Slug <span className="muted">(used in links)</span>
                    <input name="slug" defaultValue={category.slug} />
                  </label>
                ) : null}
                <label>
                  From price (Rs.)
                  <input type="number" name="fromPrice" defaultValue={category?.fromPrice ?? 0} min={0} />
                </label>
                <label>
                  Order
                  <input type="number" name="sortOrder" defaultValue={category?.sortOrder ?? categories.length + 1} />
                </label>
                <label className="is-wide">
                  Teaser
                  <textarea name="teaser" defaultValue={category?.teaser} rows={3} required />
                </label>
              </div>
              <MediaField
                label="Photos"
                primaryFields={[{ name: "image", label: "Category photo", initialValue: category?.image ?? "", required: true }]}
                initialMediaUrls={category?.mediaUrls}
              />
              <label className="inline-check">
                <input type="checkbox" name="featured" defaultChecked={category?.featured ?? false} /> Featured
              </label>
              <FormActions
                saveLabel={category ? "Save changes" : "Add category"}
                deleteFormId={category ? deleteFormId : undefined}
                deleteMessage="Delete this category? It must have no treatments."
              />
            </ActionForm>
            {category ? (
              <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteServiceCategory} className="admin-delete-form" successHref={listHref}>
                <input type="hidden" name="id" value={category.id} />
              </ActionForm>
            ) : null}
          </>
        ) : null}
      </MasterDetail>
    </main>
  );
}
