// Purpose: Supplies Teams announcement templates and interpolation helpers for previews.
import { formatLongDate } from "./dateUtils.js";

export const ANNOUNCEMENT_TYPES = [
  { value: "pre-session", label: "Pre-session" },
  { value: "reminder", label: "Reminder" },
  { value: "wrap-up", label: "Wrap-up" },
  { value: "postponement", label: "Postponement" },
  { value: "reschedule", label: "Reschedule" },
];

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

export const fillAnnouncementTemplate = (session, type = "pre-session", overrides = {}) => {
  const values = {
    presenter: session?.presenterName || "TBD",
    topic: session?.topic || "TBD",
    day: session?.day || "Saturday",
    date: formatLongDate(session?.date),
    startTime: session?.startTime || "14:00",
    endTime: session?.endTime || "15:00",
    meetingLink: session?.meetingLink || "Meeting link will be shared in calendar.",
    summary: session?.summary || "The session covered practical ideas and reusable takeaways for the training team.",
    rescheduleDate: overrides.rescheduleDate || formatLongDate(session?.date),
    ...overrides,
  };

  return Object.entries(values).reduce((content, [key, value]) => content.replaceAll(`{${key}}`, value), ANNOUNCEMENT_TEMPLATES[type]);
};
