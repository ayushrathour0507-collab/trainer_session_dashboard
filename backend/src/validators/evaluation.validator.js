// Purpose: Validates evaluation route params and score/checklist payloads.
import { z } from "zod";

const objectId = z.string().min(1, "Mongo document id is required");
const score = z.coerce.number().min(1).max(5);
const iamneoEmail = z.string().trim().email().refine((value) => value.toLowerCase().endsWith("@iamneo.ai"), {
  message: "Email must use @iamneo.ai",
});

const scoresSchema = z.object({
  startOnTime: score,
  structure: score,
  interaction: score,
  clarity: score,
  practical: score,
  clickup: score.optional(),
  clickupDiscipline: score.optional(),
  timeEfficiency: score,
}).superRefine((value, ctx) => {
  if (value.clickup === undefined && value.clickupDiscipline === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["clickup"],
      message: "Attendee feedback score is required",
    });
  }
}).transform((value) => {
  const feedbackScore = value.clickupDiscipline ?? value.clickup;
  return {
    ...value,
    clickup: feedbackScore,
    clickupDiscipline: feedbackScore,
  };
});

const checksSchema = z.object({
  startedOnTime: z.coerce.boolean().default(false),
  completedOnTime: z.coerce.boolean().default(false),
  icebreakerDone: z.coerce.boolean().default(false),
  qaDone: z.coerce.boolean().default(false),
});

const adminInsightsSchema = z.object({
  strengths: z.array(z.string().trim()).min(1, "At least one strength is required"),
  improvements: z.array(z.string().trim()).min(1, "At least one improvement is required"),
  audienceEngagement: z.string().trim().min(3, "Audience engagement insight is required"),
  deliveryNotes: z.string().trim().min(3, "Delivery notes are required"),
  recommendedActions: z.array(z.string().trim()).min(1, "At least one recommended action is required"),
});

export const evaluationIdSchema = z.object({
  params: z.object({ sessionId: objectId }),
});

export const evaluationSaveSchema = z.object({
  params: z.object({ sessionId: objectId }),
  body: z.object({
    scores: scoresSchema,
    organiserChecks: checksSchema,
    adminInsights: adminInsightsSchema,
    attendeeAverageRating: z.coerce.number().min(0).max(5).optional(),
    remarks: z.string().trim().optional().default(""),
    attendanceCount: z.coerce.number().int().min(0).default(0),
    feedbackCount: z.coerce.number().int().min(0).default(0),
  }),
});

export const feedbackBulkSchema = z.object({
  body: z.object({
    rawText: z.string().min(1, "Feedback CSV or TSV text is required"),
    sessionId: z.string().optional(),
  }),
});

export const feedbackSingleSchema = z.object({
  params: z.object({ sessionId: objectId }),
  body: z.object({
    responderName: z.string().trim().optional().default("Anonymous"),
    email: iamneoEmail.optional().or(z.literal("")),
    isAnonymous: z.coerce.boolean().optional().default(true),
    presenterName: z.string().trim().optional().default(""),
    sessionDate: z.coerce.date().optional(),
    sessionTitle: z.string().trim().optional().default(""),
    attendeeRating: z.coerce.number().min(1).max(5),
    keyTakeaways: z.string().trim().optional().default(""),
    improvements: z.string().trim().optional().default(""),
    futureSuggestions: z.string().trim().optional().default(""),
    submittedAt: z.coerce.date().optional(),
  }),
});
