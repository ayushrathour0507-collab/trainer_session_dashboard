// Purpose: Imports, stores, and summarizes attendee feedback records for KT sessions.
import Feedback from "../models/Feedback.model.js";
import Session from "../models/Session.model.js";
import { parseFeedbackText, summarizeFeedback } from "../utils/feedbackParser.utils.js";
import { getFeedbackWindow } from "../utils/feedbackWindow.utils.js";
import { sendError, sendSuccess } from "../utils/response.utils.js";

const findSessionForFeedback = async (feedback, explicitSessionId) => {
  if (explicitSessionId) {
    return Session.findById(explicitSessionId);
  }

  if (!feedback.sessionDate) return null;
  const start = new Date(feedback.sessionDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(feedback.sessionDate);
  end.setHours(23, 59, 59, 999);
  return Session.findOne({ date: { $gte: start, $lte: end } });
};

const refreshSessionFeedbackCount = async (sessionId) => {
  const [count, items] = await Promise.all([
    Feedback.countDocuments({ session: sessionId }),
    Feedback.find({ session: sessionId }).select("attendeeRating").lean(),
  ]);
  const avg = items.length
    ? Math.round((items.reduce((sum, item) => sum + Number(item.attendeeRating || 0), 0) / items.length) * 100) / 100
    : 0;

  await Session.findByIdAndUpdate(sessionId, { feedbackCount: count });
};

const createFeedbackForSession = async (session, body) => {
  const feedback = await Feedback.create({
    ...body,
    session: session._id,
    sessionDate: body.sessionDate || session.date,
    sessionTitle: body.sessionTitle || session.topic,
    presenterName: body.presenterName || session.presenterName,
    submittedAt: body.submittedAt || new Date(),
  });

  await refreshSessionFeedbackCount(session._id);
  return feedback;
};

export const getFeedbackBySession = async (req, res) => {
  try {
    const feedback = await Feedback.find({ session: req.params.sessionId }).sort({ submittedAt: -1 }).lean();
    return sendSuccess(res, "Feedback loaded", {
      items: feedback,
      summary: summarizeFeedback(feedback),
    });
  } catch (error) {
    return sendError(res, "Unable to load feedback", error.message, 500);
  }
};

export const bulkImportFeedback = async (req, res) => {
  try {
    const parsed = parseFeedbackText(req.body.rawText);
    const created = [];
    const unmatched = [];

    for (const item of parsed) {
      const session = await findSessionForFeedback(item, req.body.sessionId);
      if (!session) {
        unmatched.push(item);
        continue;
      }

      const feedback = await Feedback.create({
        ...item,
        session: session._id,
        sessionDate: item.sessionDate || session.date,
        sessionTitle: item.sessionTitle || session.topic,
        presenterName: item.presenterName || session.presenterName,
      });
      created.push(feedback);
      await refreshSessionFeedbackCount(session._id);
    }

    return sendSuccess(res, "Feedback imported", { created, unmatched }, 201);
  } catch (error) {
    return sendError(res, "Unable to import feedback", error.message, 500);
  }
};

export const addFeedback = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return sendError(res, "Session not found", null, 404);
    }

    const feedback = await createFeedbackForSession(session, req.body);
    return sendSuccess(res, "Feedback added", feedback, 201);
  } catch (error) {
    return sendError(res, "Unable to add feedback", error.message, 500);
  }
};

export const submitPublicFeedback = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return sendError(res, "Session not found", null, 404);
    }

    const feedbackWindow = getFeedbackWindow(session);
    if (!feedbackWindow.isOpen) {
      return sendError(res, feedbackWindow.message, feedbackWindow, 400);
    }

    const feedback = await createFeedbackForSession(session, {
      ...req.body,
      responderName: req.body.responderName || "Anonymous",
    });

    return sendSuccess(res, "Feedback submitted. Thank you.", {
      id: feedback._id,
      session: feedback.session,
      attendeeRating: feedback.attendeeRating,
    }, 201);
  } catch (error) {
    return sendError(res, "Unable to submit feedback", error.message, 500);
  }
};
