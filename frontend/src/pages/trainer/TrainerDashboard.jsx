// Purpose: Shows trainer stats, sessions, notifications, anonymized feedback, and improvement tips.
import { Award, CalendarDays, Star, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FeedbackSummaryCard from "../../components/feedback/FeedbackSummaryCard.jsx";
import CardCarousel from "../../components/common/CardCarousel.jsx";
import KPICard from "../../components/common/KPICard.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import MetricSpiderChart from "../../components/evaluation/MetricSpiderChart.jsx";
import NotificationColumn from "../../components/common/NotificationColumn.jsx";
import PerformanceBar from "../../components/common/PerformanceBar.jsx";
import SessionCard from "../../components/common/SessionCard.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { leaderboardService } from "../../services/leaderboard.service.js";
import { matchesSearch } from "../../utils/search.js";

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    if (!user?._id) return;
    let mounted = true;
    leaderboardService.getTrainerDashboard(user._id)
      .then((data) => mounted && setDashboard(data))
      .catch((err) => mounted && setError(err.response?.data?.message || err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [user?._id]);

  const stats = dashboard?.stats || {};
  const filteredSessions = useMemo(() => (dashboard?.sessions || []).filter((session) => matchesSearch(query, [
    session.topic,
    session.presenterName,
    session.status,
    session.month,
  ])), [dashboard?.sessions, query]);
  const filteredEvaluations = useMemo(() => (dashboard?.evaluations || []).filter((evaluation) => matchesSearch(query, [
    evaluation.session?.topic,
    evaluation.verdict,
    evaluation.remarks,
    evaluation.overallFeedbackPost,
  ])), [dashboard?.evaluations, query]);
  const filteredNotifications = useMemo(() => (dashboard?.notifications || []).filter((notification) => matchesSearch(query, [
    notification.title,
    notification.message,
    notification.type,
  ])), [dashboard?.notifications, query]);
  const latestEvaluation = filteredEvaluations[0] || dashboard?.evaluations?.[0] || null;

  if (loading) return <LoadingSpinner label="Loading trainer dashboard" />;

  return (
    <div className="space-y-4">
      <div className="nexus-card p-4">
        <p className="text-sm font-black uppercase text-accent">Welcome</p>
        <h1 className="text-2xl font-black text-light-text dark:text-dark-text">{dashboard?.trainer?.name || user?.name}</h1>
        <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">{error || dashboard?.improvementTip}</p>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard icon={CalendarDays} value={stats.sessionsDelivered || 0} label="Delivered" />
        <KPICard icon={Star} value={Number(stats.avgScore || 0).toFixed(2)} label="Avg Score" tone="warning" />
        <KPICard icon={Award} value={Number(stats.bestScore || 0).toFixed(2)} label="Best Score" tone="success" />
        <KPICard icon={TrendingUp} value={stats.verdict || "Pending"} label="Verdict" tone="info" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
            <div>
              <h2 className="mb-3 text-lg font-black text-light-text dark:text-dark-text">My Sessions</h2>
              {filteredSessions.length ? (
                <CardCarousel itemClassName="min-w-[280px] max-w-[340px]">
                  {filteredSessions.slice(0, 8).map((session) => <SessionCard key={session._id} session={session} />)}
                </CardCarousel>
              ) : (
                <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">No sessions match your search.</p>
              )}
            </div>
            <div className="nexus-card p-4">
              <h2 className="mb-3 text-lg font-black text-light-text dark:text-dark-text">Score History</h2>
              <div className="space-y-3">
                {filteredEvaluations.map((evaluation) => (
                  <div key={evaluation._id} className="rounded-button border border-light-border p-3 dark:border-dark-border">
                    <PerformanceBar label={evaluation.session?.topic || "Session"} score={Number(evaluation.overallScore || 0)} />
                    <p className="mt-2 text-xs font-bold text-light-subtext dark:text-dark-subtext">
                      Feedback {Number(evaluation.attendeeAverageRating || 0).toFixed(2)} | Admin {Number(evaluation.adminInsightScore || 0).toFixed(2)}
                    </p>
                  </div>
                ))}
                {!filteredEvaluations.length ? <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">{query ? "No evaluations match your search." : "No evaluations yet."}</p> : null}
              </div>
            </div>
          </div>
          {latestEvaluation ? (
            <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="nexus-card p-4">
                <p className="label-tag text-accent">Performance Shape</p>
                <h2 className="text-lg font-black text-light-text dark:text-dark-text">Latest Session Radar</h2>
                <MetricSpiderChart scores={latestEvaluation.scores || {}} height={260} />
              </div>
              <div className="nexus-card p-4">
                <p className="label-tag text-accent">Score Mix</p>
                <h2 className="text-lg font-black text-light-text dark:text-dark-text">Rating Composition</h2>
                <div className="mt-4 grid gap-3">
                  <PerformanceBar label="Attendee Feedback Impact" score={Number(latestEvaluation.attendeeAverageRating || 0)} />
                  <PerformanceBar label="Admin Insight Impact" score={Number(latestEvaluation.adminInsightScore || 0)} />
                  <PerformanceBar label="Overall Trainer Rating" score={Number(latestEvaluation.overallScore || 0)} />
                </div>
              </div>
            </section>
          ) : null}
          {dashboard?.evaluations?.[0]?.overallFeedbackPost ? (
            <section className="nexus-card p-4">
              <h2 className="text-lg font-black text-light-text dark:text-dark-text">Latest Overall Feedback</h2>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm font-bold text-light-subtext dark:text-dark-subtext">{dashboard.evaluations[0].overallFeedbackPost}</pre>
            </section>
          ) : null}
          <FeedbackSummaryCard summary={dashboard?.feedbackSummary} />
        </div>
        <NotificationColumn notifications={filteredNotifications} title="Trainer Notifications" />
      </section>
    </div>
  );
};

export default TrainerDashboard;
