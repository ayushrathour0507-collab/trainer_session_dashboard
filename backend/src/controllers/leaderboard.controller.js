// Purpose: Serves ranked trainer performance, monthly winners, and programme-level leaderboard insights.
import Evaluation from "../models/Evaluation.model.js";
import { buildLeaderboard, buildMetricBreakdown, buildMonthlyWinners } from "../services/leaderboard.service.js";
import { getInsights } from "../services/scoring.service.js";
import { sendError, sendSuccess } from "../utils/response.utils.js";

const loadEvaluations = async () => {
  return Evaluation.find({ trainerFeedbackPublished: true })
    .populate({
      path: "session",
      populate: { path: "presenter", select: "name email avatar role" },
    })
    .sort({ overallScore: -1 })
    .lean();
};

export const getLeaderboard = async (req, res) => {
  try {
    const evaluations = await loadEvaluations();
    const month = req.query.month || "All";
    const metric = req.query.metric || "Overall";
    return sendSuccess(res, "Leaderboard loaded", {
      items: buildLeaderboard(evaluations, month, metric),
      metricBreakdown: buildMetricBreakdown(evaluations, month),
    });
  } catch (error) {
    return sendError(res, "Unable to load leaderboard", error.message, 500);
  }
};

export const getMonthlyWinners = async (req, res) => {
  try {
    const evaluations = await loadEvaluations();
    return sendSuccess(res, "Monthly winners loaded", buildMonthlyWinners(evaluations));
  } catch (error) {
    return sendError(res, "Unable to load monthly winners", error.message, 500);
  }
};

export const getLeaderboardInsights = async (req, res) => {
  try {
    const evaluations = await loadEvaluations();
    return sendSuccess(res, "Leaderboard insights loaded", getInsights(evaluations));
  } catch (error) {
    return sendError(res, "Unable to load insights", error.message, 500);
  }
};
