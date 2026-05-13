// Purpose: Provides a 1-5 metric slider with live score feedback.
import PropTypes from "prop-types";

const MetricSlider = ({ label, value, onChange }) => {
  const number = Number(value || 1);
  const tone = number >= 4 ? "text-success" : number >= 3 ? "text-warning" : "text-danger";

  return (
    <label className="block rounded-card border border-light-border bg-light-surface p-4 dark:border-dark-border dark:bg-dark-surface">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-black text-light-text dark:text-dark-text">{label}</span>
        <span className={`font-mono text-sm font-black ${tone}`}>{number}/5</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={number}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-light-secondary accent-accent dark:bg-dark-secondary"
      />
    </label>
  );
};

MetricSlider.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MetricSlider;
