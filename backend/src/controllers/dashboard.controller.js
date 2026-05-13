// Purpose: Aggregates dashboard KPIs and trainer profile data for admin and trainer experiences.
import Evaluation from "../models/Evaluation.model.js";
import Feedback from "../models/Feedback.model.js";
import Session from "../models/Session.model.js";
import User from "../models/User.model.js";
import { buildLeaderboard, buildMetricBreakdown } from "../services/leaderboard.service.js";
import { getVerdict } from "../services/scoring.service.js";
import { summarizeFeedback } from "../utils/feedbackParser.utils.js";
import { sendError, sendSuccess } from "../utils/response.utils.js";

const average = (values) => {
  const clean = values.filter((value) => Number.isFinite(Number(value)));
  return clean.length ? Math.round((clean.reduce((sum, value) => sum + Number(value), 0) / clean.length) * 100) / 100 : 0;
};

const maskFeedbackForTrainer = (item) => {
  const isAnonymous = item.isAnonymous !== false;
  return {
    ...item,
    isAnonymous,
    responderName: isAnonymous ? "Anonymous attendee" : item.responderName || "Attendee",
    email: "",
  };
};

const activeScheduleStatuses = ["Pending", "Confirmed"];

const isActiveScheduledSession = (session) => activeScheduleStatuses.includes(session.status);

const loadEvaluationSet = async () => {
  return Evaluation.find()
    .populate({
      path: "session",
      populate: { path: "presenter", select: "name email avatar role" },
    })
    .lean();
};

const buildAdminNotifications = (sessions = [], evaluations = []) => {
  const evaluationBySession = new Map(evaluations.map((evaluation) => [String(evaluation.session?._id), evaluation]));
  const approvalRequests = sessions
    .filter((session) => ["Pending Approval", "Changes Requested"].includes(session.approvalStatus))
    .map((session) => ({
      id: `approval-${session._id}`,
      type: "action",
      title: "Trainer session approval",
      message: `${session.presenterName} submitted "${session.topic}" for review.`,
      date: session.updatedAt || session.createdAt || session.date,
      href: "/admin/sessions",
    }));
  const noPresenter = sessions
    .filter((session) => isActiveScheduledSession(session) && session.approvalStatus !== "Pending Approval" && (!session.presenterName || session.presenterName === "TBD"))
    .map((session) => ({
      id: `presenter-${session._id}`,
      type: "action",
      title: "Presenter not confirmed",
      message: `${session.topic || "Upcoming session"} needs a trainer assignment.`,
      date: session.date,
      href: "/admin/sessions",
    }));

  const publish = sessions
    .filter((session) => {
      const evaluation = evaluationBySession.get(String(session._id));
      return session.status === "Completed" && (!evaluation || !evaluation.trainerFeedbackPublished);
    })
    .map((session) => ({
      id: `publish-${session._id}`,
      type: "feedback",
      title: "Collective response not published",
      message: `${session.topic} has ${session.feedbackCount || 0} responses waiting for admin review.`,
      date: session.updatedAt || session.date,
      href: `/admin/evaluate/${session._id}`,
    }));

  const upcoming = sessions
    .filter(isActiveScheduledSession)
    .slice(0, 4)
    .map((session) => ({
      id: `upcoming-${session._id}`,
      type: "upcoming",
      title: "Upcoming session",
      message: `${session.topic} is scheduled with ${session.presenterName}.`,
      date: session.date,
      href: "/admin/sessions",
    }));

  return [...approvalRequests, ...noPresenter, ...publish, ...upcoming].slice(0, 8);
};

