import { lockScroll, unlockScroll } from "./scroll-lock.js";

const DESKTOP_QUERY = "(min-width: 769px)";

export function initNav() {
  const burger = document.querySelector("[data-burger]");
  const nav = document.querySelector("[data-nav]");

  if (!burger || !nav) return;

  let isOpen = false;

  const setOpen = (next) => {
    if (next === isOpen) return;
    isOpen = next;

    nav.classList.toggle("header__nav--open", isOpen);
    burger.classList.toggle("burger--open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
  };

  burger.addEventListener("click", () => setOpen(!isOpen));

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) setOpen(false);
  });

  window.matchMedia(DESKTOP_QUERY).addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}
