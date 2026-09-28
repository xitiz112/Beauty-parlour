import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { deleteService, deleteServiceCategory, saveService, saveServiceCategory } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Desk services" };

export default async function AdminServicesPage() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { services: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Menu</p>
        <h1>Treatments</h1>
      </section>

      <ActionForm action={saveServiceCategory}>
        <h2>Add category</h2>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Teaser
          <textarea name="teaser" required />
        </label>
        <label>
          Image URL
          <input name="image" required />
        </label>
        <div className="form-row two">
          <label>
            From price (Rs.)
            <input type="number" name="fromPrice" defaultValue={0} min={0} />
          </label>
          <label>
            Sort
            <input type="number" name="sortOrder" defaultValue={categories.length + 1} />
          </label>
        </div>
        <label className="inline-check">
          <input type="checkbox" name="featured" /> Featured
        </label>
        <button className="btn btn-primary" type="submit">
          Add category
        </button>
      </ActionForm>

      {categories.map((category) => (
        <section className="price-block" key={category.id}>
          <ActionForm action={saveServiceCategory}>
            <input type="hidden" name="id" value={category.id} />
            <h2>{category.name}</h2>
            <label>
              Name
              <input name="name" defaultValue={category.name} required />
            </label>
            <label>
              Slug
              <input name="slug" defaultValue={category.slug} />
            </label>
            <label>
              Teaser
              <textarea name="teaser" defaultValue={category.teaser} required />
            </label>
            <label>
              Image URL
              <input name="image" defaultValue={category.image} required />
            </label>
            <div className="form-row two">
              <label>
                From price (Rs.)
                <input type="number" name="fromPrice" defaultValue={category.fromPrice} min={0} />
              </label>
              <label>
                Sort
                <input type="number" name="sortOrder" defaultValue={category.sortOrder} />
              </label>
            </div>
            <label className="inline-check">
              <input type="checkbox" name="featured" defaultChecked={category.featured} /> Featured
            </label>
            <div className="admin-actions">
              <button className="btn btn-primary" type="submit">
                Save category
              </button>
            </div>
          </ActionForm>
          <ActionForm action={deleteServiceCategory}>
            <input type="hidden" name="id" value={category.id} />
            <ConfirmSubmit label="Delete category" message="Delete this category? It must have no treatments." />
          </ActionForm>

          <ActionForm action={saveService}>
            <h3>Add treatment</h3>
            <input type="hidden" name="categoryId" value={category.id} />
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Description
              <textarea name="description" />
            </label>
            <div className="form-row two">
              <label>
                Minutes
                <input type="number" name="durationMinutes" defaultValue={60} min={1} required />
              </label>
              <label>
                Price (Rs.)
                <input type="number" name="price" defaultValue={0} min={0} required />
              </label>
            </div>
            <label>
              Sort
              <input type="number" name="sortOrder" defaultValue={category.services.length + 1} />
            </label>
            <label className="inline-check">
              <input type="checkbox" name="published" defaultChecked /> Published
            </label>
            <button className="btn btn-primary" type="submit">
              Add treatment
            </button>
          </ActionForm>

          {category.services.map((service) => (
            <div key={service.id}>
              <ActionForm action={saveService}>
                <input type="hidden" name="id" value={service.id} />
                <label>
                  Category
                  <select name="categoryId" defaultValue={service.categoryId}>
                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Name
                  <input name="name" defaultValue={service.name} required />
                </label>
                <label>
                  Description
                  <textarea name="description" defaultValue={service.description || ""} />
                </label>
                <div className="form-row two">
                  <label>
                    Minutes
                    <input type="number" name="durationMinutes" defaultValue={service.durationMinutes} min={1} required />
                  </label>
                  <label>
                    Price (Rs.)
                    <input type="number" name="price" defaultValue={service.price} min={0} required />
                  </label>
                </div>
                <label>
                  Sort
                  <input type="number" name="sortOrder" defaultValue={service.sortOrder} />
                </label>
                <label className="inline-check">
                  <input type="checkbox" name="published" defaultChecked={service.published} /> Published
                </label>
                <button className="btn btn-primary" type="submit">
                  Save
                </button>
              </ActionForm>
              <ActionForm action={deleteService}>
                <input type="hidden" name="id" value={service.id} />
                <ConfirmSubmit
                  label="Delete treatment"
                  message="Delete this treatment? If it has appointments it will be unpublished instead."
                />
              </ActionForm>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
