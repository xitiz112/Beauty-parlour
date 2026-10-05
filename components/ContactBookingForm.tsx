"use client";

import { useActionState, useState } from "react";
import { CircleCheck } from "lucide-react";
import { requestAppointment, type ActionState } from "@/lib/actions";

type ContactCategory = {
  id: string;
  slug: string;
  name: string;
  services: Array<{ id: string; name: string }>;
};

type ContactStylist = Pick<import("@prisma/client").Stylist, "id" | "name" | "role">;

// Today in Kathmandu, as YYYY-MM-DD, for the date picker's minimum.
function todayInKathmandu() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kathmandu" }).format(new Date());
}

export function ContactBookingForm({
  categories,
  stylists,
  whatsappHref,
  prefill,
}: {
  categories: ContactCategory[];
  stylists: ContactStylist[];
  whatsappHref: string;
  prefill?: { category?: string; treatment?: string; stylist?: string };
}) {
  const startingCategory = categories.find((item) => item.slug === prefill?.category) || categories[0];
  const [categoryId, setCategoryId] = useState(startingCategory?.id || "");
  const startingService = startingCategory?.services.find((item) => item.name === prefill?.treatment);
  const [serviceId, setServiceId] = useState(startingService?.id || startingCategory?.services[0]?.id || "");
  // Team pages link here with ?stylist=<name>.
  const [stylistId, setStylistId] = useState(stylists.find((item) => item.name === prefill?.stylist)?.id || "");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(requestAppointment, {});
  const [submitted, setSubmitted] = useState<{ name: string; service: string; date: string; time: string } | null>(null);
  const category = categories.find((item) => item.id === categoryId) || categories[0];

  if (state.success && submitted) {
    const message = `Hello, I just requested an appointment on your website: ${submitted.service} on ${submitted.date} at ${submitted.time} (${submitted.name}).`;
    return (
      <div className="contact-booking-form contact-form-done" role="status">
        <CircleCheck className="contact-form-done-icon" aria-hidden="true" />
        <h3>Request received</h3>
        <p>
          Thank you, {submitted.name}. We’ve saved your request for <strong>{submitted.service}</strong> on{" "}
          <strong>{submitted.date}</strong> at <strong>{submitted.time}</strong>. Our team will call or message you to
          confirm.
        </p>
        <p className="contact-form-note">No time slot is reserved until we confirm.</p>
        <a className="btn btn-line" href={`${whatsappHref}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
          Message us on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form
      className="contact-booking-form"
      action={formAction}
      onSubmit={(event) => {
        const form = new FormData(event.currentTarget);
        setSubmitted({
          name: String(form.get("name") || "").trim(),
          service: category?.services.find((item) => item.id === form.get("serviceId"))?.name || "",
          date: String(form.get("date") || ""),
          time: String(form.get("time") || ""),
        });
      }}
    >
      <div className="contact-form-heading">
        <p className="eyebrow">A little time for you</p>
        <h3>Request an appointment</h3>
        <p>Tell us what you have in mind. We’ll confirm the details with you directly.</p>
      </div>
      <div className="contact-form-grid">
        <label>
          Your name
          <input name="name" autoComplete="name" placeholder="Full name" maxLength={80} required />
        </label>
        <label>
          Phone number
          <input name="phone" type="tel" autoComplete="tel" placeholder="+977" maxLength={20} required />
        </label>
        <label>
          Service
          <select
            value={categoryId}
            onChange={(event) => {
              const nextCategory = categories.find((item) => item.id === event.target.value);
              setCategoryId(event.target.value);
              setServiceId(nextCategory?.services[0]?.id || "");
            }}
            required
          >
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Treatment
          <select name="serviceId" value={serviceId} onChange={(event) => setServiceId(event.target.value)} required disabled={!category?.services.length}>
            {category?.services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Preferred date
          <input name="date" type="date" min={todayInKathmandu()} required />
        </label>
        <label>
          Preferred time
          <input name="time" type="time" min="09:00" max="19:00" step={1800} defaultValue="11:00" required />
        </label>
        <label className="contact-form-notes">
          Preferred stylist
          <select name="stylistId" value={stylistId} onChange={(event) => setStylistId(event.target.value)}>
            <option value="">Any available stylist</option>
            {stylists.map((stylist) => (
              <option key={stylist.id} value={stylist.id}>
                {stylist.name} — {stylist.role}
              </option>
            ))}
          </select>
        </label>
        <label className="contact-form-notes">
          Notes <span className="muted">(optional)</span>
          <textarea name="notes" rows={2} maxLength={1000} placeholder="Anything you’d like us to know?" />
        </label>
        {/* Spam trap: hidden from people, filled in by bots. */}
        <label className="contact-form-trap" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state.error ? <p className="field-error" role="alert">{state.error}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send appointment request"}
      </button>
      <p className="contact-form-note">
        No time slot is reserved until our team confirms your request. Prefer to chat?{" "}
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
          WhatsApp us
        </a>
        .
      </p>
    </form>
  );
}
