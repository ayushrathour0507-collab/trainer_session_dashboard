/**
 * Purpose: Premium session card for public, admin, and trainer grids with tags, score, status, and hover glow.
 */
import PropTypes from "prop-types";
import { ArrowRight, CalendarDays, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import RatingStars from "../common/RatingStars.jsx";
import StatusBadge from "./StatusBadge.jsx";
import TagChip from "./TagChip.jsx";

const initialsFor = (session) => session.presenterInitials || session.assigneeCode || (session.presenterName || "TBD").split(" ").map((part) => part[0]).join("").slice(0, 3);

const SessionCard = ({ session }) => {
  const score = Number(session.overallScore || session.rating || 0);
  const tags = session.tags?.length ? session.tags : session.posterTopics || [];
  const date = session.date ? new Date(session.date) : null;

  return (
    <Link to={`/sessions/${session._id || session.id}`} className="nexus-card group block p-3 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-xs font-black uppercase tracking-wide text-textSecondary">Session #{session.sessionNumber}</span>
        <StatusBadge status={session.status} />
      </div>
      <div className="mt-2.5 flex items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/10 text-sm font-black text-accent">{initialsFor(session)}</div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{session.presenterName || "TBD"}</p>
          <p className="truncate text-xs text-textSecondary">{date ? format(date, "dd MMM yyyy") : "TBD"} - {session.day}</p>
        </div>
      </div>
      <h3 className="mt-2 line-clamp-2 text-base font-black">{session.topic || "TBD"}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tags.slice(0, 3).map((tag) => <TagChip key={tag} tag={tag} />)}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-textSecondary">
        <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-accent" />{session.startTime || "14:00"}</span>
        <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-accent" />{session.attendees || 0}</span>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
        <div className="flex items-center gap-2">
          <RatingStars rating={score} showValue={false} />
          <span className="font-mono text-xs font-bold text-textSecondary">{score ? score.toFixed(1) : "TBD"}</span>
        </div>
        <ArrowRight className="h-5 w-5 text-accent transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
};

SessionCard.propTypes = {
  session: PropTypes.object.isRequired,
};

export default SessionCard;
