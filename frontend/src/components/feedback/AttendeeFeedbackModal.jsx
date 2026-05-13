// Purpose: Collects in-app attendee feedback for a completed session through the public feedback API.
import PropTypes from "prop-types";
import { MessageSquarePlus, Star, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { feedbackService } from "../../services/feedback.service.js";
import { getFeedbackWindow } from "../../utils/feedbackWindow.js";

const defaultForm = {
  responderName: "",
  email: "",
  isAnonymous: true,
  attendeeRating: 5,
  keyTakeaways: "",
  improvements: "",
  futureSuggestions: "",
};

const AttendeeFeedbackModal = ({ session, open, onClose, onSubmitted }) => {
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  if (!open || !session) return null;

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const feedbackWindow = getFeedbackWindow(session);

  const submit = async (event) => {
    event.preventDefault();
    if (form.email && !form.email.toLowerCase().endsWith("@iamneo.ai")) {
      toast.error("Please use your @iamneo.ai email.");
      return;
    }
    if (!feedbackWindow.isOpen) {
      toast.error(feedbackWindow.message);
      return;
    }

    try {
      setSubmitting(true);
      await feedbackService.addPublic(session._id || session.id, {
        ...form,
        responderName: form.responderName || "Anonymous",
        sessionTitle: session.topic,
        presenterName: session.presenterName,
        sessionDate: session.date,
      });
      toast.success("Feedback submitted");
      setForm(defaultForm);
      onSubmitted?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="nexus-card max-h-[92vh] w-full max-w-2xl overflow-auto p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="label-tag text-accent">Attendee Feedback</p>
            <h2 className="mt-1 text-xl font-black text-textPrimary">{session.topic}</h2>
            <p className="mt-1 text-sm font-bold text-textSecondary">{session.presenterName || "TBD"}</p>
          </div>
          <button type="button" className="ghost-button h-10 w-10 p-0" onClick={onClose} aria-label="Close feedback form">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="label-tag mb-1 block">Name</span>
            <input className="field" value={form.responderName} placeholder="Optional" onChange={(event) => update("responderName", event.target.value)} />
          </label>
          <label className="block">
            <span className="label-tag mb-1 block">Email</span>
            <input className="field" type="email" value={form.email} placeholder="name@iamneo.ai" onChange={(event) => update("email", event.target.value)} />
          </label>
        </div>
        <label className="mt-3 flex items-start gap-3 rounded-button border border-light-border p-3 dark:border-dark-border">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-accent"
            checked={form.isAnonymous}
            onChange={(event) => update("isAnonymous", event.target.checked)}
          />
          <span>
            <span className="block text-sm font-black text-light-text dark:text-dark-text">Keep me anonymous to the trainer</span>
            <span className="block text-xs font-bold text-light-subtext dark:text-dark-subtext">Admin can still see the submitted name and email for review.</span>
          </span>
        </label>

        <div className="mt-3">
          <span className="label-tag mb-2 block">Overall Rating</span>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                className={`secondary-button h-11 px-4 ${Number(form.attendeeRating) === rating ? "border-accent bg-accent text-white" : ""}`}
                onClick={() => update("attendeeRating", rating)}
              >
                <Star className={`h-4 w-4 ${Number(form.attendeeRating) >= rating ? "fill-warning text-warning" : ""}`} />
                {rating}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 grid gap-2.5">
          <label className="block">
            <span className="label-tag mb-1 block">Key Takeaways</span>
            <textarea className="field min-h-24" value={form.keyTakeaways} placeholder="What did you learn?" onChange={(event) => update("keyTakeaways", event.target.value)} />
          </label>
          <label className="block">
            <span className="label-tag mb-1 block">Improvements</span>
            <textarea className="field min-h-24" value={form.improvements} placeholder="What can be improved next time?" onChange={(event) => update("improvements", event.target.value)} />
          </label>
          <label className="block">
            <span className="label-tag mb-1 block">Future Topic Suggestions</span>
            <textarea className="field min-h-20" value={form.futureSuggestions} placeholder="Any future topics you want?" onChange={(event) => update("futureSuggestions", event.target.value)} />
          </label>
        </div>

        <div className={`mt-3 rounded-button border p-2.5 text-sm font-bold ${feedbackWindow.isOpen ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning"}`}>
          {feedbackWindow.message}
        </div>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="secondary-button px-4" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button px-4" disabled={submitting || !feedbackWindow.isOpen}>
            <MessageSquarePlus className="h-4 w-4" />
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </form>
    </div>
  );
};

AttendeeFeedbackModal.propTypes = {
  session: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmitted: PropTypes.func,
};

export default AttendeeFeedbackModal;
