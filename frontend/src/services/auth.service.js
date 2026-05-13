// Purpose: Wraps all authentication API calls for stores and pages.
import api, { unwrap } from "./api.js";

export const authService = {
  register: (payload) => unwrap(api.post("/auth/register", payload)),
  login: (payload) => unwrap(api.post("/auth/login", payload)),
  refresh: (refreshToken) => unwrap(api.post("/auth/refresh", { refreshToken })),
  logout: () => unwrap(api.post("/auth/logout")),
  me: () => unwrap(api.get("/auth/me")),
};
