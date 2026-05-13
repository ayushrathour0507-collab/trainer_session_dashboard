// Purpose: Wraps leaderboard, dashboard, and trainer profile API calls for charts and admin panels.
import api, { unwrap } from "./api.js";

export const leaderboardService = {
  getLeaderboard: (params = {}) => unwrap(api.get("/leaderboard", { params })),
  getMonthlyWinners: () => unwrap(api.get("/leaderboard/monthly")),
  getInsights: () => unwrap(api.get("/leaderboard/insights")),
  getAdminDashboard: () => unwrap(api.get("/dashboard/admin")),
  getTrainerDashboard: (id) => unwrap(api.get(`/dashboard/trainer/${id}`)),
  getTrainers: () => unwrap(api.get("/trainers")),
  getTrainer: (id) => unwrap(api.get(`/trainers/${id}`)),
  getTrainerSessions: (id) => unwrap(api.get(`/trainers/${id}/sessions`)),
  getTrainerFeedback: (id) => unwrap(api.get(`/trainers/${id}/feedback`)),
};
