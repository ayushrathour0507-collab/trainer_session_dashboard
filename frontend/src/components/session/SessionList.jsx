/**
 * Purpose: Compact sortable session table with admin-aware actions for list view.
 */
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import RatingStars from "../common/RatingStars.jsx";
import StatusBadge from "./StatusBadge.jsx";
import VerdictBadge from "./VerdictBadge.jsx";
import TagChip from "./TagChip.jsx";

const SessionList = ({ sessions, isAdmin = false }) => (
  <div className="table-shell">
    <table className="bb-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Presenter</th>
          <th>Topic</th>
          <th>Tags</th>
          <th>Status</th>
          <th>Score</th>
          <th>Verdict</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((session) => {
          const score = Number(session.overallScore || session.rating || 0);
          return (
            <tr key={session._id}>
              <td className="font-mono font-bold">{session.sessionNumber}</td>
              <td>{String(session.date).slice(0, 10)}</td>
              <td>{session.presenterName}</td>
              <td className="font-semibold">{session.topic}</td>
              <td><div className="flex flex-wrap gap-1">{(session.tags || []).slice(0, 2).map((tag) => <TagChip key={tag} tag={tag} />)}</div></td>
              <td><StatusBadge status={session.status} /></td>
              <td><RatingStars rating={score} /></td>
              <td><VerdictBadge score={score} verdict={session.verdict} /></td>
              <td>
                <div className="flex gap-2">
                  <Link className="secondary-button min-h-8 px-3 text-xs" to={`/sessions/${session._id}`}>View</Link>
                  {isAdmin ? <Link className="secondary-button min-h-8 px-3 text-xs" to={`/admin/evaluate/${session._id}`}>Evaluate</Link> : null}
                  {isAdmin ? <Link className="secondary-button min-h-8 px-3 text-xs" to={`/admin/poster/${session._id}`}>Poster</Link> : null}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

SessionList.propTypes = {
  sessions: PropTypes.array.isRequired,
  isAdmin: PropTypes.bool,
};

export default SessionList;
