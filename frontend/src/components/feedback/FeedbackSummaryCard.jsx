// Purpose: Summarizes attendee ratings, comments, improvements, and requested future topics.
import PropTypes from "prop-types";
import RatingStars from "../common/RatingStars.jsx";

const FeedbackSummaryCard = ({ summary }) => (
  <div className="nexus-card p-4">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Feedback Summary</p>
        <h2 className="mt-1 text-xl font-black text-light-text dark:text-dark-text">{summary?.count || 0} responses</h2>
      </div>
      <RatingStars rating={Number(summary?.averageRating || 0)} />
    </div>
    <div className="mt-3 grid gap-3 md:grid-cols-3">
      {[
        ["Comments", summary?.comments],
        ["Improvements", summary?.improvements],
        ["Future Topics", summary?.futureSuggestions],
      ].map(([title, values]) => (
        <div key={title} className="rounded-card border border-light-border p-3 dark:border-dark-border">
          <h3 className="text-sm font-black text-light-text dark:text-dark-text">{title}</h3>
          <ul className="mt-2 space-y-1.5 text-sm font-bold text-light-subtext dark:text-dark-subtext">
            {(values || []).slice(0, 4).map((value) => <li key={value}>{value}</li>)}
            {!(values || []).length ? <li>No entries yet.</li> : null}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

FeedbackSummaryCard.propTypes = {
  summary: PropTypes.shape({
    count: PropTypes.number,
    averageRating: PropTypes.number,
    comments: PropTypes.array,
    improvements: PropTypes.array,
    futureSuggestions: PropTypes.array,
  }),
};

export default FeedbackSummaryCard;
