// Purpose: Stores session collections, selected session state, and CRUD actions.
import { create } from "zustand";
import { sessionService } from "../services/session.service.js";

export const useSessionStore = create((set, get) => ({
  sessions: [],
  selectedSession: null,
  upcoming: null,
  pagination: { page: 1, limit: 100, total: 0, pages: 1 },
  loading: false,
  error: null,
  fetchSessions: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await sessionService.getAll(params);
      set({ sessions: data.items || [], pagination: data.pagination || get().pagination, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },
  fetchAdminSessions: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await sessionService.getAdminAll(params);
      set({ sessions: data.items || [], pagination: data.pagination || get().pagination, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },
  fetchMySessions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await sessionService.getMine();
      set({ sessions: data || [], loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },
  fetchSession: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await sessionService.getById(id);
      set({ selectedSession: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },
  fetchUpcoming: async () => {
    try {
      const data = await sessionService.getUpcoming();
      set({ upcoming: data });
      return data;
    } catch (error) {
      set({ upcoming: null });
      return null;
    }
  },
  createSession: async (payload) => {
    const session = await sessionService.create(payload);
    set({ sessions: [...get().sessions, session].sort((a, b) => new Date(a.date) - new Date(b.date)) });
    return session;
  },
  createTrainerRequest: async (payload) => {
    const session = await sessionService.createTrainerRequest(payload);
    set({ sessions: [...get().sessions, session].sort((a, b) => new Date(a.date) - new Date(b.date)) });
    return session;
  },
  updateSession: async (id, payload) => {
    const session = await sessionService.update(id, payload);
    set({ sessions: get().sessions.map((item) => (item._id === id ? session : item)), selectedSession: session });
    return session;
  },
  updateApproval: async (id, payload) => {
    const session = await sessionService.updateApproval(id, payload);
    set({ sessions: get().sessions.map((item) => (item._id === id ? session : item)), selectedSession: session });
    return session;
  },
  deleteSession: async (id) => {
    await sessionService.remove(id);
    set({ sessions: get().sessions.filter((item) => item._id !== id) });
  },
}));
