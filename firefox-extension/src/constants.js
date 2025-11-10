// path: src/constants.js
export const STORAGE_KEY = "smartApplyState";
export const SETTINGS_JSON_KEY = "smartApplySettingsJSON"; // optional legacy store

// Allowed states: "unknown" | "applied" | "not_applied" | "generating" | "generated"
export const INITIAL_STATE = {
  auth: {
    isLoggedIn: false,
    token: "",
    user: null // {id, email}
  },

  state: "unknown",
  generatedPrompt: "",
  sessionGenReveal: false,

  fields: { job: "", company: "", updates: "" },

  settings: {
    name: "", role: "", email: "", phone: "",
    linkedin: "", address: "", summary: "",
    educations: [], experiences: [], languages: [], skills: []
  },

  ui: { showUpdates: false, createEnabled: false, activeTab: "auth_login", applyEnabled: false },
  statusText: ""
};
