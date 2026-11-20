// Kit Printer: the product page side. It cleans what the buyer types (capitals, single spaces), shows it on the
// shirt as they type, and stops the add-to-cart with a plain message if the print isn't allowed. The same rules
// (print.js, a copy of shared/print.js) run again inside Shopify's checkout, so this is a convenience, not the guard.
import { checkPrint, cleanName } from "./print.js";

for (const box of document.querySelectorAll("[data-kit-printer]")) setUp(box);

function setUp(box) {
  const name = box.querySelector("[data-kp-name]");
  const number = box.querySelector("[data-kp-number]");
  const nameOut = box.querySelector("[data-kp-name-out]");
  const numberOut = box.querySelector("[data-kp-number-out]");
  const error = box.querySelector("[data-kp-error]");

  // The block sits outside the theme's add-to-cart form, so point the inputs at that form.
  const form = findCartForm(box);
  if (!form) {
    error.textContent = "Printing isn't available on this page right now.";
    error.hidden = false;
    name.disabled = number.disabled = true;
    return;
  }
  // Read the id with getAttribute, never form.id: Shopify's cart form has a field named "id" (the variant), and
  // a field's name shadows the form's own property, so form.id returns that field instead of the form's id.
  let formId = form.getAttribute("id");
  if (!formId) { formId = "kp-form-" + Math.random().toString(36).slice(2); form.setAttribute("id", formId); }
  name.setAttribute("form", formId);
  number.setAttribute("form", formId);

  const update = () => {
    tidy(name, cleanName(name.value).replace(/^ /, ""));
    tidy(number, number.value.replace(/\D/g, ""));
    nameOut.textContent = name.value.trim();
    numberOut.textContent = number.value;
    show(checkPrint(name.value, number.value));
  };
  for (const input of [name, number]) {
    input.addEventListener("input", update);
    input.addEventListener("blur", update);
  }

  // Runs before the theme's own add-to-cart handler, so a bad print never leaves the page.
  form.addEventListener("submit", (event) => {
    name.value = cleanName(name.value);
    const result = checkPrint(name.value, number.value);
    show(result);
    if (!result.ok) {
      event.preventDefault();
      event.stopImmediatePropagation();
      (result.field === "number" ? number : name).focus();
      return;
    }
    // Leave empty boxes out of the cart entirely (disabled fields aren't sent), so a plain kit has no blank
    // "Print name" line. Switched back on straight after, once the theme has read the form.
    for (const input of [name, number]) input.disabled = !input.value.trim();
    setTimeout(() => { name.disabled = number.disabled = false; }, 0);
  }, true);

  function show(result) {
    const bad = !result.ok;
    error.textContent = bad ? result.reason : "";
    error.hidden = !bad;
    name.setAttribute("aria-invalid", String(bad && result.field === "name"));
    number.setAttribute("aria-invalid", String(bad && result.field === "number"));
  }
}

// Replace a box's text only when it changed, and keep the cursor where it was, so typing in the middle of a
// name doesn't throw the cursor to the end.
function tidy(input, value) {
  if (input.value === value) return;
  const at = input.selectionStart ?? value.length;
  const drift = input.value.length - value.length;
  input.value = value;
  if (document.activeElement === input) input.setSelectionRange(Math.max(0, at - drift), Math.max(0, at - drift));
}

function findCartForm(box) {
  const inSection = box.closest("section, .shopify-section")?.querySelector('form[action*="/cart/add"]');
  return inSection || document.querySelector('form[action*="/cart/add"]');
}
