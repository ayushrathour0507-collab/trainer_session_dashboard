// Purpose: Wraps session and announcement API calls for the React data layer.
import api, { unwrap } from "./api.js";

export const sessionService = {
  getAll: (params = {}) => unwrap(api.get("/sessions", { params })),
  getAdminAll: (params = {}) => unwrap(api.get("/sessions/admin/all", { params })),
  getMine: () => unwrap(api.get("/sessions/trainer/mine")),
  getById: (id) => unwrap(api.get(`/sessions/${id}`)),
  getUpcoming: () => unwrap(api.get("/sessions/upcoming")),
  getByMonth: (month) => unwrap(api.get(`/sessions/month/${month}`)),
  create: (payload) => unwrap(api.post("/sessions", payload)),
  createTrainerRequest: (payload) => unwrap(api.post("/sessions/trainer/request", payload)),
  update: (id, payload) => unwrap(api.put(`/sessions/${id}`, payload)),
  updateApproval: (id, payload) => unwrap(api.put(`/sessions/${id}/approval`, payload)),
  remove: (id) => unwrap(api.delete(`/sessions/${id}`)),
  generateAnnouncement: (payload) => unwrap(api.post("/announcements/generate", payload)),
  getAnnouncements: (sessionId) => unwrap(api.get(`/announcements/${sessionId}`)),
};
