"use client";

import { useEffect, useState } from "react";

export function Lightbox() {
  const [open, setOpen] = useState<{ src: string; caption: string } | null>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-lightbox]");
      if (!target) return;
      setOpen({
        src: target.dataset.lightbox || "",
        caption: target.dataset.caption || "",
      });
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="lightbox is-open" role="dialog" aria-modal="true" aria-label="Gallery image" onClick={() => setOpen(null)}>
      <button type="button" aria-label="Close" onClick={() => setOpen(null)}>
        ×
      </button>
      <div onClick={(event) => event.stopPropagation()}>
        <img src={open.src} alt={open.caption} />
        <p className="lightbox-caption">{open.caption}</p>
      </div>
    </div>
  );
}
