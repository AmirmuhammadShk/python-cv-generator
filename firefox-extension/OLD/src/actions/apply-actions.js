// src/actions/apply-actions.js
import { setText, toggle } from "../utils/dom.js";
import { save } from "../storage/storage.js";
import { validateInitial, validateUpdates } from "../validation/validation.js";
import { randomDelayMs, randomPrompt } from "../utils/rand.js";
import { setGenerateUIByState } from "../ui/apply-ui.js";

export function bindApplyActions(app) {
  const {
    jobInput, companyInput, updatesInput,
    checkBtn, generateBtn, copyBtn, createCvBtn,
    statusEl, updatesSection, jobErr, companyErr, updatesErr
  } = app.el;

  checkBtn.addEventListener("click", async () => {
    if (!validateInitial({ jobInput, jobErr, companyInput, companyErr, statusEl, setText })) { await save(app.data); return; }
    app.data.sessionGenReveal = false;
    const notApplied = Math.random() < 0.5;
    app.data.state = notApplied ? "not_applied" : "applied";
    setText(statusEl, `Status: ${notApplied ? "not applied" : "applied"}`);
    toggle(updatesSection, false);
    app.data.generatedPrompt = "";
    setGenerateUIByState(app);
    await save(app.data);
  });

  generateBtn.addEventListener("click", async () => {
    if (app.data.state !== "not_applied") return;
    app.data.sessionGenReveal = false;
    app.data.state = "generating";
    setGenerateUIByState(app);
    setText(statusEl, "Generating prompt...");

    await new Promise((r) => setTimeout(r, randomDelayMs()));
    app.data.generatedPrompt = randomPrompt(app.contextHeader());
    app.data.state = "generated";
    app.data.sessionGenReveal = true;
    setGenerateUIByState(app);
    setText(statusEl, "Prompt ready. You can copy it.");
    await save(app.data);
  });

  copyBtn.addEventListener("click", async () => {
    if (!app.data.generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(app.data.generatedPrompt);
      const old = copyBtn.textContent; copyBtn.textContent = "Copied";
      setTimeout(() => (copyBtn.textContent = old), 1200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = app.data.generatedPrompt; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    }
    toggle(updatesSection, true);
    updatesInput.focus();
    setText(statusEl, "Add CV Updates, then Create CV.");
    await save(app.data);
  });

  updatesInput.addEventListener("input", async () => { 
    validateUpdates({ updatesInput, updatesErr, createCvBtn }); 
    await save(app.data); 
  });

  createCvBtn.addEventListener("click", async () => {
    if (!validateUpdates({ updatesInput, updatesErr, createCvBtn })) { await save(app.data); return; }
    setText(statusEl, "CV created.");
    await save(app.data);
  });

  // field-level validation & persistence
  jobInput.addEventListener("blur", async () => { 
    validateInitial({ jobInput, jobErr, companyInput, companyErr, statusEl, setText });
    await save(app.data); 
  });
  companyInput.addEventListener("blur", async () => { 
    validateInitial({ jobInput, jobErr, companyInput, companyErr, statusEl, setText });
    await save(app.data); 
  });
  jobInput.addEventListener("input", () => { app.data.fields.job = jobInput.value; save(app.data); });
  companyInput.addEventListener("input", () => { app.data.fields.company = companyInput.value; save(app.data); });
}
