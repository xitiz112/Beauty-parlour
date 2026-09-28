(function () {
  const header = document.getElementById("site-header");
  const toggle = header && header.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      const open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    if (lightboxImage) lightboxImage.removeAttribute("src");
    if (lightboxCaption) lightboxCaption.textContent = "";
  }

  document.querySelectorAll("[data-lightbox]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = button.dataset.lightbox;
      lightboxImage.alt = button.dataset.caption || "";
      if (lightboxCaption) lightboxCaption.textContent = button.dataset.caption || "";
      lightbox.classList.add("is-open");
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeLightbox();
  });
})();
