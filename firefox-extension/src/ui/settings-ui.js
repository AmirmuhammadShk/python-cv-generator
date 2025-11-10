// path: src/ui/settings-ui.js
import { save, load } from "../storage/storage.js";
import { api } from "../services/api.js";

/** PUBLIC API */
export function renderAllLists(app) {
  ensureSaveButton(app);
  renderEdu(app);
  renderExp(app);
  renderLang(app);
  renderSkill(app);
}

/* -------------------- SETTINGS SAVE BUTTON -------------------- */
function ensureSaveButton(app) {
  const panel = document.querySelector("#tabSettingPane .settings-panel");
  if (!panel) return;
  if (panel.querySelector("#saveSettingsBtn")) return;

  const bar = document.createElement("div");
  bar.className = "row";
  bar.style.justifyContent = "flex-end";
  bar.style.marginBottom = "8px";

  const btn = document.createElement("button");
  btn.id = "saveSettingsBtn";
  btn.type = "button";
  btn.textContent = "Save";
  btn.title = "Save settings to API";

  btn.addEventListener("click", async () => {
    syncBasicsFromInputs(app);

    clearBasicErrorStyles(app);
    setStatus(app, "Saving...", false);

    const v = validateSettings(app.data.settings);
    if (!v.ok) {
      setStatus(app, v.msg, true);
      applyBasicErrorStyles(app, v.missingKeys || []);
      return;
    }

    const exactJson = buildExactSettingsJSON(app.data.settings);

    try {
      const res = await api.saveSettings({ token: app.data.auth.token, settings: exactJson });
      if (!res.ok) {
        setStatus(app, res.msg || "Failed to save settings.", true);
        return;
      }

      await save(app.data);
      const fresh = await load();
      if (fresh) {
        app.data = fresh;
        fillBasicsFromState(app);
        renderAllLists(app);
      }
      app.data.ui.applyEnabled = true;
      setStatus(app, "Settings saved. Apply is now enabled.", false);
    } catch {
      setStatus(app, "Failed to save settings.", true);
    }
  });

  bar.appendChild(btn);
  panel.prepend(bar);
}

/* -------------------- STATUS & ERROR HELPERS -------------------- */
function setStatus(app, msg, isError) {
  if (!app?.el?.statusEl) return;
  app.el.statusEl.textContent = msg || "";
  app.el.statusEl.style.color = isError ? "#b42318" : "#6b7280";
}

function clearBasicErrorStyles(app) {
  const { s_name, s_role, s_email, s_phone, s_linkedin, s_address, s_summary } = app.el;
  [s_name, s_role, s_email, s_phone, s_linkedin, s_address, s_summary].forEach(el => {
    el?.classList.remove("error");
  });
}

function applyBasicErrorStyles(app, missingKeys) {
  const map = {
    name: "s_name",
    role: "s_role",
    email: "s_email",
    phone: "s_phone",
    linkedin: "s_linkedin",
    address: "s_address",
    summary: "s_summary",
  };
  (missingKeys || []).forEach(k => {
    const id = map[k];
    if (id && app.el[id]) app.el[id].classList.add("error");
  });
}

/* -------------------- VALIDATION -------------------- */
function validateSettings(s) {
  const missing = [];
  const req = (k, v) => { if (!v || String(v).trim() === "") missing.push(k); };

  req("summary", s.summary);
  req("email", s.email);
  req("linkedin", s.linkedin);
  req("name", s.name);
  req("role", s.role);
  req("phone", s.phone);
  req("address", s.address);

  if (missing.length) {
    const msg = "Please fill all required fields: " + missing.join(", ");
    return { ok: false, msg, missingKeys: missing };
  }

  if (!Array.isArray(s.languages) || s.languages.length === 0)
    return { ok: false, msg: "At least one language is required." };

  if (!Array.isArray(s.experiences) || s.experiences.length === 0)
    return { ok: false, msg: "At least one experience is required." };

  if (!Array.isArray(s.skills) || s.skills.length === 0)
    return { ok: false, msg: "At least one core skill is required." };

  const hasLangName = s.languages.some(l => (l?.language || "").trim().length > 0);
  if (!hasLangName) return { ok: false, msg: "Language item must include a language name." };

  const hasExp = s.experiences.some(x => (x?.role || x?.company || "").trim().length > 0);
  if (!hasExp) return { ok: false, msg: "Experience item must include a role or company." };

  return { ok: true };
}

