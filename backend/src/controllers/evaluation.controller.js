// Purpose: Reads and saves organizer evaluations while recalculating session scores and verdicts.
import Evaluation from "../models/Evaluation.model.js";
import Feedback from "../models/Feedback.model.js";
import Session from "../models/Session.model.js";
import {
  calculateAdminInsightScore,
  calculateOrganiserScore,
  calculateOverallScore,
  calculateTotalScore,
  generateOverallFeedbackPost,
  getVerdict,
  normaliseScores,
} from "../services/scoring.service.js";
import { summarizeFeedback } from "../utils/feedbackParser.utils.js";
import { sendError, sendSuccess } from "../utils/response.utils.js";

const average = (values) => {
  const cleanValues = values.filter((value) => Number.isFinite(Number(value)));
  return cleanValues.length
    ? Math.round((cleanValues.reduce((sum, value) => sum + Number(value), 0) / cleanValues.length) * 100) / 100
    : 0;
};

const buildEvaluationPayload = (body, session, userId, feedbackItems = [], existingEvaluation = null) => {
  const scores = normaliseScores(body.scores);
  const totalScore = calculateTotalScore(scores);
  const organiserScore = calculateOrganiserScore(body.organiserChecks);
  const adminInsightScore = calculateAdminInsightScore(body.organiserChecks);
  const attendeeAverageRating = Number(body.attendeeAverageRating || 0) > 0
    ? Number(body.attendeeAverageRating)
    : average(feedbackItems.map((feedback) => feedback.attendeeRating)) || totalScore;
  const overallScore = calculateOverallScore(attendeeAverageRating, organiserScore);
  const verdict = getVerdict(totalScore);
  const feedbackSummary = summarizeFeedback(feedbackItems);
  const draftEvaluation = {
    adminInsights: body.adminInsights,
    overallScore,
    verdict,
    attendeeAverageRating,
    adminInsightScore,
    attendanceCount: body.attendanceCount || 0,
    feedbackCount: body.feedbackCount || feedbackItems.length,
  };

  return {
    session: session._id,
    evaluatedBy: userId,
    scores,
    organiserChecks: body.organiserChecks,
    totalScore,
    attendeeAverageRating,
    adminInsightScore,
    overallScore,
    verdict,
    remarks: body.remarks || "",
    adminInsights: body.adminInsights,
    overallFeedbackPost: generateOverallFeedbackPost(session, draftEvaluation, feedbackSummary),
    trainerFeedbackPublished: existingEvaluation?.trainerFeedbackPublished || false,
    trainerFeedbackPublishedAt: existingEvaluation?.trainerFeedbackPublishedAt || null,
    trainerFeedbackPublishedBy: existingEvaluation?.trainerFeedbackPublishedBy || null,
    attendanceCount: body.attendanceCount || 0,
    feedbackCount: body.feedbackCount || feedbackItems.length,
  };
};

export const getEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ session: req.params.sessionId })
      .populate("session")
      .populate("evaluatedBy", "name email")
      .lean();

    if (!evaluation) {
      return sendSuccess(res, "No evaluation found for this session", null);
    }

    return sendSuccess(res, "Evaluation loaded", evaluation);
  } catch (error) {
    return sendError(res, "Unable to load evaluation", error.message, 500);
  }
};

export const saveEvaluation = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return sendError(res, "Session not found", null, 404);
    }

    const [feedbackItems, existingEvaluation] = await Promise.all([
      Feedback.find({ session: session._id }).lean(),
      Evaluation.findOne({ session: session._id }).lean(),
    ]);
    const payload = buildEvaluationPayload(req.body, session, req.user._id, feedbackItems, existingEvaluation);
    const evaluation = await Evaluation.findOneAndUpdate(
      { session: session._id },
      payload,
      { new: true, upsert: true, runValidators: true },
    ).lean();

    session.attendees = payload.attendanceCount;
    session.feedbackCount = payload.feedbackCount;
    session.totalScore = payload.totalScore;
    session.overallScore = payload.overallScore;
    session.verdict = payload.verdict;
    if (payload.trainerFeedbackPublished) {
      session.rating = payload.overallScore;
    }
    if (session.status !== "Cancelled" && session.status !== "Postponed") {
      session.status = "Completed";
    }
    await session.save();

    return sendSuccess(res, "Evaluation saved", evaluation);
  } catch (error) {
    return sendError(res, "Unable to save evaluation", error.message, 500);
  }
};

export const publishEvaluationResponses = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return sendError(res, "Session not found", null, 404);
    }

    const evaluation = await Evaluation.findOne({ session: session._id });
    if (!evaluation) {
      return sendError(res, "Complete the admin evaluation before publishing responses", null, 400);
    }

    const requiredInsightReady = Boolean(
      evaluation.adminInsights?.strengths?.length
      && evaluation.adminInsights?.improvements?.length
      && evaluation.adminInsights?.audienceEngagement
      && evaluation.adminInsights?.deliveryNotes
      && evaluation.adminInsights?.recommendedActions?.length,
    );

    if (!requiredInsightReady) {
      return sendError(res, "Admin insights are required before publishing trainer responses", null, 400);
    }

    evaluation.trainerFeedbackPublished = true;
    evaluation.trainerFeedbackPublishedAt = new Date();
    evaluation.trainerFeedbackPublishedBy = req.user._id;
    await evaluation.save();

    session.rating = evaluation.overallScore;
    session.overallScore = evaluation.overallScore;
    session.totalScore = evaluation.totalScore;
    session.verdict = evaluation.verdict;
    session.feedbackCount = evaluation.feedbackCount;
    session.attendees = evaluation.attendanceCount;
    session.status = "Completed";
    await session.save();

    return sendSuccess(res, "Collective feedback and trainer rating published", evaluation);
  } catch (error) {
    return sendError(res, "Unable to publish trainer responses", error.message, 500);
  }
};
