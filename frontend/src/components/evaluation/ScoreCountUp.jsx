/**
 * Purpose: Animates a score number from 0 to target using requestAnimationFrame easing.
 */
import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const easeOut = (value) => 1 - ((1 - value) ** 3);

const ScoreCountUp = ({ value, duration = 1500, decimals = 2, className = "" }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const started = performance.now();
    const target = Number(value || 0);
    const tick = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      setDisplay(target * easeOut(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, value]);

  return <span className={className}>{display.toFixed(decimals)}</span>;
};

ScoreCountUp.propTypes = {
  value: PropTypes.number.isRequired,
  duration: PropTypes.number,
  decimals: PropTypes.number,
  className: PropTypes.string,
};

export default ScoreCountUp;
