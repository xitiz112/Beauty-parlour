"use client";

import type { Stylist } from "@prisma/client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type TeamMember = Pick<Stylist, "id" | "name" | "role" | "specialty" | "image">;

export function TeamCarousel({ stylists }: { stylists: TeamMember[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanGoBack(track.scrollLeft > 2);
    setCanGoForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateControls();
    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    return () => {
      track.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [updateControls, stylists.length]);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".team-card");
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = (card?.offsetWidth || track.clientWidth) + gap;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const nextScroll = Math.max(0, Math.min(maxScroll, track.scrollLeft + direction * step));
    track.scrollLeft = nextScroll;
    setCanGoBack(nextScroll > 2);
    setCanGoForward(nextScroll < maxScroll - 2);
  };

  return (
    <div className="team-carousel">
      <div className="team-carousel-controls" aria-label="Team carousel controls">
        <button type="button" onClick={() => move(-1)} disabled={!canGoBack} aria-label="Previous team members">
          <span aria-hidden="true">←</span>
        </button>
        <button type="button" onClick={() => move(1)} disabled={!canGoForward} aria-label="Next team members">
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="team-track" ref={trackRef} role="region" aria-label="Our team" aria-roledescription="carousel" tabIndex={0}>
        {stylists.map((member) => {
          const first = member.name.split(" ")[0];
          const bookHref = `/?stylist=${encodeURIComponent(member.name)}#contact`;
          return (
            <article className="team-card" key={member.id}>
              <div className="team-media">
                <img src={member.image} alt={member.name} loading="lazy" />
                <div className="team-overlay-copy">
                  <h3>{member.name}</h3>
                  <p className="role">{member.role}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
