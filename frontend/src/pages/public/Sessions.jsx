// Purpose: Lists all KT sessions with multi-dimensional URL-synced filters, grid/list views, and active filter chips.
import { FileSpreadsheet, FileText } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import SessionCard from "../../components/session/SessionCard.jsx";
import SessionList from "../../components/session/SessionList.jsx";
import FilterBar from "../../filters/FilterBar.jsx";
import { createSessionFilters } from "../../filters/filterConfig.js";
import { useFilters } from "../../filters/useFilters.js";
import { useSessions } from "../../hooks/useSessions.js";
import { exportSessionsToExcel, exportSessionsToPdf } from "../../utils/sessionExport.js";

const scoreFor = (session) => Number(session.overallScore || session.totalScore || session.rating || 0);
const PAGE_SIZE = 12;

const Sessions = () => {
  const { sessions, loading, fetchSessions } = useSessions();
  const [page, setPage] = useState(1);
  const listRef = useRef(null);
  const presenterOptions = useMemo(() => [...new Set(sessions.map((session) => session.presenterName || session.presenter).filter(Boolean))], [sessions]);
  const filterConfig = useMemo(() => createSessionFilters(presenterOptions), [presenterOptions]);
  const { filters, setFilter, clearFilter, clearAll } = useFilters("sessions", filterConfig, {
    q: "",
    status: "All",
    dateRange: ["", ""],
    presenters: [],
    tags: [],
    sort: "Latest First",
    view: "grid",
  });

  useEffect(() => {
    fetchSessions({ limit: 100 });
  }, [fetchSessions]);

  const filtered = useMemo(() => sessions.filter((session) => {
    const isUpcoming = ["Pending", "Confirmed"].includes(session.status) && new Date(session.date) >= new Date();
    const statusMatch = filters.status === "All"
      || (filters.status === "Upcoming" && isUpcoming)
      || session.status === filters.status;
    const sessionDate = session.date ? new Date(String(session.date).slice(0, 10)) : null;
    const [startDate, endDate] = filters.dateRange || ["", ""];
    const afterStart = !startDate || (sessionDate && sessionDate >= new Date(startDate));
    const beforeEnd = !endDate || (sessionDate && sessionDate <= new Date(endDate));
    const dateMatch = afterStart && beforeEnd;
    const presenterMatch = !filters.presenters?.length || filters.presenters.includes(session.presenterName || session.presenter);
    const tagMatch = !filters.tags?.length || filters.tags.some((tag) => (session.tags || []).includes(tag));
    const query = `${session.topic} ${session.presenterName || session.presenter} ${(session.tags || []).join(" ")} ${session.note || ""}`.toLowerCase();
    return statusMatch && dateMatch && presenterMatch && tagMatch && query.includes(String(filters.q || "").toLowerCase());
  }).sort((a, b) => {
    if (filters.sort === "Oldest First") return new Date(a.date) - new Date(b.date);
    if (filters.sort === "Highest Score") return scoreFor(b) - scoreFor(a);
    if (filters.sort === "Lowest Score") return scoreFor(a) - scoreFor(b);
    if (filters.sort === "Most Attendees") return Number(b.attendees || 0) - Number(a.attendees || 0);
    return new Date(b.date) - new Date(a.date);
  }), [filters, sessions]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const filterSignature = [
    filters.q || "",
    filters.status || "",
    (filters.dateRange || []).join("|"),
    (filters.presenters || []).join("|"),
    (filters.tags || []).join("|"),
    filters.sort || "",
    filters.view || "",
  ].join("::");

  useEffect(() => {
    setPage(1);
  }, [filterSignature]);

  const changePage = (nextPage) => {
    setPage((currentPage) => Math.min(pages, Math.max(1, typeof nextPage === "function" ? nextPage(currentPage) : nextPage)));
    window.requestAnimationFrame(() => {
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (loading && !sessions.length) return <LoadingSpinner label="Loading sessions" />;

  return (
    <div className="space-y-4">
      <div className="nexus-card p-3.5">
        <div className="flex flex-col gap-2.5 border-b border-border pb-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="label-tag text-accent">Programme Board</p>
            <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
              <h1 className="text-3xl font-black text-textPrimary">Sessions</h1>
              <p className="pb-1 text-sm font-bold text-textSecondary">{filtered.length} of {sessions.length} sessions</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="secondary-button min-h-9 px-3 text-sm"
              disabled={!filtered.length}
              onClick={() => {
                exportSessionsToExcel(filtered);
                toast.success("Sessions exported to Excel");
              }}
            >
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </button>
            <button
              type="button"
              className="secondary-button min-h-9 px-3 text-sm"
              disabled={!filtered.length}
              onClick={() => {
                exportSessionsToPdf(filtered);
                toast.success("Sessions exported to PDF");
              }}
            >
              <FileText className="h-4 w-4" /> PDF
            </button>
          </div>
        </div>
        <div className="pt-2.5">
          <FilterBar
            config={filterConfig}
            values={filters}
            onChange={setFilter}
            onClear={clearFilter}
            onClearAll={clearAll}
            resultCount={filtered.length}
            totalCount={sessions.length}
            embedded
            showResultCount={false}
          />
        </div>
      </div>
      <div ref={listRef}>
        {paginated.length ? (
          filters.view === "table" ? (
            <SessionList sessions={paginated} />
          ) : filters.view === "list" ? (
            <div className="grid gap-3">
              {paginated.map((session) => <SessionCard key={session._id || session.id} session={session} />)}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {paginated.map((session) => <SessionCard key={session._id || session.id} session={session} />)}
            </div>
          )
        ) : (
          <EmptyState title="No sessions found" description="Adjust filters or clear them to see the complete programme." />
        )}
      </div>
      {pages > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <button type="button" className="secondary-button px-3" disabled={page <= 1} onClick={() => changePage((value) => value - 1)}>Previous</button>
          <span className="font-mono text-sm text-textSecondary">Page {page} of {pages}</span>
          <button type="button" className="secondary-button px-3" disabled={page >= pages} onClick={() => changePage((value) => value + 1)}>Next</button>
        </div>
      ) : null}
    </div>
  );
};

export default Sessions;
