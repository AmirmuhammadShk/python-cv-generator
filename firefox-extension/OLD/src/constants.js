// src/constants.js
export const STORAGE_KEY = "jobApplyState";
export const SETTINGS_JSON_KEY = "jobApplySettingsJSON"; // exact-structure JSON store

// Allowed states: "unknown" | "applied" | "not_applied" | "generating" | "generated"
export const INITIAL_STATE = {
  state: "unknown",
  generatedPrompt: "",
  sessionGenReveal: false,
  fields: { job: "", company: "", updates: "" },
  settings: {
    name: "", role: "", email: "", phone: "",
    linkedin: "", address: "", summary: "",
    educations: [], experiences: [], languages: [], skills: []
  },
  ui: { showUpdates: false, createEnabled: false, activeTab: "apply" },
  statusText: ""
};
