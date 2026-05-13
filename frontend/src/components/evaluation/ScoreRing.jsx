/**
 * Purpose: Circular animated progress ring showing a score out of 5 with verdict label.
 */
import PropTypes from "prop-types";
import { getVerdict } from "../../utils/scoring.js";
import ScoreCountUp from "./ScoreCountUp.jsx";

const ScoreRing = ({ score = 0, size = 132 }) => {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 5) / 5) * circumference;
  const verdict = getVerdict(score);

  return (
    <div className="inline-grid place-items-center gap-2 text-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ "--ring-size": circumference }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={verdict.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="animate-[ringFill_1s_ease-out]"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fill="var(--text-primary)" fontFamily="var(--font-mono)" fontSize="20" fontWeight="800">
          {Number(score || 0).toFixed(1)}
        </text>
      </svg>
      <span className="text-xs font-bold text-textSecondary">{verdict.label}</span>
    </div>
  );
};

ScoreRing.propTypes = {
  score: PropTypes.number,
  size: PropTypes.number,
};

export default ScoreRing;
