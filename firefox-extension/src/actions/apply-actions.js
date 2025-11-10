// path: src/actions/apply-actions.js
import { setText, toggle } from "../utils/dom.js";
import { save } from "../storage/storage.js";
import { validateInitial, validateUpdates } from "../validation/validation.js";
import { setGenerateUIByState } from "../ui/apply-ui.js";
import { api } from "../services/api.js";

export function bindApplyActions(app) {
  const {
    jobInput, companyInput, updatesInput,
    checkBtn, copyBtn, createCvBtn,
    statusEl, updatesSection, jobErr, companyErr, updatesErr, genDone, cvResult
  } = app.el;

  checkBtn.addEventListener("click", async () => {
    if (!validateInitial({ jobInput, jobErr, companyInput, companyErr, statusEl, setText })) { await save(app.data); return; }
    setText(statusEl, "Checking application status...");

    const { ok, status, prompt, msg } = await api.applyCheck({
      token: app.data.auth.token,
      job: jobInput.value.trim(),
      company: companyInput.value.trim()
    });

    if (!ok) { setText(statusEl, msg || "Failed to check."); return; }

    if (status === "applied") {
      app.data.state = "applied";
      setText(statusEl, "You applied for this job before");
      app.data.generatedPrompt = "";
      genDone.classList.add("hidden");
      toggle(updatesSection, false);
      await save(app.data);
      return;
    }

    app.data.state = "generated";
    app.data.generatedPrompt = prompt || "";
    setGenerateUIByState(app);
    setText(statusEl, "Prompt ready. You can copy it.");
    genDone.classList.remove("hidden");
    toggle(updatesSection, true);
    updatesInput.focus();
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
    setText(statusEl, "Prompt copied. Paste/update your CV below, then Create CV.");
    await save(app.data);
  });

  updatesInput.addEventListener("input", async () => {
    validateUpdates({ updatesInput, updatesErr, createCvBtn });
    app.data.fields.updates = updatesInput.value;
    await save(app.data);
  });

  createCvBtn.addEventListener("click", async () => {
    if (!validateUpdates({ updatesInput, updatesErr, createCvBtn })) { await save(app.data); return; }
    setText(statusEl, "Creating CV...");
    cvResult.textContent = "";

    const { ok, downloadUrl, msg } = await api.createCv({
      token: app.data.auth.token,
      modifiedText: updatesInput.value.trim()
    });

    if (!ok) { setText(statusEl, msg || "Failed to create CV.", true); return; }

    setText(statusEl, "CV created.");
    cvResult.innerHTML = `Download: <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer">Your CV</a>`;
    await save(app.data);
  });

  jobInput.addEventListener("input", () => { app.data.fields.job = jobInput.value; save(app.data); });
  companyInput.addEventListener("input", () => { app.data.fields.company = companyInput.value; save(app.data); });
}
