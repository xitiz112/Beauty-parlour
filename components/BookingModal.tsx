"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { ContactBookingForm } from "./ContactBookingForm";

type FormProps = ComponentProps<typeof ContactBookingForm>;
type Prefill = NonNullable<FormProps["prefill"]>;

/**
 * Opens the appointment form in a popup for any link marked with `data-book`.
 * The link's own query string (?category=&treatment=&stylist=) pre-fills the form,
 * and without JavaScript the link still falls back to the #contact section.
 */
export function BookingModal({ categories, stylists, whatsappHref }: Omit<FormProps, "prefill">) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [prefill, setPrefill] = useState<Prefill>({});
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[data-book]");
      const dialog = dialogRef.current;
      if (!link || !dialog) return;

      event.preventDefault();
      const params = new URL(link.href, window.location.href).searchParams;
      setPrefill({
        category: params.get("category") || undefined,
        treatment: params.get("treatment") || undefined,
        stylist: params.get("stylist") || undefined,
      });
      setOpenCount((count) => count + 1); // remount the form so it starts fresh
      if (!dialog.open) dialog.showModal();
    };

    // Capture phase, so this runs before Next.js <Link> navigates.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className="booking-modal"
      aria-label="Request an appointment"
      onClick={(event) => {
        if (event.target === event.currentTarget) close(); // backdrop click
      }}
    >
      <div className="booking-modal-panel">
        <button className="booking-modal-close" type="button" aria-label="Close" onClick={close}>
          <X aria-hidden="true" />
        </button>
        <ContactBookingForm
          key={openCount}
          categories={categories}
          stylists={stylists}
          whatsappHref={whatsappHref}
          prefill={prefill}
        />
      </div>
    </dialog>
  );
}
