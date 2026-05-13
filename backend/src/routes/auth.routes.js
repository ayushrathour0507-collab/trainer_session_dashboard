// Purpose: Registers authentication endpoints for account access and token lifecycle actions.
import express from "express";
import { z } from "zod";
import { login, logout, me, refresh, register } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email().refine((value) => value.toLowerCase().endsWith("@iamneo.ai"), {
      message: "Email must use the @iamneo.ai domain",
    }),
    password: z.string().min(8),
    role: z.enum(["trainer", "viewer"]).default("trainer"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().refine((value) => value.toLowerCase().endsWith("@iamneo.ai"), {
      message: "Email must use the @iamneo.ai domain",
    }),
    password: z.string().min(1),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }).partial(),
});

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", logout);
router.get("/me", protect, me);

export default router;
