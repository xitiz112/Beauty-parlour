"use client";

import type { Review } from "@prisma/client";
import { useCallback, useEffect, useRef, useState } from "react";

const portraits = [
  "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=400",
];

type GuestReview = Pick<Review, "id" | "guestName" | "service" | "rating" | "quote">;

export function ReviewCarousel({ reviews }: { reviews: GuestReview[] }) {
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
  }, [reviews.length, updateControls]);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".review");
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = (card?.offsetWidth || track.clientWidth) + gap;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const nextScroll = Math.max(0, Math.min(maxScroll, track.scrollLeft + direction * step));
    track.scrollLeft = nextScroll;
    setCanGoBack(nextScroll > 2);
    setCanGoForward(nextScroll < maxScroll - 2);
  };

  return (
    <div className="review-carousel">
      <div className="review-carousel-controls" aria-label="Testimonial carousel controls">
        <button type="button" onClick={() => move(-1)} disabled={!canGoBack} aria-label="Previous testimonials">
          <span aria-hidden="true">←</span>
        </button>
        <button type="button" onClick={() => move(1)} disabled={!canGoForward} aria-label="Next testimonials">
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="review-track" ref={trackRef} role="region" aria-label="Guest testimonials" aria-roledescription="carousel" tabIndex={0}>
        {reviews.map((review, index) => (
          <article className="review" key={review.id}>
            <div className="review-profile">
              <div className="review-identity">
                <strong className="review-name">{review.guestName}</strong>
                <span className="review-service">{review.service}</span>
                <p className="stars" aria-label={`${review.rating} stars`}>
                  {"★".repeat(review.rating)}
                </p>
              </div>
              <img className="review-portrait" src={portraits[index % portraits.length]} alt="" loading="lazy" />
            </div>
            <blockquote>{review.quote}</blockquote>
          </article>
        ))}
      </div>
    </div>
  );
}
