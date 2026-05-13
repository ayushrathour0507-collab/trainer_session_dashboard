// Purpose: Lists sessions assigned to the signed-in trainer.
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth, subMonths } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useSessions } from "../../hooks/useSessions.js";
import { formatLongDate } from "../../utils/dateUtils.js";
import { matchesSearch } from "../../utils/search.js";

const MySessions = () => {
  const { sessions, loading, error, fetchMySessions, createTrainerRequest } = useSessions();
  const [searchParams] = useSearchParams();
  const [requestOpen, setRequestOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [form, setForm] = useState({
    date: "",
    topic: "",
    startTime: "14:00",
    endTime: "15:00",
    summary: "",
    posterTopics: "",
    requirements: "Laptop\nStable internet\nReady to learn",
  });
  const query = searchParams.get("q") || "";

  useEffect(() => {
    fetchMySessions();
  }, [fetchMySessions]);

  const filteredSessions = useMemo(() => sessions.filter((session) => matchesSearch(query, [
    session.topic,
    session.presenterName,
    session.status,
    session.month,
    session.sessionNumber,
    formatLongDate(session.date),
  ])), [query, sessions]);
  const monthDays = useMemo(() => eachDayOfInterval({
    start: startOfMonth(calendarMonth),
    end: endOfMonth(calendarMonth),
  }), [calendarMonth]);
  const leadingBlanks = startOfMonth(calendarMonth).getDay();
  const sessionsByDay = useMemo(() => monthDays.map((day) => ({
    day,
    sessions: filteredSessions.filter((session) => session.date && isSameDay(new Date(session.date), day)),
  })), [filteredSessions, monthDays]);

  if (loading) return <LoadingSpinner label="Loading my sessions" />;

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const lines = (value) => String(value || "").split("\n").map((item) => item.trim()).filter(Boolean);
  const submitRequest = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await createTrainerRequest({
        date: form.date,
        topic: form.topic,
        startTime: form.startTime,
        endTime: form.endTime,
        summary: form.summary,
        posterTopics: lines(form.posterTopics),
        requirements: lines(form.requirements),
      });
      toast.success("Session sent to admin for approval");
      setRequestOpen(false);
      setForm({
        date: "",
        topic: "",
        startTime: "14:00",
        endTime: "15:00",
        summary: "",
        posterTopics: "",
        requirements: "Laptop\nStable internet\nReady to learn",
      });
      fetchMySessions();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to submit session request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="nexus-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-light-text dark:text-dark-text">My Sessions</h1>
          <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">{error || `${filteredSessions.length} sessions in your calendar`}</p>
        </div>
        <button type="button" className="primary-button px-4" onClick={() => setRequestOpen(true)}>
          <Plus className="h-4 w-4" /> Create Session
        </button>
      </div>
      <section className="nexus-card overflow-hidden">
        <div className="flex flex-col gap-2.5 border-b border-light-border p-3.5 dark:border-dark-border sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label-tag text-accent">Calendar</p>
            <h2 className="text-xl font-black text-light-text dark:text-dark-text">{format(calendarMonth, "MMMM yyyy")}</h2>
          </div>
          <div className="flex gap-2">
            <button type="button" className="secondary-button min-h-9 px-3 text-sm" onClick={() => setCalendarMonth((current) => subMonths(current, 1))}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button type="button" className="secondary-button min-h-9 px-3 text-sm" onClick={() => setCalendarMonth(new Date())}>Today</button>
            <button type="button" className="secondary-button min-h-9 px-3 text-sm" onClick={() => setCalendarMonth((current) => addMonths(current, 1))}>
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-light-border text-center text-xs font-black uppercase tracking-[0.18em] text-light-subtext dark:border-dark-border dark:text-dark-subtext">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="p-2">{day}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: leadingBlanks }).map((_, index) => <div key={`blank-${index}`} className="min-h-[96px] border-b border-r border-light-border/70 bg-[var(--surface-field)]/30 dark:border-dark-border/70" />)}
          {sessionsByDay.map(({ day, sessions: daySessions }) => (
            <div key={day.toISOString()} className="min-h-[96px] border-b border-r border-light-border/70 p-2 dark:border-dark-border/70">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-xs font-black text-light-subtext dark:text-dark-subtext">{format(day, "d")}</span>
                {daySessions.length ? <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-black text-accent">{daySessions.length}</span> : null}
              </div>
              <div className="space-y-1.5">
                {daySessions.map((session) => (
                  <div key={session._id} className="rounded-md border border-light-border bg-[var(--surface-field)] px-2 py-1.5 dark:border-dark-border">
                    <p className="line-clamp-1 text-xs font-black text-light-text dark:text-dark-text">{session.topic || "TBD"}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-light-subtext dark:text-dark-subtext">{session.startTime || "14:00"}</span>
                      <StatusBadge status={session.approvalStatus || session.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      {!filteredSessions.length ? <div className="nexus-card p-4 text-center text-sm font-bold text-light-subtext dark:text-dark-subtext">{query ? "No sessions match your search." : "No sessions assigned yet."}</div> : null}
      {requestOpen ? (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-6 backdrop-blur-sm">
          <form onSubmit={submitRequest} className="nexus-card flex max-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col overflow-hidden p-0">
            <div className="shrink-0 border-b border-light-border/70 p-4 dark:border-dark-border/70">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="label-tag text-accent">Trainer Request</p>
                  <h2 className="mt-1 text-2xl font-black text-light-text dark:text-dark-text">Create Session</h2>
                  <p className="mt-1 text-sm font-bold text-light-subtext dark:text-dark-subtext">Your request will go to admin approval before it is published.</p>
                </div>
                <button type="button" className="ghost-button h-10 w-10 p-0" onClick={() => setRequestOpen(false)} aria-label="Close create session form">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="label-tag mb-1 block">Session Date</span>
                  <input className="field" type="date" value={form.date} onChange={(event) => update("date", event.target.value)} required />
                </label>
                <label className="block">
                  <span className="label-tag mb-1 block">Topic</span>
                  <input className="field" value={form.topic} onChange={(event) => update("topic", event.target.value)} placeholder="Session topic" required />
                </label>
                <label className="block">
                  <span className="label-tag mb-1 block">Start Time</span>
                  <input className="field" value={form.startTime} onChange={(event) => update("startTime", event.target.value)} required />
                </label>
                <label className="block">
                  <span className="label-tag mb-1 block">End Time</span>
                  <input className="field" value={form.endTime} onChange={(event) => update("endTime", event.target.value)} required />
                </label>
              </div>
              <label className="mt-3 block">
                <span className="label-tag mb-1 block">Short Summary</span>
                <textarea className="field min-h-24" value={form.summary} onChange={(event) => update("summary", event.target.value)} placeholder="What will this KT cover?" />
              </label>
              <label className="mt-3 block">
                <span className="label-tag mb-1 block">Poster Topics</span>
                <textarea className="field min-h-24" value={form.posterTopics} onChange={(event) => update("posterTopics", event.target.value)} placeholder="One topic per line" />
              </label>
              <label className="mt-3 block">
                <span className="label-tag mb-1 block">Requirements</span>
                <textarea className="field min-h-20" value={form.requirements} onChange={(event) => update("requirements", event.target.value)} />
              </label>
            </div>
            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-light-border/70 p-4 dark:border-dark-border/70 sm:flex-row sm:justify-end">
              <button type="button" className="secondary-button px-4" onClick={() => setRequestOpen(false)}>Cancel</button>
              <button type="submit" className="primary-button px-4" disabled={submitting}>{submitting ? "Submitting..." : "Send for Approval"}</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default MySessions;
