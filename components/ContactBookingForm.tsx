"use client";

import { useState, type FormEvent } from "react";

type ContactCategory = {
  id: string;
  slug: string;
  name: string;
  services: Array<{ id: string; name: string }>;
};

type ContactStylist = Pick<import("@prisma/client").Stylist, "id" | "name" | "role">;

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
  const [stylistName, setStylistName] = useState(prefill?.stylist || "");
  const [submitted, setSubmitted] = useState(false);
  const category = categories.find((item) => item.id === categoryId) || categories[0];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const service = category?.services.find((item) => item.id === String(form.get("serviceId")));
    const message = [
      "Hello Liora Beauty Studio, I’d like to request an appointment.",
      `Name: ${String(form.get("name") || "").trim()}`,
      `Phone: ${String(form.get("phone") || "").trim()}`,
      `Service: ${service?.name || "Not selected"}`,
      `Preferred date: ${String(form.get("date") || "Flexible")}`,
      `Preferred stylist: ${String(form.get("stylist") || "Any available stylist")}`,
      form.get("notes") ? `Notes: ${String(form.get("notes"))}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`${whatsappHref}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  }

  return (
    <form className="contact-booking-form" onSubmit={handleSubmit}>
      <div className="contact-form-heading">
        <p className="eyebrow">A little time for you</p>
        <h3>Request an appointment</h3>
        <p>Tell us what you have in mind. We’ll confirm the details with you directly.</p>
      </div>
      <div className="contact-form-grid">
        <label>
          Your name
          <input name="name" autoComplete="name" placeholder="Full name" required />
        </label>
        <label>
          Phone number
          <input name="phone" type="tel" autoComplete="tel" placeholder="+977" required />
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
          <input name="date" type="date" min={new Date().toISOString().slice(0, 10)} />
        </label>
        <label>
          Preferred stylist
          <select name="stylist" value={stylistName} onChange={(event) => setStylistName(event.target.value)}>
            <option value="">Any available stylist</option>
            {stylists.map((stylist) => (
              <option key={stylist.id} value={stylist.name}>
                {stylist.name} — {stylist.role}
              </option>
            ))}
          </select>
        </label>
        <label className="contact-form-notes">
          Notes <span className="muted">(optional)</span>
          <textarea name="notes" rows={2} placeholder="Anything you’d like us to know?" />
        </label>
      </div>
      {submitted ? <p className="contact-form-confirmation" role="status">Your request is ready in WhatsApp. Send the message to confirm with our team.</p> : null}
      <button className="btn btn-primary" type="submit">
        Send appointment request
      </button>
      <p className="contact-form-note">No time slot is reserved until our team confirms your request.</p>
    </form>
  );
}
