// Purpose: Wraps feedback import, entry, and retrieval API calls.
import api, { unwrap } from "./api.js";

export const feedbackService = {
  getBySession: (sessionId) => unwrap(api.get(`/feedback/${sessionId}`)),
  bulkImport: (payload) => unwrap(api.post("/feedback/bulk", payload)),
  add: (sessionId, payload) => unwrap(api.post(`/feedback/${sessionId}`, payload)),
  addPublic: (sessionId, payload) => unwrap(api.post(`/feedback/public/${sessionId}`, payload)),
};
