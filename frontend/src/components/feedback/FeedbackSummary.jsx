/**
 * Purpose: Compact feedback aggregate summary with average rating, response count, themes, and future topics.
 */
import PropTypes from "prop-types";
import FeedbackSummaryCard from "./FeedbackSummaryCard.jsx";

const FeedbackSummary = ({ feedback = [] }) => {
  const summary = {
    count: feedback.length,
    averageRating: feedback.length ? feedback.reduce((sum, item) => sum + Number(item.attendeeRating || 0), 0) / feedback.length : 0,
    comments: feedback.map((item) => item.keyTakeaways).filter(Boolean),
    improvements: feedback.map((item) => item.improvements).filter(Boolean),
    futureSuggestions: feedback.map((item) => item.futureSuggestions).filter(Boolean),
  };

  return <FeedbackSummaryCard summary={summary} />;
};

FeedbackSummary.propTypes = {
  feedback: PropTypes.array,
};

export default FeedbackSummary;
