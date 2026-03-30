// ================================================================
//  TOPAZ ADMIN SOLUTIONS — MAIN JAVASCRIPT
//  Responsibilities:
//    - Theme toggle (light / dark)
//    - Navigation: scroll spy, header state, active links
//    - Mobile hamburger drawer
//    - Scroll-reveal animations
//    - Contact form submission
//
//  Puzzle behaviour lives in puzzle.js — load it separately.
//  Load order in HTML:
//    <script src="js/topaz-main.js" defer></script>
//    <script src="js/puzzle.js" defer></script>
// ================================================================

(function () {
  "use strict";

  // --------------------------------------------------------------
  //  DOM REFERENCES
  // --------------------------------------------------------------

  const header = document.getElementById("site-header");
  const hamburger = document.getElementById("hamburger");
  const drawer = document.getElementById("nav-drawer");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const footerYear = document.getElementById("footerYear");
  const PAGE_TITLES = {
    "": "Topaz Admin Solutions",
    hero: "Paralegal & Administrative Services | Topaz Admin Solutions",
    services: "Our Services | Topaz Admin Solutions",
    about: "About | Topaz Admin Solutions",
    contact: "Contact | Topaz Admin Solutions",
  };

  // --------------------------------------------------------------
  //  FOOTER YEAR
  //  Auto-updates so the copyright year is always current.
  // --------------------------------------------------------------

  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // --------------------------------------------------------------
  //  THEME TOGGLE
  //  Default: always light mode regardless of OS preference.
  //  Manual override persists to localStorage so the user's
  //  choice survives page refresh.
  //  Dark mode is driven exclusively by [data-theme="dark"]
  //  on <html> — the prefers-color-scheme media query in CSS
  //  has been removed so OS dark mode never auto-overrides.
  // --------------------------------------------------------------

  ("use strict");

  // Read persisted choice → fall back to light
  let currentTheme = localStorage.getItem("theme") || "light";

  // Apply immediately to <html> before paint to avoid flash
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", currentTheme);
      localStorage.setItem("theme", currentTheme);
      updateThemeIcon();
    });
  }

  /**
   * Swaps the icon SVG inside the toggle button and updates its
   * aria-label to reflect the *next* action (not the current state).
   */
  function updateThemeIcon() {
    if (!themeToggle) return;

    themeToggle.setAttribute(
      "aria-label",
      `Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`,
    );

    themeToggle.innerHTML =
      currentTheme === "dark"
        ? // Sun — shown in dark mode (click to go light)
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" aria-hidden="true">
           <circle cx="12" cy="12" r="5"/>
           <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42
                    M18.36 18.36l1.42 1.42M1 12h2M21 12h2
                    M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
         </svg>`
        : // Moon — shown in light mode (click to go dark)
          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" aria-hidden="true">
           <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
         </svg>`;
  }

  // --------------------------------------------------------------
  //  SCROLL SPY
  //  - Adds .scrolled to the header after 40px scroll
  //    (triggers the frosted-glass background via CSS).
  //  - Marks the matching .nav-link as .active.
  //  Throttled via requestAnimationFrame to stay off the main thread.
  // --------------------------------------------------------------

  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const scrollY = window.scrollY;

      header?.classList.toggle("scrolled", scrollY > 40);

      let current = "";
      sections.forEach((sec) => {
        const sectionTop = sec.getBoundingClientRect().top + scrollY - 120;
        if (scrollY >= sectionTop) current = sec.id;
      });

      navLinks.forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });

      // Dynamic browser title — updates as user scrolls between sections
      document.title = PAGE_TITLES[current] || "Topaz Admin Solutions";

      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on load to set initial header/link state

  // --------------------------------------------------------------
  //  MOBILE HAMBURGER DRAWER
  //  Toggles the off-canvas nav; locks body scroll while open.
  //  Drawer links close the drawer automatically (SPA-style nav).
  // --------------------------------------------------------------

  if (hamburger && drawer) {
    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!isOpen));
      drawer.classList.toggle("open", !isOpen);
      document.body.style.overflow = isOpen ? "" : "hidden";
    });

    document.querySelectorAll(".drawer-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.setAttribute("aria-expanded", "false");
        drawer.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  // --------------------------------------------------------------
  //  SCROLL REVEAL
  //  IntersectionObserver watches every .reveal element.
  //  When 12% of the element enters the viewport it gets the
  //  .revealed class; CSS handles the fade-up animation.
  //  Un-observed after first trigger — one-shot only.
  // --------------------------------------------------------------

  const revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    revealEls.forEach((el) => revealObs.observe(el));
  }

  // --------------------------------------------------------------
  //  CONTACT FORM — Validation + Submission (merged, single listener)
  //  Validates all fields before allowing submission.
  //  Replace the setTimeout block with fetch() when wiring a backend.
  // --------------------------------------------------------------

  const RULES = {
    fname: { required: true, minLength: 2, label: "First name" },
    lname: { required: true, minLength: 2, label: "Last name" },
    email: { required: true, type: "email", label: "Email" },
    service: { required: true, type: "select", label: "Service" },
    message: { required: true, minLength: 10, label: "Message" },
  };

  const VALIDATORS = {
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    select: (v) => v !== "" && v !== "Select a service",
  };

  function validateField(input) {
    const rule = RULES[input.id];
    if (!rule) return { valid: true, message: "" };

    const val = input.value;

    if (rule.required && !val.trim())
      return { valid: false, message: `${rule.label} is required.` };

    if (rule.type === "email" && val.trim() && !VALIDATORS.email(val))
      return { valid: false, message: "Please enter a valid email address." };

    if (rule.type === "select" && !VALIDATORS.select(val))
      return { valid: false, message: "Please select a service." };

    if (rule.minLength && val.trim().length < rule.minLength)
      return {
        valid: false,
        message: `${rule.label} must be at least ${rule.minLength} characters.`,
      };

    return { valid: true, message: "" };
  }

  function setFieldState(input, result) {
    const wrapper = input.closest(".form-field");
    if (!wrapper) return;

    let errEl = wrapper.querySelector(".field-error");
    if (!errEl) {
      errEl = document.createElement("span");
      errEl.className = "field-error";
      errEl.setAttribute("aria-live", "polite");
      errEl.setAttribute("role", "alert");
      wrapper.appendChild(errEl);
    }

    if (result.valid) {
      wrapper.classList.remove("field--error");
      wrapper.classList.add("field--valid");
      errEl.textContent = "";
    } else {
      wrapper.classList.add("field--error");
      wrapper.classList.remove("field--valid");
      errEl.textContent = result.message;
    }
  }

  // ── Real-time validation after first touch ──
  Object.keys(RULES).forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;

    let touched = false;

    input.addEventListener("blur", () => {
      touched = true;
      setFieldState(input, validateField(input));
    });

    input.addEventListener("input", () => {
      if (touched) setFieldState(input, validateField(input));
    });

    input.addEventListener("change", () => {
      touched = true;
      setFieldState(input, validateField(input));
    });
  });

  // ── Single submit listener — validation gates submission ──
  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // 1. Run validation on every field
      let allValid = true;
      Object.keys(RULES).forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        const result = validateField(input);
        setFieldState(input, result);
        if (!result.valid) allValid = false;
      });

      // 2. Block if any field failed — clear stale success message
      if (!allValid) {
        formStatus.textContent = "";
        formStatus.style.color = "";
        const firstError = contactForm.querySelector(
          ".field--error input, .field--error textarea, .field--error select",
        );
        firstError?.focus();
        return; // ← exits here, nothing below runs
      }

      // 3. All valid — disable button and simulate send
      const btn = contactForm.querySelector('[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }

      // TODO: replace setTimeout with fetch() to your real endpoint
      setTimeout(() => {
        formStatus.textContent = "✓ Message sent — we'll be in touch within one business day.";
        formStatus.style.color = "var(--color-primary)";

        contactForm.reset();

        // Clear all valid states after reset
        Object.keys(RULES).forEach((id) => {
          const input = document.getElementById(id);
          input?.closest(".form-field")?.classList.remove("field--valid", "field--error");
        });

        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `Send Message
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>`;
        }
      }, 1400);
    });
  }
})();
