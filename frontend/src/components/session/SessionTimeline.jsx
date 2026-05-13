/**
 * Purpose: Compact vertical March-July programme timeline with status-coloured session nodes.
 */
import PropTypes from "prop-types";
import { isSameDay } from "date-fns";
import { Link } from "react-router-dom";

const nodeClass = (session) => {
  if (session.status === "Completed") return "bg-success border-success";
  if (session.status === "Postponed" || session.status === "Cancelled") return "bg-danger border-danger";
  if (session.date && isSameDay(new Date(session.date), new Date())) return "bg-accent border-accent animate-[todayPulse_1.8s_infinite]";
  return "bg-surface border-border";
};

const formatDate = (dateValue) => {
  if (!dateValue) return "TBD";
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const SessionTimeline = ({ sessions }) => (
  <div className="relative max-h-[360px] overflow-y-auto pr-1">
    <div className="absolute bottom-4 left-[9px] top-4 w-px bg-border" />
    <div className="relative grid gap-2">
      {sessions.map((session) => (
        <Link
          key={session._id || session.id}
          to={`/sessions/${session._id || session.id}`}
          className="group grid grid-cols-[20px_1fr] gap-2 rounded-md p-1 transition hover:bg-accent/10"
        >
          <span className="relative flex justify-center pt-2">
            <span className={`relative z-10 h-4 w-4 rounded-full border-2 shadow-card ${nodeClass(session)}`} />
          </span>
          <span className="min-w-0 rounded-md border border-border bg-surface/45 px-3 py-2 transition group-hover:border-accent/40">
            <span className="flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] font-black text-accent">Session #{session.sessionNumber}</span>
              <span className="shrink-0 font-mono text-[11px] text-textSecondary">{formatDate(session.date)}</span>
            </span>
            <span className="mt-0.5 block truncate text-sm font-black text-textPrimary">{session.topic || "TBD"}</span>
            <span className="mt-0.5 block truncate text-xs font-bold text-textSecondary">
              {session.presenterName || "TBD"} - {session.status || "Pending"} - Score {session.overallScore || session.rating || "TBD"}
            </span>
          </span>
        </Link>
      ))}
    </div>
  </div>
);

SessionTimeline.propTypes = {
  sessions: PropTypes.array.isRequired,
};

export default SessionTimeline;
