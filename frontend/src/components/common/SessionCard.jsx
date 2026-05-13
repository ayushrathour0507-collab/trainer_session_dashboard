// Purpose: Displays a compact session card for dashboards and trainer-related grids.
import { CalendarDays, Users } from "lucide-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatLongDate } from "../../utils/dateUtils.js";
import PresenterChip from "./PresenterChip.jsx";
import RatingStars from "./RatingStars.jsx";
import StatusBadge from "./StatusBadge.jsx";

const SessionCard = ({ session }) => (
  <Link
    to={`/sessions/${session._id}`}
    className="nexus-card block p-3 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-glow"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-mono text-xs font-bold text-light-subtext dark:text-dark-subtext">Session #{session.sessionNumber}</p>
        <h3 className="mt-1 line-clamp-2 text-base font-black text-light-text dark:text-dark-text">{session.topic || "TBD"}</h3>
      </div>
      <StatusBadge status={session.status} />
    </div>
    <div className="mt-2">
      <PresenterChip name={session.presenterName || "TBD"} avatar={session.presenter?.avatar} />
    </div>
    <div className="mt-2 grid gap-1 text-xs font-bold text-light-subtext dark:text-dark-subtext">
      <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-accent" />{formatLongDate(session.date)} - {session.day}</span>
      <span className="flex items-center gap-2"><Users className="h-4 w-4 text-accent" />{session.attendees || 0} attendees</span>
    </div>
    <div className="mt-2 flex items-center justify-between border-t border-light-border pt-2 dark:border-dark-border">
      <RatingStars rating={Number(session.rating || 0)} />
      <span className="text-xs font-black text-light-subtext dark:text-dark-subtext">{session.feedbackCount || 0} feedback</span>
    </div>
  </Link>
);

SessionCard.propTypes = {
  session: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    sessionNumber: PropTypes.number,
    topic: PropTypes.string,
    status: PropTypes.string,
    presenterName: PropTypes.string,
    presenter: PropTypes.shape({ avatar: PropTypes.string }),
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    day: PropTypes.string,
    attendees: PropTypes.number,
    rating: PropTypes.number,
    feedbackCount: PropTypes.number,
  }).isRequired,
};

export default SessionCard;
