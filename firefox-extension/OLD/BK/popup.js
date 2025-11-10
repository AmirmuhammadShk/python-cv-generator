(function () {
  const $ = (sel) => document.querySelector(sel);

  // --- Tabs / Topbar ---
  const tabApply = $("#tabApply");
  const tabSetting = $("#tabSetting");
  const clearBtn = $("#clearBtn");
  const tabApplyPane = $("#tabApplyPane");
  const tabSettingPane = $("#tabSettingPane");

  function activeTab() {
    return tabApply.classList.contains("active") ? "apply" : "setting";
  }
  function setTab(name) {
    const applyActive = name === "apply";
    tabApply.classList.toggle("active", applyActive);
    tabSetting.classList.toggle("active", !applyActive);
    tabApplyPane.classList.toggle("hidden", !applyActive);
    tabSettingPane.classList.toggle("hidden", applyActive);
    // Double popup width/height for settings
    document.body.classList.toggle("settings-open", !applyActive);
  }

  // --- Apply tab Elements (existing) ---
  const jobInput = $("#job");
  const companyInput = $("#company");
  const checkBtn = $("#checkBtn");
  const statusEl = $("#status");

  const jobErr = $("#jobErr");
  const companyErr = $("#companyErr");

  const generateStep = $("#generateStep");
  const generateBtn = $("#generateBtn");
  const genLoading = $("#genLoading");
  const genDone = $("#genDone"); // "Prompt Generated" + Copy
  const copyBtn = $("#copyBtn");

  const updatesSection = $("#updatesSection");
  const updatesInput = $("#updates");
  const updatesErr = $("#updatesErr");
  const createCvBtn = $("#createCvBtn");

  // --- Settings tab Elements (basics) ---
  const s_name = $("#s_name");
  const s_role = $("#s_role");
  const s_email = $("#s_email");
  const s_phone = $("#s_phone");
  const s_linkedin = $("#s_linkedin");
  const s_address = $("#s_address");
  const s_summary = $("#s_summary");

  // Multi-entry containers & add buttons
  const eduList = $("#eduList");
  const expList = $("#expList");
  const langList = $("#langList");
  const skillList = $("#skillList");

  const addEduBtn = $("#addEduBtn");
  const addExpBtn = $("#addExpBtn");
  const addLangBtn = $("#addLangBtn");
  const addSkillBtn = $("#addSkillBtn");

  // State
  // "unknown" | "applied" | "not_applied" | "generating" | "generated"
  let state = "unknown";
  let generatedPrompt = "";
  // session-only flag to reveal genDone only after Generate is clicked in this session
  let sessionGenReveal = false;

  // Settings arrays
  let educations = []; // [{degree, field, uni, start, end}]
  let experiences = []; // [{company, role, city, country, workType, start, end, description}]
  let languages = []; // [{language, level}]
  let skills = []; // ["React", "Kubernetes", ...]

  // ---------- Persistence ----------
  const KEY = "jobApplyState";
  async function save() {
    const data = {
      state,
      fields: {
        job: jobInput.value,
        company: companyInput.value,
        updates: updatesInput.value
      },
      settings: {
        name: s_name.value,
        role: s_role.value,
        email: s_email.value,
        phone: s_phone.value,
        linkedin: s_linkedin.value,
        address: s_address.value,
        summary: s_summary.value,
        educations,
        experiences,
        languages,
        skills
      },
      generatedPrompt,
      ui: {
        showUpdates: !updatesSection.classList.contains("hidden"),
        createEnabled: !createCvBtn.disabled,
        activeTab: activeTab()
      },
      statusText: statusEl.textContent
    };
    try { await browser.storage.local.set({ [KEY]: data }); } catch {}
  }

  async function load() {
    try {
      const all = await browser.storage.local.get(KEY);
      const data = all[KEY];
      if (!data) return;

      // restore Apply fields
      jobInput.value = data.fields?.job || "";
      companyInput.value = data.fields?.company || "";
      updatesInput.value = data.fields?.updates || "";

      // restore Settings fields
      s_name.value = data.settings?.name || "";
      s_role.value = data.settings?.role || "";
      s_email.value = data.settings?.email || "";
      s_phone.value = data.settings?.phone || "";
      s_linkedin.value = data.settings?.linkedin || "";
      s_address.value = data.settings?.address || "";
      s_summary.value = data.settings?.summary || "";

      // restore Settings arrays
      educations = Array.isArray(data.settings?.educations) ? data.settings.educations : [];
      experiences = Array.isArray(data.settings?.experiences) ? data.settings.experiences : [];
      languages  = Array.isArray(data.settings?.languages)  ? data.settings.languages  : [];
      skills     = Array.isArray(data.settings?.skills)     ? data.settings.skills     : [];

      // render list UIs
      renderAllLists();

      // restore state + prompt
      state = data.state || "unknown";
      generatedPrompt = data.generatedPrompt || "";

      // UI
      toggle(updatesSection, !!data.ui?.showUpdates);
      createCvBtn.disabled = !(data.ui?.createEnabled);
      setTab(data.ui?.activeTab === "setting" ? "setting" : "apply");

      setText(statusEl, data.statusText || "");
    } catch {}
  }

  // ---------- Helpers ----------
  function setText(el, text) { el.textContent = text; }
  function toggle(el, show) { el.classList.toggle("hidden", !show); }
  function setError(inputEl, errEl, show) {
    inputEl.classList.toggle("error", !!show);
    errEl.classList.toggle("hidden", !show);
  }
  function contextHeader() {
    const job = jobInput.value.trim();
    const company = companyInput.value.trim();
    return [job, company].filter(Boolean).join(" · ");
  }
  function randomDelayMs() { return (Math.floor(Math.random() * 3) + 1) * 1000; }
  function randomPrompt() {
    const pts = [
      "Results-driven developer with proven delivery across web platforms.",
      "Strong CI/CD, testing, and observability practices.",
      "Collaborates well with cross-functional stakeholders.",
      "Hands-on with JS/TS, modern frameworks, and cloud-native tooling.",
      "Focus on clean code, performance, and maintainability.",
      "Enjoys mentoring, docs, and knowledge sharing."
    ];
    const rand = (n) => Math.floor(Math.random() * n);
    const count = 5 + rand(4);
    const bullets = Array.from({ length: count }, () => pts[rand(pts.length)]);
    const header = contextHeader();
    return (header ? header + "\n\n" : "") + "• " + bullets.join("\n• ");
  }

  function setGenerateUIByState() {
    const showGenerate = state === "not_applied" || state === "generating" || state === "generated";
    toggle(generateStep, showGenerate);
    generateBtn.classList.toggle("hidden", !(state === "not_applied"));
    toggle(genLoading, state === "generating");
    toggle(genDone, state === "generated" && sessionGenReveal === true);
  }

  // ---------- Validation ----------
  function validateInitial(showErrors = true) {
    const jobEmpty = jobInput.value.trim() === "";
    const companyEmpty = companyInput.value.trim() === "";
    setError(jobInput, jobErr, showErrors && jobEmpty);
    setError(companyInput, companyErr, showErrors && companyEmpty);
    if (showErrors && (jobEmpty || companyEmpty)) setText(statusEl, "Please fill required fields.");
    return !(jobEmpty || companyEmpty);
  }

  function validateUpdates(showErrors = true) {
    const empty = updatesInput.value.trim() === "";
    if (showErrors) setError(updatesInput, updatesErr, empty);
    createCvBtn.disabled = empty;
    return !empty;
  }

  // ---------- Settings: Renderers & Adders ----------
  function renderAllLists() {
    renderEdu();
    renderExp();
    renderLang();
    renderSkill();
  }

  function renderEdu() {
    eduList.innerHTML = "";
    educations.forEach((e, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "entry";
      wrap.innerHTML = `
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
      wrap.querySelectorAll("input").forEach(inp => {
        inp.addEventListener("input", async () => {
          const key = inp.getAttribute("data-k");
          educations[idx][key] = inp.value;
          await save();
        });
      });
      eduList.appendChild(wrap);
    });
  }
  function addEdu() {
    educations.push({ degree: "", field: "", uni: "", start: "", end: "" });
    renderEdu(); save();
  }

  function renderExp() {
    expList.innerHTML = "";
    experiences.forEach((x, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "entry";
      wrap.innerHTML = `
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
      wrap.querySelectorAll("input,textarea,select").forEach(inp => {
        inp.addEventListener("input", async () => {
          const key = inp.getAttribute("data-k");
          experiences[idx][key] = inp.value;
          await save();
        });
      });
      expList.appendChild(wrap);
    });
  }
  function addExp() {
    experiences.push({ company:"", role:"", city:"", country:"", workType:"Full", start:"", end:"", description:"" });
    renderExp(); save();
  }

  function renderLang() {
    langList.innerHTML = "";
    languages.forEach((l, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "entry";
      wrap.innerHTML = `
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
      wrap.querySelectorAll("input,select").forEach(inp => {
        inp.addEventListener("input", async () => {
          const key = inp.getAttribute("data-k");
          languages[idx][key] = inp.value;
          await save();
        });
      });
      langList.appendChild(wrap);
    });
  }
  function addLang() {
    languages.push({ language:"", level:"Beginner" });
    renderLang(); save();
  }

  function renderSkill() {
    skillList.innerHTML = "";
    skills.forEach((s, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "entry";
      wrap.innerHTML = `
        <div><label>Skill</label><input type="text" data-k="skill" value="${s || ""}"></div>
      `;
      const inp = wrap.querySelector("input");
      inp.addEventListener("input", async () => {
        skills[idx] = inp.value;
        await save();
      });
      skillList.appendChild(wrap);
    });
  }
  function addSkill() {
    skills.push("");
    renderSkill(); save();
  }

  // ---------- Validation ----------
  function validateUpdates(showErrors = true) {
    const empty = updatesInput.value.trim() === "";
    if (showErrors) {
      updatesErr?.classList.toggle("hidden", !empty);
      updatesInput.classList.toggle("error", empty);
    }
    createCvBtn.disabled = empty;
    return !empty;
  }
  function validateInitial(showErrors = true) {
    const jobEmpty = jobInput.value.trim() === "";
    const companyEmpty = companyInput.value.trim() === "";
    if (showErrors) {
      jobErr.classList.toggle("hidden", !jobEmpty);
      companyErr.classList.toggle("hidden", !companyEmpty);
      jobInput.classList.toggle("error", jobEmpty);
      companyInput.classList.toggle("error", companyEmpty);
      if (jobEmpty || companyEmpty) setText(statusEl, "Please fill required fields.");
    } else {
      jobInput.classList.toggle("error", jobEmpty);
      companyInput.classList.toggle("error", companyEmpty);
    }
    return !(jobEmpty || companyEmpty);
  }

  // ---------- UI Actions (Apply tab) ----------
  checkBtn.addEventListener("click", async () => {
    if (!validateInitial(true)) { await save(); return; }
    sessionGenReveal = false;
    const notApplied = Math.random() < 0.5;
    state = notApplied ? "not_applied" : "applied";
    setText(statusEl, `Status: ${notApplied ? "not applied" : "applied"}`);
    toggle(updatesSection, false);
    generatedPrompt = "";
    setGenerateUIByState();
    await save();
  });

  generateBtn.addEventListener("click", async () => {
    if (state !== "not_applied") return;
    sessionGenReveal = false;
    state = "generating";
    setGenerateUIByState();
    setText(statusEl, "Generating prompt...");

    await new Promise((r) => setTimeout(r, randomDelayMs()));
    generatedPrompt = randomPrompt();
    state = "generated";
    sessionGenReveal = true;
    setGenerateUIByState();
    setText(statusEl, "Prompt ready. You can copy it.");
    await save();
  });

  copyBtn.addEventListener("click", async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      const old = copyBtn.textContent; copyBtn.textContent = "Copied";
      setTimeout(() => (copyBtn.textContent = old), 1200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = generatedPrompt; document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    }
    toggle(updatesSection, true);
    updatesInput.focus();
    setText(statusEl, "Add CV Updates, then Create CV.");
    await save();
  });

  updatesInput.addEventListener("input", async () => { validateUpdates(false); await save(); });
  createCvBtn.addEventListener("click", async () => {
    if (!validateUpdates(true)) { await save(); return; }
    setText(statusEl, "CV created.");
    await save();
  });

  jobInput.addEventListener("blur", async () => { validateInitial(true); await save(); });
  companyInput.addEventListener("blur", async () => { validateInitial(true); await save(); });
  jobInput.addEventListener("input", save);
  companyInput.addEventListener("input", save);

  // ---------- Tab switching & Settings persistence ----------
  tabApply.addEventListener("click", async () => { setTab("apply"); await save(); });
  tabSetting.addEventListener("click", async () => { setTab("setting"); await save(); });

  [s_name, s_role, s_email, s_phone, s_linkedin, s_address, s_summary].forEach(el => {
    el.addEventListener("input", save);
  });

  addEduBtn.addEventListener("click", addEdu);
  addExpBtn.addEventListener("click", addExp);
  addLangBtn.addEventListener("click", addLang);
  addSkillBtn.addEventListener("click", addSkill);

  // ---------- Clear per active tab ----------
  clearBtn.addEventListener("click", async () => {
    const tab = activeTab();

    if (tab === "apply") {
      // Clear only Apply tab state/fields
      state = "unknown";
      generatedPrompt = "";
      sessionGenReveal = false;

      jobInput.value = "";
      companyInput.value = "";
      updatesInput.value = "";

      jobErr.classList.add("hidden");
      companyErr.classList.add("hidden");
      updatesErr.classList.add("hidden");
      jobInput.classList.remove("error");
      companyInput.classList.remove("error");
      updatesInput.classList.remove("error");

      toggle(updatesSection, false);
      createCvBtn.disabled = true;
      setText(statusEl, "Apply state cleared.");
      setGenerateUIByState();
      jobInput.focus();
    } else {
      // Clear only Settings tab data
      s_name.value = ""; s_role.value = ""; s_email.value = ""; s_phone.value = "";
      s_linkedin.value = ""; s_address.value = ""; s_summary.value = "";

      educations = [];
      experiences = [];
      languages = [];
      skills = [];
      renderAllLists();
    }

    await save();
  });

  // ---------- Init ----------
  (async function init() {
    await load();
    setGenerateUIByState();
    if (!statusEl.textContent) setText(statusEl, "");
    setTab(activeTab()); // keep saved tab and size
    // If nothing in lists, ensure at least one input row for better UX
    if (educations.length === 0) addEdu();
    if (experiences.length === 0) addExp();
    if (languages.length === 0) addLang();
    if (skills.length === 0) addSkill();
  })();
})();
