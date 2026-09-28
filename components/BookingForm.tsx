"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createBooking, type ActionState } from "@/lib/actions";
import { formatFromPrice } from "@/lib/time";

type Category = {
  id: string;
  slug: string;
  name: string;
  services: Array<{ id: string; name: string; durationMinutes: number; price: number }>;
};

type Stylist = {
  id: string;
  name: string;
  role: string;
  services: Array<{ serviceId: string }>;
};

type Slot = {
  stylistId: string;
  stylistName: string;
  startsAt: string;
  endsAt: string;
  label: string;
};

const initialState: ActionState = {};

export function BookingForm({
  categories,
  stylists,
  whatsappHref,
  prefill,
  minDate,
}: {
  categories: Category[];
  stylists: Stylist[];
  whatsappHref: string;
  prefill?: { category?: string; treatment?: string; stylist?: string };
  minDate: string;
}) {
  const [state, formAction, pending] = useActionState(createBooking, initialState);
  const startingCategory = categories.find((item) => item.slug === prefill?.category) || categories[0];
  const startingService =
    startingCategory?.services.find((service) => service.name === prefill?.treatment) || startingCategory?.services[0];
  const startingStylist = stylists.find((stylist) => stylist.name === prefill?.stylist);
  const [categorySlug, setCategorySlug] = useState(startingCategory?.slug || "");
  const [serviceId, setServiceId] = useState(startingService?.id || "");
  const [stylistId, setStylistId] = useState(startingStylist?.id || "");
  const [date, setDate] = useState(minDate);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const category = categories.find((item) => item.slug === categorySlug) || categories[0];
  const services = category?.services || [];

  const availableStylists = useMemo(() => {
    if (!serviceId) return stylists;
    return stylists.filter((stylist) => stylist.services.some((row) => row.serviceId === serviceId));
  }, [serviceId, stylists]);

  useEffect(() => {
    if (!category) return;
    const match = category.services.find((service) => service.name === prefill?.treatment);
    setServiceId(match?.id || category.services[0]?.id || "");
  }, [category, prefill?.treatment]);

  useEffect(() => {
    if (!prefill?.stylist) return;
    const match = stylists.find((stylist) => stylist.name === prefill.stylist);
    if (match) setStylistId(match.id);
  }, [prefill?.stylist, stylists]);

  useEffect(() => {
    setSelected(null);
    if (!serviceId || !date) {
      setSlots([]);
      return;
    }
    const params = new URLSearchParams({ date, serviceId });
    if (stylistId) params.set("stylistId", stylistId);
    setLoadingSlots(true);
    fetch(`/api/slots?${params}`)
      .then((response) => response.json())
      .then((payload) => setSlots(payload.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, serviceId, stylistId]);

  const selectedService = services.find((service) => service.id === serviceId);
  const whatsappText = selected
    ? `${whatsappHref}?text=${encodeURIComponent(
        [
          "Appointment request from the Liora website",
          selectedService ? `Treatment: ${selectedService.name}` : "",
          `Stylist: ${selected.stylistName}`,
          `Time: ${selected.label}`,
        ]
          .filter(Boolean)
          .join("\n"),
      )}`
    : whatsappHref;

  if (state.success) {
    return (
      <div className="success is-visible" tabIndex={-1}>
        <h3>Request received.</h3>
        <p>{state.success} Keep your phone nearby.</p>
        <a className="btn btn-light" href={whatsappText}>
          WhatsApp the desk
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate>
      <div className="form-grid">
        <label>
          Full name
          <input type="text" name="name" autoComplete="name" required />
        </label>
        <div className="form-row two">
          <label>
            Phone
            <input type="tel" name="phone" autoComplete="tel" required />
          </label>
          <label>
            Email <span className="muted">(optional)</span>
            <input type="email" name="email" autoComplete="email" />
          </label>
        </div>
        <div className="form-row two">
          <label>
            Service category
            <select value={categorySlug} onChange={(event) => setCategorySlug(event.target.value)}>
              {categories.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Specific treatment
            <select name="serviceId" value={serviceId} onChange={(event) => setServiceId(event.target.value)} required>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} · {service.durationMinutes} min · {formatFromPrice(service.price).replace("From ", "")}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Preferred stylist
          <select value={stylistId} onChange={(event) => setStylistId(event.target.value)}>
            <option value="">Any available chair</option>
            {availableStylists.map((stylist) => (
              <option key={stylist.id} value={stylist.id}>
                {stylist.name} — {stylist.role}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={date} min={minDate} onChange={(event) => setDate(event.target.value)} required />
        </label>
        <div>
          <p className="consent">Open chairs</p>
          {loadingSlots ? <p className="muted">Checking the book…</p> : null}
          {!loadingSlots && slots.length === 0 ? <p className="muted">No open chairs on this date. Try another day or stylist.</p> : null}
          <div className="slot-grid">
            {slots.map((slot) => {
              const active = selected?.startsAt === slot.startsAt && selected.stylistId === slot.stylistId;
              return (
                <button
                  key={`${slot.stylistId}-${slot.startsAt}`}
                  type="button"
                  className={`slot-chip${active ? " is-on" : ""}`}
                  onClick={() => setSelected(slot)}
                >
                  <strong>{slot.label}</strong>
                  <span>{slot.stylistName.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
        <input type="hidden" name="stylistId" value={selected?.stylistId || ""} />
        <input type="hidden" name="startsAt" value={selected?.startsAt || ""} />
        <label>
          Notes
          <textarea name="notes" placeholder="Allergies, reference look, bridal party size" />
        </label>
        {state.error ? <p className="field-error">{state.error}</p> : null}
        <p className="consent">The slot is held as pending until the desk confirms by phone or WhatsApp.</p>
        <button className="btn btn-primary" type="submit" disabled={pending || !selected}>
          {pending ? "Holding the chair…" : "Request appointment"}
        </button>
      </div>
    </form>
  );
}
