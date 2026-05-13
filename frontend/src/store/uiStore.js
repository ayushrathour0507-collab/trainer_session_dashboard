/**
 * Purpose: Stores UI preferences such as theme, sidebar state, and recent admin actions.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUiStore = create(
  persist(
    (set) => ({
      theme: "light",
      sidebarCollapsed: false,
      recentActions: [],
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      pushAction: (action) => set((state) => ({ recentActions: [{ ...action, at: new Date().toISOString() }, ...state.recentActions].slice(0, 5) })),
    }),
    { name: "nexus-ui" },
  ),
);
