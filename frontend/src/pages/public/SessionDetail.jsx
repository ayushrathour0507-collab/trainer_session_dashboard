// Purpose: Shows full session details, poster, evaluation breakdown, attendee comments, and requested future topics.
import { ExternalLink, FileText, Link2, ListChecks, MessageSquarePlus, NotebookText, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FeedbackSummaryCard from "../../components/feedback/FeedbackSummaryCard.jsx";
import AttendeeFeedbackModal from "../../components/feedback/AttendeeFeedbackModal.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import PerformanceBar from "../../components/common/PerformanceBar.jsx";
import RatingStars from "../../components/common/RatingStars.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import PosterPreview from "../../components/poster/PosterPreview.jsx";
import MetricSpiderChart from "../../components/evaluation/MetricSpiderChart.jsx";
import { useSessions } from "../../hooks/useSessions.js";
import { formatLongDate } from "../../utils/dateUtils.js";
import { getFeedbackWindow } from "../../utils/feedbackWindow.js";
import { metricLabels } from "../../utils/scoring.js";

const SessionDetail = () => {
  const { id } = useParams();
  const { selectedSession, loading, fetchSession } = useSessions();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    fetchSession(id);
  }, [fetchSession, id]);

  if (loading || !selectedSession) return <LoadingSpinner label="Loading session" />;

  const session = selectedSession;
  const evaluation = session.evaluation;
  const feedbackWindow = getFeedbackWindow(session);
  const resources = [
    ...(session.posterTopics || []).map((topic) => ({ label: topic, value: "KT topic" })),
    ...(session.tags || []).slice(0, 3).map((tag) => ({ label: tag, value: "Reference area" })),
  ];
  const actionItems = [
    ...(evaluation?.adminInsights?.recommendedActions || []),
    ...(session.status === "Completed" ? ["Review feedback themes before next KT.", "Update shared notes with final takeaways."] : ["Confirm final agenda.", "Keep demo links and examples ready."]),
  ].slice(0, 4);
  const feedbackSummary = {
    count: session.feedback?.length || 0,
    averageRating: session.feedback?.length
      ? session.feedback.reduce((sum, item) => sum + Number(item.attendeeRating || 0), 0) / session.feedback.length
      : Number(session.rating || 0),
    comments: session.feedback?.map((item) => item.keyTakeaways).filter(Boolean) || [],
    improvements: session.feedback?.map((item) => item.improvements).filter(Boolean) || [],
    futureSuggestions: session.feedback?.map((item) => item.futureSuggestions).filter(Boolean) || [],
  };

  return (
    <div className="space-y-4">
      <section className="grid gap-3 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="nexus-card p-3.5">
          {session.posterUrl ? (
            <img src={session.posterUrl} alt={session.topic} className="w-full rounded-card object-cover" />
          ) : (
            <PosterPreview session={session} fields={{}} />
          )}
        </div>
        <div className="nexus-card p-3.5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Session #{session.sessionNumber}</p>
              <h1 className="mt-1.5 text-2xl font-black text-light-text dark:text-dark-text">{session.topic}</h1>
            </div>
            <StatusBadge status={session.status} />
          </div>
          <div className="mt-3 grid gap-2 text-sm font-bold text-light-subtext dark:text-dark-subtext md:grid-cols-2">
            <p><span className="text-light-text dark:text-dark-text">Date:</span> {formatLongDate(session.date)} - {session.day}</p>
            <p><span className="text-light-text dark:text-dark-text">Time:</span> {session.startTime} - {session.endTime}</p>
            <p><span className="text-light-text dark:text-dark-text">Presenter:</span> {session.presenterName}</p>
            <p><span className="text-light-text dark:text-dark-text">Attendance:</span> {session.attendees || evaluation?.attendanceCount || 0}</p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RatingStars rating={Number(session.rating || evaluation?.totalScore || 0)} />
            {session.meetingLink ? (
              <a href={session.meetingLink} target="_blank" rel="noreferrer" className="primary-button px-4">Join Meeting <ExternalLink className="h-4 w-4" /></a>
            ) : null}
            {session.status === "Completed" ? (
              <button type="button" className="secondary-button px-4" disabled={!feedbackWindow.isOpen} onClick={() => setFeedbackOpen(true)}>
                Fill Feedback <MessageSquarePlus className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          {session.status === "Completed" ? (
            <div className={`mt-3 rounded-button border px-3 py-2 text-sm font-bold ${feedbackWindow.isOpen ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning"}`}>
              {feedbackWindow.message}
            </div>
          ) : null}
          <div className="mt-3 rounded-card border border-light-border p-3 dark:border-dark-border">
            <h2 className="text-sm font-black text-light-text dark:text-dark-text">Session Summary</h2>
            <p className="mt-2 text-sm font-bold text-light-subtext dark:text-dark-subtext">{session.summary || session.note || "Summary will be added after the session."}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(session.keyTakeaways || []).map((takeaway) => <span key={takeaway} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-black text-accent">{takeaway}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
        <div className="nexus-card p-3.5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-black text-light-text dark:text-dark-text">KT Document</h2>
          </div>
          <p className="mt-2 text-sm font-bold text-light-subtext dark:text-dark-subtext">{session.clickupCard ? "Linked in the programme task." : "Attach KT notes in the admin session edit flow."}</p>
          {session.clickupCard ? <a href={session.clickupCard} target="_blank" rel="noreferrer" className="secondary-button mt-3 min-h-9 px-3 text-sm">Open task <ExternalLink className="h-4 w-4" /></a> : null}
        </div>
        <div className="nexus-card p-3.5">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-black text-light-text dark:text-dark-text">Teams Recap</h2>
          </div>
          <p className="mt-2 text-sm font-bold text-light-subtext dark:text-dark-subtext">Use the Teams meeting recap or recording link directly.</p>
          {session.meetingLink ? <a href={session.meetingLink} target="_blank" rel="noreferrer" className="secondary-button mt-3 min-h-9 px-3 text-sm">Open Teams recap <ExternalLink className="h-4 w-4" /></a> : null}
        </div>
        <div className="nexus-card p-3.5">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-black text-light-text dark:text-dark-text">Follow-up Actions</h2>
          </div>
          <ul className="mt-2 space-y-1.5 text-sm font-bold text-light-subtext dark:text-dark-subtext">
            {actionItems.map((item) => <li key={item} className="line-clamp-2">- {item}</li>)}
          </ul>
        </div>
        <div className="nexus-card p-3.5">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-black text-light-text dark:text-dark-text">Resources</h2>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(resources.length ? resources : [{ label: "Session notes", value: "Resource" }]).slice(0, 5).map((item) => (
              <span key={`${item.label}-${item.value}`} className="rounded-full border border-light-border px-2 py-1 text-xs font-black text-light-subtext dark:border-dark-border dark:text-dark-subtext">{item.label}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="nexus-card p-3.5">
        <div className="flex items-center gap-2">
          <NotebookText className="h-4 w-4 text-accent" />
          <h2 className="text-lg font-black text-light-text dark:text-dark-text">Session Notes</h2>
        </div>
        <p className="mt-2 text-sm font-bold text-light-subtext dark:text-dark-subtext">{session.note || evaluation?.remarks || "No additional notes have been published yet."}</p>
      </section>

      {evaluation ? (
        <section className="nexus-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-light-text dark:text-dark-text">Rating Breakdown</h2>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-black text-accent">{evaluation.verdict}</span>
          </div>
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-card border border-light-border p-3 dark:border-dark-border">
              <p className="text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Trainer Rating</p>
              <p className="mt-1 font-mono text-2xl font-black text-light-text dark:text-dark-text">{Number(evaluation.overallScore || 0).toFixed(2)}</p>
            </div>
            <div className="rounded-card border border-light-border p-3 dark:border-dark-border">
              <p className="text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Feedback Impact</p>
              <p className="mt-1 font-mono text-2xl font-black text-light-text dark:text-dark-text">{Number(evaluation.attendeeAverageRating || 0).toFixed(2)}</p>
            </div>
            <div className="rounded-card border border-light-border p-3 dark:border-dark-border">
              <p className="text-xs font-black uppercase text-light-subtext dark:text-dark-subtext">Admin Insight</p>
              <p className="mt-1 font-mono text-2xl font-black text-light-text dark:text-dark-text">{Number(evaluation.adminInsightScore || 0).toFixed(2)}</p>
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-card border border-light-border p-3 dark:border-dark-border">
              <p className="label-tag text-accent">Score Shape</p>
              <MetricSpiderChart scores={evaluation.scores || {}} height={240} />
            </div>
            <div className="grid content-start gap-3 md:grid-cols-2">
              {Object.entries(evaluation.scores || {}).map(([key, value]) => <PerformanceBar key={key} label={metricLabels[key] || key} score={Number(value)} />)}
            </div>
          </div>
          {evaluation.overallFeedbackPost ? (
            <div className="mt-4 rounded-card border border-light-border p-3 dark:border-dark-border">
              <h3 className="text-sm font-black text-light-text dark:text-dark-text">Overall Feedback Post</h3>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm font-bold text-light-subtext dark:text-dark-subtext">{evaluation.overallFeedbackPost}</pre>
            </div>
          ) : null}
        </section>
      ) : null}

      <FeedbackSummaryCard summary={feedbackSummary} />
      <AttendeeFeedbackModal
        session={session}
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmitted={() => fetchSession(id)}
      />
    </div>
  );
};

export default SessionDetail;
