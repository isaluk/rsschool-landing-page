const SWIPE_THRESHOLD = 50;

export function initSlider() {
  const slider = document.querySelector("[data-slider]");
  if (!slider) return;

  const viewport = slider.querySelector("[data-slider-viewport]");
  const track = slider.querySelector("[data-slider-track]");
  const prevButton = slider.querySelector("[data-slider-prev]");
  const nextButton = slider.querySelector("[data-slider-next]");
  const dots = [...slider.querySelectorAll("[data-slider-dot]")];
  const slides = [...track.children];
  const count = slides.length;

  if (count < 2) return;

  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[count - 1].cloneNode(true);
  [firstClone, lastClone].forEach((clone) => {
    clone.setAttribute("aria-hidden", "true");
  });
  track.prepend(lastClone);
  track.append(firstClone);

  let position = 1;
  let isAnimating = false;

  const getCurrentIndex = () => (position - 1 + count) % count;

  const moveTrack = (animate) => {
    if (!animate) {
      track.classList.add("slider__track--instant");
    }

    track.style.transform = `translateX(${-position * 100}%)`;

    if (!animate) {
      void track.offsetWidth;
      track.classList.remove("slider__track--instant");
    }
  };

  const updateState = () => {
    const current = getCurrentIndex();

    slides.forEach((slide, index) => {
      slide.setAttribute("aria-hidden", String(index !== current));
    });

    dots.forEach((dot, index) => {
      const isActive = index === current;
      dot.classList.toggle("slider__dot--active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  };

  const goTo = (nextPosition) => {
    if (isAnimating || nextPosition === position) return;

    isAnimating = true;
    position = nextPosition;
    moveTrack(true);
    updateState();
  };

  const showNext = () => goTo(position + 1);
  const showPrev = () => goTo(position - 1);

  const handleTransitionEnd = (event) => {
    if (event.target !== track || event.propertyName !== "transform") return;

    isAnimating = false;

    if (position === 0 || position === count + 1) {
      position = getCurrentIndex() + 1;
      moveTrack(false);
    }
  };

  track.addEventListener("transitionend", handleTransitionEnd);
  track.addEventListener("transitioncancel", handleTransitionEnd);

  prevButton?.addEventListener("click", showPrev);
  nextButton?.addEventListener("click", showNext);

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goTo(index + 1));
  });

  let startX = null;
  let startY = null;

  viewport.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) return;
    startX = event.clientX;
    startY = event.clientY;
  });

  viewport.addEventListener("pointerup", (event) => {
    if (startX === null) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    startX = null;

    if (
      Math.abs(deltaX) < SWIPE_THRESHOLD ||
      Math.abs(deltaX) < Math.abs(deltaY)
    )
      return;

    if (deltaX < 0) {
      showNext();
    } else {
      showPrev();
    }
  });

  viewport.addEventListener("pointercancel", () => {
    startX = null;
  });

  viewport.addEventListener("dragstart", (event) => event.preventDefault());

  moveTrack(false);
  updateState();
}
