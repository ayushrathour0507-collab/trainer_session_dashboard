// Purpose: Persists generated Teams announcement messages for each session.
import mongoose from "mongoose";
import { ANNOUNCEMENT_TYPES } from "../config/constants.js";

const announcementSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    type: { type: String, enum: ANNOUNCEMENT_TYPES, required: true },
    content: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
    postedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

announcementSchema.index({ session: 1, type: 1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
