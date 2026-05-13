// Purpose: Calculates the attendee feedback availability window for a KT session.
import { format } from "date-fns";

const sessionDateTime = (session, timeField) => {
  const dateKey = format(new Date(session.date), "yyyy-MM-dd");
  const time = session[timeField] || (timeField === "endTime" ? "15:00" : "14:00");
  return new Date(`${dateKey}T${time}:00`);
};

export const getFeedbackWindow = (session, now = new Date()) => {
  const startAt = sessionDateTime(session, "startTime");
  const endAt = sessionDateTime(session, "endTime");
  const openAt = new Date(endAt.getTime() - (15 * 60 * 1000));
  const closeAt = new Date(openAt.getTime() + (2 * 60 * 60 * 1000));
  const isOpen = now >= openAt && now <= closeAt;
  const isBefore = now < openAt;
  const message = isOpen
    ? "Feedback is open now."
    : isBefore
      ? `Feedback opens at ${format(openAt, "hh:mm a")}.`
      : "Feedback window is closed.";

  return {
    openAt,
    closeAt,
    isOpen,
    isBefore,
    isClosed: now > closeAt,
    message,
    rule: "Feedback opens during the last 15 minutes and closes 2 hours later.",
  };
};