const buildTrainerNotifications = (sessions = [], evaluations = []) => {
  const statusUpdates = sessions
    .filter((session) => ["Pending", "Confirmed", "Completed", "Postponed", "Cancelled"].includes(session.status))
    .map((session) => ({
      id: `status-${session._id}`,
      type: session.status === "Completed" ? "feedback" : session.status === "Confirmed" ? "upcoming" : "info",
      title: `Session ${session.status.toLowerCase()}`,
      message: `${session.topic} is marked as ${session.status}.`,
      date: session.updatedAt || session.date,
      href: "/trainer/sessions",
    }));

  const upcoming = sessions
    .filter(isActiveScheduledSession)
    .slice(0, 3)
    .map((session) => ({
      id: `trainer-upcoming-${session._id}`,
      type: "upcoming",
      title: "Upcoming session",
      message: `${session.topic} is scheduled for your KT plan.`,
      date: session.date,
      href: "/trainer/sessions",
    }));

  const publishedFeedback = evaluations
    .filter((evaluation) => evaluation.trainerFeedbackPublished)
    .slice(0, 4)
    .map((evaluation) => ({
      id: `feedback-${evaluation._id}`,
      type: "feedback",
      title: "Feedback published",
      message: `${evaluation.session?.topic || "Session"} rating is now visible: ${Number(evaluation.overallScore || 0).toFixed(2)}/5.`,
      date: evaluation.trainerFeedbackPublishedAt || evaluation.updatedAt,
      href: "/trainer/feedback",
    }));

  return [...statusUpdates, ...publishedFeedback, ...upcoming].slice(0, 8);
};

export const getAdminDashboard = async (req, res) => {
  try {
    const [sessions, feedbackCount, trainers, evaluations] = await Promise.all([
      Session.find().sort({ date: 1 }).lean(),
      Feedback.countDocuments(),
      User.find({ role: "trainer" }).select("-password").lean(),
      loadEvaluationSet(),
    ]);

    const monthly = ["March", "April", "May", "June", "July"].map((month) => ({
      month,
      score: average(evaluations.filter((item) => item.session?.month === month).map((item) => item.overallScore)),
    }));

    const needingAction = sessions
      .filter((session) => ["Pending Approval", "Changes Requested"].includes(session.approvalStatus) || isActiveScheduledSession(session))
      .slice(0, 8);

    return sendSuccess(res, "Admin dashboard loaded", {
      kpis: {
        totalSessions: sessions.length,
        completed: sessions.filter((session) => session.status === "Completed").length,
        upcoming: sessions.filter(isActiveScheduledSession).length,
        avgScore: average(evaluations.map((evaluation) => evaluation.overallScore)),
        totalFeedbackResponses: feedbackCount,
        activeTrainers: trainers.length,
      },
      needingAction,
      recentActivity: sessions.slice(-6).reverse().map((session) => ({
        id: session._id,
        label: `${session.presenterName} - ${session.topic}`,
        status: session.status,
        date: session.date,
      })),
      notifications: buildAdminNotifications(sessions, evaluations),
      monthly,
      metricBreakdown: buildMetricBreakdown(evaluations),
    });
  } catch (error) {
    return sendError(res, "Unable to load admin dashboard", error.message, 500);
  }
};

