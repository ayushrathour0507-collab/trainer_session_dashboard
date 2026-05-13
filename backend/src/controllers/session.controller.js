// Purpose: Manages public and admin session retrieval, creation, updates, deletion, and schedule filters.
import { format } from "date-fns";
import Session from "../models/Session.model.js";
import User from "../models/User.model.js";
import Evaluation from "../models/Evaluation.model.js";
import Feedback from "../models/Feedback.model.js";
import { DEFAULT_MEETING_LINK } from "../config/constants.js";
import { getFeedbackWindow } from "../utils/feedbackWindow.utils.js";
import { sendError, sendSuccess } from "../utils/response.utils.js";

const getMonth = (date) => format(new Date(date), "MMMM");
const PUBLIC_STATUSES = ["Pending", "Confirmed", "Completed", "Postponed", "Cancelled"];
const emailForName = (name) => `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/\.$/, "")}@iamneo.ai`;
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const publicApprovalQuery = { approvalStatus: { $in: ["Approved", null] } };

const getSessionDateTime = (session, timeField = "startTime") => {
  const dateKey = format(new Date(session.date), "yyyy-MM-dd");
  const time = session[timeField] || "14:00";
  return new Date(`${dateKey}T${time}:00`);
};

const withLiveStatus = (session, now = new Date()) => {
  if (!session) return null;
  const startAt = getSessionDateTime(session, "startTime");
  const isOngoing = ["Pending", "Confirmed"].includes(session.status) && startAt <= now;
  return {
    ...session,
    meetingLink: DEFAULT_MEETING_LINK,
    feedbackWindow: getFeedbackWindow(session, now),
    isOngoing,
    displayStatus: isOngoing ? "Ongoing" : session.status,
  };
};

const withDefaultMeetingLink = (session) => session ? { ...session, meetingLink: DEFAULT_MEETING_LINK, feedbackWindow: getFeedbackWindow(session) } : session;

