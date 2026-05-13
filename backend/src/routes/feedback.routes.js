// Purpose: Wires feedback retrieval, manual entry, and bulk import routes.
import express from "express";
import { addFeedback, bulkImportFeedback, getFeedbackBySession, submitPublicFeedback } from "../controllers/feedback.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { evaluationIdSchema, feedbackBulkSchema, feedbackSingleSchema } from "../validators/evaluation.validator.js";

const router = express.Router();

router.get("/:sessionId", protect, authorize("admin"), validate(evaluationIdSchema), getFeedbackBySession);
router.post("/bulk", protect, authorize("admin"), validate(feedbackBulkSchema), bulkImportFeedback);
router.post("/public/:sessionId", validate(feedbackSingleSchema), submitPublicFeedback);
router.post("/:sessionId", protect, authorize("admin"), validate(feedbackSingleSchema), addFeedback);

export default router;
