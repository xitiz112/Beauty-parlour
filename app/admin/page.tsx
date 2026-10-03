import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Images, MessageSquareQuote, PackageOpen, Scissors, Settings2, Sparkles, Users } from "lucide-react";
import { AppointmentStatus } from "@prisma/client";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
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
  searchParams: Promise<{ date?: string; edit?: string; error?: string }>;
}) {
  const { date, edit, error } = await searchParams;
  const day = date || todayISODate();
  const start = new Date(`${day}T00:00:00+05:45`);
  const end = new Date(`${day}T23:59:59+05:45`);

  const [appointments, services, stylists, editing, pendingCount, categoryCount, stylistCount, galleryCount] = await Promise.all([
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
    edit
      ? prisma.appointment.findUnique({
          where: { id: edit },
          include: { service: true, stylist: true },
        })
      : Promise.resolve(null),
    prisma.appointment.count({ where: { status: "pending" } }),
    prisma.serviceCategory.count(),
    prisma.stylist.count({ where: { published: true } }),
    prisma.galleryItem.count({ where: { published: true } }),
  ]);

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
            <h2 id="admin-booking-title">Today&apos;s chairs</h2>
          </div>
        </div>
      {error ? <p className="field-error">{error}</p> : null}

      <ActionForm action={saveAppointment}>
        <h2>{editing ? "Edit booking" : "New booking"}</h2>
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
        <div className="form-row two">
          <label>
            Guest name
            <input name="guestName" defaultValue={editing?.guestName || ""} required />
          </label>
          <label>
            Phone
            <input name="phone" defaultValue={editing?.phone || ""} required />
          </label>
        </div>
        <label>
          Email
          <input type="email" name="email" defaultValue={editing?.email || ""} />
        </label>
        <div className="form-row two">
          <label>
            Treatment
            <select name="serviceId" defaultValue={editing?.serviceId || ""} required>
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
            <select name="stylistId" defaultValue={editing?.stylistId || ""} required>
              <option value="">Choose chair</option>
              {stylists.map((stylist) => (
                <option key={stylist.id} value={stylist.id}>
                  {stylist.name}
                  {stylist.published ? "" : " (hidden)"}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row two">
          <label>
            Date
            <input type="date" name="date" defaultValue={editing ? kathmanduISODate(editing.startsAt) : day} required />
          </label>
          <label>
            Start time
            <input type="time" name="time" defaultValue={editing ? kathmanduHM(editing.startsAt) : "10:00"} required />
          </label>
        </div>
        <label>
          Status
          <select name="status" defaultValue={editing?.status || "pending"}>
            {allStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Notes
          <textarea name="notes" defaultValue={editing?.notes || ""} />
        </label>
        <MediaField initialMediaUrls={editing?.mediaUrls || []} label="Booking attachments" />
        <div className="admin-actions">
          <button className="btn btn-primary" type="submit">
            {editing ? "Update booking" : "Create booking"}
          </button>
          {editing ? (
            <Link className="btn btn-line" href={`/admin?date=${day}`}>
              Cancel edit
            </Link>
          ) : null}
        </div>
      </ActionForm>

      <form className="admin-form" method="get">
        <label>
          Date
          <input type="date" name="date" defaultValue={day} />
        </label>
        <button className="btn btn-line" type="submit">
          Show day
        </button>
      </form>
      {appointments.length === 0 ? <p className="muted">No appointments on this date.</p> : null}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Guest</th>
            <th>Chair</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((row) => (
            <tr key={row.id}>
              <td>
                {formatTime(row.startsAt)}–{formatTime(row.endsAt)}
                <div className="muted">{formatDate(row.startsAt)}</div>
              </td>
              <td>
                <strong>{row.guestName}</strong>
                <div>{row.phone}</div>
                {row.email ? <div className="muted">{row.email}</div> : null}
                {row.notes ? <div className="muted">{row.notes}</div> : null}
              </td>
              <td>
                {row.stylist.name}
                <div className="muted">{row.service.name}</div>
              </td>
              <td className={`status-${row.status}`}>{row.status}</td>
              <td>
                <div className="admin-actions">
                  <Link className="btn btn-line" href={`/admin?date=${day}&edit=${row.id}`}>
                    Edit
                  </Link>
                  {actions
                    .filter((status) => status !== row.status)
                    .map((status) => (
                      <form key={status} action={updateAppointmentStatus}>
                        <input type="hidden" name="id" value={row.id} />
                        <input type="hidden" name="status" value={status} />
                        <input type="hidden" name="date" value={day} />
                        <button className="btn btn-line" type="submit">
                          {status}
                        </button>
                      </form>
                    ))}
                  <ActionForm action={deleteAppointment}>
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="date" value={day} />
                    <ConfirmSubmit
                      label="Delete"
                      message={`Permanently delete the appointment for ${row.guestName}?`}
                    />
                  </ActionForm>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </section>
    </main>
  );
}
