// Purpose: Defines the application shell, navigation, and route map for public, admin, and trainer pages.
import { useEffect, useLayoutEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "./layouts/AppShell.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import { useAuthStore } from "./store/authStore.js";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AnnouncementGenerator from "./pages/admin/AnnouncementGenerator.jsx";
import EvaluationEntry from "./pages/admin/EvaluationEntry.jsx";
import FeedbackManagement from "./pages/admin/FeedbackManagement.jsx";
import PosterGenerator from "./pages/admin/PosterGenerator.jsx";
import SessionForm from "./pages/admin/SessionForm.jsx";
import SessionManagement from "./pages/admin/SessionManagement.jsx";
import Home from "./pages/public/Home.jsx";
import Leaderboard from "./pages/public/Leaderboard.jsx";
import SessionDetail from "./pages/public/SessionDetail.jsx";
import Sessions from "./pages/public/Sessions.jsx";
import MyFeedback from "./pages/trainer/MyFeedback.jsx";
import MySessions from "./pages/trainer/MySessions.jsx";
import TrainerDashboard from "./pages/trainer/TrainerDashboard.jsx";

const resetWindowScroll = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    resetWindowScroll();
    const frame = window.requestAnimationFrame(resetWindowScroll);
    const timer = window.setTimeout(resetWindowScroll, 0);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [pathname, search]);

  return null;
};

const App = () => {
  const hydrateUser = useAuthStore((state) => state.hydrateUser);

  useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/sessions" element={<ProtectedRoute roles={["admin"]}><SessionManagement /></ProtectedRoute>} />
          <Route path="/admin/sessions/create" element={<ProtectedRoute roles={["admin"]}><SessionForm /></ProtectedRoute>} />
          <Route path="/admin/sessions/:id/edit" element={<ProtectedRoute roles={["admin"]}><SessionForm /></ProtectedRoute>} />
          <Route path="/admin/feedback" element={<ProtectedRoute roles={["admin"]}><FeedbackManagement /></ProtectedRoute>} />
          <Route path="/admin/evaluate/:sessionId" element={<ProtectedRoute roles={["admin"]}><EvaluationEntry /></ProtectedRoute>} />
          <Route path="/admin/poster/:sessionId" element={<ProtectedRoute roles={["admin"]}><PosterGenerator /></ProtectedRoute>} />
          <Route path="/admin/announce/:sessionId" element={<ProtectedRoute roles={["admin"]}><AnnouncementGenerator /></ProtectedRoute>} />
          <Route path="/trainer/dashboard" element={<ProtectedRoute roles={["trainer"]}><TrainerDashboard /></ProtectedRoute>} />
          <Route path="/trainer/sessions" element={<ProtectedRoute roles={["trainer"]}><MySessions /></ProtectedRoute>} />
          <Route path="/trainer/feedback" element={<ProtectedRoute roles={["trainer"]}><MyFeedback /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </ErrorBoundary>
  );
};

export default App;
