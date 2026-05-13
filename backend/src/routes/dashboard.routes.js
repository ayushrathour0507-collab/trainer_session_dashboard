// Purpose: Wires dashboard KPI routes and trainer profile routes while keeping the requested route file structure.
import express from "express";
import {
  getAdminDashboard,
  getTrainerById,
  getTrainerDashboard,
  getTrainerFeedback,
  getTrainerSessions,
  getTrainers,
} from "../controllers/dashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

export const dashboardRouter = express.Router();
export const trainerRouter = express.Router();

dashboardRouter.get("/admin", protect, authorize("admin"), getAdminDashboard);
dashboardRouter.get("/trainer/:id", protect, authorize("admin", "trainer"), getTrainerDashboard);

trainerRouter.get("/", protect, authorize("admin", "trainer"), getTrainers);
trainerRouter.get("/:id", protect, authorize("admin", "trainer"), getTrainerById);
trainerRouter.get("/:id/sessions", protect, authorize("admin", "trainer"), getTrainerSessions);
trainerRouter.get("/:id/feedback", protect, authorize("admin", "trainer"), getTrainerFeedback);

export default dashboardRouter;
