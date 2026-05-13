// Purpose: Renders the complete ranked trainer leaderboard with trend sparks, score bars, verdicts, and profile actions.
import PropTypes from "prop-types";
import { Trophy } from "lucide-react";
import PerformanceBar from "../common/PerformanceBar.jsx";
import VerdictBadge from "../session/VerdictBadge.jsx";
import PerformanceSpark from "./PerformanceSpark.jsx";

const LeaderboardTable = ({ items = [] }) => (
  <div className="nexus-card overflow-hidden">
    <div className="border-b border-border p-4">
      <p className="label-tag text-accent">Full Rankings</p>
      <h2 className="text-xl font-semibold">Trainer Leaderboard</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full text-left">
        <thead>
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Trainer</th>
            <th className="px-4 py-3">Sessions</th>
            <th className="px-4 py-3">Avg Score</th>
            <th className="px-4 py-3">Best</th>
            <th className="px-4 py-3">Worst</th>
            <th className="px-4 py-3">Trend</th>
            <th className="px-4 py-3">Verdict</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={`${item.rank}-${item.trainer}`} className="text-sm font-bold transition hover:bg-accent/10">
              <td className="px-4 py-3 font-mono text-accent">
                <span className="inline-flex items-center gap-2">
                  {item.rank <= 3 ? <Trophy className="h-4 w-4" /> : null}
                  #{item.rank}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-accent/20 font-black text-accent">
                    {String(item.trainer || "BB").split(" ").map((part) => part[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-black text-textPrimary">{item.trainer}</p>
                    <p className="text-xs text-textSecondary">{item.rank === 1 ? "Best Overall" : item.sessions > 1 ? "Consistent Contributor" : "Session Champion"}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-textSecondary">
                <div className="flex items-center gap-2">
                  <span>{item.sessions}</span>
                  <span className="flex gap-1">{Array.from({ length: Math.min(item.sessions || 0, 5) }).map((_, index) => <i key={index} className="h-2 w-2 rounded-full bg-success" />)}</span>
                </div>
              </td>
              <td className="min-w-[170px] px-4 py-3">
                <p className="mb-1.5 font-mono text-base font-black text-textPrimary">{Number(item.focusScore || item.avgScore || 0).toFixed(2)}</p>
                <PerformanceBar score={Number(item.focusScore || item.avgScore || 0)} />
              </td>
              <td className="px-4 py-3 font-mono text-success">{Number(item.bestScore || 0).toFixed(2)}</td>
              <td className="px-4 py-3 font-mono text-danger">{Number(item.worstScore || item.bestScore || 0).toFixed(2)}</td>
              <td className="px-4 py-3">
                <PerformanceSpark values={item.trend || item.scores || [item.avgScore || 0]} />
              </td>
              <td className="px-4 py-3">
                <VerdictBadge verdict={item.verdict} score={item.focusScore || item.avgScore} />
              </td>
            </tr>
          ))}
          {!items.length ? (
            <tr>
              <td colSpan="8" className="px-5 py-10 text-center text-sm font-bold text-textSecondary">
                No leaderboard records yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  </div>
);

LeaderboardTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    rank: PropTypes.number,
    trainer: PropTypes.string,
    sessions: PropTypes.number,
    avgScore: PropTypes.number,
    focusScore: PropTypes.number,
    bestScore: PropTypes.number,
    worstScore: PropTypes.number,
    trend: PropTypes.array,
    verdict: PropTypes.string,
  })),
};

export default LeaderboardTable;
