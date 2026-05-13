/**
 * Purpose: Maps scores, statuses, and topic tags to CSS-variable driven UI tones.
 */

export const scoreTone = (score) => {
  const value = Number(score || 0);
  if (value >= 4.5) return "success";
  if (value >= 3.5) return "info";
  if (value >= 2.5) return "warning";
  return "danger";
};

export const statusTone = (status = "") => {
  const value = status.toLowerCase();
  if (value.includes("ongoing")) return "ongoing";
  if (value.includes("completed")) return "completed";
  if (value.includes("approved")) return "completed";
  if (value.includes("rejected")) return "postponed";
  if (value.includes("changes")) return "pending";
  if (value.includes("postponed") || value.includes("cancelled")) return "postponed";
  if (value.includes("confirmed")) return "confirmed";
  return "pending";
};

export const topicTone = (tags = []) => {
  const joined = tags.join(" ").toLowerCase();
  if (joined.includes("power")) return "var(--warning)";
  if (joined.includes("cloud") || joined.includes("gcp")) return "var(--info)";
  if (joined.includes("ai") || joined.includes("chatbot")) return "var(--purple)";
  if (joined.includes("data") || joined.includes("ml")) return "var(--teal)";
  if (joined.includes("backend") || joined.includes("devops")) return "var(--orange)";
  return "var(--accent)";
};
