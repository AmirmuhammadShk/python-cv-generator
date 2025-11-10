// path: src/ui/apply-ui.js
import { toggle } from "../utils/dom.js";

export function setGenerateUIByState(app) {
  const { generateStep, genDone } = app.el;
  const show = ["generated"].includes(app.data.state);
  toggle(generateStep, show);
  genDone.classList.toggle("hidden", !(app.data.state === "generated" && app.data.generatedPrompt));
}
