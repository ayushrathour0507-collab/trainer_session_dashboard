// Purpose: Validates session route params, filters, and create/update payloads.
import { z } from "zod";
import { APPROVAL_STATUSES, SESSION_STATUSES } from "../config/constants.js";

const objectId = z.string().min(1, "Mongo document id is required");
const optionalString = z.string().trim().optional().or(z.literal(""));

const sessionBody = z.object({
  sessionNumber: z.coerce.number().int().positive().optional(),
  date: z.coerce.date(),
  day: z.string().min(3),
  presenter: optionalString,
  presenterName: z.string().trim().min(2, "Presenter name is required"),
  topic: z.string().trim().min(1).default("TBD"),
  status: z.enum(SESSION_STATUSES).default("Pending"),
  approvalStatus: z.enum(APPROVAL_STATUSES).optional().default("Approved"),
  adminRemarks: optionalString,
  meetingLink: optionalString,
  posterUrl: optionalString,
  startTime: z.string().trim().default("14:00"),
  endTime: z.string().trim().default("15:00"),
  summary: optionalString,
  keyTakeaways: z.array(z.string()).optional().default([]),
  note: optionalString,
  clickupCard: optionalString,
  clickupTaskName: optionalString,
  assigneeCode: optionalString,
  priority: z.enum(["Low", "Normal", "High", "Urgent"]).default("Normal"),
  dueDateLabel: optionalString,
  boardStatus: z.enum(["done", "active", "open", "blocked"]).default("open"),
  posterTopics: z.array(z.string()).optional().default([]),
  requirements: z.array(z.string()).optional().default([]),
});

export const sessionCreateSchema = z.object({
  body: sessionBody,
});

export const sessionUpdateSchema = z.object({
  params: z.object({ id: objectId }),
  body: sessionBody.partial(),
});

export const trainerSessionCreateSchema = z.object({
  body: z.object({
    date: z.coerce.date(),
    topic: z.string().trim().min(1, "Topic is required"),
    startTime: z.string().trim().default("14:00"),
    endTime: z.string().trim().default("15:00"),
    summary: optionalString,
    note: optionalString,
    posterTopics: z.array(z.string()).optional().default([]),
    requirements: z.array(z.string()).optional().default([]),
  }),
});

export const sessionApprovalSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    approvalStatus: z.enum(APPROVAL_STATUSES),
    adminRemarks: optionalString,
  }),
});

export const sessionIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const sessionListSchema = z.object({
  query: z.object({
    status: z.string().optional(),
    month: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }).partial(),
});

export const monthSchema = z.object({
  params: z.object({ month: z.string().min(3) }),
});
