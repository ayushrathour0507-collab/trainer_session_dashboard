// Purpose: Displays top three leaderboard trainers as a compact podium.
import { Award } from "lucide-react";
import PropTypes from "prop-types";

const podiumStyles = [
  "order-2 min-h-[170px] bg-warning/10 text-warning",
  "order-1 min-h-[140px] bg-muted/15 text-light-subtext dark:text-dark-subtext",
  "order-3 min-h-[120px] bg-info/10 text-info",
];

const MonthlyWinnerPodium = ({ topThree = [], winners = [] }) => (
  <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
    <div className="nexus-card p-4">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-black text-light-text dark:text-dark-text">Top 3 Podium</h2>
        <Award className="h-5 w-5 text-accent" />
      </div>
      <div className="grid grid-cols-3 items-end gap-3">
        {topThree.map((item, index) => (
          <div key={item.trainer} className={`flex flex-col justify-end rounded-card border border-light-border p-4 text-center dark:border-dark-border ${podiumStyles[index] || podiumStyles[2]}`}>
            <p className="text-xs font-black uppercase">Rank {item.rank}</p>
            <p className="mt-2 text-sm font-black text-light-text dark:text-dark-text">{item.trainer}</p>
            <p className="font-mono text-xl font-black">{Number(item.avgScore || 0).toFixed(2)}</p>
          </div>
        ))}
        {!topThree.length ? <p className="col-span-3 text-sm font-bold text-light-subtext dark:text-dark-subtext">No evaluated sessions yet.</p> : null}
      </div>
    </div>
    <div className="nexus-card p-4">
      <h2 className="mb-4 text-lg font-black text-light-text dark:text-dark-text">Monthly Winners</h2>
      <div className="space-y-3">
        {winners.map((winner) => (
          <div key={winner.month} className="flex items-center justify-between rounded-button border border-light-border px-3 py-2 dark:border-dark-border">
            <div>
              <p className="text-sm font-black">{winner.month}</p>
              <p className="text-xs font-bold text-light-subtext dark:text-dark-subtext">{winner.winner}</p>
            </div>
            <span className="font-mono text-sm font-black text-accent">{Number(winner.score || 0).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

MonthlyWinnerPodium.propTypes = {
  topThree: PropTypes.arrayOf(PropTypes.shape({
    rank: PropTypes.number,
    trainer: PropTypes.string,
    avgScore: PropTypes.number,
  })),
  winners: PropTypes.arrayOf(PropTypes.shape({
    month: PropTypes.string,
    winner: PropTypes.string,
    score: PropTypes.number,
  })),
};

export default MonthlyWinnerPodium;
