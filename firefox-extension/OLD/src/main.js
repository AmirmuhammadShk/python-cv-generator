// src/main.js
import { app } from "./state/state.js";
import { $, setText, toggle } from "./utils/dom.js";
import { load, save, clearSettingsJSON } from "./storage/storage.js";
import { setTab, activeTab } from "./ui/tabs.js";
import { setGenerateUIByState } from "./ui/apply-ui.js";
import { bindApplyActions } from "./actions/apply-actions.js";
import { bindSettingsInputs, bindSettingsAdders, ensureAtLeastOneRow } from "./actions/settings-actions.js";

// 1) Collect all DOM refs once
app.el = {
  // tabs/topbar
  tabApply: $("#tabApply"),
  tabSetting: $("#tabSetting"),
  clearBtn: $("#clearBtn"),
  tabApplyPane: $("#tabApplyPane"),
  tabSettingPane: $("#tabSettingPane"),

  // apply
  jobInput: $("#job"),
  companyInput: $("#company"),
  checkBtn: $("#checkBtn"),
  statusEl: $("#status"),
  jobErr: $("#jobErr"),
  companyErr: $("#companyErr"),
  generateStep: $("#generateStep"),
  generateBtn: $("#generateBtn"),
  genLoading: $("#genLoading"),
  genDone: $("#genDone"),
  copyBtn: $("#copyBtn"),
  updatesSection: $("#updatesSection"),
  updatesInput: $("#updates"),
  updatesErr: $("#updatesErr"),
  createCvBtn: $("#createCvBtn"),

  // settings basics
  s_name: $("#s_name"),
  s_role: $("#s_role"),
  s_email: $("#s_email"),
  s_phone: $("#s_phone"),
  s_linkedin: $("#s_linkedin"),
  s_address: $("#s_address"),
  s_summary: $("#s_summary"),

  // lists & adders
  eduList: $("#eduList"),
  expList: $("#expList"),
  langList: $("#langList"),
  skillList: $("#skillList"),

  addEduBtn: $("#addEduBtn"),
  addExpBtn: $("#addExpBtn"),
  addLangBtn: $("#addLangBtn"),
  addSkillBtn: $("#addSkillBtn"),
};

// 2) Restore persisted data
async function restore() {
  const data = await load();
  if (data) app.data = data;

  // Fill fields from restored data
  const d = app.data;
  app.el.jobInput.value = d.fields.job || "";
  app.el.companyInput.value = d.fields.company || "";
  app.el.updatesInput.value = d.fields.updates || "";

  app.el.s_name.value     = d.settings.name || "";
  app.el.s_role.value     = d.settings.role || "";
  app.el.s_email.value    = d.settings.email || "";
  app.el.s_phone.value    = d.settings.phone || "";
  app.el.s_linkedin.value = d.settings.linkedin || "";
  app.el.s_address.value  = d.settings.address || "";
  app.el.s_summary.value  = d.settings.summary || "";

  setText(app.el.statusEl, d.statusText || "");

  // Always start on Apply tab when the extension opens.
  setTab(app, "apply");
}

// 3) Bind events for tabs and clear
function bindGlobal() {
  app.el.tabApply.addEventListener("click", async () => { setTab(app, "apply"); await save(app.data); });
  app.el.tabSetting.addEventListener("click", async () => { setTab(app, "setting"); await save(app.data); });

  app.el.clearBtn.addEventListener("click", async () => {
    const tab = activeTab(app);
    if (tab === "apply") {
      app.data.state = "unknown";
      app.data.generatedPrompt = "";
      app.data.sessionGenReveal = false;

      app.data.fields = { job: "", company: "", updates: "" };
      app.el.jobInput.value = "";
      app.el.companyInput.value = "";
      app.el.updatesInput.value = "";

      app.el.jobErr.classList.add("hidden");
      app.el.companyErr.classList.add("hidden");
      app.el.updatesErr.classList.add("hidden");
      app.el.jobInput.classList.remove("error");
      app.el.companyInput.classList.remove("error");
      app.el.updatesInput.classList.remove("error");

      toggle(app.el.updatesSection, false);
      app.el.createCvBtn.disabled = true;
      setText(app.el.statusEl, "Apply state cleared.");
      setGenerateUIByState(app);
      app.el.jobInput.focus();
    } else {
      // CLEAR SETTINGS (and remove the exact-structure JSON)
      app.data.settings = {
        name: "", role: "", email: "", phone: "",
        linkedin: "", address: "", summary: "",
        educations: [], experiences: [], languages: [], skills: []
      };
      ensureAtLeastOneRow(app);
      setText(app.el.statusEl, "Settings cleared.");
      await clearSettingsJSON();
    }
    await save(app.data);
  });
}

// 4) Init
(async function init() {
  await restore();
  ensureAtLeastOneRow(app);
  setGenerateUIByState(app);
  bindGlobal();
  bindApplyActions(app);
  bindSettingsInputs(app);
  bindSettingsAdders(app);
})();
