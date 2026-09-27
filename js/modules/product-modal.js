import { createElement } from "./dom.js";
import { lockScroll, unlockScroll } from "./scroll-lock.js";

const NOTE_TEXT =
  "The cost is not final. Download our mobile app to see the final price and place your order. " +
  "Earn loyalty points and enjoy your favorite coffee with up to 20% discount.";

let modal = null;
let elements = null;
let basePrice = 0;

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function createOption({ type, name, value, price, mark, label, checked }) {
  const option = createElement("label", "option");

  const input = createElement("input", "option__input");
  input.type = type;
  input.name = name;
  input.value = value;
  input.dataset.price = price;
  input.checked = checked;

  const pillMark = createElement("span", "pill__mark", mark);
  pillMark.setAttribute("aria-hidden", "true");

  const pill = createElement("span", "pill option__pill");
  pill.append(pillMark, label);

  option.append(input, pill);

  return option;
}

function createOptionsGroup(legend) {
  const group = createElement("fieldset", "modal__group");
  const options = createElement("div", "modal__options");
  group.append(createElement("legend", "modal__legend", legend), options);

  return { group, options };
}

function updateTotal() {
  const selected = elements.form.querySelectorAll(".option__input:checked");
  const extras = [...selected].reduce(
    (sum, input) => sum + Number(input.dataset.price),
    0,
  );

  elements.total.textContent = formatPrice(basePrice + extras);
}

function fillModal(product) {
  basePrice = Number(product.price);

  elements.image.src = product.image;
  elements.image.alt = product.name;
  elements.title.textContent = product.name;
  elements.description.textContent = product.description;

  const sizeOptions = Object.entries(product.sizes).map(([key, size], index) =>
    createOption({
      type: "radio",
      name: "size",
      value: key,
      price: size["add-price"],
      mark: key.toUpperCase(),
      label: size.size,
      checked: index === 0,
    }),
  );

  const additiveOptions = product.additives.map((additive, index) =>
    createOption({
      type: "checkbox",
      name: "additive",
      value: additive.name,
      price: additive["add-price"],
      mark: String(index + 1),
      label: additive.name,
      checked: false,
    }),
  );

  elements.sizes.replaceChildren(...sizeOptions);
  elements.additives.replaceChildren(...additiveOptions);
  updateTotal();
}

function createModal() {
  const image = createElement("img", "modal__image");
  const media = createElement("div", "modal__media");
  media.append(image);

  const title = createElement("h2", "modal__title");
  title.id = "modal-title";
  const description = createElement("p", "modal__description");
  const intro = createElement("div", "modal__intro");
  intro.append(title, description);

  const sizes = createOptionsGroup("Size");
  const additives = createOptionsGroup("Additives");
  const form = createElement("form", "modal__form");
  form.append(sizes.group, additives.group);

  const total = createElement("span");
  const totalRow = createElement("div", "modal__total");
  totalRow.append(createElement("span", "", "Total:"), total);

  const noteIcon = createElement("span", "icon icon--info");
  noteIcon.setAttribute("aria-hidden", "true");
  const note = createElement("p", "modal__note");
  note.append(noteIcon, NOTE_TEXT);

  const closeButton = createElement("button", "modal__close", "Close");
  closeButton.type = "button";

  const content = createElement("div", "modal__content");
  content.append(intro, form, totalRow, note, closeButton);

  const modalWindow = createElement("div", "modal__window");
  modalWindow.append(media, content);

  modal = createElement("dialog", "modal");
  modal.tabIndex = -1;
  modal.setAttribute("aria-labelledby", title.id);
  modal.append(modalWindow);
  document.body.append(modal);

  elements = {
    image,
    title,
    description,
    form,
    sizes: sizes.options,
    additives: additives.options,
    total,
  };

  form.addEventListener("change", updateTotal);
  form.addEventListener("submit", (event) => event.preventDefault());
  closeButton.addEventListener("click", () => modal.close());

  let isPressedOnBackdrop = false;

  modal.addEventListener("pointerdown", (event) => {
    isPressedOnBackdrop = event.target === modal;
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal && isPressedOnBackdrop) modal.close();
    isPressedOnBackdrop = false;
  });

  modal.addEventListener("close", unlockScroll);
}

export function openProductModal(product) {
  if (!modal) createModal();
  if (modal.open) return;

  fillModal(product);
  modal.showModal();
  modal.focus();
  lockScroll();
}
