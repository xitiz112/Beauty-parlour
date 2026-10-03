"use client";

import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const links = [
  { href: "/#home", id: "home", label: "Home" },
  { href: "/#services", id: "services", label: "Our Menu" },
  { href: "/#signature", id: "signature", label: "Packages" },
  { href: "/#contact", id: "contact", label: "Availability" },
  { href: "/#gallery", id: "gallery", label: "Gallery" },
  { href: "/#about", id: "about", label: "About" },
];

const SLIDE_MS = 460;

type HeaderProps = {
  shortName: string;
  name: string;
  phone: string;
  phoneHref: string;
};

function measurePill(track: HTMLElement, pill: HTMLElement) {
  const trackRect = track.getBoundingClientRect();
  const pillRect = pill.getBoundingClientRect();
  return {
    left: pillRect.left - trackRect.left,
    width: pillRect.width,
  };
}

export function Header({ shortName, name, phone, phoneHref }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [sectionId, setSectionId] = useState("home");
  const trackRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLSpanElement>(null);
  const sliderMetricsRef = useRef({ left: -1, width: -1 });
  const animatingRef = useRef(false);
  const animTimerRef = useRef<number | null>(null);
  const activeId = sectionId;
  const bookHref = "/#contact";

  useEffect(() => {
    const syncSection = () => setSectionId(window.location.hash.slice(1) || "home");
    syncSection();
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);

  const setSliderPosition = useCallback(
    (left: number, width: number, visible: boolean, animate: boolean) => {
      const slider = sliderRef.current;
      if (!slider) return;

      slider.style.opacity = visible ? "1" : "0";
      slider.style.width = `${width}px`;

      if (!animate) {
        slider.classList.remove("is-animated");
        slider.style.transform = `translate3d(${left}px, 0, 0)`;
        sliderMetricsRef.current = { left, width };
        requestAnimationFrame(() => slider.classList.add("is-animated"));
        return;
      }

      slider.style.transform = `translate3d(${left}px, 0, 0)`;
      sliderMetricsRef.current = { left, width };
    },
    [],
  );

  const moveSliderToPill = useCallback(
    (pill: HTMLElement | null, options: { animate?: boolean; force?: boolean } = {}) => {
      const { animate = true, force = false } = options;
      const track = trackRef.current;
      if (!track || !pill) {
        setSliderPosition(0, 0, false, false);
        return;
      }

      const { left, width } = measurePill(track, pill);
      const prev = sliderMetricsRef.current;
      const unchanged =
        !force &&
        Math.abs(prev.left - left) < 0.5 &&
        Math.abs(prev.width - width) < 0.5;

      if (unchanged) return;

      const shouldAnimate = animate && prev.left >= 0;
      setSliderPosition(left, width, true, shouldAnimate);

      if (!shouldAnimate) return;

      animatingRef.current = true;
      if (animTimerRef.current) window.clearTimeout(animTimerRef.current);
      animTimerRef.current = window.setTimeout(() => {
        animatingRef.current = false;
      }, SLIDE_MS);
    },
    [setSliderPosition],
  );

  const syncSliderToActive = useCallback(
    (options?: { animate?: boolean; force?: boolean }) => {
      const track = trackRef.current;
      if (!track) return;
      const active = track.querySelector<HTMLElement>(`.nav-pill[data-nav-id="${activeId}"]`);
      moveSliderToPill(active, options);
    },
    [activeId, moveSliderToPill],
  );

  useLayoutEffect(() => {
    syncSliderToActive({ animate: false, force: true });
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      syncSliderToActive({ animate: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [syncSliderToActive]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let resizeFrame = 0;
    const onResize = () => {
      if (animatingRef.current) return;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => syncSliderToActive({ animate: false }));
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(resizeFrame);
      if (animTimerRef.current) window.clearTimeout(animTimerRef.current);
    };
  }, [syncSliderToActive]);

  return (
    <header className="site-header" id="site-header">
      <div className="container header-inner">
        <Link className="logo" href="/" aria-label={`${name} home`}>
          <span className="logo-mark">{shortName}</span>
          <span className="logo-sub">Beauty Studio</span>
        </Link>
        <nav className="nav-desktop" aria-label="Primary">
          <div className="nav-pills-track" ref={trackRef}>
            <span className="nav-pills-slider is-animated" ref={sliderRef} aria-hidden />
            {links.map((link) => (
              <Link
                key={link.id}
                className="nav-pill"
                data-nav-id={link.id}
                href={link.href}
                aria-current={activeId === link.id ? "location" : undefined}
                onClick={(event) => {
                  setSectionId(link.id);
                  moveSliderToPill(event.currentTarget, { animate: true });
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="header-actions">
          <a className="header-phone" href={phoneHref}>
            <Phone className="header-phone-icon" aria-hidden="true" />
            {phone}
          </a>
          <Link className="btn btn-primary" href={bookHref}>
            Book an appointment
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
      <nav className={`mobile-nav container${open ? " is-open" : ""}`} id="mobile-nav" aria-label="Mobile">
        <div className="mobile-nav-pills">
          {links.map((link) => (
            <Link
              key={link.id}
              className="nav-pill"
              href={link.href}
              aria-current={activeId === link.id ? "location" : undefined}
              onClick={() => {
                setSectionId(link.id);
                setOpen(false);
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mobile-nav-actions">
          <Link className="nav-pill nav-pill-accent" href={bookHref} onClick={() => setOpen(false)}>
            Book an appointment
          </Link>
          <a className="nav-pill nav-pill-line" href={phoneHref}>
            Call {phone}
          </a>
        </div>
      </nav>
    </header>
  );
}
