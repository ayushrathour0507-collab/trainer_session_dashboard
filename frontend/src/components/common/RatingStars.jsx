// Purpose: Renders a five-star visual score using accessible text.
import { Star } from "lucide-react";
import PropTypes from "prop-types";

const RatingStars = ({ rating = 0, showValue = true }) => {
  const rounded = Math.round(Number(rating || 0));
  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rounded ? "fill-warning text-warning" : "text-muted/40"}`}
          aria-hidden="true"
        />
      ))}
      {showValue ? <span className="ml-1 text-xs font-extrabold text-light-subtext dark:text-dark-subtext">{Number(rating || 0).toFixed(1)}</span> : null}
    </div>
  );
};

RatingStars.propTypes = {
  rating: PropTypes.number,
  showValue: PropTypes.bool,
};

export default RatingStars;
