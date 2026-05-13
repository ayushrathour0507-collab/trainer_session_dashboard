/**
 * Purpose: Public BytesAndBeyond command center with hero, next-session countdown, KPIs, timeline, recent sessions, and best performer spotlight.
 */
import { ArrowRight, CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, MessageSquarePlus, Star, Trophy, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import CardCarousel from "../../components/common/CardCarousel.jsx";
import KPICard from "../../components/common/KPICard.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import BestPerformerSpotlight from "../../components/dashboard/BestPerformerSpotlight.jsx";
import ScoreRing from "../../components/evaluation/ScoreRing.jsx";
import AttendeeFeedbackModal from "../../components/feedback/AttendeeFeedbackModal.jsx";
import SessionCard from "../../components/session/SessionCard.jsx";
import SessionTimeline from "../../components/session/SessionTimeline.jsx";
import StatusBadge from "../../components/session/StatusBadge.jsx";
import { useCountdown } from "../../hooks/useCountdown.js";
import { useLeaderboard } from "../../hooks/useLeaderboard.js";
import { useSessions } from "../../hooks/useSessions.js";
import { formatLongDate } from "../../utils/dateUtils.js";
import { getFeedbackWindow } from "../../utils/feedbackWindow.js";
import { matchesSearch } from "../../utils/search.js";

const Home = () => {
  const { sessions, upcoming, loading, fetchSessions, fetchUpcoming } = useSessions();
  const { leaderboard } = useLeaderboard({ month: "All Time", metric: "Overall" });
  const [searchParams] = useSearchParams();
  const [browseIndex, setBrowseIndex] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [feedbackSession, setFeedbackSession] = useState(null);
  const query = searchParams.get("q") || "";

  useEffect(() => {
    fetchSessions({ limit: 100 });
    fetchUpcoming();
  }, [fetchSessions, fetchUpcoming]);

  const filteredSessions = useMemo(() => sessions.filter((session) => matchesSearch(query, [
    session.topic,
    session.presenterName,
    session.status,
    session.month,
    session.sessionNumber,
    formatLongDate(session.date),
  ])), [query, sessions]);
  const completed = useMemo(() => sessions.filter((session) => session.status === "Completed"), [sessions]);
  const programmeCompletion = sessions.length ? Math.round((completed.length / sessions.length) * 100) : 0;
  const visibleCompleted = useMemo(() => filteredSessions.filter((session) => session.status === "Completed"), [filteredSessions]);
  const upcomingList = useMemo(() => filteredSessions.filter((session) => ["Pending", "Confirmed"].includes(session.status)), [filteredSessions]);
  const trainers = useMemo(() => new Set(sessions.map((session) => session.presenterName).filter((name) => name && name !== "TBD")), [sessions]);
  const averageRating = completed.length
    ? completed.reduce((sum, session) => sum + Number(session.overallScore || session.rating || 0), 0) / completed.length
    : 0;
  const recent = visibleCompleted.slice(-8).reverse();
  const best = leaderboard[0] || null;
  const sessionDeck = useMemo(() => [...filteredSessions].sort((a, b) => new Date(a.date) - new Date(b.date)), [filteredSessions]);
  const defaultDeckIndex = useMemo(() => {
    if (!sessionDeck.length) return 0;
    const upcomingId = upcoming?._id || upcoming?.id;
    const upcomingIndex = sessionDeck.findIndex((session) => String(session._id || session.id) === String(upcomingId));
    if (upcomingIndex >= 0) return upcomingIndex;
    const futureIndex = sessionDeck.findIndex((session) => new Date(session.date) >= new Date());
    return futureIndex >= 0 ? futureIndex : sessionDeck.length - 1;
  }, [sessionDeck, upcoming?._id, upcoming?.id]);
  const cardIndex = sessionDeck.length ? Math.min(sessionDeck.length - 1, Math.max(0, browseIndex ?? defaultDeckIndex)) : 0;
  const cardSession = sessionDeck[cardIndex] || upcoming;
  const countdown = useCountdown(cardSession?.date, cardSession?.startTime || "14:00");
  const isCurrentSessionLive = Boolean(
    cardSession?.isOngoing || (cardSession && ["Pending", "Confirmed"].includes(cardSession.status) && countdown.isPast),
  );
  const isCompletedCard = cardSession?.status === "Completed";
  const feedbackWindow = getFeedbackWindow(cardSession);
  const nextSessionStatus = isCurrentSessionLive ? "Ongoing" : (cardSession?.displayStatus || cardSession?.status || "Pending");
  const moveCard = (direction) => {
    if (!sessionDeck.length) return;
    setBrowseIndex((current) => {
      const currentIndex = current ?? defaultDeckIndex;
      return Math.min(sessionDeck.length - 1, Math.max(0, currentIndex + direction));
    });
  };
  const jumpToCard = (index) => setBrowseIndex(Math.min(sessionDeck.length - 1, Math.max(0, index)));
  const onTouchEnd = (event) => {
    if (touchStart == null) return;
    const delta = touchStart - event.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) moveCard(delta > 0 ? 1 : -1);
    setTouchStart(null);
  };

  if (loading && !sessions.length) return <LoadingSpinner label="Loading programme" />;

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="nexus-card overflow-hidden p-5 md:p-6">
          <p className="label-tag text-accent">Weekly KT Programme</p>
          <h1 className="mt-3 font-display text-4xl font-black leading-tight text-textPrimary md:text-5xl">BytesAndBeyond</h1>
          <p className="mt-2 max-w-2xl font-display text-xl italic text-accent">Loading knowledge into the system.</p>
          <p className="mt-4 max-w-2xl text-sm font-semibold text-textSecondary">A simple internal platform to schedule Saturday KT sessions, collect feedback, evaluate trainers, generate posters, and track the leaderboard.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/sessions" className="primary-button px-4">View All Sessions <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/leaderboard" className="secondary-button px-4">View Leaderboard <Trophy className="h-4 w-4" /></Link>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm font-black">
              <span>Programme Progress</span>
              <span className="font-mono text-accent">{programmeCompletion}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-pill bg-surface">
              <div className="h-full rounded-pill bg-accent transition-all" style={{ width: `${programmeCompletion}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs font-bold text-textSecondary">
              <span>{completed.length} completed</span>
              <span>{sessions.length} total sessions</span>
            </div>
          </div>
        </div>

        <div className="nexus-card overflow-hidden p-5" onTouchStart={(event) => setTouchStart(event.touches[0].clientX)} onTouchEnd={onTouchEnd}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="label-tag text-textSecondary">{isCurrentSessionLive ? "Current Session" : isCompletedCard ? "Completed Session" : "Next Session"}</p>
              <h2 key={cardSession?._id || cardSession?.id || cardIndex} className="mt-2 line-clamp-2 text-2xl font-black text-textPrimary transition-all duration-300">{cardSession?.topic || "TBD"}</h2>
            </div>
            <StatusBadge status={nextSessionStatus} />
          </div>
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-accent/20 font-black text-accent">{cardSession?.presenterInitials || "TD"}</div>
            <div>
              <p className="font-black text-textPrimary">{cardSession?.presenterName || "TBD"}</p>
              <p className="text-sm font-bold text-textSecondary">{formatLongDate(cardSession?.date)} - {cardSession?.day || "Saturday"} - {cardSession?.startTime || "14:00"}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-border bg-surface/40 p-2">
            <button type="button" className="ghost-button h-10 px-3" disabled={cardIndex <= 0} onClick={() => moveCard(-1)}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="font-mono text-xs font-black text-textSecondary">Session {cardIndex + 1} of {sessionDeck.length || 1}</span>
            <button type="button" className="ghost-button h-10 px-3" disabled={cardIndex >= sessionDeck.length - 1} onClick={() => moveCard(1)}>
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex justify-center gap-1.5" aria-label="Session carousel pagination">
            {sessionDeck.slice(0, 10).map((session, index) => (
              <button
                key={session._id || session.id}
                type="button"
                className={`h-1.5 rounded-full transition-all ${index === cardIndex ? "w-6 bg-accent" : "w-1.5 bg-textSecondary/40 hover:bg-accent/60"}`}
                onClick={() => jumpToCard(index)}
                aria-label={`Show session ${index + 1}`}
              />
            ))}
          </div>
          {isCurrentSessionLive ? (
            <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-3 text-center">
              <p className="font-mono text-2xl font-black text-success">ONGOING NOW</p>
              <p className="mt-1 text-xs font-bold uppercase text-textSecondary">Visible until admin marks it completed</p>
            </div>
          ) : isCompletedCard ? (
            <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-3 text-center">
              <p className="font-mono text-2xl font-black text-success">COMPLETED</p>
              <p className="mt-1 text-xs font-bold uppercase text-textSecondary">{feedbackWindow.message}</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["days", "hours", "minutes"].map((key) => (
                <div key={key} className="rounded-lg border border-border bg-surface/50 p-3 text-center">
                  <p className="font-mono text-2xl font-black text-accent">{countdown[key]}</p>
                  <p className="text-xs font-bold uppercase text-textSecondary">{key}</p>
                </div>
              ))}
            </div>
          )}
          {cardSession?.meetingLink ? (
            <a href={cardSession.meetingLink} target="_blank" rel="noreferrer" className="primary-button mt-4 w-full px-4">
              {isCurrentSessionLive ? "Join Ongoing Session" : "Join Meeting"} <CalendarClock className="h-4 w-4" />
            </a>
          ) : (
            <button type="button" className="secondary-button mt-4 w-full px-4" onClick={() => toast("Meeting link is not available yet.")}>Meeting Link Pending</button>
          )}
          {isCompletedCard ? (
            <button type="button" className="secondary-button mt-3 w-full px-4" disabled={!feedbackWindow.isOpen} onClick={() => setFeedbackSession(cardSession)}>
              <MessageSquarePlus className="h-4 w-4" /> Fill Feedback
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard icon={CalendarClock} value={sessions.length} label="Total Sessions" />
        <KPICard icon={CheckCircle2} value={completed.length} label="Sessions Completed" tone="success" />
        <KPICard icon={Star} value={averageRating.toFixed(2)} label="Programme Avg Score" tone="warning" />
        <KPICard icon={UsersRound} value={trainers.size} label="Active Trainers" tone="info" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <div className="nexus-card p-4">
          <div className="mb-4">
            <p className="label-tag text-accent">Programme Timeline</p>
            <h2 className="text-2xl font-semibold">March to July 2026</h2>
          </div>
          <SessionTimeline sessions={filteredSessions} />
        </div>
        <div className="nexus-card p-4">
          <p className="label-tag text-accent">Best Performer</p>
          {best ? <BestPerformerSpotlight trainer={best} /> : <ScoreRing score={averageRating} />}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="label-tag text-accent">What's On</p>
            <h2 className="text-2xl font-semibold">Upcoming Sessions</h2>
          </div>
          <Link to="/sessions" className="text-sm font-black text-accent">See all</Link>
        </div>
        <CardCarousel itemClassName="min-w-[300px] max-w-[380px]">
          {upcomingList.map((session) => <SessionCard key={session._id || session.id} session={session} />)}
        </CardCarousel>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="label-tag text-accent">Recent Completed</p>
            <h2 className="text-2xl font-semibold">Latest Knowledge Transfers</h2>
          </div>
          <Link to="/sessions" className="text-sm font-black text-accent">See all</Link>
        </div>
        <CardCarousel itemClassName="min-w-[300px] max-w-[380px]">
          {recent.map((session) => <SessionCard key={session._id || session.id} session={session} />)}
        </CardCarousel>
      </section>

      <AttendeeFeedbackModal
        session={feedbackSession}
        open={Boolean(feedbackSession)}
        onClose={() => setFeedbackSession(null)}
        onSubmitted={() => {
          fetchSessions({ limit: 100 });
          fetchUpcoming();
        }}
      />
    </div>
  );
};

export default Home;
