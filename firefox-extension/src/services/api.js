// path: src/services/api.js
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const MOCK_LATENCY = 600;

// In-memory mock "DB"
const mockDb = {
  users: [
    // { id:"u1", email:"demo@ex.com", password:"pass123", token:"t-demo", settings:{...} }
  ]
};

const makeToken = (id) => `t-${id}-${Math.random().toString(36).slice(2,8)}`;

export const api = {
  async register({ email, password, confirm }) {
    await wait(MOCK_LATENCY);
    if (!email || !password || password !== confirm) {
      return { ok: false, msg: "Invalid registration data." };
    }
    if (mockDb.users.some(u => u.email === email)) {
      return { ok: false, msg: "Email already registered." };
    }
    const id = `u${mockDb.users.length + 1}`;
    mockDb.users.push({ id, email, password, token: null, settings: null });
    return { ok: true };
  },

  async login({ email, password }) {
    await wait(MOCK_LATENCY);
    const u = mockDb.users.find(x => x.email === email && x.password === password);
    if (!u) return { ok: false, msg: "Invalid email/password." };
    u.token = makeToken(u.id);
    return { ok: true, token: u.token, userId: u.id, email: u.email };
  },

  async me({ token }) {
    await wait(MOCK_LATENCY);
    const u = mockDb.users.find(x => x.token === token);
    if (!u) return { ok: false, msg: "Not authenticated" };
    return { ok: true, user: { id: u.id, email: u.email } };
  },

  async getSettings({ token }) {
    await wait(MOCK_LATENCY);
    const u = mockDb.users.find(x => x.token === token);
    if (!u) return { ok: false, msg: "Not authenticated" };
    return { ok: true, settings: u.settings }; // may be null
  },

  async saveSettings({ token, settings }) {
    await wait(MOCK_LATENCY);
    const u = mockDb.users.find(x => x.token === token);
    if (!u) return { ok: false, msg: "Not authenticated" };

    if (!settings?.summary || !settings?.contact?.email || !settings?.contact?.linkedin || !settings?.name ||
        !settings?.role || !settings?.contact?.phone || !settings?.contact?.address ||
        !Array.isArray(settings.languages) || !settings.languages.length ||
        !Array.isArray(settings.experiences) || !settings.experiences.length ||
        !Array.isArray(settings.coreSkills) || !settings.coreSkills.length) {
      return { ok: false, msg: "Missing required settings fields." };
    }

    u.settings = settings;
    return { ok: true };
  },

  async applyCheck({ token, job, company }) {
    await wait(MOCK_LATENCY);
    const u = mockDb.users.find(x => x.token === token);
    if (!u) return { ok: false, msg: "Not authenticated" };
    if (!job || !company) return { ok: false, msg: "Missing job/company." };

    const applied = Math.random() < 0.4;
    if (applied) {
      return { ok: true, status: "applied" };
    }
    const prompt = `${job} · ${company}\n\n• Results-driven developer with proven delivery.\n• Strong CI/CD, testing, and observability.\n• Collaborates well with cross-functional stakeholders.\n• Hands-on with JS/TS, modern frameworks, and cloud.\n• Focus on clean code, performance, maintainability.`;
    return { ok: true, status: "not_applied", prompt };
  },

  async createCv({ token, modifiedText }) {
    await wait(MOCK_LATENCY);
    const u = mockDb.users.find(x => x.token === token);
    if (!u) return { ok: false, msg: "Not authenticated" };
    if (!modifiedText || !modifiedText.trim()) {
      return { ok: false, msg: "Modified CV text required." };
    }
    const url = "https://example.com/cv/download/mock-cv.pdf";
    return { ok: true, downloadUrl: url };
  }
};
