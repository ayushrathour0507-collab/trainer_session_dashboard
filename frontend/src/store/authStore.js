// Purpose: Stores authentication state, tokens, and role-aware auth actions.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/auth.service.js";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      initialized: false,
      error: null,
      login: async (payload) => {
        set({ loading: true, error: null });
        try {
          const data = await authService.login(payload);
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          set({ user: data.user, loading: false, initialized: true });
          return data.user;
        } catch (error) {
          set({ error: error.response?.data?.message || error.message, loading: false });
          throw error;
        }
      },
      register: async (payload) => {
        set({ loading: true, error: null });
        try {
          const data = await authService.register(payload);
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          set({ user: data.user, loading: false, initialized: true });
          return data.user;
        } catch (error) {
          set({ error: error.response?.data?.message || error.message, loading: false });
          throw error;
        }
      },
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.warn(error.message);
        } finally {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({ user: null, initialized: true });
        }
      },
      hydrateUser: async () => {
        if (!localStorage.getItem("accessToken")) {
          set({ user: null, loading: false, initialized: true });
          return;
        }
        set({ loading: true, error: null });
        try {
          const data = await authService.me();
          set({ user: data.user, loading: false, initialized: true });
        } catch (error) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({ user: null, loading: false, initialized: true });
        }
      },
    }),
    { name: "bytesandbeyond-auth", partialize: (state) => ({ user: state.user }) },
  ),
);
