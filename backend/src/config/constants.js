// Purpose: Stores shared domain constants used by controllers, validators, and seed data.
export const SESSION_STATUSES = [
  "Pending",
  "Confirmed",
  "Completed",
  "Postponed",
  "Cancelled",
];

export const APPROVAL_STATUSES = [
  "Approved",
  "Pending Approval",
  "Rejected",
  "Changes Requested",
];

export const USER_ROLES = ["admin", "trainer", "viewer"];

export const ANNOUNCEMENT_TYPES = [
  "pre-session",
  "reminder",
  "wrap-up",
  "postponement",
  "reschedule",
];

export const SCORE_KEYS = [
  "startOnTime",
  "structure",
  "interaction",
  "clarity",
  "practical",
  "clickup",
  "timeEfficiency",
];

export const SCORE_LABELS = {
  startOnTime: "Start On Time",
  structure: "Structure",
  interaction: "Interaction",
  clarity: "Clarity",
  practical: "Practical",
  clickup: "Attendee Feedback",
  timeEfficiency: "Time Efficiency",
};

export const PROGRAMME_MONTHS = ["March", "April", "May", "June", "July"];

export const DEFAULT_MEETING_LINK = "https://teams.microsoft.com/meet/43439073580887?p=T7TF7S4gDgaaQgKOkA";
