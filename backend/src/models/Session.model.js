// Purpose: Defines KT session scheduling, display metadata, and denormalized public summary fields.
import mongoose from "mongoose";
import { APPROVAL_STATUSES, DEFAULT_MEETING_LINK, SESSION_STATUSES } from "../config/constants.js";

const sessionSchema = new mongoose.Schema(
  {
    sessionNumber: { type: Number, required: true, unique: true },
    date: { type: Date, required: true },
    day: { type: String, required: true },
    presenter: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    presenterName: { type: String, default: "TBD" },
    presenterInitials: { type: String, default: "TBD" },
    topic: { type: String, default: "TBD" },
    series: { type: String, default: "The Construct" },
    status: { type: String, enum: SESSION_STATUSES, default: "Pending" },
    approvalStatus: { type: String, enum: APPROVAL_STATUSES, default: "Approved" },
    adminRemarks: { type: String, default: "" },
    meetingLink: { type: String, default: DEFAULT_MEETING_LINK },
    posterUrl: { type: String, default: "" },
    startTime: { type: String, default: "14:00" },
    endTime: { type: String, default: "15:00" },
    summary: { type: String, default: "" },
    keyTakeaways: [{ type: String }],
    note: { type: String, default: "" },
    clickupCard: { type: String, default: "" },
    clickupTaskName: { type: String, default: "" },
    assigneeCode: { type: String, default: "" },
    priority: { type: String, enum: ["Low", "Normal", "High", "Urgent"], default: "Normal" },
    dueDateLabel: { type: String, default: "" },
    boardStatus: { type: String, enum: ["done", "active", "open", "blocked"], default: "open" },
    month: { type: String, required: true },
    rating: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    verdict: { type: String, default: "" },
    attendees: { type: Number, default: 0 },
    feedbackCount: { type: Number, default: 0 },
    posterTheme: { type: String, default: "navy-gold" },
    tags: [{ type: String }],
    posterTopics: [{ type: String }],
    requirements: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

sessionSchema.index({ date: 1 });
sessionSchema.index({ status: 1, month: 1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
