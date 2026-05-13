// Purpose: Wires evaluation read and admin save/update endpoints.
import express from "express";
import { getEvaluation, publishEvaluationResponses, saveEvaluation } from "../controllers/evaluation.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { evaluationIdSchema, evaluationSaveSchema } from "../validators/evaluation.validator.js";

const router = express.Router();

router.get("/:sessionId", protect, authorize("admin", "trainer"), validate(evaluationIdSchema), getEvaluation);
router.post("/:sessionId/publish", protect, authorize("admin"), validate(evaluationIdSchema), publishEvaluationResponses);
router.post("/:sessionId", protect, authorize("admin"), validate(evaluationSaveSchema), saveEvaluation);
router.put("/:sessionId", protect, authorize("admin"), validate(evaluationSaveSchema), saveEvaluation);

export default router;
