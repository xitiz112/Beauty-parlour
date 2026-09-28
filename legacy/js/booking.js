(function () {
  const form = document.getElementById("booking-form");
  if (!form) return;

  const salon = window.SALON;
  const category = document.getElementById("service-category");
  const treatment = document.getElementById("service-treatment");
  const stylist = document.getElementById("preferred-stylist");
  const dateInput = form.elements.date;
  const success = document.getElementById("booking-success");
  const whatsappFallback = document.getElementById("whatsapp-fallback");
  const params = new URLSearchParams(window.location.search);

  function fillTreatments() {
    const selected = salon.services.find(function (service) {
      return service.id === category.value;
    });
    const options = selected ? selected.treatments : [];
    treatment.innerHTML =
      '<option value="">Any treatment in this category</option>' +
      options
        .map(function (item) {
          return `<option value="${item}">${item}</option>`;
        })
        .join("");
  }

  if (category && treatment) {
    fillTreatments();
    category.addEventListener("change", fillTreatments);
  }

  if (stylist) {
    salon.team.forEach(function (member) {
      const option = document.createElement("option");
      option.value = member.name;
      option.textContent = member.name + " — " + member.role;
      stylist.appendChild(option);
    });
  }

  if (dateInput) {
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
    dateInput.min = today;
  }

  const requestedCategory = params.get("category");
  if (requestedCategory && category) {
    const match = salon.services.some(function (service) {
      return service.id === requestedCategory;
    });
    if (match) {
      category.value = requestedCategory;
      fillTreatments();
    }
  }

  const requestedTreatment = params.get("treatment");
  if (requestedTreatment && treatment) {
    treatment.value = requestedTreatment;
  }

  const requestedStylist = params.get("stylist");
  if (requestedStylist && stylist) {
    const known = salon.team.some(function (member) {
      return member.name === requestedStylist;
    });
    if (known) stylist.value = requestedStylist;
  }

  function messageFromForm(data) {
    return [
      "Appointment request from the Liora website",
      "Name: " + data.get("name"),
      "Phone: " + data.get("phone"),
      data.get("email") ? "Email: " + data.get("email") : "",
      "Category: " + data.get("category"),
      data.get("treatment") ? "Treatment: " + data.get("treatment") : "",
      "Stylist: " + data.get("stylist"),
      "Date: " + data.get("date"),
      "Time window: " + data.get("window"),
      data.get("notes") ? "Notes: " + data.get("notes") : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const data = new FormData(form);
    const required = ["name", "phone", "category", "date", "window"];
    let valid = true;

    required.forEach(function (field) {
      const input = form.elements[field];
      const error = form.querySelector('[data-error-for="' + field + '"]');
      const empty = !String(data.get(field) || "").trim();
      if (error) error.textContent = empty ? "This field is required." : "";
      if (empty) valid = false;
      if (input) input.setAttribute("aria-invalid", empty ? "true" : "false");
    });

    if (!valid) return;

    const payload = {
      name: data.get("name"),
      phone: data.get("phone"),
      email: data.get("email"),
      category: data.get("category"),
      treatment: data.get("treatment"),
      stylist: data.get("stylist"),
      date: data.get("date"),
      window: data.get("window"),
      notes: data.get("notes"),
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("liora-requests") || "[]");
    existing.push(payload);
    localStorage.setItem("liora-requests", JSON.stringify(existing));

    const text = encodeURIComponent(messageFromForm(data));
    if (whatsappFallback) {
      whatsappFallback.href = salon.whatsappHref + "?text=" + text;
    }

    form.hidden = true;
    form.setAttribute("aria-hidden", "true");
    if (success) {
      success.classList.add("is-visible");
      success.focus();
    }
  });
})();
