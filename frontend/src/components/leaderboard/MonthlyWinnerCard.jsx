/**
 * Purpose: Displays a timeline-style monthly winner card with badge, score, and short winning reason.
 */
import PropTypes from "prop-types";
import ScoreRing from "../evaluation/ScoreRing.jsx";

const initialsFor = (name = "TBD") => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "BB";

const MonthlyWinnerCard = ({ winner }) => {
  const score = Number(winner.score || 0);
  const hasWinner = score > 0 && winner.winner !== "TBD";

  return (
    <article className="nexus-card min-w-[240px] p-4">
      <p className="font-display text-2xl font-black text-accent">{winner.month}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/20 font-black text-accent">
            {initialsFor(winner.winner)}
          </div>
          <div>
            <h3 className="font-semibold text-textPrimary">{winner.winner || "TBD"}</h3>
            <p className="text-xs text-textSecondary">{winner.badge || "Awaiting sessions"}</p>
          </div>
        </div>
        <ScoreRing score={score} size={70} />
      </div>
      <p className="mt-3 text-sm text-textSecondary">
        {hasWinner ? `Won with a ${score.toFixed(2)} score and the strongest completed session for ${winner.month}.` : "Winner will appear after the month's sessions are evaluated and published."}
      </p>
    </article>
  );
};

MonthlyWinnerCard.propTypes = {
  winner: PropTypes.shape({
    month: PropTypes.string,
    winner: PropTypes.string,
    score: PropTypes.number,
    badge: PropTypes.string,
  }).isRequired,
};

export default MonthlyWinnerCard;
