import { createElement } from "./dom.js";
import { openProductModal } from "./product-modal.js";

const DATA_URL = "data/products.json";
const LOAD_ERROR_TEXT = "Failed to load the menu. Please try again later.";
const TABLET_QUERY = "(max-width: 768px)";
const TABLET_INITIAL_COUNT = 4;

function createCard(product) {
  const item = createElement("li", "catalog__item");
  item.dataset.productId = product.id;

  const card = createElement("article", "card");

  const media = createElement("div", "card__media");
  const image = createElement("img", "card__image");
  image.src = product.image;
  image.alt = product.name;
  image.loading = "lazy";
  media.append(image);

  const body = createElement("div", "card__body");
  const info = createElement("div", "card__info");
  const title = createElement("h2", "card__title");
  const button = createElement("button", "card__button", product.name);
  button.type = "button";
  title.append(button);
  info.append(
    title,
    createElement("p", "card__description", product.description),
  );
  body.append(info, createElement("span", "card__price", `$${product.price}`));

  card.append(media, body);
  item.append(card);

  return item;
}

async function loadProducts() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function initCatalog() {
  const tabs = [...document.querySelectorAll("[data-catalog-tab]")];
  const list = document.querySelector("[data-catalog-list]");
  const emptyMessage = document.querySelector("[data-catalog-empty]");
  const moreButton = document.querySelector("[data-catalog-more]");
  const tabletQuery = window.matchMedia(TABLET_QUERY);

  if (!tabs.length || !list || !emptyMessage || !moreButton) return;

  let products = [];
  let isExpanded = false;

  try {
    products = await loadProducts();
  } catch (error) {
    console.error("Failed to load products:", error);
    emptyMessage.textContent = LOAD_ERROR_TEXT;
  }

  const updateVisibleCards = () => {
    const cards = [...list.children];
    const limit =
      tabletQuery.matches && !isExpanded ? TABLET_INITIAL_COUNT : cards.length;

    cards.forEach((card, index) => {
      card.hidden = index >= limit;
    });

    moreButton.hidden = cards.length <= limit;
  };

  const showCategory = (category) => {
    isExpanded = false;

    tabs.forEach((tab) => {
      const isActive = tab.dataset.category === category;
      tab.classList.toggle("pill--active", isActive);
      tab.setAttribute("aria-pressed", String(isActive));
    });

    const cards = products
      .filter((product) => product.category === category)
      .map(createCard);

    list.replaceChildren(...cards);
    list.hidden = cards.length === 0;
    emptyMessage.hidden = cards.length > 0;
    updateVisibleCards();
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => showCategory(tab.dataset.category));
  });

  list.addEventListener("click", (event) => {
    const item = event.target.closest("[data-product-id]");
    if (!item) return;

    const product = products.find(({ id }) => id === item.dataset.productId);
    if (product) openProductModal(product);
  });

  moreButton.addEventListener("click", () => {
    isExpanded = true;
    updateVisibleCards();
    list.children[TABLET_INITIAL_COUNT]
      ?.querySelector(".card__button")
      .focus({ preventScroll: true });
  });

  tabletQuery.addEventListener("change", updateVisibleCards);

  showCategory(tabs[0].dataset.category);
}
