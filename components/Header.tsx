"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const links = [
  { href: "/#home", id: "home", label: "Home" },
  { href: "/#services", id: "services", label: "Services" },
  { href: "/#bridal", id: "bridal", label: "Bridal" },
  { href: "/#gallery", id: "gallery", label: "Gallery" },
  { href: "/#about", id: "about", label: "About" },
  { href: "/#contact", id: "contact", label: "Contact" },
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
            <svg className="header-phone-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6.6 3.8c.3-.7 1.1-1.1 1.8-.9l2.2.6c.6.2 1 .7 1.1 1.4l.4 2.4c.1.6-.2 1.2-.7 1.5l-1.3.9a12.6 12.6 0 0 0 5.2 5.2l.9-1.3c.3-.5.9-.8 1.5-.7l2.4.4c.7.1 1.2.5 1.4 1.1l.6 2.2c.2.7-.2 1.5-.9 1.8l-1.6.7c-.8.3-1.6.4-2.4.2C10.2 18.6 5.4 13.8 4.7 7.8c-.2-.8-.1-1.6.2-2.4l.7-1.6Z"
              />
            </svg>
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
            <span></span>
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
