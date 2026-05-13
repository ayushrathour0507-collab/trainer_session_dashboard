// Purpose: Wires announcement generation and retrieval endpoints.
import express from "express";
import { z } from "zod";
import { generateAnnouncementForSession, getAnnouncementsBySession } from "../controllers/announcement.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { ANNOUNCEMENT_TYPES } from "../config/constants.js";

const router = express.Router();

const generateSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1),
    type: z.enum(ANNOUNCEMENT_TYPES).default("pre-session"),
    overrides: z.record(z.string()).optional().default({}),
    save: z.boolean().optional().default(true),
  }),
});

const sessionIdSchema = z.object({
  params: z.object({ sessionId: z.string().min(1) }),
});

router.post("/generate", protect, authorize("admin"), validate(generateSchema), generateAnnouncementForSession);
router.get("/:sessionId", protect, authorize("admin"), validate(sessionIdSchema), getAnnouncementsBySession);

export default router;
