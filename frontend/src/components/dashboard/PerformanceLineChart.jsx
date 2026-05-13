/**
 * Purpose: Recharts line chart for programme score trend by session or month.
 */
import PropTypes from "prop-types";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const PerformanceLineChart = ({ data = [] }) => (
  <section className="nexus-card h-[280px] p-4">
    <p className="label-tag text-accent">Performance</p>
    <h2 className="mb-4 text-2xl font-semibold">Score Trend</h2>
    <ResponsiveContainer width="100%" height="78%">
      <LineChart data={data}>
        <XAxis dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
        <YAxis domain={[0, 5]} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
        <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
        <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </section>
);

PerformanceLineChart.propTypes = {
  data: PropTypes.array,
};

export default PerformanceLineChart;
