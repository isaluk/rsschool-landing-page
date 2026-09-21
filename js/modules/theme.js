const STORAGE_KEY = "theme";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const toggleButton = document.querySelector("[data-theme-button]");
  if (!toggleButton) return;

  const isDark = theme === "dark";
  toggleButton.setAttribute(
    "aria-label",
    isDark ? "Light theme" : "Dark theme",
  );
  toggleButton.dataset.themeButton = theme;
}

export function initTheme() {
  applyTheme(document.documentElement.dataset.theme);

  const toggleButton = document.querySelector("[data-theme-button]");

  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      const currentTheme = document.documentElement.dataset.theme;
      const newTheme = currentTheme === "dark" ? "light" : "dark";

      localStorage.setItem(STORAGE_KEY, newTheme);
      applyTheme(newTheme);
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      applyTheme(event.newValue);
    }
  });
}
