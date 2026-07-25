(function () {
  "use strict";

  const currentPage = document.body.dataset.page || "home";
  const navItems = [
    ["catalog", "Каталог", "catalog.html"],
    ["categories", "Категорії", "categories.html"],
    ["countries", "Країни", "countries.html"],
    ["verify", "Як перевірити", "verify.html"]
  ];

  function headerTemplate() {
    return `
      <a class="skip-link" href="#main">Перейти до вмісту</a>
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand" href="index.html" aria-label="Офіційне джерело — на головну">
            <span class="brand-shield" aria-hidden="true"><span>✓</span></span>
            <span>Офіційне джерело</span>
          </a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
            <span class="sr-only">Відкрити меню</span>
            <span></span><span></span><span></span>
          </button>
          <nav class="site-nav" id="site-nav" aria-label="Головна навігація">
            ${navItems.map(([key, label, href]) => `
              <a href="${href}"${currentPage === key ? ' class="active" aria-current="page"' : ""}>${label}</a>
            `).join("")}
            <a class="nav-submit" href="submit.html">Додати бренд</a>
          </nav>
        </div>
      </header>`;
  }

  function footerTemplate() {
    return `
      <footer class="site-footer">
        <div class="container footer-grid">
          <div>
            <a class="brand brand-light" href="index.html">
              <span class="brand-shield" aria-hidden="true"><span>✓</span></span>
              <span>Офіційне джерело</span>
            </a>
            <p class="footer-about">Каталог перевірених сайтів виробників, офіційних каталогів, представництв і дистриб’юторів.</p>
          </div>
          <div>
            <h2>Каталог</h2>
            <a href="catalog.html">Усі бренди</a>
            <a href="categories.html">Категорії</a>
            <a href="countries.html">Країни</a>
          </div>
          <div>
            <h2>Про перевірку</h2>
            <a href="verify.html">Методика</a>
            <a href="about.html">Про проєкт</a>
            <a href="submit.html">Повідомити про помилку</a>
          </div>
          <div>
            <h2>Важливо</h2>
            <p>Дані в цій версії демонстраційні. Перед публічним запуском кожен запис потрібно перевірити редакційно.</p>
          </div>
        </div>
        <div class="container footer-bottom">
          <span>© 2026 Офіційне джерело</span>
          <span>Довідковий, а не комерційний проєкт</span>
        </div>
      </footer>`;
  }

  document.querySelector("[data-header]")?.insertAdjacentHTML("afterbegin", headerTemplate());
  document.querySelector("[data-footer]")?.insertAdjacentHTML("afterbegin", footerTemplate());

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    nav?.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav?.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      menuButton?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      menuButton?.focus();
    }
  });

  function statusMeta(status) {
    if (status === "verified") return { label: "Перевірено", className: "verified" };
    if (status === "review") return { label: "Повторна перевірка", className: "review" };
    return { label: "Не підтверджено", className: "unconfirmed" };
  }

  function brandCard(brand) {
    const status = statusMeta(brand.status);
    const href = brand.id === "garmin" ? "brand.html" : `brand.html?id=${encodeURIComponent(brand.id)}`;
    return `
      <article class="brand-card" data-category="${brand.category}" data-country="${brand.country}">
        <div class="brand-card-top">
          <span class="brand-avatar" aria-hidden="true">${brand.initials}</span>
          <span class="status-badge ${status.className}"><span>✓</span>${status.label}</span>
        </div>
        <div>
          <p class="eyebrow">${brand.category}</p>
          <h3><a href="${href}">${brand.name}</a></h3>
          <p class="brand-domain">${brand.site}</p>
        </div>
        <div class="brand-meta">
          <span>${brand.countryCode} · ${brand.country}</span>
          <span>${brand.type}</span>
        </div>
        <div class="card-footer">
          <span>Перевірено ${brand.checked}</span>
          <a href="${href}" aria-label="Переглянути запис ${brand.name}">Переглянути <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
  }

  const heroForm = document.querySelector("#hero-search");
  heroForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = new FormData(heroForm).get("q")?.toString().trim() || "";
    window.location.href = `catalog.html${query ? `?q=${encodeURIComponent(query)}` : ""}`;
  });

  const recentGrid = document.querySelector("#recent-brands");
  if (recentGrid && window.BRAND_DATA) {
    recentGrid.innerHTML = window.BRAND_DATA.slice(0, 4).map(brandCard).join("");
  }

  const catalogGrid = document.querySelector("#catalog-grid");
  if (catalogGrid && window.BRAND_DATA) {
    const search = document.querySelector("#catalog-search");
    const category = document.querySelector("#filter-category");
    const country = document.querySelector("#filter-country");
    const type = document.querySelector("#filter-type");
    const status = document.querySelector("#filter-status");
    const sort = document.querySelector("#filter-sort");
    const count = document.querySelector("#results-count");
    const empty = document.querySelector("#catalog-empty");
    const clearButton = document.querySelector("#clear-filters");
    const params = new URLSearchParams(window.location.search);

    const categories = [...new Set(window.BRAND_DATA.map((item) => item.category))].sort();
    const countries = [...new Set(window.BRAND_DATA.map((item) => item.country))].sort();
    const types = [...new Set(window.BRAND_DATA.map((item) => item.type))].sort();

    categories.forEach((value) => category?.insertAdjacentHTML("beforeend", `<option>${value}</option>`));
    countries.forEach((value) => country?.insertAdjacentHTML("beforeend", `<option>${value}</option>`));
    types.forEach((value) => type?.insertAdjacentHTML("beforeend", `<option>${value}</option>`));

    if (search) search.value = params.get("q") || "";
    if (category && params.get("category")) category.value = params.get("category");
    if (country && params.get("country")) country.value = params.get("country");

    function renderCatalog() {
      const q = search?.value.trim().toLocaleLowerCase("uk") || "";
      let results = window.BRAND_DATA.filter((item) => {
        const haystack = [item.name, item.category, item.country, item.site, item.type].join(" ").toLocaleLowerCase("uk");
        return (!q || haystack.includes(q))
          && (!category?.value || item.category === category.value)
          && (!country?.value || item.country === country.value)
          && (!type?.value || item.type === type.value)
          && (!status?.value || item.status === status.value);
      });

      if (sort?.value === "name") results.sort((a, b) => a.name.localeCompare(b.name, "uk"));
      if (sort?.value === "country") results.sort((a, b) => a.country.localeCompare(b.country, "uk"));
      if (sort?.value === "recent") {
        results.sort((a, b) => {
          const parse = (date) => date.split(".").reverse().join("-");
          return parse(b.checked).localeCompare(parse(a.checked));
        });
      }

      catalogGrid.innerHTML = results.map(brandCard).join("");
      if (count) count.textContent = `${results.length} ${results.length === 1 ? "бренд" : results.length < 5 ? "бренди" : "брендів"}`;
      empty?.classList.toggle("hidden", results.length !== 0);
    }

    [search, category, country, type, status, sort].forEach((element) => {
      element?.addEventListener(element === search ? "input" : "change", renderCatalog);
    });

    clearButton?.addEventListener("click", () => {
      if (search) search.value = "";
      [category, country, type, status].forEach((element) => {
        if (element) element.value = "";
      });
      if (sort) sort.value = "recent";
      renderCatalog();
      search?.focus();
    });

    renderCatalog();
  }

  document.querySelectorAll("[data-category-link]").forEach((link) => {
    link.addEventListener("click", () => {
      const value = link.getAttribute("data-category-link");
      if (value) window.location.href = `catalog.html?category=${encodeURIComponent(value)}`;
    });
  });

  document.querySelectorAll("[data-country-link]").forEach((link) => {
    link.addEventListener("click", () => {
      const value = link.getAttribute("data-country-link");
      if (value) window.location.href = `catalog.html?country=${encodeURIComponent(value)}`;
    });
  });

  const submitForm = document.querySelector("#submit-brand-form");
  submitForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!submitForm.checkValidity()) {
      submitForm.reportValidity();
      return;
    }
    submitForm.classList.add("hidden");
    document.querySelector("#form-success")?.classList.remove("hidden");
    document.querySelector("#form-success")?.focus();
  });

  const reportButton = document.querySelector("#report-error");
  reportButton?.addEventListener("click", () => {
    window.location.href = "submit.html?type=error&brand=Garmin";
  });

  if (document.querySelector("#brand-profile-name") && window.BRAND_DATA) {
    const brandId = new URLSearchParams(window.location.search).get("id") || "garmin";
    const brand = window.BRAND_DATA.find((item) => item.id === brandId);
    if (brand) {
      document.title = `${brand.name}: офіційний сайт і країна — Офіційне джерело`;
      document.querySelector("#brand-profile-logo").textContent = brand.initials;
      document.querySelector("#brand-profile-name").textContent = brand.name;
      document.querySelector("#brand-profile-category").textContent = brand.category;
      document.querySelector("#brand-profile-description").textContent = brand.note;
      document.querySelector("#brand-profile-country").textContent = brand.country;
      document.querySelector("#brand-source-domain").textContent = brand.site;
      document.querySelector("#brand-source-type").textContent = `${brand.type} · ${brand.country}`;
      const sourceLink = document.querySelector("#brand-source-link");
      sourceLink.href = brand.url;
      if (brand.url === "#") {
        sourceLink.classList.add("hidden");
      }
      if (brand.id !== "garmin") {
        document.querySelectorAll("[data-example-garmin]").forEach((element) => element.classList.add("hidden"));
        document.querySelector("#brand-source-reason").innerHTML = `<strong>Статус запису</strong>${brand.note} Детальна редакційна картка для цього бренду ще готується.`;
      }
    }
  }

  if (submitForm) {
    const params = new URLSearchParams(window.location.search);
    const brandName = params.get("brand");
    if (brandName) {
      const input = document.querySelector("#brand-name");
      if (input) input.value = brandName;
    }
    if (params.get("type") === "error") {
      const select = document.querySelector("#request-type");
      if (select) select.value = "Повідомлення про помилку";
    }
  }

  const backTop = document.querySelector("#back-top");
  window.addEventListener("scroll", () => backTop?.classList.toggle("visible", window.scrollY > 700), { passive: true });
  backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
