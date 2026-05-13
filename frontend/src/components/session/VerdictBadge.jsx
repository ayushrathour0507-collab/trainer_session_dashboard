/**
 * Purpose: Renders verdict metadata with grade, icon, and score-coloured badge styling.
 */
import PropTypes from "prop-types";
import { getVerdict } from "../../utils/scoring.js";

const VerdictBadge = ({ score, verdict }) => {
  const meta = getVerdict(score);
  const label = verdict || meta.label;
  const className = label === "Excellent" ? "badge-excellent" : label === "Good" ? "badge-good" : label === "Average" ? "badge-average" : "badge-needs";
  return <span className={`status-badge ${className}`}>{meta.icon} {label} · {meta.grade}</span>;
};

VerdictBadge.propTypes = {
  score: PropTypes.number,
  verdict: PropTypes.string,
};

export default VerdictBadge;
