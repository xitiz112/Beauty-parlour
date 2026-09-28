import type { ServiceCategory, StudioSetting, Stylist, StylistService } from "@prisma/client";
import { todayISODate } from "@/lib/time";
import { BookingForm } from "./BookingForm";

type CategoryWithServices = ServiceCategory & {
  services: Array<{ id: string; name: string; durationMinutes: number; price: number }>;
};

type StylistWithServices = Stylist & { services: StylistService[] };

export function BookingSection({
  studio,
  categories,
  stylists,
  prefill,
}: {
  studio: StudioSetting;
  categories: CategoryWithServices[];
  stylists: StylistWithServices[];
  prefill?: { category?: string; treatment?: string; stylist?: string };
}) {
  return (
    <section className="section booking" id="book">
      <div className="container book-split">
        <div className="book-panel">
          <p className="eyebrow">Visit</p>
          <h2>Book your visit</h2>
          <p>Pick a real open chair. The slot is held until we confirm by phone or WhatsApp.</p>
          <ul className="hours-list">
            <li>
              <span>Sunday–Friday</span>
              <span>10:00 AM – 7:00 PM</span>
            </li>
            <li>
              <span>Saturday</span>
              <span>9:00 AM – 6:00 PM</span>
            </li>
          </ul>
          <p>{studio.walkIns}</p>
          <div className="form-actions">
            <a className="btn btn-ghost" href={studio.phoneHref}>
              Call the studio
            </a>
            <a className="btn btn-light" href={studio.whatsappHref}>
              WhatsApp us
            </a>
          </div>
        </div>
        <div className="form-card">
          <BookingForm
            categories={categories}
            stylists={stylists}
            whatsappHref={studio.whatsappHref}
            prefill={prefill}
            minDate={todayISODate()}
          />
        </div>
      </div>
    </section>
  );
}
