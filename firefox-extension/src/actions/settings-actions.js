// path: src/actions/settings-actions.js
import { save } from "../storage/storage.js";
import { renderAllLists, addEdu, addExp, addLang, addSkill } from "../ui/settings-ui.js";

export function bindSettingsInputs(app) {
  const { s_name, s_role, s_email, s_phone, s_linkedin, s_address, s_summary } = app.el;

  const map = [
    [s_name,     v => app.data.settings.name = v],
    [s_role,     v => app.data.settings.role = v],
    [s_email,    v => app.data.settings.email = v],
    [s_phone,    v => app.data.settings.phone = v],
    [s_linkedin, v => app.data.settings.linkedin = v],
    [s_address,  v => app.data.settings.address = v],
    [s_summary,  v => app.data.settings.summary = v],
  ];

  map.forEach(([el, setter]) => {
    el.addEventListener("input", () => { setter(el.value); save(app.data); });
  });
}

export function bindSettingsAdders(app) {
  const { addEduBtn, addExpBtn, addLangBtn, addSkillBtn } = app.el;
  addEduBtn.addEventListener("click", () => addEdu(app));
  addExpBtn.addEventListener("click", () => addExp(app));
  addLangBtn.addEventListener("click", () => addLang(app));
  addSkillBtn.addEventListener("click", () => addSkill(app));
}

export function ensureAtLeastOneRow(app) {
  renderAllLists(app);
}
