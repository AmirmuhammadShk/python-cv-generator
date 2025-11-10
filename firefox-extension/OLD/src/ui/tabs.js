// src/ui/tabs.js
import { toggle } from "../utils/dom.js";

export function setTab(app, name) {
  const { tabApply, tabSetting, tabApplyPane, tabSettingPane } = app.el;
  const applyActive = name === "apply";
  tabApply.classList.toggle("active", applyActive);
  tabSetting.classList.toggle("active", !applyActive);
  tabApplyPane.classList.toggle("hidden", !applyActive);
  tabSettingPane.classList.toggle("hidden", applyActive);
  document.body.classList.toggle("settings-open", !applyActive);
  app.activeTab = applyActive ? "apply" : "setting";
}

export const activeTab = (app) => app.activeTab;
