// Purpose: Provides a small convenience hook around auth store state and role helpers.
import { useAuthStore } from "../store/authStore.js";

export const useAuth = () => {
  const auth = useAuthStore();
  return {
    ...auth,
    isAuthenticated: Boolean(auth.user),
    isAdmin: auth.user?.role === "admin",
    isTrainer: auth.user?.role === "trainer",
  };
};
