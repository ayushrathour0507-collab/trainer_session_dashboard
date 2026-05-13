// Purpose: Gives admins a simple session-management workspace for status updates, edits, evaluations, posters, and announcements.
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import MainSessionsTable from "../../components/common/MainSessionsTable.jsx";
import { useSessions } from "../../hooks/useSessions.js";
import { formatLongDate } from "../../utils/dateUtils.js";
import { matchesSearch } from "../../utils/search.js";

const SessionManagement = () => {
  const { sessions, loading, fetchAdminSessions, deleteSession, updateSession, updateApproval } = useSessions();
  const [confirmId, setConfirmId] = useState("");
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    fetchAdminSessions({ limit: 100 });
  }, [fetchAdminSessions]);

  const remove = async () => {
    try {
      await deleteSession(confirmId);
      toast.success("Session deleted");
      setConfirmId("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const changeStatus = async (id, status) => {
    const current = sessions.find((session) => session._id === id);
    if (!current) return;
    try {
      await updateSession(id, { status });
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Status update failed");
    }
  };

  const changeApproval = async (id, approvalStatus) => {
    const remarksByStatus = {
      Approved: "Approved by admin and ready to publish.",
      Rejected: "Rejected by admin. Please submit a new proposal if needed.",
      "Changes Requested": "Admin requested changes. Please update and resubmit.",
    };
    try {
      await updateApproval(id, { approvalStatus, adminRemarks: remarksByStatus[approvalStatus] });
      toast.success(`Approval updated to ${approvalStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval update failed");
    }
  };

  const filteredSessions = useMemo(() => sessions.filter((session) => matchesSearch(query, [
    session.topic,
    session.presenterName,
    session.status,
    session.approvalStatus,
    session.adminRemarks,
    session.priority,
    session.month,
    session.sessionNumber,
    session.boardTaskName,
    session.assigneeInitials,
    formatLongDate(session.date),
  ])), [query, sessions]);

  if (loading && !sessions.length) return <LoadingSpinner label="Loading sessions" />;

  return (
    <div className="space-y-4">
      <div className="nexus-card flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label-tag text-accent">Admin</p>
          <h1 className="text-2xl font-black text-light-text dark:text-dark-text">Session Management</h1>
          <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">Showing {filteredSessions.length} of {sessions.length} sessions.</p>
        </div>
        <Link to="/admin/sessions/create" className="primary-button px-4"><Plus className="h-4 w-4" /> New Session</Link>
      </div>

      <MainSessionsTable
        sessions={filteredSessions}
        title="All Sessions"
        subtitle="Update session status inline, then use actions for editing, evaluation, poster, or announcement."
        showAdminActions
        onDelete={setConfirmId}
        onStatusChange={changeStatus}
        onApprovalChange={changeApproval}
      />

      {confirmId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="nexus-card max-w-sm p-4">
            <h2 className="text-lg font-black">Delete session?</h2>
            <p className="mt-2 text-sm font-bold text-light-subtext dark:text-dark-subtext">This removes the session, its evaluation, and related feedback.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="secondary-button px-4" onClick={() => setConfirmId("")}>Cancel</button>
              <button type="button" className="primary-button px-4" onClick={remove}>Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SessionManagement;
