/* ==========================================================================
   SONALI PORTFOLIO — SCRIPT.JS
   Modular vanilla JS. Each feature is an independent init function called
   once the DOM is ready. No external dependencies.

   Modules:
   1. Theme Toggle (dark/light + localStorage)
   2. Mobile Nav Toggle
   3. Sticky Navbar Shadow + Active Link Highlighting
   4. Smooth Scroll Offset (accounts for sticky navbar height)
   5. Scroll Progress Bar
   6. Custom Cursor (desktop only)
   7. Typing Effect (hero tagline)
   8. Animated Counters (stats section)
   9. Scroll Reveal Animations (IntersectionObserver)
   10. Contact Form Validation
   11. Back To Top Button
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initMobileNav();
  initNavbarScrollState();
  initSmoothScroll();
  initScrollProgress();
  initProjectSwipers();
  initMobileOnlyProjectSwipers();
  initTypingEffect();
  initCounters();
  initScrollReveal();
  initContactForm();
  initBackToTop();
});

/* ==========================================================================
   1. THEME TOGGLE
   ========================================================================== */
function initThemeToggle() {
  const STORAGE_KEY = "sonali-portfolio-theme";
  const toggleBtn = document.getElementById("themeToggle");
  const root = document.documentElement;

  if (!toggleBtn) return;

  // Determine initial theme: saved preference > system preference > dark default
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const prefersLight = window.matchMedia(
    "(prefers-color-scheme: light)",
  ).matches;
  const initialTheme = savedTheme || (prefersLight ? "light" : "dark");

  applyTheme(initialTheme);

  toggleBtn.addEventListener("click", () => {
    const current =
      root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      toggleBtn.setAttribute("aria-pressed", "true");
    } else {
      root.removeAttribute("data-theme");
      toggleBtn.setAttribute("aria-pressed", "false");
    }
  }
}

/* ==========================================================================
   2. MOBILE NAV TOGGLE
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("is-open");
    document.body.classList.toggle("nav-locked", !isOpen);
  });

  // Close menu when a link is tapped (mobile)
  menu.querySelectorAll(".navbar__link").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      document.body.classList.remove("nav-locked");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-locked");
    }
  });
}

/* ==========================================================================
   3. STICKY NAVBAR SHADOW + ACTIVE LINK HIGHLIGHTING
   ========================================================================== */
function initNavbarScrollState() {
  const navbar = document.getElementById("navbar");
  const navLinks = document.querySelectorAll(".navbar__link");
  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 12);
    highlightActiveSection();
  };

  const highlightActiveSection = () => {
    const scrollPos = window.scrollY + 120;
    let currentId = sections[0] ? sections[0].id : "";

    sections.forEach((section) => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("is-active", isActive);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ==========================================================================
   4. SMOOTH SCROLL OFFSET (accounts for sticky navbar height)
   ========================================================================== */
function initSmoothScroll() {
  const navbar = document.getElementById("navbar");
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId.length <= 1) return; // ignore bare "#"

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const targetPosition =
        target.getBoundingClientRect().top + window.scrollY - navHeight - 12;

      window.scrollTo({ top: targetPosition, behavior: "smooth" });

      setTimeout(() => {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }, 400);
    });
  });
}

/* ==========================================================================
   5. SCROLL PROGRESS BAR
   ========================================================================== */
function initScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;

  const updateProgress = () => {
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress =
      scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
}

/* ==========================================================================
   7. TYPING EFFECT (hero tagline rotates through Sonali's specialties)
   ========================================================================== */
function initTypingEffect() {
  const el = document.getElementById("typingText");
  if (!el) return;

  const phrases = [
    "Shopify Stores.",
    "Custom Shopify Apps.",
    "eCommerce Solutions.",
    "React Applications.",
    "Modern Web Applications.",
  ];

  const typeSpeed = 65;
  const eraseSpeed = 38;
  const holdTime = 1600;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  // Respect reduced-motion users: show the first phrase statically
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = phrases[0];
    return;
  }

  function tick() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex -= 1;
    } else {
      charIndex += 1;
    }

    el.textContent = currentPhrase.slice(0, charIndex);

    let delay = isDeleting ? eraseSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      delay = holdTime;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 300;
    }

    window.setTimeout(tick, delay);
  }

  tick();
}

