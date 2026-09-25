const DATA_URL = "data/products.json";
const LOAD_ERROR_TEXT = "Failed to load the menu. Please try again later.";

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

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
  info.append(
    createElement("h2", "card__title", product.name),
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

  if (!tabs.length || !list || !emptyMessage) return;

  let products = [];

  try {
    products = await loadProducts();
  } catch (error) {
    console.error("Failed to load products:", error);
    emptyMessage.textContent = LOAD_ERROR_TEXT;
  }

  const showCategory = (category) => {
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
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => showCategory(tab.dataset.category));
  });

  showCategory(tabs[0].dataset.category);
}
