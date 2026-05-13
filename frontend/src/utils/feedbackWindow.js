// Purpose: Mirrors the feedback availability rule for client-side messaging and button state.
const sessionDateTime = (session, timeField) => {
  if (!session?.date) return null;
  const dateKey = String(session.date).slice(0, 10);
  const time = session[timeField] || (timeField === "endTime" ? "15:00" : "14:00");
  return new Date(`${dateKey}T${time}:00`);
};

export const getFeedbackWindow = (session, now = new Date()) => {
  if (session?.feedbackWindow) {
    return {
      ...session.feedbackWindow,
      openAt: new Date(session.feedbackWindow.openAt),
      closeAt: new Date(session.feedbackWindow.closeAt),
    };
  }

  const endAt = sessionDateTime(session, "endTime");
  if (!endAt) return { isOpen: false, isBefore: true, isClosed: false, message: "Feedback timing is unavailable." };

  const openAt = new Date(endAt.getTime() - (15 * 60 * 1000));
  const closeAt = new Date(openAt.getTime() + (2 * 60 * 60 * 1000));
  const isOpen = now >= openAt && now <= closeAt;
  const isBefore = now < openAt;
  const timeLabel = openAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return {
    openAt,
    closeAt,
    isOpen,
    isBefore,
    isClosed: now > closeAt,
    message: isOpen ? "Feedback is open now." : isBefore ? `Feedback opens at ${timeLabel}.` : "Feedback window is closed.",
  };
};
