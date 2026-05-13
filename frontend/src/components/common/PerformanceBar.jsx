// Purpose: Shows score magnitude as a stable horizontal progress bar.
import PropTypes from "prop-types";

const PerformanceBar = ({ score = 0, max = 5, label }) => {
  const percent = Math.min(100, Math.max(0, (Number(score || 0) / max) * 100));
  const color = percent >= 90 ? "bg-success" : percent >= 70 ? "bg-accent" : percent >= 50 ? "bg-warning" : "bg-danger";

  return (
    <div className="w-full">
      {label ? (
        <div className="mb-1 flex items-center justify-between text-xs font-bold text-light-subtext dark:text-dark-subtext">
          <span>{label}</span>
          <span>{Number(score || 0).toFixed(2)}</span>
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-light-secondary dark:bg-dark-secondary">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

PerformanceBar.propTypes = {
  score: PropTypes.number,
  max: PropTypes.number,
  label: PropTypes.string,
};

export default PerformanceBar;