export const getTrainerDashboard = async (req, res) => {
  try {
    const trainer = await User.findById(req.params.id).select("-password").lean();
    if (!trainer) {
      return sendError(res, "Trainer not found", null, 404);
    }

    const sessions = await Session.find({
      $or: [{ presenter: trainer._id }, { presenterName: trainer.name }],
    }).sort({ date: 1 }).lean();

    const sessionIds = sessions.map((session) => session._id);
    const evaluations = await Evaluation.find({ session: { $in: sessionIds }, trainerFeedbackPublished: true })
      .populate("session")
      .sort({ trainerFeedbackPublishedAt: -1, updatedAt: -1 })
      .lean();
    const publishedSessionIds = evaluations.map((evaluation) => evaluation.session?._id).filter(Boolean);
    const feedback = await Feedback.find({ session: { $in: publishedSessionIds } }).sort({ submittedAt: -1 }).lean();

    const scores = evaluations.map((evaluation) => evaluation.overallScore);
    const lowestMetric = evaluations.length
      ? Object.entries(
        evaluations.reduce((acc, evaluation) => {
          Object.entries(evaluation.scores || {}).forEach(([key, value]) => {
            acc[key] = [...(acc[key] || []), Number(value)];
          });
          return acc;
        }, {}),
      )
        .map(([metric, values]) => ({ metric, score: average(values) }))
        .sort((a, b) => a.score - b.score)[0]
      : null;

    return sendSuccess(res, "Trainer dashboard loaded", {
      trainer,
      stats: {
        sessionsDelivered: sessions.filter((session) => session.status === "Completed").length,
        avgScore: average(scores),
        bestScore: scores.length ? Math.max(...scores) : 0,
        verdict: getVerdict(average(scores)),
      },
      sessions,
      evaluations,
      feedback: feedback.map(maskFeedbackForTrainer),
      notifications: buildTrainerNotifications(sessions, evaluations),
      improvementTip: lowestMetric
        ? `Focus next on ${lowestMetric.metric.replace(/([A-Z])/g, " $1").trim()} to lift the next score band.`
        : "Deliver one evaluated session to unlock tailored improvement tips.",
      feedbackSummary: summarizeFeedback(feedback),
    });
  } catch (error) {
    return sendError(res, "Unable to load trainer dashboard", error.message, 500);
  }
};

export const getTrainers = async (req, res) => {
  try {
    const [trainers, evaluations] = await Promise.all([
      User.find({ role: "trainer" }).select("-password").lean(),
      loadEvaluationSet(),
    ]);
    const leaderboard = buildLeaderboard(evaluations);

    return sendSuccess(res, "Trainers loaded", trainers.map((trainer) => {
      const stats = leaderboard.find((item) => String(item.trainerId) === String(trainer._id) || item.trainer === trainer.name);
      return {
        ...trainer,
        stats: stats || { sessions: 0, avgScore: 0, bestScore: 0, verdict: "Pending" },
      };
    }));
  } catch (error) {
    return sendError(res, "Unable to load trainers", error.message, 500);
  }
};

export const getTrainerById = async (req, res) => {
  try {
    const trainer = await User.findById(req.params.id).select("-password").lean();
    if (!trainer) {
      return sendError(res, "Trainer not found", null, 404);
    }
    return sendSuccess(res, "Trainer loaded", trainer);
  } catch (error) {
    return sendError(res, "Unable to load trainer", error.message, 500);
  }
};

export const getTrainerSessions = async (req, res) => {
  try {
    const trainer = await User.findById(req.params.id).lean();
    if (!trainer) {
      return sendError(res, "Trainer not found", null, 404);
    }
    const sessions = await Session.find({ $or: [{ presenter: trainer._id }, { presenterName: trainer.name }] }).sort({ date: 1 }).lean();
    return sendSuccess(res, "Trainer sessions loaded", sessions);
  } catch (error) {
    return sendError(res, "Unable to load trainer sessions", error.message, 500);
  }
};

export const getTrainerFeedback = async (req, res) => {
  try {
    const trainer = await User.findById(req.params.id).lean();
    if (!trainer) {
      return sendError(res, "Trainer not found", null, 404);
    }
    const sessions = await Session.find({ $or: [{ presenter: trainer._id }, { presenterName: trainer.name }] }).select("_id").lean();
    const publishedEvaluations = await Evaluation.find({
      session: { $in: sessions.map((session) => session._id) },
      trainerFeedbackPublished: true,
    }).select("session").lean();
    const feedback = await Feedback.find({ session: { $in: publishedEvaluations.map((evaluation) => evaluation.session) } }).sort({ submittedAt: -1 }).lean();
    return sendSuccess(res, "Trainer feedback loaded", feedback.map(maskFeedbackForTrainer));
  } catch (error) {
    return sendError(res, "Unable to load trainer feedback", error.message, 500);
  }
};
