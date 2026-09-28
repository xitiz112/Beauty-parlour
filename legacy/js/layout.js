(function () {
  const salon = window.SALON;
  const page = document.body.dataset.page || "home";

  const links = [
    { href: "index.html", id: "home", label: "Home" },
    { href: "services.html", id: "services", label: "Services" },
    { href: "bridal.html", id: "bridal", label: "Bridal" },
    { href: "gallery.html", id: "gallery", label: "Gallery" },
    { href: "about.html", id: "about", label: "About" },
    { href: "contact.html", id: "contact", label: "Contact" },
  ];

  const bookHref = page === "home" ? "#book" : "index.html#book";

  function navMarkup() {
    return links
      .map(function (link) {
        const current = link.id === page ? ' aria-current="page"' : "";
        return `<a href="${link.href}"${current}>${link.label}</a>`;
      })
      .join("");
  }

  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = `
      <div class="container header-inner">
        <a class="logo" href="index.html" aria-label="${salon.name} home">
          <span class="logo-mark">${salon.shortName}</span>
          <span class="logo-sub">Beauty Studio</span>
        </a>
        <nav class="nav-desktop" aria-label="Primary">${navMarkup()}</nav>
        <div class="header-actions">
          <a class="header-phone" href="${salon.phoneHref}">${salon.phone}</a>
          <a class="btn btn-primary" href="${bookHref}">Book Now</a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">
            <span></span>
          </button>
        </div>
      </div>
      <nav class="mobile-nav container" id="mobile-nav">${navMarkup()}
        <a href="${bookHref}">Book Now</a>
        <a href="${salon.phoneHref}">Call ${salon.phone}</a>
      </nav>
    `;
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML = `
      <div class="container footer-grid">
        <div class="footer-col">
          <div class="logo">
            <span class="logo-mark">${salon.shortName}</span>
            <span class="logo-sub">Beauty Studio</span>
          </div>
          <p>${salon.tagline}</p>
        </div>
        <div class="footer-col">
          <strong>Visit</strong>
          <p>${salon.address}<br>${salon.city}</p>
          <p><a href="${salon.phoneHref}">${salon.phone}</a><br>
          <a href="${salon.whatsappHref}">WhatsApp</a></p>
        </div>
        <div class="footer-col">
          <strong>Explore</strong>
          <div class="footer-links">
            <a href="services.html">Services</a>
            <a href="bridal.html">Bridal</a>
            <a href="gallery.html">Gallery</a>
            <a href="${bookHref}">Book</a>
            <a href="${salon.instagramHref}">Instagram</a>
            <a href="${salon.facebookHref}">Facebook</a>
          </div>
        </div>
      </div>
      <div class="container footer-legal">
        <span>© ${new Date().getFullYear()} ${salon.name}</span>
        <span>
          <a href="privacy.html">Privacy</a> ·
          <a href="cancellation.html">Cancellation / late arrival</a>
        </span>
      </div>
    `;
  }
})();
