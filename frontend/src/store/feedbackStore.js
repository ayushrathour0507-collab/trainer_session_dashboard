// Purpose: Stores feedback records, summaries, and bulk import state.
import { create } from "zustand";
import { feedbackService } from "../services/feedback.service.js";

export const useFeedbackStore = create((set) => ({
  feedback: [],
  summary: null,
  loading: false,
  error: null,
  fetchFeedback: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const data = await feedbackService.getBySession(sessionId);
      set({ feedback: data.items || [], summary: data.summary || null, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },
  bulkImport: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await feedbackService.bulkImport(payload);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },
}));
