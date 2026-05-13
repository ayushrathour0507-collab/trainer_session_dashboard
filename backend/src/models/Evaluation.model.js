// Purpose: Stores organizer evaluation metrics, weighted scores, verdicts, and attendance records.
import mongoose from "mongoose";

const scoreFields = {
  startOnTime: { type: Number, min: 1, max: 5, default: 3 },
  structure: { type: Number, min: 1, max: 5, default: 3 },
  interaction: { type: Number, min: 1, max: 5, default: 3 },
  clarity: { type: Number, min: 1, max: 5, default: 3 },
  practical: { type: Number, min: 1, max: 5, default: 3 },
  clickup: { type: Number, min: 1, max: 5, default: 3 },
  clickupDiscipline: { type: Number, min: 1, max: 5, default: 3 },
  timeEfficiency: { type: Number, min: 1, max: 5, default: 3 },
};

const evaluationSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true, unique: true },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scores: scoreFields,
    organiserChecks: {
      startedOnTime: { type: Boolean, default: false },
      completedOnTime: { type: Boolean, default: false },
      icebreakerDone: { type: Boolean, default: false },
      qaDone: { type: Boolean, default: false },
    },
    totalScore: { type: Number, default: 0 },
    attendeeAverageRating: { type: Number, default: 0 },
    adminInsightScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    verdict: { type: String, default: "Needs Improvement" },
    remarks: { type: String, default: "" },
    adminInsights: {
      strengths: [{ type: String }],
      improvements: [{ type: String }],
      audienceEngagement: { type: String, default: "" },
      deliveryNotes: { type: String, default: "" },
      recommendedActions: [{ type: String }],
    },
    overallFeedbackPost: { type: String, default: "" },
    trainerFeedbackPublished: { type: Boolean, default: false },
    trainerFeedbackPublishedAt: { type: Date, default: null },
    trainerFeedbackPublishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    attendanceCount: { type: Number, default: 0 },
    feedbackCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

evaluationSchema.index({ overallScore: -1 });

const Evaluation = mongoose.model("Evaluation", evaluationSchema);

export default Evaluation;
