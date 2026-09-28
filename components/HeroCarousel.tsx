"use client";

import { useEffect, useState } from "react";

export type HeroSlide = {
  src: string;
  alt: string;
};

const INTERVAL_MS = 5600;
const CURTAIN_MS = 2500;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const count = slides.length;

  function showSlide(next: number) {
    setIndex((current) => {
      if (current === next) return current;
      setPrevious(current);
      return next;
    });
  }

  useEffect(() => {
    if (previous === null) return;
    const timer = window.setTimeout(() => setPrevious(null), CURTAIN_MS);
    return () => window.clearTimeout(timer);
  }, [previous, index]);

  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setIndex((current) => {
        setPrevious(current);
        return (current + 1) % count;
      });
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [count]);

  return (
    <>
      <div className="hero-media">
        {slides.map((slide, slideIndex) => {
          const isCurrent = slideIndex === index;
          const isPrevious = slideIndex === previous;
          const className = [
            isCurrent ? "is-current" : "",
            isPrevious ? "is-previous is-curtain" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <img
              key={`${slide.src}-${slideIndex}`}
              className={className || undefined}
              src={slide.src}
              alt={slide.alt}
            />
          );
        })}
      </div>
      {count > 1 ? (
        <div className="hero-dots" role="tablist" aria-label="Studio photos">
          {slides.map((slide, slideIndex) => (
            <button
              key={`${slide.src}-dot-${slideIndex}`}
              type="button"
              role="tab"
              aria-selected={slideIndex === index}
              aria-label={`Show ${slide.alt}`}
              className={slideIndex === index ? "is-active" : undefined}
              onClick={() => showSlide(slideIndex)}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
