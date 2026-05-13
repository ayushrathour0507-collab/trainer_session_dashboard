/**
 * Purpose: Shows admin smart alerts for sessions missing presenter, evaluation, poster, or meeting-link data.
 */
import PropTypes from "prop-types";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const AlertPanel = ({ sessions = [] }) => {
  const alerts = sessions.flatMap((session) => {
    const id = session._id || session.id;
    const output = [];
    if (!session.presenterName || session.presenterName === "TBD") output.push({ key: `${id}-presenter`, text: `Session #${session.sessionNumber} - No presenter confirmed yet`, href: `/admin/sessions/${id}/edit`, action: "Assign Presenter" });
    if (session.status === "Completed" && !session.evaluation) output.push({ key: `${id}-evaluation`, text: `Session #${session.sessionNumber} - Evaluation not submitted`, href: `/admin/evaluate/${id}`, action: "Add Evaluation" });
    if (!session.posterUrl) output.push({ key: `${id}-poster`, text: `Session #${session.sessionNumber} - Poster not uploaded`, href: `/admin/poster/${id}`, action: "Generate Poster" });
    if (!session.meetingLink) output.push({ key: `${id}-link`, text: `Session #${session.sessionNumber} - Meeting link missing`, href: `/admin/sessions/${id}/edit`, action: "Add Link" });
    return output;
  }).slice(0, 6);

  return (
    <section className="nexus-card p-4">
      <p className="label-tag text-accent">Smart Alerts</p>
      <h2 className="mb-4 text-2xl font-semibold">Sessions Needing Action</h2>
      <div className="grid gap-3">
        {alerts.map((alert) => (
          <Link key={alert.key} to={alert.href} className="flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm font-bold text-warning">
            <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{alert.text}</span>
            <span>{alert.action}</span>
          </Link>
        ))}
        {!alerts.length ? <p className="text-sm font-bold text-textSecondary">Everything is up to date.</p> : null}
      </div>
    </section>
  );
};

AlertPanel.propTypes = {
  sessions: PropTypes.array,
};

export default AlertPanel;
