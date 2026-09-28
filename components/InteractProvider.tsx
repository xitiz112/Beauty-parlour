"use client";

import { useEffect } from "react";

export function InteractProvider() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const header = document.getElementById("site-header");
    const cleanups: Array<() => void> = [];

    function onScroll() {
      header?.classList.toggle("is-scrolled", window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    document.body.prepend(progress);

    function updateProgress() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : "0%";
    }
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    cleanups.push(() => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      progress.remove();
    });

    if (!reduce) {
      const targets = document.querySelectorAll(
        ".section-head, .card, .signature, .team-card, .review, .book-panel, .form-card, .visit-card, .offer-banner, .gallery-item, .price-block",
      );
      targets.forEach((el) => el.classList.add("reveal"));
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "80px 0px 12% 0px" },
      );
      document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      const end = Number(el.dataset.count);
      if (!end) return;
      const watcher = new IntersectionObserver((entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (reduce) {
          el.textContent = String(end);
        } else {
          el.textContent = "0";
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / 1100, 1);
            el.textContent = String(Math.round(end * (1 - Math.pow(1 - t, 3))));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
        watcher.disconnect();
      });
      watcher.observe(el);
      cleanups.push(() => watcher.disconnect());
    });

    if (!reduce && fine) {
      document.querySelectorAll<HTMLElement>(".card").forEach((card) => {
        const move = (event: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `rotateX(${-py * 7}deg) rotateY(${px * 8}deg) translateY(-6px)`;
          card.classList.add("is-hot");
        };
        const leave = () => {
          card.style.transform = "";
          card.classList.remove("is-hot");
        };
        card.addEventListener("mousemove", move);
        card.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          card.removeEventListener("mousemove", move);
          card.removeEventListener("mouseleave", leave);
        });
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
