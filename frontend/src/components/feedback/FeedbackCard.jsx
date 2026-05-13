/**
 * Purpose: Displays a single feedback response with optional anonymisation for trainer-facing views.
 */
import PropTypes from "prop-types";
import RatingStars from "../common/RatingStars.jsx";

const FeedbackCard = ({ feedback, anonymous = true }) => (
  <article className="nexus-card p-4">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-textPrimary">{anonymous ? "Anonymous attendee" : feedback.responderName || "Unknown attendee"}</p>
        <p className="text-xs text-textSecondary">{feedback.sessionTitle || feedback.session?.topic || "BytesAndBeyond session"}</p>
      </div>
      <RatingStars rating={Number(feedback.attendeeRating || 0)} showValue />
    </div>
    <p className="text-sm font-bold text-textSecondary">{feedback.keyTakeaways || feedback.comment || "No comment added."}</p>
    {feedback.improvements ? <p className="mt-3 text-sm text-warning">Improve: {feedback.improvements}</p> : null}
  </article>
);

FeedbackCard.propTypes = {
  feedback: PropTypes.object.isRequired,
  anonymous: PropTypes.bool,
};

export default FeedbackCard;
