// Purpose: Wires public leaderboard, monthly winner, and insight endpoints.
import express from "express";
import { getLeaderboard, getLeaderboardInsights, getMonthlyWinners } from "../controllers/leaderboard.controller.js";

const router = express.Router();

router.get("/", getLeaderboard);
router.get("/monthly", getMonthlyWinners);
router.get("/insights", getLeaderboardInsights);

export default router;
