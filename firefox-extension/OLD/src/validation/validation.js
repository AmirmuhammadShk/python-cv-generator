// src/validation/validation.js
import { setError } from "../utils/dom.js";

export function validateInitial({ jobInput, jobErr, companyInput, companyErr, statusEl, setText }) {
  const jobEmpty = jobInput.value.trim() === "";
  const companyEmpty = companyInput.value.trim() === "";
  setError(jobInput, jobErr, jobEmpty);
  setError(companyInput, companyErr, companyEmpty);
  if (jobEmpty || companyEmpty) setText(statusEl, "Please fill required fields.");
  return !(jobEmpty || companyEmpty);
}

export function validateUpdates({ updatesInput, updatesErr, createCvBtn }) {
  const empty = updatesInput.value.trim() === "";
  updatesErr?.classList.toggle("hidden", !empty);
  updatesInput.classList.toggle("error", empty);
  createCvBtn.disabled = empty;
  return !empty;
}
