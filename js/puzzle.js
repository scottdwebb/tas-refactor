"use strict";

/**
 * ============================================================
 * puzzle.js — Services Puzzle Section
 * ============================================================
 * @description Handles hover/focus image filter sync, label
 *              state, modal open/close, and focus trapping.
 *              Matches topaz-spa.html modal structure exactly:
 *              - Activation class : "visible"  (not "is-open")
 *              - modalBg image    : set via style.backgroundImage
 *              - JS closes modal  : removes "visible", adds
 *                                   aria-hidden="true"
 * @fonts       Cormorant Garamond / General Sans (from page <head>)
 * @palette     --color-primary (teal green) / --color-gold
 * ============================================================
 */

// ============================================================
// SERVICE DATA
// ============================================================
// NOTE: iconPath = raw SVG child elements (no <svg> wrapper).
//       bg       = path to the piece background image.
// ============================================================
const SERVICES = [
  {
    // 0 — TL: Paralegal Support
    name: "Paralegal Support",
    faClass: "fa-solid fa-scale-balanced",
    desc: "Comprehensive paralegal assistance that keeps your cases moving from case intake through final disposition.",
    list: [
      "Case file organization and management",
      "Court filing coordination and deadline tracking",
      "Client intake and communication support",
      "Deposition scheduling and preparation",
    ],
    // Balance / scale bars icon
    iconPath: `<path d="M3 17l4-8 4 4 4-6 4 10"/>
               <line x1="3" y1="21" x2="21" y2="21"/>`,
    bg: "images/puzzle-piece--1__modal.webp",
  },
  {
    // 1 — TR: Document Preparation
    name: "Document Preparation",
    faClass: "fa-solid fa-file-contract",
    desc: "Accurate, properly formatted legal documents drafted, proofed, and ready for review or filing.",
    list: [
      "Pleadings, motions, and briefs",
      "Contracts and agreements",
      "Correspondence and demand letters",
      "Formatting to court or firm standards",
    ],
    // Document / file icon
    iconPath: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
               <polyline points="14 2 14 8 20 8"/>
               <line x1="16" y1="13" x2="8" y2="13"/>
               <line x1="16" y1="17" x2="8" y2="17"/>`,
    bg: "images/puzzle-piece--2__modal.webp",
  },
  {
    // 2 — BL: Legal Research
    name: "Legal Research",
    faClass: "fa-solid fa-magnifying-glass",
    desc: "Thorough, citation-ready research memos that give you the foundation you need before walking into court.",
    list: [
      "Case law and statutory research",
      "Jurisdiction-specific regulatory review",
      "Research memos in your preferred format",
      "Shepardizing and citation validation",
    ],
    // Magnifying glass icon
    iconPath: `<circle cx="11" cy="11" r="8"/>
               <line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
    bg: "images/puzzle-piece--3__modal.webp",
  },
  {
    // 3 — BR: Trial Assistance
    name: "Trial Assistance",
    faClass: "fa-solid fa-gavel",
    desc: "Dedicated trial support that keeps your litigation team organized, prepared, and focused when it matters most.",
    list: [
      "Trial binder and exhibit preparation",
      "Witness list and subpoena coordination",
      "Real-time courtroom support and logistics",
      "Post-trial filing and record organization",
    ],
    // Admin / grid icon
    iconPath: `<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
               <line x1="8" y1="21" x2="16" y2="21"/>
               <line x1="12" y1="17" x2="12" y2="21"/>`,
    bg: "images/puzzle-piece--4__modal.webp",
  },
];

// ============================================================
// DOM REFERENCES
// ============================================================
const puzzleWrapper = document.getElementById("puzzleWrapper");
const puzzleGrid = document.getElementById("puzzleGrid");
const modalLayer = document.getElementById("pieceModalLayer");
const modalClose = document.getElementById("pieceModalClose");
const modalBg = document.getElementById("pieceModalBg");
const modalIcon = document.getElementById("modalIcon");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalList = document.getElementById("modalList");

const pieces = puzzleGrid ? [...puzzleGrid.querySelectorAll(".puzzle-piece")] : [];
const labelItems = puzzleWrapper ? [...puzzleWrapper.querySelectorAll(".puzzle-label-item")] : [];

/** Index of the currently active piece (for focus restore on close) */
let activePieceIdx = null;

// ============================================================
// HOVER / FOCUS STATE HELPERS
// ============================================================

/**
 * Marks a piece + its label as hovered; adds .has-hover to wrapper.
 * @param {string|number} idx  data-service index
 */
