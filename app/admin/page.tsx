import type { Metadata } from "next";
import Link from "next/link";
import { AppointmentStatus } from "@prisma/client";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
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

  const [appointments, services, stylists, editing] = await Promise.all([
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
  ]);

  return (
    <main>
      <section className="page-hero">
        <p className="eyebrow">Book</p>
        <h1>Today&apos;s chairs</h1>
      </section>
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
                  <form action={deleteAppointment}>
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="date" value={day} />
                    <ConfirmSubmit label="Delete" message="Delete this booking permanently?" />
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
