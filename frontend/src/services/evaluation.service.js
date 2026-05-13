// Purpose: Wraps evaluation API calls for admin scoring workflows.
import api, { unwrap } from "./api.js";

export const evaluationService = {
  getBySession: (sessionId) => unwrap(api.get(`/evaluations/${sessionId}`)),
  save: (sessionId, payload) => unwrap(api.post(`/evaluations/${sessionId}`, payload)),
  update: (sessionId, payload) => unwrap(api.put(`/evaluations/${sessionId}`, payload)),
  publish: (sessionId) => unwrap(api.post(`/evaluations/${sessionId}/publish`)),
};