/* ==========================================================================
   8. ANIMATED COUNTERS (About stats: 3+, 20+, 15+)
   ========================================================================== */
function initCounters() {
  const counters = document.querySelectorAll(".stat-card__number[data-count]");
  if (!counters.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const runCounter = (el) => {
    const target = parseFloat(el.getAttribute("data-count")) || 0;
    const suffix = el.getAttribute("data-suffix") || "";

    if (prefersReducedMotion) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    const duration = 1400;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value =
        target % 1 !== 0
          ? (eased * target).toFixed(1)
          : Math.round(eased * target);

      el.textContent = `${value}${suffix}`;

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

/* ==========================================================================
   9. SCROLL REVEAL ANIMATIONS (fade-up / fade-left / fade-right / zoom-in)
   ========================================================================== */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".fade-up, .fade-left, .fade-right, .zoom-in",
  );
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Slight stagger for elements revealing together (e.g. grid cards)
          const delay = Math.min(index * 60, 240);
          window.setTimeout(
            () => entry.target.classList.add("is-visible"),
            delay,
          );
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
  );

  targets.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   10. CONTACT FORM VALIDATION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");
  const messageField = document.getElementById("message");
  const status = document.getElementById("formStatus");

  const errors = {
    name: document.getElementById("nameError"),
    email: document.getElementById("emailError"),
    message: document.getElementById("messageError"),
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(field, message) {
    const group = field.closest(".form-group");
    errors[field.name].textContent = message;
    group.classList.toggle("has-error", Boolean(message));
  }

  function validateName() {
    const value = nameField.value.trim();
    if (!value) {
      setError(nameField, "Please enter your name.");
      return false;
    }
    if (value.length < 2) {
      setError(nameField, "Name looks too short.");
      return false;
    }
    setError(nameField, "");
    return true;
  }

  function validateEmail() {
    const value = emailField.value.trim();
    if (!value) {
      setError(emailField, "Please enter your email.");
      return false;
    }
    if (!emailPattern.test(value)) {
      setError(emailField, "Please enter a valid email address.");
      return false;
    }
    setError(emailField, "");
    return true;
  }

  function validateMessage() {
    const value = messageField.value.trim();
    if (!value) {
      setError(messageField, "Please write a short message.");
      return false;
    }
    if (value.length < 10) {
      setError(messageField, "Message should be at least 10 characters.");
      return false;
    }
    setError(messageField, "");
    return true;
  }

  // Validate on blur for immediate feedback
  nameField.addEventListener("blur", validateName);
  emailField.addEventListener("blur", validateEmail);
  messageField.addEventListener("blur", validateMessage);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "";
    status.style.color = "";

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    if (!isNameValid || !isEmailValid || !isMessageValid) {
      status.textContent = "Please fix the highlighted fields.";
      status.style.color = "var(--danger)";
      return;
    }

    // Sends form data to a Google Apps Script Web App, which appends
    // each submission as a row in a Google Sheet.
    const GOOGLE_SHEET_ENDPOINT =
      "https://script.google.com/macros/s/AKfycbx_bbtYGwbJ6hEtaFBSYTrrkqbsH-0_yaMrI6xdCz_hBbOi7burS2BWi6Hc6S4GJCPb/exec"; // ends in /exec

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.classList.add("btn--loading");
    submitBtn.textContent = "Sending...";

    fetch(GOOGLE_SHEET_ENDPOINT, {
      method: "POST",
      mode: "no-cors", // Apps Script doesn't send CORS headers back; the
      // request still completes and the row still saves,
      // we just can't read the response body here.
      body: new FormData(form),
    })
      .then(() => {
        status.textContent = "Message sent! I\u2019ll get back to you soon.";
        status.style.color = "var(--success)";
        form.reset();

        Object.values(errors).forEach((error) => {
          error.textContent = "";
        });

        form
          .querySelectorAll(".form-group")
          .forEach((group) => group.classList.remove("has-error"));
      })
      .catch(() => {
        status.textContent = "Something went wrong. Please try again.";
        status.style.color = "var(--danger)";
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.classList.remove("btn--loading");
        submitBtn.textContent = "Send Message";
      });
  });
}

