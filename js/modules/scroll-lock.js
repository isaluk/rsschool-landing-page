let lockCount = 0;

export function lockScroll() {
  lockCount += 1;
  document.documentElement.classList.add("is-scroll-locked");
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.classList.remove("is-scroll-locked");
  }
}
