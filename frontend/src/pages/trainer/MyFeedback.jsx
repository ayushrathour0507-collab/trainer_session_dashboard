// Purpose: Displays anonymized feedback received by the logged-in trainer.
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import RatingStars from "../../components/common/RatingStars.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { leaderboardService } from "../../services/leaderboard.service.js";
import { formatLongDate } from "../../utils/dateUtils.js";
import { matchesSearch } from "../../utils/search.js";

const MyFeedback = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    if (!user?._id) return;
    let mounted = true;
    Promise.all([
      leaderboardService.getTrainerFeedback(user._id),
      leaderboardService.getTrainerDashboard(user._id),
    ])
      .then(([feedbackData, dashboardData]) => {
        if (!mounted) return;
        setFeedback(feedbackData);
        setSummaries((dashboardData.evaluations || []).filter((evaluation) => evaluation.overallFeedbackPost));
      })
      .catch((err) => mounted && setError(err.response?.data?.message || err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [user?._id]);

  const filteredFeedback = useMemo(() => feedback.filter((item) => matchesSearch(query, [
    item.sessionTitle,
    item.responderName,
    item.attendeeRating,
    item.keyTakeaways,
    item.improvements,
    item.futureSuggestions,
    formatLongDate(item.sessionDate),
  ])), [feedback, query]);

  if (loading) return <LoadingSpinner label="Loading my feedback" />;

  return (
    <div className="space-y-4">
      <div className="nexus-card p-4">
        <h1 className="text-2xl font-black text-light-text dark:text-dark-text">My Feedback</h1>
        <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">{error || `${filteredFeedback.length} of ${feedback.length} anonymized responses`}</p>
      </div>
      {summaries.length ? (
        <section className="grid gap-3 lg:grid-cols-2">
          {summaries.map((evaluation) => (
            <article key={evaluation._id} className="nexus-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="label-tag text-accent">Published Summary</p>
                  <h2 className="mt-1 text-lg font-black text-light-text dark:text-dark-text">{evaluation.session?.topic || "Session"}</h2>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 font-mono text-xs font-black text-accent">
                  {Number(evaluation.overallScore || 0).toFixed(2)} / 5
                </span>
              </div>
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap font-sans text-sm font-bold text-light-subtext dark:text-dark-subtext">{evaluation.overallFeedbackPost}</pre>
            </article>
          ))}
        </section>
      ) : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {filteredFeedback.map((item) => (
          <article key={item._id} className="nexus-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-light-text dark:text-dark-text">{item.sessionTitle}</h2>
                <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">{formatLongDate(item.sessionDate)}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-accent">
                  {item.isAnonymous ? "Anonymous attendee" : item.responderName || "Attendee"}
                </p>
              </div>
              <RatingStars rating={Number(item.attendeeRating || 0)} />
            </div>
            <div className="mt-3 grid gap-2 text-sm font-bold text-light-subtext dark:text-dark-subtext">
              <p><span className="text-light-text dark:text-dark-text">Takeaway:</span> {item.keyTakeaways || "No takeaway shared."}</p>
              <p><span className="text-light-text dark:text-dark-text">Improvement:</span> {item.improvements || "No improvement shared."}</p>
              <p><span className="text-light-text dark:text-dark-text">Future topic:</span> {item.futureSuggestions || "No topic suggested."}</p>
            </div>
          </article>
        ))}
      </div>
      {!filteredFeedback.length ? <div className="nexus-card p-4 text-center text-sm font-bold text-light-subtext dark:text-dark-subtext">{query ? "No feedback matches your search." : "No feedback available yet."}</div> : null}
    </div>
  );
};

export default MyFeedback;
