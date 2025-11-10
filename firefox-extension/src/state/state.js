// path: src/state/state.js
import { INITIAL_STATE } from "../constants.js";

export const app = {
  data: structuredClone(INITIAL_STATE),
  el: {},

  get activeTab() { return this.data.ui.activeTab; },
  set activeTab(v) { this.data.ui.activeTab = v; },

  setState(partial) { Object.assign(this.data, partial); return this.data; },

  setStatus(text) { this.data.statusText = text; },

  contextHeader() {
    const { job, company } = this.data.fields;
    return [job?.trim(), company?.trim()].filter(Boolean).join(" · ");
  }
};