/* -------------------- TRANSFORM TO EXACT JSON -------------------- */
function buildExactSettingsJSON(s = {}) {
  const text = (v) => (typeof v === "string" ? v.trim() : "");
  const parseYearMonth = (str) => {
    const t = text(str);
    if (!t) return { year: "", month: "" };
    const m = /^(\d{4})(?:-(\d{2}))?$/.exec(t);
    return m ? { year: m[1] || "", month: m[2] || "" } : { year: "", month: "" };
  };

  const edu0 = Array.isArray(s.educations) && s.educations.length > 0 ? s.educations[0] : {};
  const education = {
    grade: text(edu0?.degree) ? `${text(edu0.degree)}${text(edu0.field) ? ", " + text(edu0.field) : ""}` : "",
    university: text(edu0?.uni),
    start: parseYearMonth(edu0?.start),
    end: parseYearMonth(edu0?.end)
  };

  const experiences = (Array.isArray(s.experiences) ? s.experiences : []).map(x => {
    const loc = [text(x.city), text(x.country)].filter(Boolean).join(", ");
    const startObj = parseYearMonth(x.start);
    const endRaw = text(x.end);
    const isPresent = /present/i.test(endRaw);
    const endVal = isPresent ? "Present" : parseYearMonth(endRaw);

    return {
      role: text(x.role),
      company: text(x.company),
      location: loc,
      type: text(x.type) || text(x.workType) || "",
      workType: "",
      start: startObj,
      end: endVal,
      detail: text(x.description)
    };
  });

  const languages = (Array.isArray(s.languages) ? s.languages : []).map(l => ({
    language: text(l.language),
    level: text(l.level)
  }));

  const coreSkills = Array.isArray(s.skills) ? s.skills.map(text).filter(Boolean) : [];

  return {
    name: text(s.name),
    role: text(s.role),
    contact: {
      email: text(s.email),
      linkedin: text(s.linkedin),
      github: "",
      personalWebsite: "",
      address: text(s.address),
      phone: text(s.phone)
    },
    summary: text(s.summary),
    experiences,
    education,
    languages,
    coreSkills
  };
}

/* -------------------- BASIC FIELD SYNC/HYDRATE -------------------- */
function fillBasicsFromState(app) {
  const d = app.data;
  if (!app?.el) return;

  app.el.s_name.value     = d.settings.name || "";
  app.el.s_role.value     = d.settings.role || "";
  app.el.s_email.value    = d.settings.email || "";
  app.el.s_phone.value    = d.settings.phone || "";
  app.el.s_linkedin.value = d.settings.linkedin || "";
  app.el.s_address.value  = d.settings.address || "";
  app.el.s_summary.value  = d.settings.summary || "";
}

function syncBasicsFromInputs(app) {
  if (!app?.el) return;
  const s = app.data.settings;
  s.name     = app.el.s_name.value || "";
  s.role     = app.el.s_role.value || "";
  s.email    = app.el.s_email.value || "";
  s.phone    = app.el.s_phone.value || "";
  s.linkedin = app.el.s_linkedin.value || "";
  s.address  = app.el.s_address.value || "";
  s.summary  = app.el.s_summary.value || "";
}

/* -------------------- EDUCATION -------------------- */
export function addEdu(app) {
  app.data.settings.educations.push({ degree:"", field:"", uni:"", start:"", end:"" });
  renderEdu(app); save(app.data);
}

function renderEdu(app) {
  const { eduList } = app.el;
  const arr = app.data.settings.educations;
  eduList.innerHTML = "";

  if (arr.length === 0) {
    const note = document.createElement("div");
    note.className = "muted";
    note.textContent = "";
    eduList.appendChild(note);
    return;
  }

  arr.forEach((e, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "entry";
    wrap.innerHTML = `
      <button type="button" class="entry-del" aria-label="Remove education" title="Remove">×</button>
      <div class="grid-3">
        <div><label>Degree</label><input type="text" data-k="degree" value="${e.degree || ""}"></div>
        <div><label>Field</label><input type="text" data-k="field" value="${e.field || ""}"></div>
        <div><label>Uni</label><input type="text" data-k="uni" value="${e.uni || ""}"></div>
      </div>
      <div class="grid-2" style="margin-top:8px;">
        <div><label>Start (optional)</label><input type="text" data-k="start" value="${e.start || ""}"></div>
        <div><label>End (optional)</label><input type="text" data-k="end" value="${e.end || ""}"></div>
      </div>
    `;

    wrap.querySelector(".entry-del").addEventListener("click", async () => {
      arr.splice(idx, 1);
      await save(app.data);
      renderEdu(app);
    });

    wrap.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("input", async () => {
        const key = inp.getAttribute("data-k");
        arr[idx][key] = inp.value;
        await save(app.data);
      });
    });

    eduList.appendChild(wrap);
  });
}

/* -------------------- EXPERIENCE -------------------- */
export function addExp(app) {
  app.data.settings.experiences.push({
    company:"", role:"", city:"", country:"", workType:"Full", start:"", end:"", description:""
  });
  renderExp(app); save(app.data);
}

