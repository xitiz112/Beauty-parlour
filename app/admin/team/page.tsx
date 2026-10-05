import type { Metadata } from "next";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminItem, FormActions } from "@/components/admin/AdminList";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { editorKeys, MasterDetail, resolveSelection, type MDGroup } from "@/components/admin/MasterDetail";
import { MediaField } from "@/components/admin/MediaField";
import { WEEKDAYS } from "@/lib/admin";
import { deleteStylist, deleteWorkingHour, saveStylist, saveStylistServiceMedia, saveWorkingHour } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { minutesToTime } from "@/lib/time";

export const metadata: Metadata = { title: "Desk team" };

const BASE = "/admin/team";

function DaySelect({ defaultValue }: { defaultValue: number }) {
  return (
    <select name="dayOfWeek" defaultValue={defaultValue} aria-label="Day">
      {WEEKDAYS.map((day, index) => (
        <option key={day} value={index}>
          {day}
        </option>
      ))}
    </select>
  );
}

export default async function AdminTeamPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const [stylists, categories] = await Promise.all([
    prisma.stylist.findMany({
      orderBy: { sortOrder: "asc" },
      include: { hours: { orderBy: { dayOfWeek: "asc" } }, services: true },
    }),
    prisma.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { services: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);
  const allServices = categories.flatMap((category) =>
    category.services.map((service) => ({ ...service, categoryName: category.name })),
  );

  const groups: MDGroup[] = [
    {
      key: "stylists",
      label: "Stylists",
      noun: "stylist",
      items: stylists.map((stylist) => ({
        id: stylist.id,
        title: stylist.name,
        subtitle: stylist.role,
        thumb: stylist.image,
        hidden: !stylist.published,
      })),
    },
  ];
  const selection = resolveSelection(groups, params);
  const stylist = stylists.find((entry) => entry.id === selection.item?.id);
  const { key, deleteFormId } = editorKeys(selection);
  const assigned = new Set(stylist?.services.map((row) => row.serviceId));
  const freeDay = WEEKDAYS.findIndex((_, day) => !stylist?.hours.some((hour) => hour.dayOfWeek === day));

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">People</p>
        <h1>Team</h1>
      </section>

      <MasterDetail basePath={BASE} groups={groups} selection={selection}>
        <ActionForm key={key} action={saveStylist} createdHref={`${BASE}?edit=`}>
          {stylist ? <input type="hidden" name="id" value={stylist.id} /> : null}
          <div className="admin-fields">
            <label>
              Name
              <input name="name" defaultValue={stylist?.name} required />
            </label>
            {stylist ? (
              <label>
                Slug <span className="muted">(used in links)</span>
                <input name="slug" defaultValue={stylist.slug} />
              </label>
            ) : null}
            <label>
              Role
              <input name="role" defaultValue={stylist?.role} required />
            </label>
            <label>
              Specialty
              <input name="specialty" defaultValue={stylist?.specialty} required />
            </label>
            <label>
              Order
              <input type="number" name="sortOrder" defaultValue={stylist?.sortOrder ?? stylists.length + 1} />
            </label>
          </div>
          <MediaField
            label="Photos"
            primaryFields={[{ name: "image", label: "Profile photo", initialValue: stylist?.image ?? "", required: true }]}
            initialMediaUrls={stylist?.mediaUrls}
          />
          <label className="inline-check">
            <input type="checkbox" name="published" defaultChecked={stylist?.published ?? true} /> Published on the site
          </label>
          <fieldset className="admin-fieldset">
            <legend>Treatments they offer</legend>
            <div className="admin-checks">
              {allServices.map((service) => (
                <label key={service.id}>
                  <input type="checkbox" name="serviceIds" value={service.id} defaultChecked={assigned.has(service.id)} />
                  {service.categoryName} — {service.name}
                </label>
              ))}
            </div>
          </fieldset>
          {!stylist ? <p className="admin-note">New stylists start with the studio’s default weekly hours.</p> : null}
          <FormActions
            saveLabel={stylist ? "Save changes" : "Add stylist"}
            deleteFormId={stylist ? deleteFormId : undefined}
            deleteMessage="Delete this stylist? Pending or confirmed bookings will block this."
          />
        </ActionForm>
        {stylist ? (
          <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteStylist} className="admin-delete-form" successHref={BASE}>
            <input type="hidden" name="id" value={stylist.id} />
          </ActionForm>
        ) : null}

        {stylist ? (
          <section className="md-subsection" key={`hours-${key}`}>
            <h3>Working hours</h3>
            <p className="muted">One row per working day. Days without a row are days off.</p>
            <div className="admin-hours">
              {stylist.hours.map((hour) => (
                <div className="admin-hours-row" key={hour.id}>
                  <ActionForm action={saveWorkingHour} className="admin-hours-form">
                    <input type="hidden" name="id" value={hour.id} />
                    <input type="hidden" name="stylistId" value={stylist.id} />
                    <input type="hidden" name="mediaUrls" value={JSON.stringify(hour.mediaUrls)} />
                    <DaySelect defaultValue={hour.dayOfWeek} />
                    <input type="time" name="startMin" defaultValue={minutesToTime(hour.startMin)} aria-label="Start" />
                    <input type="time" name="endMin" defaultValue={minutesToTime(hour.endMin)} aria-label="End" />
                    <button className="btn btn-line" type="submit">
                      Save
                    </button>
                    <ConfirmSubmit
                      form={`delete-hour-${hour.id}`}
                      className="admin-delete-button"
                      label="Remove"
                      message={`Remove ${WEEKDAYS[hour.dayOfWeek]} hours?`}
                    />
                  </ActionForm>
                  <ActionForm id={`delete-hour-${hour.id}`} action={deleteWorkingHour} className="admin-delete-form">
                    <input type="hidden" name="id" value={hour.id} />
                  </ActionForm>
                </div>
              ))}
              {freeDay >= 0 ? (
                <ActionForm action={saveWorkingHour} className="admin-hours-form admin-hours-add">
                  <input type="hidden" name="stylistId" value={stylist.id} />
                  <DaySelect defaultValue={freeDay} />
                  <input type="time" name="startMin" defaultValue="10:00" aria-label="Start" />
                  <input type="time" name="endMin" defaultValue="19:00" aria-label="End" />
                  <button className="btn btn-primary" type="submit">
                    Add day
                  </button>
                </ActionForm>
              ) : null}
            </div>
          </section>
        ) : null}

        {stylist && stylist.services.length ? (
          <section className="md-subsection" key={`portfolio-${key}`}>
            <h3>Treatment portfolio</h3>
            <p className="muted">Photos of this stylist’s work for each treatment they offer.</p>
            <div className="admin-list">
              {stylist.services.map((link) => {
                const service = allServices.find((item) => item.id === link.serviceId);
                if (!service) return null;
                return (
                  <AdminItem
                    key={link.serviceId}
                    title={`${service.categoryName} — ${service.name}`}
                    subtitle={`${link.mediaUrls.length} photo${link.mediaUrls.length === 1 ? "" : "s"}`}
                    thumb={link.mediaUrls[0]}
                  >
                    <ActionForm action={saveStylistServiceMedia} className="admin-form admin-form-flat">
                      <input type="hidden" name="stylistId" value={stylist.id} />
                      <input type="hidden" name="serviceId" value={link.serviceId} />
                      <MediaField initialMediaUrls={link.mediaUrls} label="Portfolio photos" />
                      <FormActions saveLabel="Save photos" />
                    </ActionForm>
                  </AdminItem>
                );
              })}
            </div>
          </section>
        ) : null}
      </MasterDetail>
    </main>
  );
}
