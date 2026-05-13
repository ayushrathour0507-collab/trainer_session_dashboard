/**
 * Purpose: Displays a compact clickable topic tag chip for filtering and metadata.
 */
import PropTypes from "prop-types";

const TagChip = ({ tag, onClick }) => (
  <button type="button" className="rounded-pill border border-border bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent" onClick={onClick}>
    {tag}
  </button>
);

TagChip.propTypes = {
  tag: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default TagChip;