function renderExp(app) {
  const { expList } = app.el;
  const arr = app.data.settings.experiences;
  expList.innerHTML = "";

  if (arr.length === 0) {
    const note = document.createElement("div");
    note.className = "muted";
    note.textContent = "";
    expList.appendChild(note);
    return;
  }

  arr.forEach((x, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "entry";
    wrap.innerHTML = `
      <button type="button" class="entry-del" aria-label="Remove experience" title="Remove">×</button>
      <div class="grid-2">
        <div><label>Company</label><input type="text" data-k="company" value="${x.company || ""}"></div>
        <div><label>Role</label><input type="text" data-k="role" value="${x.role || ""}"></div>
      </div>
      <div class="grid-3" style="margin-top:8px;">
        <div><label>City</label><input type="text" data-k="city" value="${x.city || ""}"></div>
        <div><label>Country</label><input type="text" data-k="country" value="${x.country || ""}"></div>
        <div>
          <label>Work-Type</label>
          <select data-k="workType">
            <option ${x.workType==="Full"?"selected":""}>Full</option>
            <option ${x.workType==="Part"?"selected":""}>Part</option>
            <option ${x.workType==="Contract"?"selected":""}>Contract</option>
            <option ${x.workType==="Freelance"?"selected":""}>Freelance</option>
          </select>
        </div>
      </div>
      <div class="grid-2" style="margin-top:8px;">
        <div><label>Start</label><input type="text" data-k="start" value="${x.start || ""}"></div>
        <div><label>End</label><input type="text" data-k="end" value="${x.end || ""}"></div>
      </div>
      <div style="margin-top:8px;">
        <label>Description</label>
        <textarea data-k="description">${x.description || ""}</textarea>
      </div>
    `;

    wrap.querySelector(".entry-del").addEventListener("click", async () => {
      arr.splice(idx, 1);
      await save(app.data);
      renderExp(app);
    });

    wrap.querySelectorAll("input,textarea,select").forEach(inp => {
      inp.addEventListener("input", async () => {
        const key = inp.getAttribute("data-k");
        arr[idx][key] = inp.value;
        await save(app.data);
      });
    });

    expList.appendChild(wrap);
  });
}

/* -------------------- LANGUAGES -------------------- */
export function addLang(app) {
  app.data.settings.languages.push({ language:"", level:"Beginner" });
  renderLang(app); save(app.data);
}

function renderLang(app) {
  const { langList } = app.el;
  const arr = app.data.settings.languages;
  langList.innerHTML = "";

  if (arr.length === 0) {
    const note = document.createElement("div");
    note.className = "muted";
    note.textContent = "";
    langList.appendChild(note);
    return;
  }

  arr.forEach((l, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "entry";
    wrap.innerHTML = `
      <button type="button" class="entry-del" aria-label="Remove language" title="Remove">×</button>
      <div class="grid-2">
        <div><label>Language</label><input type="text" data-k="language" value="${l.language || ""}"></div>
        <div>
          <label>Level</label>
          <select data-k="level">
            <option ${l.level==="Beginner"?"selected":""}>Beginner</option>
            <option ${l.level==="Pro"?"selected":""}>Pro</option>
            <option ${l.level==="Fluent"?"selected":""}>Fluent</option>
          </select>
        </div>
      </div>
    `;

    wrap.querySelector(".entry-del").addEventListener("click", async () => {
      arr.splice(idx, 1);
      await save(app.data);
      renderLang(app);
    });

    wrap.querySelectorAll("input,select").forEach(inp => {
      inp.addEventListener("input", async () => {
        const key = inp.getAttribute("data-k");
        arr[idx][key] = inp.value;
        await save(app.data);
      });
    });

    langList.appendChild(wrap);
  });
}

/* -------------------- SKILLS (AS CHIPS) -------------------- */
export function addSkill(app) {
  const { skillList } = app.el;
  if (skillList.querySelector(".inline-form")) return;

  const form = document.createElement("div");
  form.className = "inline-form";
  form.innerHTML = `
    <input type="text" placeholder="Type a skill and press Add…" />
    <button type="button" class="add-btn">Add</button>
  `;
  const input = form.querySelector("input");
  const btn = form.querySelector("button");

  const commit = async () => {
    const val = (input.value || "").trim();
    if (!val) return;
    app.data.settings.skills.push(val);
    await save(app.data);
    renderSkill(app);
  };

  btn.addEventListener("click", commit);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") commit(); });

  skillList.appendChild(form);
  input.focus();
}

function renderSkill(app) {
  const { skillList } = app.el;
  const arr = app.data.settings.skills;
  skillList.innerHTML = "";

  if (arr.length === 0) {
    const note = document.createElement("div");
    note.className = "muted";
    note.textContent = "";
    skillList.appendChild(note);
    return;
  }

  const chips = document.createElement("div");
  chips.className = "chips";

  arr.forEach((s, idx) => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `
      <button type="button" class="del-btn" aria-label="Remove" title="Remove">×</button>
      <span class="label">${s}</span>
    `;
    chip.querySelector(".del-btn").addEventListener("click", async () => {
      app.data.settings.skills.splice(idx, 1);
      await save(app.data);
      renderSkill(app);
    });
    chips.appendChild(chip);
  });
  skillList.appendChild(chips);
}
