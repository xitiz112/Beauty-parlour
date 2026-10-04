"use client";

import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export type HeaderLink = { id: string; label: string; href: string; newTab: boolean; opensBooking: boolean };

// "/#services" → "services" (the page section it scrolls to); other links use their href.
function navIdFor(href: string) {
  const hash = href.indexOf("#");
  return hash >= 0 ? href.slice(hash + 1) : href;
}

const SLIDE_MS = 460;

type HeaderProps = {
  shortName: string;
  name: string;
  phone: string;
  phoneHref: string;
  logoSubtitle: string;
  ctaLabel: string;
  showPhone: boolean;
  navLinks: HeaderLink[];
};

function measurePill(track: HTMLElement, pill: HTMLElement) {
  const trackRect = track.getBoundingClientRect();
  const pillRect = pill.getBoundingClientRect();
  return {
    left: pillRect.left - trackRect.left,
    width: pillRect.width,
  };
}

export function Header({ shortName, name, phone, phoneHref, logoSubtitle, ctaLabel, showPhone, navLinks }: HeaderProps) {
  const links = useMemo(
    () => navLinks.map((link) => ({ ...link, key: link.id, id: navIdFor(link.href) })),
    [navLinks],
  );
  const [open, setOpen] = useState(false);
  const [sectionId, setSectionId] = useState("home");
  const trackRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLSpanElement>(null);
  const sliderMetricsRef = useRef({ left: -1, width: -1 });
  const animatingRef = useRef(false);
  const animTimerRef = useRef<number | null>(null);
  const scrollLockUntilRef = useRef(0);
  const activeId = sectionId;
  const bookHref = "/#contact";

  // Mobile menu: close on Escape, and when the screen grows past the phone layout.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const wide = window.matchMedia("(min-width: 600px)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  useEffect(() => {
    const syncSection = () => setSectionId(window.location.hash.slice(1) || "home");
    syncSection();
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);

  // Follow the section in view while scrolling. Paused briefly after a click so the
  // slider goes straight to the clicked link instead of stepping through each section.
  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.id))
      .filter((section): section is HTMLElement => section !== null);
    if (sections.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      if (Date.now() < scrollLockUntilRef.current) return;

      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setSectionId(sections[sections.length - 1].id);
        return;
      }

      const line = window.innerHeight * 0.35;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      }
      setSectionId(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [links]);

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
      const active = track.querySelector<HTMLElement>(`.nav-pill[data-nav-id="${CSS.escape(activeId)}"]`);
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
    <header className="site-header" id="site-header" data-menu-open={open || undefined}>
      <div className="container header-inner">
        <Link className="logo" href="/" aria-label={`${name} home`}>
          <span className="logo-mark">{shortName}</span>
          <span className="logo-sub">{logoSubtitle}</span>
        </Link>
        <nav className="nav-desktop" aria-label="Primary">
          <div className="nav-pills-track" ref={trackRef}>
            <span className="nav-pills-slider is-animated" ref={sliderRef} aria-hidden />
            {links.map((link) => (
              <Link
                key={link.key}
                className="nav-pill"
                data-nav-id={link.id}
                href={link.href}
                target={link.newTab ? "_blank" : undefined}
                rel={link.newTab ? "noopener noreferrer" : undefined}
                data-book={link.opensBooking || undefined}
                aria-current={activeId === link.id ? "location" : undefined}
                onClick={(event) => {
                  scrollLockUntilRef.current = Date.now() + 1000;
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
          {showPhone ? (
            <a className="header-phone" href={phoneHref}>
              <Phone className="header-phone-icon" aria-hidden="true" />
              {phone}
            </a>
          ) : null}
          <Link className="btn btn-primary" href={bookHref} data-book>
            {ctaLabel}
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="menu-toggle-lines" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
      <nav className={`mobile-nav${open ? " is-open" : ""}`} id="mobile-nav" aria-label="Mobile" inert={!open}>
        <div className="mobile-nav-inner container">
          <p className="mobile-nav-eyebrow">Menu</p>
          <ul className="mobile-nav-links">
            {links.map((link, index) => (
              <li key={link.key} style={{ "--i": index } as React.CSSProperties}>
                <Link
                  className="mobile-nav-link"
                  href={link.href}
                  target={link.newTab ? "_blank" : undefined}
                  rel={link.newTab ? "noopener noreferrer" : undefined}
                  data-book={link.opensBooking || undefined}
                  aria-current={activeId === link.id ? "location" : undefined}
                  onClick={() => {
                    scrollLockUntilRef.current = Date.now() + 1000;
                    setSectionId(link.id);
                    setOpen(false);
                  }}
                >
                  <span className="mobile-nav-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="mobile-nav-label">{link.label}</span>
                  <ArrowUpRight className="mobile-nav-arrow" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mobile-nav-footer" style={{ "--i": links.length + 1 } as React.CSSProperties}>
            <Link className="btn btn-light mobile-nav-book" href={bookHref} data-book onClick={() => setOpen(false)}>
              {ctaLabel}
            </Link>
            <a className="mobile-nav-call" href={phoneHref}>
              <Phone aria-hidden="true" />
              {phone}
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
