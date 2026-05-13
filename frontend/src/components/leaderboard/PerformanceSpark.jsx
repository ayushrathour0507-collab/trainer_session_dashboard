/**
 * Purpose: Inline SVG sparkline for trainer score trend.
 */
import PropTypes from "prop-types";

const PerformanceSpark = ({ values = [] }) => {
  const clean = values.length ? values : [0, 0, 0];
  const max = Math.max(...clean, 5);
  const points = clean.map((value, index) => {
    const x = (index / Math.max(clean.length - 1, 1)) * 80;
    const y = 34 - (Number(value || 0) / max) * 30;
    return [x, y];
  });
  const path = points.map(([x, y], index) => `${index ? "L" : "M"} ${x} ${y}`).join(" ");
  const trend = clean.at(-1) - clean[0];
  const color = trend > 0.05 ? "var(--success)" : trend < -0.05 ? "var(--danger)" : "var(--muted)";
  return (
    <svg width="88" height="40" viewBox="0 0 88 40" aria-label="Score trend">
      <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill={color} />)}
    </svg>
  );
};

PerformanceSpark.propTypes = {
  values: PropTypes.array,
};

export default PerformanceSpark;
