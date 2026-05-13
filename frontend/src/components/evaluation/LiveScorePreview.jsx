/**
 * Purpose: Real-time debounced evaluation score preview with formula breakdown, radar chart, and animated verdict.
 */
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { calculateEvaluationScore } from "../../utils/scoring.js";
import MetricSpiderChart from "./MetricSpiderChart.jsx";
import ScoreCountUp from "./ScoreCountUp.jsx";

const LiveScorePreview = ({ scores, checks }) => {
  const [preview, setPreview] = useState(() => calculateEvaluationScore(scores, checks));

  useEffect(() => {
    const timer = window.setTimeout(() => setPreview(calculateEvaluationScore(scores, checks)), 100);
    return () => window.clearTimeout(timer);
  }, [scores, checks]);

  return (
    <div className="nexus-card grid gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-tag">Live Score Preview</p>
          <h2 className="text-xl font-semibold" style={{ color: preview.verdict.color }}>{preview.verdict.icon} {preview.verdict.label}</h2>
        </div>
        <div className="text-right">
          <ScoreCountUp value={preview.overallScore} className="font-mono text-3xl font-black" />
          <p className="text-xs font-bold text-textSecondary">Overall / 5</p>
        </div>
      </div>
      <MetricSpiderChart scores={scores} />
      <div className="rounded-lg border border-border bg-surface/50 p-3 text-sm text-textSecondary">
        Overall Score = ({preview.totalScore.toFixed(2)} x 60%) + ({preview.organiserScore.toFixed(2)} x 40%) = <strong className="text-accent">{preview.overallScore.toFixed(2)}</strong>
      </div>
    </div>
  );
};

LiveScorePreview.propTypes = {
  scores: PropTypes.object.isRequired,
  checks: PropTypes.object.isRequired,
};

export default LiveScorePreview;
