/* =============================================================
   TOPAZ ADMIN SOLUTIONS
   Privacy Policy — Page Scripts
   privacy-policy.js
   
   Table of Contents
   1. Theme Toggle
   2. Header Scroll
   3. Mobile TOC Toggle
   4. TOC Active Link on Scroll
   5. Scroll Reveal
   ============================================================= */

"use strict";

// ── DOM refs ──
const themeToggle = document.querySelector("[data-theme-toggle]");
const siteHeader = document.getElementById("site-header");

/* ============================================================
   1. THEME TOGGLE
   Default: always light mode regardless of OS preference.
   Persists manual choice to localStorage.
   Dark mode driven exclusively by [data-theme="dark"] on <html>.
   ============================================================ */

let currentTheme = localStorage.getItem("theme") || "light";
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

/* ============================================================
   2. HEADER SCROLL
   Adds .scrolled to the header after 40px scroll for the
   frosted glass effect.
   ============================================================ */

if (siteHeader) {
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        siteHeader.classList.toggle("scrolled", window.scrollY > 40);
        ticking = false;
      });
    },
    { passive: true },
  );
}

/* ============================================================
   3. MOBILE TOC TOGGLE
   Collapses / expands the table of contents on small screens.
   ============================================================ */

// --------------------------------------------------------------
// TOC MOBILE TOGGLE + TOC SCROLL SPY
// - Handles mobile open/close state for policy/article TOC.
// - Highlights the matching TOC link while scrolling the article.
// - Uses unique variable names to avoid collisions with the
//   main site scroll spy above.
// --------------------------------------------------------------

const tocToggle = document.getElementById("toc-toggle");
const tocPanel = document.getElementById("toc-panel");
const tocLinks = document.querySelectorAll(".toc-list a");
const tocSections = document.querySelectorAll(".policy-article-section[id]");

function closeMobileTOC() {
  if (!tocToggle || !tocPanel) return;
  if (window.innerWidth >= 900) return;

  tocToggle.setAttribute("aria-expanded", "false");
  tocPanel.classList.remove("open");
}

if (tocToggle && tocPanel) {
  tocToggle.addEventListener("click", () => {
    const expanded = tocToggle.getAttribute("aria-expanded") === "true";
    tocToggle.setAttribute("aria-expanded", String(!expanded));
    tocPanel.classList.toggle("open", !expanded);
  });
}

tocLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth < 900) {
      window.setTimeout(() => {
        closeMobileTOC();
      }, 120);
    }
  });
});

function updateTOC() {
  if (!tocSections.length || !tocLinks.length) return;

  let activeId = "";
  const offset = window.innerWidth < 900 ? 220 : 140;
  const scrollPosition = window.scrollY + offset;

  tocSections.forEach((section) => {
    if (scrollPosition >= section.offsetTop) {
      activeId = section.id;
    }
  });

  tocLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("active", isActive);
  });
}

window.addEventListener("resize", () => {
  if (tocToggle && tocPanel && window.innerWidth >= 900) {
    tocToggle.setAttribute("aria-expanded", "false");
    tocPanel.classList.remove("open");
  }

  updateTOC();
});

window.addEventListener("scroll", updateTOC, { passive: true });
window.addEventListener("load", updateTOC);
updateTOC();

/* ============================================================
   5. SCROLL REVEAL
   Uses IntersectionObserver to fade-in sections as they enter
   the viewport. Respects prefers-reduced-motion.
   ============================================================ */

const revealEls = document.querySelectorAll(".reveal");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReduced) {
  revealEls.forEach((el) => el.classList.add("revealed"));
} else {
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
  );

  revealEls.forEach((el) => revealObs.observe(el));
}
