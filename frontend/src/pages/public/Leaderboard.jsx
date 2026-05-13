// Purpose: Shows the public leaderboard with animated podium, URL-synced filters, monthly winner timeline, metric chart, and PDF export.
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download } from "lucide-react";
import { useMemo, useRef } from "react";
import toast from "react-hot-toast";
import LeaderboardTable from "../../components/leaderboard/LeaderboardTable.jsx";
import MetricBreakdownChart from "../../components/leaderboard/MetricBreakdownChart.jsx";
import MonthlyWinnerCard from "../../components/leaderboard/MonthlyWinnerCard.jsx";
import PodiumStage from "../../components/leaderboard/PodiumStage.jsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import FilterBar from "../../filters/FilterBar.jsx";
import { leaderboardFilters } from "../../filters/filterConfig.js";
import { useFilters } from "../../filters/useFilters.js";
import { useLeaderboard } from "../../hooks/useLeaderboard.js";
import { matchesSearch } from "../../utils/search.js";

const Leaderboard = () => {
  const { filters, setFilter, clearFilter, clearAll } = useFilters("leaderboard", leaderboardFilters, {
    q: "",
    month: "All Time",
    metric: "Overall",
    minSessions: "Any",
  });
  const { leaderboard, metricBreakdown, winners, loading, error } = useLeaderboard({
    month: filters.month === "All Time" ? "All Time" : filters.month,
    metric: filters.metric,
  });
  const reportRef = useRef(null);
  const filteredLeaderboard = useMemo(() => {
    const minSessions = filters.minSessions === "Any" ? 0 : Number.parseInt(filters.minSessions, 10) || 0;
    return leaderboard.filter((item) => (
      Number(item.sessions || 0) >= minSessions
      && matchesSearch(filters.q, [item.trainer, item.name, item.verdict, item.grade, item.avgScore, item.bestScore])
    ));
  }, [filters.minSessions, filters.q, leaderboard]);

  const exportPdf = async () => {
    const backgroundColor = window.getComputedStyle(document.documentElement).getPropertyValue("--bg-primary").trim();
    const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor });
    const pdf = new jsPDF("p", "mm", "a4");
    const img = canvas.toDataURL("image/png");
    const width = 190;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(img, "PNG", 10, 10, width, Math.min(height, 277));
    pdf.save("bytesandbeyond-leaderboard.pdf");
    toast.success("Leaderboard PDF exported");
  };

  if (loading) return <LoadingSpinner label="Loading leaderboard" />;

  return (
    <div className="space-y-4" ref={reportRef}>
      <div className="nexus-card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="label-tag text-accent">BytesAndBeyond</p>
          <h1 className="text-2xl font-black text-textPrimary">Leaderboard</h1>
          <p className="text-sm font-bold text-textSecondary">{error || "Trainer performance across completed KT sessions."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="primary-button px-4" onClick={exportPdf}><Download className="h-4 w-4" /> Export PDF</button>
        </div>
      </div>
      <FilterBar config={leaderboardFilters} values={filters} onChange={setFilter} onClear={clearFilter} onClearAll={clearAll} resultCount={filteredLeaderboard.length} totalCount={leaderboard.length} />
      <PodiumStage trainers={filteredLeaderboard.slice(0, 3)} />
      <LeaderboardTable items={filteredLeaderboard} />
      <MetricBreakdownChart data={metricBreakdown} />
      <section>
        <div className="mb-3">
          <p className="label-tag text-accent">Monthly Timeline</p>
          <h2 className="text-xl font-semibold">Monthly Winners</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {winners.map((winner) => <MonthlyWinnerCard key={winner.month} winner={winner} />)}
        </div>
      </section>
    </div>
  );
};

export default Leaderboard;
