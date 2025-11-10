// src/storage/storage.js
import { STORAGE_KEY, SETTINGS_JSON_KEY } from "../constants.js";

/* ---------- app state (internal structure your app uses) ---------- */
export async function save(data) {
  try { await browser.storage.local.set({ [STORAGE_KEY]: data }); } catch {}
}

export async function load() {
  try {
    const all = await browser.storage.local.get(STORAGE_KEY);
    return all[STORAGE_KEY] || null;
  } catch { return null; }
}

/* ---------- exact-structure settings JSON (requested format) ---------- */
export async function saveSettingsJSON(settingsJson) {
  try { await browser.storage.local.set({ [SETTINGS_JSON_KEY]: settingsJson }); } catch {}
}

export async function loadSettingsJSON() {
  try {
    const all = await browser.storage.local.get(SETTINGS_JSON_KEY);
    return all[SETTINGS_JSON_KEY] || null;
  } catch { return null; }
}

export async function clearSettingsJSON() {
  try { await browser.storage.local.remove(SETTINGS_JSON_KEY); } catch {}
}
