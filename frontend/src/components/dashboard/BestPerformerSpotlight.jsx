/**
 * Purpose: Compact spotlight card for the current top-ranked trainer with avatar, average score, verdict, and score ring.
 */
import PropTypes from "prop-types";
import ScoreRing from "../evaluation/ScoreRing.jsx";

const initialsFor = (name = "TBD") => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "BB";

const BestPerformerSpotlight = ({ trainer }) => {
  const score = Number(trainer.avgScore || trainer.focusScore || 0);
  return (
    <div className="mt-5 grid place-items-center gap-4 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-accent/20 text-xl font-black text-accent">
        {trainer.avatar ? <img src={trainer.avatar} alt="" className="h-full w-full rounded-full object-cover" /> : initialsFor(trainer.trainer)}
      </div>
      <div>
        <h3 className="text-xl font-black text-textPrimary">{trainer.trainer}</h3>
        <p className="text-sm font-bold text-textSecondary">Rank #{trainer.rank} - {trainer.sessions} session{trainer.sessions === 1 ? "" : "s"}</p>
      </div>
      <ScoreRing score={score} />
    </div>
  );
};

BestPerformerSpotlight.propTypes = {
  trainer: PropTypes.shape({
    trainer: PropTypes.string,
    rank: PropTypes.number,
    sessions: PropTypes.number,
    avgScore: PropTypes.number,
    focusScore: PropTypes.number,
    avatar: PropTypes.string,
  }).isRequired,
};

export default BestPerformerSpotlight;
