"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

type GalleryImage = { src: string; caption: string };

export function Lightbox() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-lightbox]");
      if (!target) return;
      const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-lightbox]"));
      const gallery = targets.map((item) => ({
        src: item.dataset.lightbox || "",
        caption: item.dataset.caption || "",
      }));
      setImages(gallery);
      setActiveIndex(targets.indexOf(target));
    }
    function onKey(event: KeyboardEvent) {
      if (activeIndex === null) return;
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index === null ? null : (index - 1 + images.length) % images.length));
      if (event.key === "ArrowRight") setActiveIndex((index) => (index === null ? null : (index + 1) % images.length));
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [activeIndex, images.length]);

  if (!activeImage) return null;

  const move = (direction: -1 | 1) => {
    setActiveIndex((index) => (index === null ? null : (index + direction + images.length) % images.length));
  };

  return (
    <div className="lightbox is-open" role="dialog" aria-modal="true" aria-label="Gallery image" onClick={() => setActiveIndex(null)}>
      <button className="lightbox-close" type="button" aria-label="Close" onClick={() => setActiveIndex(null)}>
        <X aria-hidden="true" size={28} />
      </button>
      <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>
        <button className="lightbox-nav lightbox-prev" type="button" aria-label="Previous image" onClick={() => move(-1)}>
          <ArrowLeft aria-hidden="true" size={22} />
        </button>
        <img src={activeImage.src} alt={activeImage.caption} />
        <button className="lightbox-nav lightbox-next" type="button" aria-label="Next image" onClick={() => move(1)}>
          <ArrowRight aria-hidden="true" size={22} />
        </button>
        <p className="lightbox-caption">{activeImage.caption}</p>
      </div>
    </div>
  );
}
