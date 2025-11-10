// path: src/utils/dom.js
export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const toggle  = (el, show) => el.classList.toggle("hidden", !show);
export const setText = (el, text) => { el.textContent = text; };

export function setError(inputEl, errEl, show) {
  inputEl.classList.toggle("error", !!show);
  errEl.classList.toggle("hidden", !show);
}
