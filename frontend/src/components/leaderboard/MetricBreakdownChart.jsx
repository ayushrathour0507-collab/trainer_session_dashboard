// Purpose: Visualizes average score by evaluation metric with Recharts.
import PropTypes from "prop-types";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const MetricBreakdownChart = ({ data = [] }) => (
  <div className="nexus-card h-[280px] p-4">
    <h2 className="mb-3 text-lg font-black text-light-text dark:text-dark-text">Metric Breakdown</h2>
    <ResponsiveContainer width="100%" height="85%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} angle={-20} textAnchor="end" interval={0} />
        <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
        <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
        <Bar dataKey="score" fill="var(--accent)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

MetricBreakdownChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    metric: PropTypes.string,
    score: PropTypes.number,
  })),
};

export default MetricBreakdownChart;
