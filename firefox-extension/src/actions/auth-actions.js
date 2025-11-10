// path: src/actions/auth-actions.js
import { api } from "../services/api.js";
import { save } from "../storage/storage.js";
import { setTab } from "../ui/tabs.js";

export function bindAuthActions(app) {
  const { loginBtn, loginEmail, loginPass, registerBtn, regEmail, regPass, regPass2, statusEl } = app.el;

  loginBtn.addEventListener("click", async () => {
    setStatus(app, "Logging in...");
    const { ok, token, userId, email, msg } = await api.login({
      email: loginEmail.value.trim(),
      password: loginPass.value
    });
    if (!ok) { setStatus(app, msg || "Login failed.", true); return; }

    app.data.auth = { isLoggedIn: true, token, user: { id: userId, email } };
    await save(app.data);
    setStatus(app, "Logged in. Loading settings...");
    await loadSettingsIntoApp(app);
  });

  registerBtn.addEventListener("click", async () => {
    setStatus(app, "Registering...");
    const { ok, msg } = await api.register({
      email: regEmail.value.trim(),
      password: regPass.value,
      confirm: regPass2.value
    });
    if (!ok) { setStatus(app, msg || "Registration failed.", true); return; }
    setStatus(app, "Account created. Please login.");
    setTab(app, "auth_login");
  });
}

export async function loadSettingsIntoApp(app) {
  const { token } = app.data.auth;
  const res = await api.getSettings({ token });
  if (!res.ok) { setStatus(app, res.msg || "Failed to get settings.", true); return; }

  const s = res.settings;
  if (s) {
    app.data.settings = s;
    fillBasics(app);
    app.data.ui.activeTab = "setting";
    app.data.ui.applyEnabled = true;
    setStatus(app, "Settings loaded.");
    setTab(app, "setting");
  } else {
    app.data.ui.applyEnabled = false;
    app.data.ui.activeTab = "setting";
    setStatus(app, "No settings found. Please fill settings.");
    setTab(app, "setting");
  }
  await save(app.data);
}

export function setStatus(app, msg, isError = false) {
  if (!app?.el?.statusEl) return;
  app.el.statusEl.textContent = msg || "";
  app.el.statusEl.style.color = isError ? "#b42318" : "#6b7280";
}

function fillBasics(app) {
  const s = app.data.settings || {};
  app.el.s_name.value     = s.name || "";
  app.el.s_role.value     = s.role || "";
  app.el.s_email.value    = s.contact?.email || s.email || "";
  app.el.s_phone.value    = s.contact?.phone || s.phone || "";
  app.el.s_linkedin.value = s.contact?.linkedin || s.linkedin || "";
  app.el.s_address.value  = s.contact?.address || s.address || "";
  app.el.s_summary.value  = s.summary || "";
}
