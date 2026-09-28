import type { GalleryItem } from "@prisma/client";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <div className="gallery-grid">
      {items.map((item) => (
        <button
          key={item.id}
          className="gallery-item"
          type="button"
          data-lightbox={item.image.replace("w=900", "w=1400")}
          data-caption={item.caption}
        >
          <img src={item.image} alt={item.caption} loading="lazy" />
          <span className="caption">{item.caption}</span>
          <span className="view-dot">View</span>
        </button>
      ))}
    </div>
  );
}
