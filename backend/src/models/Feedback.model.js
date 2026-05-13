// Purpose: Captures attendee feedback imported from Microsoft Forms or entered manually by admins.
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    responderName: { type: String, default: "Anonymous" },
    email: { type: String, default: "" },
    isAnonymous: { type: Boolean, default: true },
    presenterName: { type: String, default: "" },
    sessionDate: { type: Date, required: true },
    sessionTitle: { type: String, required: true },
    attendeeRating: { type: Number, min: 1, max: 5, required: true },
    keyTakeaways: { type: String, default: "" },
    improvements: { type: String, default: "" },
    futureSuggestions: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

feedbackSchema.index({ session: 1, submittedAt: -1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
