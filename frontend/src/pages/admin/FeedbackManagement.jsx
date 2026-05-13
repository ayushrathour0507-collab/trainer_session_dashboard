// Purpose: Lets admins import Microsoft Forms feedback and review the parsed import result.
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import FeedbackImporter from "../../components/feedback/FeedbackImporter.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useFeedbackStore } from "../../store/feedbackStore.js";
import { useSessionStore } from "../../store/sessionStore.js";
import { evaluationService } from "../../services/evaluation.service.js";
import { feedbackService } from "../../services/feedback.service.js";
import { formatLongDate } from "../../utils/dateUtils.js";
import { matchesSearch } from "../../utils/search.js";

const FeedbackManagement = () => {
  const { sessions, loading: sessionsLoading, fetchSessions } = useSessionStore();
  const { bulkImport, loading } = useFeedbackStore();
  const [result, setResult] = useState(null);
  const [evaluationsBySession, setEvaluationsBySession] = useState({});
  const [rawFeedback, setRawFeedback] = useState([]);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState("");
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    fetchSessions({ limit: 100 });
  }, [fetchSessions]);

  useEffect(() => {
    const completed = sessions.filter((session) => session.status === "Completed");
    if (!completed.length) return;

    let mounted = true;
    Promise.all(completed.map((session) => evaluationService.getBySession(session._id).catch(() => null)))
      .then((evaluations) => {
        if (!mounted) return;
        setEvaluationsBySession(evaluations.reduce((acc, evaluation) => {
          if (evaluation?.session?._id || evaluation?.session) {
            acc[String(evaluation.session?._id || evaluation.session)] = evaluation;
          }
          return acc;
        }, {}));
      });

    return () => {
      mounted = false;
    };
  }, [sessions]);

  const importFeedback = async (payload) => {
    try {
      const data = await bulkImport(payload);
      setResult(data);
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Import failed");
      throw error;
    }
  };

  const loadRawFeedback = async (session) => {
    try {
      const data = await feedbackService.getBySession(session._id);
      setRawFeedback(data.items || []);
      setSelectedSessionTitle(session.topic);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load responses");
    }
  };

  const completedSessions = useMemo(() => sessions
    .filter((session) => session.status === "Completed")
    .filter((session) => matchesSearch(query, [
      session.topic,
      session.presenterName,
      session.month,
      session.feedbackCount,
      formatLongDate(session.date),
    ])), [query, sessions]);
  const filteredRawFeedback = useMemo(() => rawFeedback.filter((item) => matchesSearch(query, [
    item.responderName,
    item.email,
    item.attendeeRating,
    item.keyTakeaways,
    item.improvements,
    item.futureSuggestions,
  ])), [query, rawFeedback]);

  if (sessionsLoading && !sessions.length) return <LoadingSpinner label="Loading feedback workspace" />;

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
      <FeedbackImporter sessions={sessions} onImport={importFeedback} />
      <div className="nexus-card p-4">
        <h1 className="text-2xl font-black text-light-text dark:text-dark-text">Feedback Management</h1>
        <p className="mt-1 text-sm font-bold text-light-subtext dark:text-dark-subtext">Bulk import accepts CSV or tab-separated exports.</p>
        <div className="mt-4 grid gap-2">
          <div className="rounded-card border border-light-border p-3 dark:border-dark-border">
            <p className="text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Imported</p>
            <p className="mt-1 text-2xl font-black text-success">{result?.created?.length || 0}</p>
          </div>
          <div className="rounded-card border border-light-border p-3 dark:border-dark-border">
            <p className="text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Unmatched</p>
            <p className="mt-1 text-2xl font-black text-warning">{result?.unmatched?.length || 0}</p>
          </div>
          {loading ? <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">Importing feedback...</p> : null}
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-black text-light-text dark:text-dark-text">Collective Response Publishing</h2>
          <div className="mt-2 space-y-2">
            {completedSessions.map((session) => {
              const evaluation = evaluationsBySession[session._id];
              return (
                <div key={session._id} className="rounded-button border border-light-border p-3 dark:border-dark-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-light-text dark:text-dark-text">{session.topic}</p>
                      <p className="text-xs font-bold text-light-subtext dark:text-dark-subtext">{session.feedbackCount || 0} responses collected</p>
                    </div>
                    <StatusBadge status={evaluation?.trainerFeedbackPublished ? "Completed" : "Pending"} />
                  </div>
                  <Link to={`/admin/evaluate/${session._id}`} className="secondary-button mt-3 w-full px-3">
                    {evaluation?.trainerFeedbackPublished ? "View Published Response" : "Review & Publish Collective Response"}
                  </Link>
                  <button type="button" className="ghost-button mt-2 w-full px-3" onClick={() => loadRawFeedback(session)}>
                    View Named Responses
                  </button>
                </div>
              );
            })}
            {!completedSessions.length ? <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">No completed sessions match your search.</p> : null}
          </div>
        </div>
        {selectedSessionTitle ? (
          <div className="mt-4">
            <h2 className="text-lg font-black text-light-text dark:text-dark-text">Named Responses</h2>
            <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">{selectedSessionTitle}</p>
            <div className="mt-2 max-h-[360px] space-y-2 overflow-auto pr-1">
              {filteredRawFeedback.map((item) => (
                <article key={item._id} className="rounded-button border border-light-border p-2.5 dark:border-dark-border">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-light-text dark:text-dark-text">{item.responderName || "Anonymous"}</p>
                      <p className="text-xs font-bold text-light-subtext dark:text-dark-subtext">{item.email || "No email"}</p>
                      <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-black ${item.isAnonymous !== false ? "border-warning/30 bg-warning/10 text-warning" : "border-success/30 bg-success/10 text-success"}`}>
                        {item.isAnonymous !== false ? "Anonymous to trainer" : "Visible to trainer"}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-black text-accent">{item.attendeeRating}/5</span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-light-subtext dark:text-dark-subtext">{item.keyTakeaways || "No takeaway shared."}</p>
                </article>
              ))}
              {!filteredRawFeedback.length ? <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">{query ? "No responses match your search." : "No responses collected for this session yet."}</p> : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FeedbackManagement;
