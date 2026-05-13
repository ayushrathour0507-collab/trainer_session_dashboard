/**
 * Purpose: Five-point metric slider with live colour and emoji reaction for evaluation entry.
 */
import PropTypes from "prop-types";
import { getVerdict } from "../../utils/scoring.js";

const reactions = {
  1: "\u{1F61E}",
  2: "\u{1F610}",
  3: "\u{1F642}",
  4: "\u{1F60A}",
  5: "\u{1F929}",
};

const MetricSlider = ({ metric, value, onChange }) => {
  const verdict = getVerdict(value);
  return (
    <label className="nexus-card grid gap-2.5 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">{metric.icon} {metric.label}</span>
        <span className="font-mono text-xl font-black" style={{ color: verdict.color }}>{value} {reactions[value]}</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ accentColor: verdict.color }}
      />
    </label>
  );
};

MetricSlider.propTypes = {
  metric: PropTypes.object.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MetricSlider;
