// Purpose: Wires public session endpoints and admin-only session mutation endpoints.
import express from "express";
import {
  createSession,
  createTrainerSessionRequest,
  deleteSession,
  getAdminSessions,
  getMySessions,
  getSessionById,
  getSessions,
  getSessionsByMonth,
  getUpcomingSession,
  updateSession,
  updateSessionApproval,
} from "../controllers/session.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  monthSchema,
  sessionCreateSchema,
  sessionApprovalSchema,
  sessionIdSchema,
  sessionListSchema,
  sessionUpdateSchema,
  trainerSessionCreateSchema,
} from "../validators/session.validator.js";

const router = express.Router();

router.get("/", validate(sessionListSchema), getSessions);
router.get("/admin/all", protect, authorize("admin"), validate(sessionListSchema), getAdminSessions);
router.get("/trainer/mine", protect, authorize("trainer", "admin"), getMySessions);
router.get("/upcoming", getUpcomingSession);
router.get("/month/:month", validate(monthSchema), getSessionsByMonth);
router.get("/:id", validate(sessionIdSchema), getSessionById);
router.post("/", protect, authorize("admin"), validate(sessionCreateSchema), createSession);
router.post("/trainer/request", protect, authorize("trainer"), validate(trainerSessionCreateSchema), createTrainerSessionRequest);
router.put("/:id/approval", protect, authorize("admin"), validate(sessionApprovalSchema), updateSessionApproval);
router.put("/:id", protect, authorize("admin"), validate(sessionUpdateSchema), updateSession);
router.delete("/:id", protect, authorize("admin"), validate(sessionIdSchema), deleteSession);

export default router;
