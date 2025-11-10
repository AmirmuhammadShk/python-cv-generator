// src/ui/apply-ui.js
import { toggle } from "../utils/dom.js";

export function setGenerateUIByState(app) {
  const { generateStep, generateBtn, genLoading, genDone } = app.el;
  const showGenerate = ["not_applied", "generating", "generated"].includes(app.data.state);
  toggle(generateStep, showGenerate);
  generateBtn.classList.toggle("hidden", !(app.data.state === "not_applied"));
  toggle(genLoading, app.data.state === "generating");
  toggle(genDone, app.data.state === "generated" && app.data.sessionGenReveal === true);
}