const dateLabel = (dateValue) => {
  const date = new Date(dateValue);
  return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)}`;
};

const initials = (name = "") => name
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join("")
  .toUpperCase();

const enrichSession = async (session) => {
  const evaluation = await Evaluation.findOne({ session: session._id, trainerFeedbackPublished: true }).lean();
  const feedback = evaluation
    ? await Feedback.find({ session: session._id }).sort({ submittedAt: -1 }).lean()
    : [];
  return {
    ...withDefaultMeetingLink(session),
    evaluation,
    feedback: feedback.map((item) => ({
      ...item,
      responderName: "Anonymous",
      email: "",
    })),
  };
};

const resolvePresenter = async (payload) => {
  const presenterName = String(payload.presenterName || "").trim();

  if (payload.presenter) {
    const presenter = await User.findById(payload.presenter).lean();
    if (presenter) return { ...payload, presenter: presenter._id, presenterName: presenter.name };
  }

  if (!presenterName || presenterName === "TBD") {
    return { ...payload, presenter: null, presenterName: "TBD" };
  }

  const existing = await User.findOne({
    role: "trainer",
    name: { $regex: `^${escapeRegex(presenterName)}$`, $options: "i" },
  }).lean();

  if (existing) {
    return { ...payload, presenter: existing._id, presenterName: existing.name };
  }

  const created = await User.create({
    name: presenterName,
    email: emailForName(presenterName),
    password: "Trainer@123",
    role: "trainer",
  });

  return { ...payload, presenter: created._id, presenterName: created.name };
};

export const getSessions = async (req, res) => {
  try {
    const { status, month, search, page = 1, limit = 100 } = req.query;
    const query = { ...publicApprovalQuery };

    if (status && status !== "All") query.status = status;
    else query.status = { $in: PUBLIC_STATUSES };
    if (month && month !== "All") query.month = month;
    if (search) {
      query.$or = [
        { presenterName: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
        { note: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Session.find(query).populate("presenter", "name email avatar role").sort({ date: 1 }).skip(skip).limit(Number(limit)).lean(),
      Session.countDocuments(query),
    ]);

    return sendSuccess(res, "Sessions loaded", {
      items: items.map(withDefaultMeetingLink),
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) || 1 },
    });
  } catch (error) {
    return sendError(res, "Unable to load sessions", error.message, 500);
  }
};

export const getAdminSessions = async (req, res) => {
  try {
    const { status, month, search, page = 1, limit = 100 } = req.query;
    const query = {};

    if (status && status !== "All") query.status = status;
    if (month && month !== "All") query.month = month;
    if (search) {
      query.$or = [
        { presenterName: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
        { clickupTaskName: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Session.find(query)
        .populate("presenter", "name email avatar role")
        .populate("createdBy", "name email role")
        .sort({ date: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Session.countDocuments(query),
    ]);

    return sendSuccess(res, "Admin sessions loaded", {
      items: items.map(withDefaultMeetingLink),
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) || 1 },
    });
  } catch (error) {
    return sendError(res, "Unable to load admin sessions", error.message, 500);
  }
};

export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ $or: [{ createdBy: req.user._id }, { presenter: req.user._id }] })
      .populate("presenter", "name email avatar role")
      .sort({ date: 1 })
      .lean();
    return sendSuccess(res, "Trainer sessions loaded", sessions.map(withDefaultMeetingLink));
  } catch (error) {
    return sendError(res, "Unable to load trainer-created sessions", error.message, 500);
  }
};

export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate("presenter", "name email avatar role").lean();
    if (!session) {
      return sendError(res, "Session not found", null, 404);
    }
    return sendSuccess(res, "Session loaded", await enrichSession(session));
  } catch (error) {
    return sendError(res, "Unable to load session", error.message, 500);
  }
};

export const createTrainerSessionRequest = async (req, res) => {
  try {
    const maxSession = await Session.findOne().sort({ sessionNumber: -1 }).lean();
    const date = req.body.date;
    const session = await Session.create({
      ...req.body,
      sessionNumber: (maxSession?.sessionNumber || 0) + 1,
      date,
      day: format(new Date(date), "EEEE"),
      month: getMonth(date),
      presenter: req.user._id,
      presenterName: req.user.name,
      presenterInitials: initials(req.user.name),
      createdBy: req.user._id,
      status: "Pending",
      approvalStatus: "Pending Approval",
      adminRemarks: "",
      meetingLink: DEFAULT_MEETING_LINK,
      dueDateLabel: dateLabel(date),
      clickupTaskName: req.body.topic,
      boardStatus: "open",
      priority: "Normal",
      posterTopics: req.body.posterTopics?.length ? req.body.posterTopics : ["Session overview", "Live walkthrough", "Q&A"],
      requirements: req.body.requirements?.length ? req.body.requirements : ["Laptop", "Stable internet", "Ready to learn"],
    });

    return sendSuccess(res, "Session request submitted for admin approval", withDefaultMeetingLink(session.toObject()), 201);
  } catch (error) {
    return sendError(res, "Unable to submit session request", error.message, 500);
  }
};

export const createSession = async (req, res) => {
  try {
    const maxSession = await Session.findOne().sort({ sessionNumber: -1 }).lean();
    const payload = await resolvePresenter({
      ...req.body,
      sessionNumber: req.body.sessionNumber || (maxSession?.sessionNumber || 0) + 1,
      month: getMonth(req.body.date),
      createdBy: req.user?._id || null,
      status: req.body.status || "Pending",
    });

    const session = await Session.create({ ...payload, meetingLink: DEFAULT_MEETING_LINK });
    return sendSuccess(res, "Session created", session, 201);
  } catch (error) {
    return sendError(res, "Unable to create session", error.message, 500);
  }
};

export const updateSession = async (req, res) => {
  try {
    const basePayload = {
      ...req.body,
      ...(req.body.date ? { month: getMonth(req.body.date) } : {}),
    };
    const touchesPresenter = Object.prototype.hasOwnProperty.call(req.body, "presenter")
      || Object.prototype.hasOwnProperty.call(req.body, "presenterName");
    const payload = touchesPresenter ? await resolvePresenter(basePayload) : basePayload;

    const session = await Session.findByIdAndUpdate(req.params.id, { ...payload, meetingLink: DEFAULT_MEETING_LINK }, { new: true, runValidators: true }).lean();
    if (!session) {
      return sendError(res, "Session not found", null, 404);
    }

    return sendSuccess(res, "Session updated", withDefaultMeetingLink(session));
  } catch (error) {
    return sendError(res, "Unable to update session", error.message, 500);
  }
};

export const updateSessionApproval = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return sendError(res, "Session not found", null, 404);
    }

    session.approvalStatus = req.body.approvalStatus;
    session.adminRemarks = req.body.adminRemarks || "";
    if (req.body.approvalStatus === "Approved") {
      session.status = session.status === "Completed" ? "Completed" : "Confirmed";
      session.boardStatus = "active";
    }
    if (req.body.approvalStatus === "Rejected") {
      session.status = "Cancelled";
      session.boardStatus = "blocked";
    }
    if (req.body.approvalStatus === "Changes Requested") {
      session.status = "Pending";
      session.boardStatus = "open";
    }
    await session.save();

    return sendSuccess(res, `Session ${req.body.approvalStatus.toLowerCase()}`, withDefaultMeetingLink(session.toObject()));
  } catch (error) {
    return sendError(res, "Unable to update approval", error.message, 500);
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return sendError(res, "Session not found", null, 404);
    }

    await Promise.all([
      Evaluation.deleteMany({ session: session._id }),
      Feedback.deleteMany({ session: session._id }),
      session.deleteOne(),
    ]);

    return sendSuccess(res, "Session deleted", { id: req.params.id });
  } catch (error) {
    return sendError(res, "Unable to delete session", error.message, 500);
  }
};

export const getUpcomingSession = async (req, res) => {
  try {
    const now = new Date();
    const sessions = await Session.find({ status: { $in: ["Pending", "Confirmed"] }, ...publicApprovalQuery })
      .populate("presenter", "name email avatar role")
      .sort({ date: 1 })
      .lean();
    const activeSession = sessions.find((session) => getSessionDateTime(session, "startTime") <= now);
    const futureSession = sessions.find((session) => getSessionDateTime(session, "startTime") > now);
    const session = activeSession || futureSession || null;

    return sendSuccess(res, "Upcoming session loaded", withLiveStatus(session, now));
  } catch (error) {
    return sendError(res, "Unable to load upcoming session", error.message, 500);
  }
};

export const getSessionsByMonth = async (req, res) => {
  try {
    const sessions = await Session.find({ month: req.params.month, status: { $in: PUBLIC_STATUSES }, ...publicApprovalQuery })
      .populate("presenter", "name email avatar role")
      .sort({ date: 1 })
      .lean();

    return sendSuccess(res, "Month sessions loaded", sessions.map(withDefaultMeetingLink));
  } catch (error) {
    return sendError(res, "Unable to load sessions by month", error.message, 500);
  }
};
