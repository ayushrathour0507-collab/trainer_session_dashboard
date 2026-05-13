// Purpose: Centralizes date formatting, countdowns, and programme progress calculations.
import { differenceInSeconds, format, isValid } from "date-fns";

export const safeDate = (date) => {
  const parsed = new Date(date);
  return isValid(parsed) ? parsed : null;
};

export const formatDate = (date, pattern = "dd MMM yyyy") => {
  const parsed = safeDate(date);
  return parsed ? format(parsed, pattern) : "TBD";
};

export const formatLongDate = (date) => formatDate(date, "dd MMMM yyyy");

export const getCountdown = (date) => {
  const target = safeDate(date);
  if (!target) return "TBD";

  const seconds = Math.max(0, differenceInSeconds(target, new Date()));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

export const programmeProgress = () => {
  const start = new Date("2026-03-01T00:00:00");
  const end = new Date("2026-07-11T15:00:00");
  const now = new Date();
  const total = end.getTime() - start.getTime();
  const elapsed = Math.min(Math.max(now.getTime() - start.getTime(), 0), total);
  return Math.round((elapsed / total) * 100);
};
