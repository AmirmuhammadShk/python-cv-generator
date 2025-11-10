// path: src/main.js
import { app } from "./state/state.js";
import { $, setText, toggle } from "./utils/dom.js";
import { load, save } from "./storage/storage.js";
import { setTab, activeTab } from "./ui/tabs.js";
import { setGenerateUIByState } from "./ui/apply-ui.js";
import { bindApplyActions } from "./actions/apply-actions.js";
import { bindSettingsInputs, bindSettingsAdders, ensureAtLeastOneRow } from "./actions/settings-actions.js";
import { bindAuthActions, loadSettingsIntoApp, setStatus } from "./actions/auth-actions.js";

// 1) Collect DOM refs
app.el = {
  // tabs/topbar
  tabLogin: $("#tabLogin"),
  tabRegister: $("#tabRegister"),
  tabSetting: $("#tabSetting"),
  tabApply: $("#tabApply"),
  clearBtn: $("#clearBtn"),

  // panes
  tabLoginPane: $("#tabLoginPane"),
  tabRegisterPane: $("#tabRegisterPane"),
  tabSettingPane: $("#tabSettingPane"),
  tabApplyPane: $("#tabApplyPane"),

  // auth inputs
  loginEmail: $("#loginEmail"),
  loginPass: $("#loginPass"),
  loginBtn: $("#loginBtn"),
  regEmail: $("#regEmail"),
  regPass: $("#regPass"),
  regPass2: $("#regPass2"),
  registerBtn: $("#registerBtn"),

  // apply
  jobInput: $("#job"),
  companyInput: $("#company"),
  checkBtn: $("#checkBtn"),
  statusEl: $("#status"),
  jobErr: $("#jobErr"),
  companyErr: $("#companyErr"),
  generateStep: $("#generateStep"),
  genDone: $("#genDone"),
  copyBtn: $("#copyBtn"),
  updatesSection: $("#updatesSection"),
  updatesInput: $("#updates"),
  updatesErr: $("#updatesErr"),
  createCvBtn: $("#createCvBtn"),
  cvResult: $("#cvResult"),

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

// 2) Restore (auth first)
async function restore() {
  const data = await load();
  if (data) app.data = data;

  if (app.data.auth?.isLoggedIn) {
    setTab(app, "setting");
    await loadSettingsIntoApp(app);
  } else {
    setTab(app, "auth_login");
  }

  const d = app.data;
  app.el.jobInput.value = d.fields.job || "";
  app.el.companyInput.value = d.fields.company || "";
  app.el.updatesInput.value = d.fields.updates || "";

  setText(app.el.statusEl, d.statusText || "");
  app.data.ui.applyEnabled = !!app.data.ui.applyEnabled;
}

// 3) Bind tab buttons and clear
function bindGlobal() {
  app.el.tabLogin.addEventListener("click", async () => { setTab(app, "auth_login"); await save(app.data); });
  app.el.tabRegister.addEventListener("click", async () => { setTab(app, "auth_register"); await save(app.data); });
  app.el.tabSetting.addEventListener("click", async () => { setTab(app, "setting"); await save(app.data); });
  app.el.tabApply.addEventListener("click", async () => { setTab(app, "apply"); await save(app.data); });

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
    } else if (tab === "setting") {
      app.data.settings = {
        name: "", role: "", email: "", phone: "",
        linkedin: "", address: "", summary: "",
        educations: [], experiences: [], languages: [], skills: []
      };
      ensureAtLeastOneRow(app);
      setText(app.el.statusEl, "Local settings cleared (API unchanged).");
    } else {
      app.data.auth = { isLoggedIn: false, token: "", user: null };
      app.data.ui.applyEnabled = false;
      setText(app.el.statusEl, "Logged out / state cleared.");
      setTab(app, "auth_login");
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
  bindAuthActions(app);
  bindApplyActions(app);
  bindSettingsInputs(app);
  bindSettingsAdders(app);

  app.el.tabApply.classList.toggle("disabled", !app.data.ui.applyEnabled);
})();
