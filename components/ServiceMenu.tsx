"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Service, ServiceCategory } from "@prisma/client";
import { formatMoney } from "@/lib/time";
import { SlideDown } from "@/components/SlideDown";

type MenuCategory = Pick<ServiceCategory, "id" | "slug" | "name" | "teaser" | "image" | "sortOrder"> & {
  services: Service[];
};

type MenuItem = { category: MenuCategory; service: Service; index: number };

export function ServiceMenu({ categories }: { categories: MenuCategory[] }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const allItems = categories.flatMap((category) =>
    category.services.map((service, index) => ({ category, service, index })),
  );
  const visibleItems = selectedCategory === "all"
    ? allItems
    : allItems.filter(({ category }) => category.slug === selectedCategory);
  const menuRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Replay the card reveal each time the category changes (not on first load).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const grids = menuRef.current?.querySelectorAll<HTMLElement>(".card-grid") ?? [];
    grids.forEach((grid) => {
      grid.classList.remove("is-revealing");
      void grid.offsetWidth; // force reflow so the animation restarts
      grid.classList.add("is-revealing");
    });
  }, [selectedCategory]);

  const renderCard = ({ category, service, index }: MenuItem, position: number) => {
    const bookingHref = `/?category=${encodeURIComponent(category.slug)}&treatment=${encodeURIComponent(service.name)}#contact`;

    return (
      <article
        key={service.id}
        id={category.slug === "bridal" && index === 0 ? "bridal" : undefined}
        className="card service-card"
        style={{ "--reveal-index": position % 6 } as React.CSSProperties}
      >
        <div className="card-visual">
          <div className="card-media">
            <img src={service.image || category.image} alt={service.name} />
          </div>
        </div>
        <div className="card-body">
          <h3>{service.name}</h3>
          <p>{service.description || category.teaser}</p>
          <div className="service-card-actions">
            <Link className="btn btn-primary" href={bookingHref} data-book>
              Book now
            </Link>
            <span className="service-card-price">{formatMoney(service.price)}</span>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="service-menu" ref={menuRef}>
      <div className="service-category-tabs" role="group" aria-label="Filter menu by category">
        <button
          className={selectedCategory === "all" ? "is-active" : ""}
          type="button"
          aria-pressed={selectedCategory === "all"}
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            className={selectedCategory === category.slug ? "is-active" : ""}
            type="button"
            aria-pressed={selectedCategory === category.slug}
            key={category.id}
            onClick={() => setSelectedCategory(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {visibleItems.slice(0, 6).map(renderCard)}
      </div>

      {visibleItems.length > 6 ? (
        <SlideDown
          className="service-more"
          triggerClassName="btn btn-line service-more-trigger"
          duration={650}
          trigger={
            <>
              <span className="service-more-open">View more</span>
              <span className="service-more-close">View less</span>
            </>
          }
        >
          <div className="card-grid">{visibleItems.slice(6).map(renderCard)}</div>
        </SlideDown>
      ) : null}
    </div>
  );
}
