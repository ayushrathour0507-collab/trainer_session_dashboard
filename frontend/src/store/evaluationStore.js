// Purpose: Stores evaluation loading state and save actions for admin scoring pages.
import { create } from "zustand";
import { evaluationService } from "../services/evaluation.service.js";

export const useEvaluationStore = create((set) => ({
  evaluation: null,
  loading: false,
  error: null,
  fetchEvaluation: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const data = await evaluationService.getBySession(sessionId);
      set({ evaluation: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },
  saveEvaluation: async (sessionId, payload) => {
    set({ loading: true, error: null });
    try {
      const data = await evaluationService.save(sessionId, payload);
      set({ evaluation: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },
  publishEvaluation: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const data = await evaluationService.publish(sessionId);
      set({ evaluation: data, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },
}));
