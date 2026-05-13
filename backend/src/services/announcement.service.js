// Purpose: Generates Teams-ready announcement copy from session data and selected announcement type.
import { format } from "date-fns";

export const ANNOUNCEMENT_TEMPLATES = {
  "pre-session":
    "📢 BytesAndBeyond — {day}'s Session!\nHey All General,\n\nWe're back with another exciting session! {presenter} is going to take us through {topic}.\n\n📅 Date: {date} — {day}\n🕑 Time: {startTime} – {endTime}\n💻 Laptop · Stable internet · Ready to learn!\n\nThis session is mandatory for all trainers. Please check your calendar for the meeting link and join on time.\n\n🔗 Join: {meetingLink}\n\nSee you all at {startTime}! 🔥",
  reminder:
    "⏰ Quick Reminder — BytesAndBeyond Today!\n\n{presenter} is presenting {topic} starting at {startTime}.\n\n🔗 {meetingLink}\n\nJoin on time! 🙌",
  "wrap-up":
    "✅ BytesAndBeyond — Session Wrapped!\n\nHuge shoutout to {presenter} for an amazing session on {topic}! 🔥\n\n{summary}\n\nPlease fill the feedback form if you haven't already! 📝",
  postponement:
    "📢 Update — Today's BytesAndBeyond Session\n\nToday's session has been postponed due to unavailability. The session has been rescheduled to {rescheduleDate}. Please update your calendars.\n\nThank you for your patience! 🙏",
  reschedule:
    "🎉 BytesAndBeyond — We're Back!\n\nThe session has been rescheduled to {rescheduleDate} at {startTime}. Come ready to learn and build! 🚀\n\n🔗 {meetingLink}",
};

const formatDate = (date) => {
  if (!date) return "TBD";
  return format(new Date(date), "dd MMMM yyyy");
};

export const generateAnnouncement = (session, type = "pre-session", overrides = {}) => {
  const template = ANNOUNCEMENT_TEMPLATES[type] || ANNOUNCEMENT_TEMPLATES["pre-session"];
  const replacements = {
    presenter: session.presenterName || "TBD",
    topic: session.topic || "TBD",
    day: session.day || "Saturday",
    date: formatDate(session.date),
    startTime: session.startTime || "14:00",
    endTime: session.endTime || "15:00",
    meetingLink: session.meetingLink || "Meeting link will be shared in the calendar invite.",
    summary: session.summary || "The session covered practical insights, peer learning, and reusable takeaways for future projects.",
    rescheduleDate: overrides.rescheduleDate || formatDate(session.date),
    ...overrides,
  };

  return Object.entries(replacements).reduce((content, [key, value]) => {
    return content.replaceAll(`{${key}}`, value || "TBD");
  }, template);
};
