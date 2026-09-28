(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.prepend(progress);

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = max > 0 ? (window.scrollY / max) * 100 + "%" : "0%";
  }

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  if (!reduce) {
    document.querySelectorAll(".section-head, .card, .signature, .team-card, .review, .book-panel, .form-card, .visit-card, .offer-banner, .gallery-item").forEach(function (el) {
      el.classList.add("reveal");
    });

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "80px 0px 12% 0px" }
    );

    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
  }

  document.querySelectorAll("[data-count]").forEach(function (el) {
    const end = Number(el.dataset.count);
    if (!end) return;

    function run() {
      if (reduce) {
        el.textContent = String(end);
        return;
      }
      el.textContent = "0";
      const start = performance.now();
      function tick(now) {
        const t = Math.min((now - start) / 1100, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(end * eased));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const watcher = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        run();
        watcher.disconnect();
      }
    });
    watcher.observe(el);
  });

  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const rect = btn.getBoundingClientRect();
      ripple.style.left = event.clientX - rect.left + "px";
      ripple.style.top = event.clientY - rect.top + "px";
      ripple.style.width = ripple.style.height = "12px";
      btn.appendChild(ripple);
      setTimeout(function () {
        ripple.remove();
      }, 700);
    });
  });

  if (reduce || !fine) return;

  document.documentElement.classList.add("has-fancy-cursor");
  const cursor = document.createElement("div");
  const ring = document.createElement("div");
  cursor.className = "cursor";
  ring.className = "cursor-ring";
  document.body.append(cursor, ring);

  let x = 0;
  let y = 0;
  let rx = 0;
  let ry = 0;

  window.addEventListener(
    "mousemove",
    function (event) {
      x = event.clientX;
      y = event.clientY;
      cursor.style.left = x + "px";
      cursor.style.top = y + "px";
    },
    { passive: true }
  );

  function follow() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(follow);
  }
  follow();

  document.querySelectorAll("a, button, .card, .gallery-item, .team-card").forEach(function (el) {
    el.addEventListener("mouseenter", function () {
      ring.classList.add("is-hot");
    });
    el.addEventListener("mouseleave", function () {
      ring.classList.remove("is-hot");
    });
  });

  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("mousemove", function (event) {
      const rect = btn.getBoundingClientRect();
      const mx = event.clientX - rect.left - rect.width / 2;
      const my = event.clientY - rect.top - rect.height / 2;
      btn.style.transform = "translate(" + mx * 0.12 + "px, " + (my * 0.18 - 3) + "px)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.transform = "";
    });
  });

  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("mousemove", function (event) {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = "rotateX(" + -py * 7 + "deg) rotateY(" + px * 8 + "deg) translateY(-6px)";
      card.classList.add("is-hot");
    });
    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
      card.classList.remove("is-hot");
    });
  });
})();
