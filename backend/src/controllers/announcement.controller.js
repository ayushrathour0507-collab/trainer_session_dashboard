// Purpose: Generates, saves, and retrieves Teams announcement content for sessions.
import Announcement from "../models/Announcement.model.js";
import Session from "../models/Session.model.js";
import { generateAnnouncement } from "../services/announcement.service.js";
import { sendError, sendSuccess } from "../utils/response.utils.js";

export const generateAnnouncementForSession = async (req, res) => {
  try {
    const { sessionId, type = "pre-session", overrides = {}, save = true } = req.body;
    const session = await Session.findById(sessionId).lean();
    if (!session) {
      return sendError(res, "Session not found", null, 404);
    }

    const content = generateAnnouncement(session, type, overrides);
    let announcement = null;

    if (save) {
      announcement = await Announcement.create({
        session: session._id,
        type,
        content,
        createdBy: req.user._id,
      });
    }

    return sendSuccess(res, "Announcement generated", { content, announcement }, 201);
  } catch (error) {
    return sendError(res, "Unable to generate announcement", error.message, 500);
  }
};

export const getAnnouncementsBySession = async (req, res) => {
  try {
    const announcements = await Announcement.find({ session: req.params.sessionId })
      .sort({ generatedAt: -1 })
      .lean();
    return sendSuccess(res, "Announcements loaded", announcements);
  } catch (error) {
    return sendError(res, "Unable to load announcements", error.message, 500);
  }
};