/* ==========================================================================
   11. BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    const navbar = document.getElementById("navbar");

    if (navbar) {
      navbar.setAttribute("tabindex", "-1");

      setTimeout(() => {
        navbar.focus();
        navbar.removeAttribute("tabindex");
      }, 400);
    }
  });
}
/* ==========================================================================
   12. PROJECT SWIPERS (technology-wise Featured Projects sliders)
   Auto-initializes every .project-swiper found on the page. To add a new
   sliding category later, wrap its cards in the same
   .swiper.project-swiper > .swiper-wrapper > .swiper-slide markup — this
   function will pick it up automatically, no JS changes required.
   ========================================================================== */
function initProjectSwipers() {
  if (typeof Swiper === "undefined") return;

  document.querySelectorAll(".project-swiper").forEach((el) => {
    const wrap = el.closest(".project-swiper-wrap");
    if (!wrap) return;

    new Swiper(el, {
      loop: true,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      spaceBetween: 22,
      slidesPerView: 1,
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
      navigation: {
        nextEl: wrap.querySelector(".project-swiper-nav--next"),
        prevEl: wrap.querySelector(".project-swiper-nav--prev"),
      },
      pagination: {
        el: wrap.querySelector(".project-swiper-pagination"),
        clickable: true,
      },
      a11y: { enabled: true },
      keyboard: { enabled: true },
    });
  });
}

/* ==========================================================================
   13. MOBILE-ONLY PROJECT SWIPERS
   Below 768px, every .project-grid (categories with 3 or fewer projects)
   is temporarily converted into a Swiper — same .project-card nodes are
   moved into slides, no HTML authoring changes required. At 768px and up,
   it's converted back into the original static grid automatically.
   ========================================================================== */
function initMobileOnlyProjectSwipers() {
  if (typeof Swiper === "undefined") return;

  const mql = window.matchMedia("(max-width: 767.98px)");
  const registry = new Map(); // grid element -> { swiperInstance, wrap, cards, parent, nextSibling }
  const grids = document.querySelectorAll(".project-grid");

  function buildSwiperShell(grid) {
    const cards = Array.from(grid.children);

    const wrap = document.createElement("div");
    wrap.className = "project-swiper-wrap fade-up is-visible";

    const swiperEl = document.createElement("div");
    swiperEl.className = "swiper project-swiper";

    const wrapperEl = document.createElement("div");
    wrapperEl.className = "swiper-wrapper";

    cards.forEach((card) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.appendChild(card); // moves the existing card, doesn't clone it
      wrapperEl.appendChild(slide);
    });

    swiperEl.appendChild(wrapperEl);

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "project-swiper-nav project-swiper-nav--prev";
    prevBtn.setAttribute("aria-label", "Previous project");
    prevBtn.innerHTML = "&#8249;";

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "project-swiper-nav project-swiper-nav--next";
    nextBtn.setAttribute("aria-label", "Next project");
    nextBtn.innerHTML = "&#8250;";

    const pagination = document.createElement("div");
    pagination.className = "swiper-pagination project-swiper-pagination";

    wrap.append(swiperEl, prevBtn, nextBtn, pagination);

    return { wrap, swiperEl, prevBtn, nextBtn, pagination, cards };
  }

  function enableMobileSwiper(grid) {
    if (registry.has(grid)) return;

    const parent = grid.parentElement;
    const nextSibling = grid.nextSibling;
    const shell = buildSwiperShell(grid);

    parent.insertBefore(shell.wrap, grid);
    grid.remove();

    const swiperInstance = new Swiper(shell.swiperEl, {
      loop: true,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      slidesPerView: 1,
      spaceBetween: 22,
      navigation: { nextEl: shell.nextBtn, prevEl: shell.prevBtn },
      pagination: { el: shell.pagination, clickable: true },
      a11y: { enabled: true },
      keyboard: { enabled: true },
    });

    registry.set(grid, { ...shell, swiperInstance, parent, nextSibling });
  }

  function disableMobileSwiper(grid) {
    const entry = registry.get(grid);
    if (!entry) return;

    entry.cards.forEach((card) => grid.appendChild(card)); // restore original order
    entry.swiperInstance.destroy(true, true);
    entry.parent.insertBefore(grid, entry.nextSibling);
    entry.wrap.remove();

    registry.delete(grid);
  }

  function applyForViewport() {
    grids.forEach((grid) => {
      if (mql.matches) {
        enableMobileSwiper(grid);
      } else {
        disableMobileSwiper(grid);
      }
    });
  }

  applyForViewport();
  mql.addEventListener("change", applyForViewport);
}
