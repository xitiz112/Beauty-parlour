import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Images, MessageSquareQuote, PackageOpen, Scissors, Settings2, Sparkles, Users } from "lucide-react";
import { AppointmentStatus } from "@prisma/client";
import { ActionForm } from "@/components/admin/ActionForm";
import { FormActions } from "@/components/admin/AdminList";
import { editorKeys, MasterDetail, resolveSelection, type MDGroup } from "@/components/admin/MasterDetail";
import { MediaField } from "@/components/admin/MediaField";
import { deleteAppointment, saveAppointment, updateAppointmentStatus } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime, kathmanduHM, kathmanduISODate, todayISODate } from "@/lib/time";

export const metadata: Metadata = { title: "Desk bookings" };

const actions: AppointmentStatus[] = ["confirmed", "cancelled", "completed", "no_show"];
const allStatuses: AppointmentStatus[] = ["pending", "confirmed", "cancelled", "completed", "no_show"];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; edit?: string; error?: string; group?: string }>;
}) {
  const { date, edit, error, group } = await searchParams;
  const day = date || todayISODate();
  const start = new Date(`${day}T00:00:00+05:45`);
  const end = new Date(`${day}T23:59:59+05:45`);

  const [appointments, services, stylists, editing, pendingCount, categoryCount, stylistCount, galleryCount, requests] = await Promise.all([
    prisma.appointment.findMany({
      where: { startsAt: { gte: start, lte: end } },
      include: { service: true, stylist: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.service.findMany({
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: { category: true },
    }),
    prisma.stylist.findMany({ orderBy: { sortOrder: "asc" } }),
    edit && edit !== "new"
      ? prisma.appointment.findUnique({
          where: { id: edit },
          include: { service: true, stylist: true },
        })
      : Promise.resolve(null),
    prisma.appointment.count({ where: { status: "pending" } }),
    prisma.serviceCategory.count(),
    prisma.stylist.count({ where: { published: true } }),
    prisma.galleryItem.count({ where: { published: true } }),
    // Every pending request, whatever day it's for, so new website requests are easy to find.
    prisma.appointment.findMany({
      where: { status: "pending" },
      include: { service: true, stylist: true },
      orderBy: [{ startsAt: "asc" }],
    }),
  ]);

  // A booking opened by link may sit on another day; keep it visible in the list.
  const showingRequests = group === "requests";
  const dayRows =
    !showingRequests && editing && !appointments.some((row) => row.id === editing.id) ? [editing, ...appointments] : appointments;
  const toItem = (row: (typeof appointments)[number], withDate: boolean) => ({
    id: row.id,
    title: row.guestName,
    subtitle: `${row.service.name} · ${row.stylist?.name ?? "Any stylist"}`,
    meta: withDate
      ? `${formatDate(row.startsAt)} ${formatTime(row.startsAt)}`
      : `${formatTime(row.startsAt)} · ${row.status.replace("_", " ")}`,
  });
  const groups: MDGroup[] = [
    { key: "day", label: "Day", noun: "booking", items: dayRows.map((row) => toItem(row, false)) },
    { key: "requests", label: "Requests", noun: "booking", items: requests.map((row) => toItem(row, true)) },
  ];
  const selection = resolveSelection(groups, { group, edit });
  const rows = showingRequests ? requests : dayRows;
  const booking = rows.find((row) => row.id === selection.item?.id);
  const { key, deleteFormId } = editorKeys(selection);

  const managementLinks = [
    { href: "/admin/services", label: "Services & menu", detail: `${categoryCount} categories`, icon: Scissors },
    { href: "/admin/team", label: "Studio team", detail: `${stylistCount} published stylists`, icon: Users },
    { href: "/admin/gallery", label: "Gallery", detail: `${galleryCount} published looks`, icon: Images },
    { href: "/admin/reviews", label: "Guest reviews", detail: "Manage testimonials", icon: MessageSquareQuote },
    { href: "/admin/content", label: "Offers & packages", detail: "Homepage content", icon: PackageOpen },
    { href: "/admin/settings", label: "Studio settings", detail: "Contact and site details", icon: Settings2 },
  ];

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">STUDIO DESK</p>
        <h1>Good to see you.</h1>
        <p className="muted">Your studio overview and daily booking desk.</p>
      </section>
      <section className="admin-overview" aria-label="Studio overview">
        <article className="admin-stat-card">
          <span><CalendarDays aria-hidden="true" /></span>
          <div><strong>{appointments.length}</strong><p>Bookings today</p></div>
        </article>
        <article className="admin-stat-card">
          <span><Sparkles aria-hidden="true" /></span>
          <div><strong>{pendingCount}</strong><p>Awaiting confirmation</p></div>
        </article>
        <article className="admin-stat-card">
          <span><Scissors aria-hidden="true" /></span>
          <div><strong>{services.length}</strong><p>Menu treatments</p></div>
        </article>
      </section>

      <section className="admin-management" aria-labelledby="admin-management-title">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">MANAGE YOUR STUDIO</p>
            <h2 id="admin-management-title">Your workspace</h2>
          </div>
          <Link href="/admin/users">Manage desk users <Users aria-hidden="true" size={16} /></Link>
        </div>
        <div className="admin-management-grid">
          {managementLinks.map(({ href, label, detail, icon: Icon }) => (
            <Link className="admin-management-card" href={href} key={href}>
              <span className="admin-management-icon"><Icon aria-hidden="true" /></span>
              <span><strong>{label}</strong><small>{detail}</small></span>
              <span className="admin-management-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-booking-desk" aria-labelledby="admin-booking-title">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">BOOKINGS</p>
            <h2 id="admin-booking-title">{day === todayISODate() ? "Today’s chairs" : `Chairs on ${formatDate(start)}`}</h2>
          </div>
        </div>
        {error ? <p className="field-error">{error}</p> : null}

        <MasterDetail
          basePath="/admin"
          groups={groups}
          selection={selection}
          extraParams={{ date: day }}
          listHeader={
            showingRequests ? (
              <p className="admin-note">Pending requests for any day, oldest first. Confirm or cancel each one.</p>
            ) : (
            <form className="md-date" method="get">
              <input type="date" name="date" defaultValue={day} aria-label="Show bookings on" />
              <button className="btn btn-line" type="submit">
                Show
              </button>
            </form>
            )
          }
          editorTitle={booking ? booking.guestName : "New booking"}
          editorActions={
            booking ? <span className={`admin-status status-${booking.status}`}>{booking.status.replace("_", " ")}</span> : null
          }
        >
          {booking ? (
            <p className="admin-note">
              For {formatDate(booking.startsAt)} at {formatTime(booking.startsAt)} · received {formatDate(booking.createdAt)}
              {booking.stylistId ? "" : " · no stylist chosen yet — pick one below before confirming"}
            </p>
          ) : null}
          {booking ? (
            <div className="admin-status-actions" aria-label="Change status">
              <span className="muted">Mark as</span>
              {actions
                .filter((status) => status !== booking.status)
                .map((status) => (
                  <form key={status} action={updateAppointmentStatus}>
                    <input type="hidden" name="id" value={booking.id} />
                    <input type="hidden" name="status" value={status} />
                    <input type="hidden" name="date" value={day} />
                    <input type="hidden" name="group" value={selection.group.key} />
                    <button className="btn btn-line" type="submit">
                      {status.replace("_", " ")}
                    </button>
                  </form>
                ))}
            </div>
          ) : null}

          <ActionForm key={key} action={saveAppointment}>
            {booking ? <input type="hidden" name="id" value={booking.id} /> : null}
            <div className="admin-fields">
              <label>
                Guest name
                <input name="guestName" defaultValue={booking?.guestName || ""} required />
              </label>
              <label>
                Phone
                <input name="phone" defaultValue={booking?.phone || ""} required />
              </label>
              <label className="is-wide">
                Email
                <input type="email" name="email" defaultValue={booking?.email || ""} />
              </label>
              <label>
                Treatment
                <select name="serviceId" defaultValue={booking?.serviceId || ""} required>
                  <option value="">Choose treatment</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.category.name} — {service.name}
                      {service.published ? "" : " (hidden)"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Stylist
                <select name="stylistId" defaultValue={booking?.stylistId || ""} required>
                  <option value="">{booking && !booking.stylistId ? "Any stylist — assign one" : "Choose chair"}</option>
                  {stylists.map((stylist) => (
                    <option key={stylist.id} value={stylist.id}>
                      {stylist.name}
                      {stylist.published ? "" : " (hidden)"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Date
                <input type="date" name="date" defaultValue={booking ? kathmanduISODate(booking.startsAt) : day} required />
              </label>
              <label>
                Start time
                <input type="time" name="time" defaultValue={booking ? kathmanduHM(booking.startsAt) : "10:00"} required />
              </label>
              <label>
                Status
                <select name="status" defaultValue={booking?.status || "pending"}>
                  {allStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="is-wide">
                Notes
                <textarea name="notes" defaultValue={booking?.notes || ""} rows={3} />
              </label>
            </div>
            <MediaField initialMediaUrls={booking?.mediaUrls || []} label="Booking attachments" />
            <FormActions
              saveLabel={booking ? "Save booking" : "Create booking"}
              deleteFormId={booking ? deleteFormId : undefined}
              deleteMessage={`Permanently delete the appointment for ${booking?.guestName ?? "this guest"}?`}
            />
          </ActionForm>
          {booking ? (
            <ActionForm key={`delete-${selection.group.key}`} id={deleteFormId} action={deleteAppointment} className="admin-delete-form">
              <input type="hidden" name="id" value={booking.id} />
              <input type="hidden" name="date" value={day} />
              <input type="hidden" name="group" value={selection.group.key} />
            </ActionForm>
          ) : null}
        </MasterDetail>
      </section>
    </main>
  );
}
