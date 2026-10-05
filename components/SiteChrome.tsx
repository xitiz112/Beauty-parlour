import type { StudioSetting } from "@prisma/client";
import { Phone } from "lucide-react";
import type { getBookingOptions, LayoutContent } from "@/lib/data";
import { BookingModal } from "./BookingModal";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { InteractProvider } from "./InteractProvider";
import { Lightbox } from "./Lightbox";
import { WhatsAppIcon } from "./SocialIcons";

export function SiteChrome({
  studio,
  booking,
  layout,
  children,
}: {
  studio: StudioSetting;
  booking: Awaited<ReturnType<typeof getBookingOptions>>;
  layout: LayoutContent;
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header
        shortName={studio.shortName}
        name={studio.name}
        phone={studio.phone}
        phoneHref={studio.phoneHref}
        logoSubtitle={studio.logoSubtitle}
        ctaLabel={studio.headerCtaLabel}
        showPhone={studio.showHeaderPhone}
        navLinks={layout.headerLinks.map(({ id, label, href, newTab, opensBooking }) => ({ id, label, href, newTab, opensBooking }))}
      />
      {children}
      <Footer studio={studio} content={layout} />
      <a className="call-float" href={studio.phoneHref} aria-label={`Call us at ${studio.phone}`}>
        <Phone aria-hidden="true" />
        <span className="whatsapp-float-label">Call us</span>
      </a>
      <a
        className="whatsapp-float"
        href={`${studio.whatsappHref}?text=${encodeURIComponent(`Hello ${studio.name}, I’d like to ask about an appointment.`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
      >
        <WhatsAppIcon />
        <span className="whatsapp-float-label">Chat with us</span>
      </a>
      <Lightbox />
      <BookingModal categories={booking.categories} stylists={booking.stylists} whatsappHref={studio.whatsappHref} />
      <InteractProvider />
    </>
  );
}
