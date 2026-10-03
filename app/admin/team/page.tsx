import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { MediaField } from "@/components/admin/MediaField";
import { WEEKDAYS } from "@/lib/admin";
import { deleteStylist, deleteWorkingHour, saveStylist, saveStylistServiceMedia, saveWorkingHour } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { minutesToTime } from "@/lib/time";

export const metadata: Metadata = { title: "Desk team" };

export default async function AdminTeamPage() {
  const [stylists, categories] = await Promise.all([
    prisma.stylist.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        hours: { orderBy: { dayOfWeek: "asc" } },
        services: true,
      },
    }),
    prisma.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { services: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  const allServices = categories.flatMap((category) =>
    category.services.map((service) => ({ ...service, categoryName: category.name })),
  );

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">People</p>
        <h1>Chairs</h1>
      </section>

      <ActionForm action={saveStylist}>
        <h2>Add stylist</h2>
        <label>
          Name
          <input name="name" required />
        </label>
        <div className="form-row two">
          <label>
            Role
            <input name="role" required />
          </label>
          <label>
            Specialty
            <input name="specialty" required />
          </label>
        </div>
        <MediaField primaryName="image" primaryRequired />
        <label>
          Sort
          <input type="number" name="sortOrder" defaultValue={stylists.length + 1} />
        </label>
        <label className="inline-check">
          <input type="checkbox" name="published" defaultChecked /> Published
        </label>
        <p className="muted">Treatments they offer</p>
        <div className="admin-checks">
          {allServices.map((service) => (
            <label key={service.id}>
              <input type="checkbox" name="serviceIds" value={service.id} />
              {service.categoryName} — {service.name}
            </label>
          ))}
        </div>
        <button className="btn btn-primary" type="submit">
          Add stylist
        </button>
      </ActionForm>

      {stylists.map((stylist) => {
        const assigned = new Set(stylist.services.map((row) => row.serviceId));
        return (
          <section className="price-block" key={stylist.id}>
            <ActionForm action={saveStylist}>
              <input type="hidden" name="id" value={stylist.id} />
              <label>
                Name
                <input name="name" defaultValue={stylist.name} required />
              </label>
              <label>
                Slug
                <input name="slug" defaultValue={stylist.slug} />
              </label>
              <label>
                Role
                <input name="role" defaultValue={stylist.role} required />
              </label>
              <label>
                Specialty
                <input name="specialty" defaultValue={stylist.specialty} required />
              </label>
              <MediaField primaryName="image" initialPrimary={stylist.image} initialMediaUrls={stylist.mediaUrls} primaryRequired />
              <label>
                Sort
                <input type="number" name="sortOrder" defaultValue={stylist.sortOrder} />
              </label>
              <label className="inline-check">
                <input type="checkbox" name="published" defaultChecked={stylist.published} /> Published
              </label>
              <p className="muted">Treatments they offer</p>
              <div className="admin-checks">
                {allServices.map((service) => (
                  <label key={service.id}>
                    <input
                      type="checkbox"
                      name="serviceIds"
                      value={service.id}
                      defaultChecked={assigned.has(service.id)}
                    />
                    {service.categoryName} — {service.name}
                  </label>
                ))}
              </div>
              <button className="btn btn-primary" type="submit">
                Save stylist
              </button>
            </ActionForm>
            <ActionForm action={deleteStylist}>
              <input type="hidden" name="id" value={stylist.id} />
              <ConfirmSubmit
                label="Delete stylist"
                message="Delete this stylist? Pending or confirmed bookings will block this."
              />
            </ActionForm>

            <h3>Treatment portfolio media</h3>
            {stylist.services.map((serviceLink) => {
              const service = allServices.find((item) => item.id === serviceLink.serviceId);
              if (!service) return null;
              return (
                <ActionForm action={saveStylistServiceMedia} key={serviceLink.serviceId}>
                  <input type="hidden" name="stylistId" value={stylist.id} />
                  <input type="hidden" name="serviceId" value={serviceLink.serviceId} />
                  <MediaField initialMediaUrls={serviceLink.mediaUrls} label={`${service.categoryName} — ${service.name} media`} />
                  <button className="btn btn-line" type="submit">Save portfolio media</button>
                </ActionForm>
              );
            })}

            {stylist.hours.map((hour) => (
              <div key={hour.id}>
                <ActionForm action={saveWorkingHour}>
                  <input type="hidden" name="id" value={hour.id} />
                  <input type="hidden" name="stylistId" value={stylist.id} />
                  <label>
                    Day
                    <select name="dayOfWeek" defaultValue={hour.dayOfWeek}>
                      {WEEKDAYS.map((day, index) => (
                        <option key={day} value={index}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="form-row two">
                    <label>
                      Start
                      <input type="time" name="startMin" defaultValue={minutesToTime(hour.startMin)} />
                    </label>
                    <label>
                      End
                      <input type="time" name="endMin" defaultValue={minutesToTime(hour.endMin)} />
                    </label>
                  </div>
                  <MediaField initialMediaUrls={hour.mediaUrls} label="Working-hour media" />
                  <button className="btn btn-line" type="submit">
                    Save hours
                  </button>
                </ActionForm>
                <ActionForm action={deleteWorkingHour}>
                  <input type="hidden" name="id" value={hour.id} />
                  <ConfirmSubmit label="Remove day" message={`Remove ${WEEKDAYS[hour.dayOfWeek]} hours?`} />
                </ActionForm>
              </div>
            ))}

            <ActionForm action={saveWorkingHour}>
              <input type="hidden" name="stylistId" value={stylist.id} />
              <h3>Add hours</h3>
              <label>
                Day
                <select name="dayOfWeek" defaultValue={1}>
                  {WEEKDAYS.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-row two">
                <label>
                  Start
                  <input type="time" name="startMin" defaultValue="10:00" />
                </label>
                <label>
                  End
                  <input type="time" name="endMin" defaultValue="19:00" />
                </label>
              </div>
              <MediaField label="Working-hour media" />
              <button className="btn btn-line" type="submit">
                Add hours
              </button>
            </ActionForm>
          </section>
        );
      })}
    </main>
  );
}
