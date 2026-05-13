// Purpose: Presents admin KPIs, quick actions, notifications, activity, and monthly performance.
import { CalendarPlus, CheckCircle2, FileImage, Megaphone, MessageSquarePlus, Star, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Cell, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import KPICard from "../../components/common/KPICard.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import NotificationColumn from "../../components/common/NotificationColumn.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { leaderboardService } from "../../services/leaderboard.service.js";
import { formatLongDate } from "../../utils/dateUtils.js";
import { matchesSearch } from "../../utils/search.js";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    let mounted = true;
    leaderboardService.getAdminDashboard()
      .then((data) => mounted && setDashboard(data))
      .catch((err) => mounted && setError(err.response?.data?.message || err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const kpis = dashboard?.kpis || {};
  const needingAction = useMemo(() => (dashboard?.needingAction || []).filter((session) => matchesSearch(query, [
    session.topic,
    session.presenterName,
    session.status,
    session.month,
    formatLongDate(session.date),
  ])), [dashboard?.needingAction, query]);
  const recentActivity = useMemo(() => (dashboard?.recentActivity || []).filter((activity) => matchesSearch(query, [
    activity.label,
    formatLongDate(activity.date),
  ])), [dashboard?.recentActivity, query]);
  const notifications = useMemo(() => (dashboard?.notifications || []).filter((notification) => matchesSearch(query, [
    notification.title,
    notification.message,
    notification.type,
    notification.priority,
  ])), [dashboard?.notifications, query]);
  const statusData = useMemo(() => {
    const completed = Number(kpis.completed || 0);
    const upcoming = Number(kpis.upcoming || 0);
    const other = Math.max(Number(kpis.totalSessions || 0) - completed - upcoming, 0);
    return [
      { name: "Completed", value: completed, color: "var(--success)" },
      { name: "Upcoming", value: upcoming, color: "var(--warning)" },
      { name: "Other", value: other, color: "var(--info)" },
    ].filter((item) => item.value > 0);
  }, [kpis.completed, kpis.totalSessions, kpis.upcoming]);
  const completionPercent = kpis.totalSessions ? Math.round((Number(kpis.completed || 0) / Number(kpis.totalSessions || 1)) * 100) : 0;

  if (loading) return <LoadingSpinner label="Loading admin dashboard" />;

  return (
    <div className="space-y-4">
      {error ? <div className="nexus-card border-danger/30 p-4 text-sm font-bold text-danger">{error}</div> : null}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <KPICard icon={CalendarPlus} value={kpis.totalSessions || 0} label="Total Sessions" />
        <KPICard icon={CheckCircle2} value={kpis.completed || 0} label="Completed" tone="success" />
        <KPICard icon={CalendarPlus} value={kpis.upcoming || 0} label="Upcoming" tone="warning" />
        <KPICard icon={Star} value={Number(kpis.avgScore || 0).toFixed(2)} label="Avg Score" tone="info" />
        <KPICard icon={MessageSquarePlus} value={kpis.totalFeedbackResponses || 0} label="Feedback" tone="success" />
        <KPICard icon={UsersRound} value={kpis.activeTrainers || 0} label="Trainers" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="nexus-card flex h-[340px] min-h-0 flex-col p-4">
              <h2 className="shrink-0 text-lg font-black text-light-text dark:text-dark-text">Quick Actions</h2>
              <div className="mt-3 grid shrink-0 gap-2 sm:grid-cols-2">
                <Link to="/admin/sessions/create" className="primary-button px-4"><CalendarPlus className="h-4 w-4" /> New Session</Link>
                <Link to="/admin/feedback" className="secondary-button px-4"><MessageSquarePlus className="h-4 w-4" /> Add Feedback</Link>
                <Link to="/admin/sessions" className="secondary-button px-4"><FileImage className="h-4 w-4" /> Generate Poster</Link>
                <Link to="/admin/sessions" className="secondary-button px-4"><Megaphone className="h-4 w-4" /> Announcement</Link>
              </div>
              <h2 className="mt-4 shrink-0 text-lg font-black text-light-text dark:text-dark-text">Sessions Needing Action</h2>
              <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {needingAction.map((session) => (
                  <div key={session._id} className="flex items-center justify-between gap-3 rounded-button border border-light-border p-3 dark:border-dark-border">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{session.topic}</p>
                      <p className="text-xs font-bold text-light-subtext dark:text-dark-subtext">{formatLongDate(session.date)} | {session.presenterName}</p>
                    </div>
                    <StatusBadge status={session.status} />
                  </div>
                ))}
                {!needingAction.length ? <p className="text-sm font-bold text-light-subtext dark:text-dark-subtext">{query ? "No matching pending actions." : "No pending actions."}</p> : null}
              </div>
            </div>
            <div className="nexus-card h-[340px] p-4">
              <h2 className="mb-3 text-lg font-black text-light-text dark:text-dark-text">Monthly Performance</h2>
              <ResponsiveContainer width="100%" height="82%">
                <LineChart data={dashboard?.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="nexus-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="label-tag text-accent">Programme Health</p>
                  <h2 className="text-lg font-black text-light-text dark:text-dark-text">Session Status Mix</h2>
                </div>
                <div className="rounded-button bg-accent/10 px-3 py-2 text-right">
                  <p className="font-mono text-lg font-black text-accent">{completionPercent}%</p>
                  <p className="text-[10px] font-black uppercase text-light-subtext dark:text-dark-subtext">Complete</p>
                </div>
              </div>
              <div className="mt-3 grid gap-3 xl:grid-cols-[140px_1fr]">
                <div className="relative mx-auto h-32 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={64} paddingAngle={3} isAnimationActive={false}>
                        {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                    <span className="font-mono text-xl font-black text-light-text dark:text-dark-text">{kpis.totalSessions || 0}</span>
                  </div>
                </div>
                <div className="min-w-0 space-y-2">
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black">
                      <span>Completion</span>
                      <span className="font-mono text-accent">{completionPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-pill bg-[var(--surface-field)]">
                      <div className="h-full rounded-pill bg-accent" style={{ width: `${completionPercent}%` }} />
                    </div>
                  </div>
                  {statusData.map((item) => (
                    <div key={item.name} className="flex min-w-0 items-center justify-between gap-3 rounded-button border border-light-border px-3 py-2 text-sm font-bold dark:border-dark-border">
                      <span className="flex min-w-0 items-center gap-2 truncate">
                        <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="shrink-0 font-mono text-light-subtext dark:text-dark-subtext">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <section className="nexus-card p-4">
              <h2 className="text-lg font-black text-light-text dark:text-dark-text">Recent Activity</h2>
              <div className="mt-3 grid max-h-48 gap-2 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="rounded-button border border-light-border p-3 dark:border-dark-border">
                    <p className="truncate text-sm font-black">{activity.label}</p>
                    <p className="mt-1 text-xs font-bold text-light-subtext dark:text-dark-subtext">{formatLongDate(activity.date)}</p>
                  </div>
                ))}
              </div>
            </section>
          </section>
        </div>
        <NotificationColumn notifications={notifications} title="Admin Notifications" className="h-[340px]" />
      </section>
    </div>
  );
};

export default AdminDashboard;