const setHover = (idx) => {
  const i = String(idx);
  pieces.forEach((p) => p.classList.toggle("is-hovered", p.dataset.service === i));
  labelItems.forEach((l) => l.classList.toggle("is-hovered", l.dataset.service === i));

  puzzleWrapper?.classList.add("has-hover");
};

/** Clears all hover state. */
const clearHover = () => {
  pieces.forEach((p) => p.classList.remove("is-hovered"));
  labelItems.forEach((l) => l.classList.remove("is-hovered"));

  puzzleWrapper?.classList.remove("has-hover");
};

// ============================================================
// MODAL — open
// ============================================================

/**
 * Opens the shared modal layer for the given service index.
 * Matches topaz-spa.html approach:
 *   - modalBg background image set via style property
 *   - activation: puzzleWrapper gets .has-active
 *                 modalLayer gets .visible + aria-hidden removed
 * @param {number} idx
 */
const openModal = (idx) => {
  const svc = SERVICES[idx];
  if (!svc || !modalLayer) return;

  activePieceIdx = idx;

  // Populate background image
  if (modalBg) {
    modalBg.style.backgroundImage = `url(${svc.bg})`;
  }

  // Populate icon (innerHTML — internal data only, safe)
  if (modalIcon) {
    modalIcon.className = "piece-modal-icon";
    svc.faClass.split(" ").forEach((cls) => modalIcon.classList.add(cls));
  }

  // Populate text fields
  if (modalTitle) modalTitle.textContent = svc.name;
  if (modalDesc) modalDesc.textContent = svc.desc;

  // Populate list
  if (modalList) {
    modalList.innerHTML = svc.list.map((item) => `<li>${item}</li>`).join("");
  }

  // Activate
  puzzleWrapper?.classList.add("has-active");
  modalLayer.classList.add("visible");
  modalLayer.removeAttribute("aria-hidden");

  // Move focus to close button (accessibility)
  requestAnimationFrame(() => modalClose?.focus());
};

// ============================================================
// MODAL — close
// ============================================================

/** Closes the modal and restores focus to the triggering piece. */
const closeModal = () => {
  if (!modalLayer) return;

  modalLayer.classList.remove("visible");
  modalLayer.setAttribute("aria-hidden", "true");
  puzzleWrapper?.classList.remove("has-active");

  // Restore focus to the piece that opened the modal
  if (activePieceIdx !== null) {
    pieces[activePieceIdx]?.focus();
  }
  activePieceIdx = null;
};

// ============================================================
// BIND PIECE EVENTS
// ============================================================
pieces.forEach((piece, i) => {
  const idx = piece.dataset.service;

  // Mouse hover → image filter + label sync
  piece.addEventListener("mouseenter", () => setHover(idx));
  piece.addEventListener("mouseleave", () => clearHover());

  // Keyboard focus → same as hover
  piece.addEventListener("focus", () => setHover(idx));
  piece.addEventListener("blur", () => clearHover());

  // Click → open modal
  piece.addEventListener("click", () => openModal(Number(idx)));

  // Enter / Space → open modal
  piece.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(Number(idx));
    }
  });
});

// ============================================================
// BIND MODAL CLOSE EVENTS
// ============================================================

// × button
modalClose?.addEventListener("click", closeModal);

// Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalLayer?.classList.contains("visible")) {
    closeModal();
  }
});

// Click on the modal backdrop (outside .piece-modal-content)
modalLayer?.addEventListener("click", (e) => {
  if (e.target === modalLayer) closeModal();
});

// ============================================================
// FOCUS TRAP — keep Tab inside modal while open
// ============================================================
modalLayer?.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;

  const focusable = [...modalLayer.querySelectorAll('button, a[href], [tabindex="0"]')].filter(
    (el) => !el.disabled,
  );

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// ============================================================
// OPTIONAL — subtle label parallax on mousemove
// Remove block if not desired.
// ============================================================
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && puzzleGrid) {
  puzzleGrid.addEventListener("mousemove", (e) => {
    const rect = puzzleGrid.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;

    labelItems.forEach((item) => {
      const depth = item.classList.contains("is-hovered") ? 5 : 2;
      item.style.transform = `translate(calc(-50% + ${(cx * depth).toFixed(2)}px), calc(-50% + ${(cy * depth).toFixed(2)}px))`;
    });
  });

  puzzleGrid.addEventListener("mouseleave", () => {
    labelItems.forEach((item) => {
      item.style.transform = "";
    });
  });
}
