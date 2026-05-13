/**
 * Purpose: Recharts RadarChart for seven evaluation metrics with Nexus accent grid/fill and custom tooltip.
 */
import PropTypes from "prop-types";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { METRICS, getVerdict, normaliseScores } from "../../utils/scoring.js";

const TooltipContent = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const verdict = getVerdict(item.score);
  return (
    <div className="rounded-md border border-border bg-surface p-3 shadow-high">
      <p className="font-bold">{item.metric}</p>
      <p className="font-mono text-accent">{item.score.toFixed(2)} · {verdict.label}</p>
    </div>
  );
};

const MetricSpiderChart = ({ scores = {}, height = 320 }) => {
  const normalised = normaliseScores(scores);
  const data = METRICS.map((metric) => ({ metric: `${metric.icon} ${metric.label}`, score: normalised[metric.key] || 0, fullMark: 5 }));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(201,168,76,0.2)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} stroke="rgba(201,168,76,0.18)" />
          <Radar name="Score" dataKey="score" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} strokeWidth={2} />
          <Tooltip content={<TooltipContent />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

TooltipContent.propTypes = { active: PropTypes.bool, payload: PropTypes.array };
MetricSpiderChart.propTypes = { scores: PropTypes.object, height: PropTypes.number };

export default MetricSpiderChart;
