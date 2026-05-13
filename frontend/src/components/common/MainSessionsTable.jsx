// Purpose: Displays a clear mobile-scrollable session management table with status, score, and common actions.
import { Edit, FileImage, Megaphone, Star, Trash2 } from "lucide-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import PerformanceBar from "./PerformanceBar.jsx";
import StatusBadge from "./StatusBadge.jsx";

const statusOptions = ["Pending", "Confirmed", "Completed", "Postponed", "Cancelled"];
const approvalActions = [
  ["Approved", "Approve"],
  ["Rejected", "Reject"],
  ["Changes Requested", "Request Changes"],
];

const statusSelectStyles = {
  Completed: "border-success/30 text-success",
  Pending: "border-warning/30 text-warning",
  Confirmed: "border-accent/30 text-accent",
  Postponed: "border-muted/30 text-light-subtext dark:text-dark-subtext",
  Cancelled: "border-danger/30 text-danger",
};

const formatDate = (dateValue) => {
  if (!dateValue) return "TBD";
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const MainSessionsTable = ({
  sessions = [],
  title = "Sessions",
  subtitle = "KT session schedule and evaluation status.",
  showAdminActions = false,
  onDelete,
  onStatusChange,
  onApprovalChange,
}) => (
  <div className="nexus-card overflow-hidden">
    <div className="border-b border-light-border p-3.5 dark:border-dark-border">
      <h2 className="text-lg font-black text-light-text dark:text-dark-text">{title}</h2>
      <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">{subtitle}</p>
    </div>
    <div className="overflow-hidden">
      <table className="w-full table-fixed text-left">
        <colgroup>
          <col className={showAdminActions ? "w-[30%]" : "w-[34%]"} />
          <col className={showAdminActions ? "w-[11%]" : "w-[13%]"} />
          <col className={showAdminActions ? "w-[13%]" : "w-[15%]"} />
          <col className={showAdminActions ? "w-[12%]" : "w-[13%]"} />
          <col className={showAdminActions ? "w-[12%]" : "w-[13%]"} />
          <col className={showAdminActions ? "w-[11%]" : "w-[12%]"} />
          {showAdminActions ? <col className="w-[11%]" /> : null}
        </colgroup>
        <thead className="text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">
          <tr>
            <th className="px-3 py-2.5">Session</th>
            <th className="px-2.5 py-2.5">Date</th>
            <th className="px-2.5 py-2.5">Presenter</th>
            <th className="px-2.5 py-2.5">Status</th>
            <th className="px-2.5 py-2.5">Approval</th>
            <th className="px-2.5 py-2.5">Score</th>
            {showAdminActions ? <th className="px-2.5 py-2.5">Actions</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-light-border dark:divide-dark-border">
          {sessions.map((session) => {
            const score = Number(session.overallScore || session.rating || 0);
            return (
              <tr key={session._id} className="text-sm font-bold">
                <td className="px-3 py-2.5 align-top">
                  <Link to={`/sessions/${session._id}`} className="block min-w-0 hover:text-accent">
                    <span className="font-mono text-xs text-light-subtext dark:text-dark-subtext">#{session.sessionNumber}</span>
                    <span className="block truncate font-black text-light-text dark:text-dark-text" title={session.topic || "TBD"}>{session.topic || "TBD"}</span>
                  </Link>
                </td>
                <td className="truncate px-2.5 py-2.5 align-top text-light-subtext dark:text-dark-subtext">{formatDate(session.date)}</td>
                <td className="truncate px-2.5 py-2.5 align-top text-light-subtext dark:text-dark-subtext" title={session.presenter?.name || session.presenterName || "TBD"}>{session.presenter?.name || session.presenterName || "TBD"}</td>
                <td className="px-2.5 py-2.5 align-top">
                  {showAdminActions && onStatusChange ? (
                    <select
                      className={`admin-status-select h-9 w-full rounded-full border px-3 pr-7 text-xs font-extrabold outline-none ${statusSelectStyles[session.status || "Pending"] || statusSelectStyles.Pending}`}
                      value={session.status || "Pending"}
                      onChange={(event) => onStatusChange(session._id, event.target.value)}
                    >
                      {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  ) : (
                    <StatusBadge status={session.status} />
                  )}
                </td>
                <td className="px-2.5 py-2.5 align-top">
                  <div className="flex flex-col items-start gap-1.5">
                    <StatusBadge status={session.approvalStatus || "Approved"} />
                    {session.adminRemarks ? <p className="line-clamp-2 text-xs font-bold text-light-subtext dark:text-dark-subtext">{session.adminRemarks}</p> : null}
                    {showAdminActions && onApprovalChange && ["Pending Approval", "Changes Requested"].includes(session.approvalStatus) ? (
                      <div className="flex flex-wrap gap-1">
                        {approvalActions.map(([approvalStatus, label]) => (
                          <button
                            key={approvalStatus}
                            type="button"
                            className="inline-flex h-7 items-center rounded-full border border-light-border px-2.5 text-[11px] font-black text-light-subtext transition hover:border-accent/40 hover:bg-accent/10 hover:text-accent dark:border-dark-border dark:text-dark-subtext"
                            onClick={() => onApprovalChange(session._id, approvalStatus)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </td>
                <td className="px-2.5 py-2.5 align-top">
                  {score ? (
                    <div>
                      <div className="mb-1 font-mono text-xs font-black text-light-text dark:text-dark-text">{score.toFixed(2)} / 5</div>
                      <PerformanceBar label="" score={score} />
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-light-subtext dark:text-dark-subtext">Not evaluated</span>
                  )}
                </td>
                {showAdminActions ? (
                  <td className="px-2.5 py-2.5 align-top">
                    <div className="flex flex-wrap items-center gap-1">
                      <Link title="Edit" to={`/admin/sessions/${session._id}/edit`} className="ghost-button h-8 w-8 p-0"><Edit className="h-4 w-4" /></Link>
                      <Link title="Evaluate" to={`/admin/evaluate/${session._id}`} className="ghost-button h-8 w-8 p-0"><Star className="h-4 w-4" /></Link>
                      <Link title="Poster" to={`/admin/poster/${session._id}`} className="ghost-button h-8 w-8 p-0"><FileImage className="h-4 w-4" /></Link>
                      <Link title="Announcement" to={`/admin/announce/${session._id}`} className="ghost-button h-8 w-8 p-0"><Megaphone className="h-4 w-4" /></Link>
                      {onDelete ? (
                        <button title="Delete" type="button" className="ghost-button h-8 w-8 p-0 text-danger" onClick={() => onDelete(session._id)}><Trash2 className="h-4 w-4" /></button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            );
          })}
          {!sessions.length ? (
            <tr>
              <td colSpan={showAdminActions ? 7 : 6} className="px-5 py-10 text-center text-sm font-bold text-light-subtext dark:text-dark-subtext">No sessions available.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  </div>
);

MainSessionsTable.propTypes = {
  sessions: PropTypes.array,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  showAdminActions: PropTypes.bool,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onApprovalChange: PropTypes.func,
};

export default MainSessionsTable;
