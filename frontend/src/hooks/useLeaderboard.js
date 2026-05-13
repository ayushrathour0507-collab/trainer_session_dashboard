// Purpose: Fetches leaderboard, winner, and insight data for public and admin views.
import { useEffect, useState } from "react";
import { leaderboardService } from "../services/leaderboard.service.js";

export const useLeaderboard = (filters = "All") => {
  const params = typeof filters === "string" ? { month: filters } : filters;
  const month = params.month || "All";
  const metric = params.metric || "Overall";
  const [state, setState] = useState({
    leaderboard: [],
    metricBreakdown: [],
    winners: [],
    insights: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setState((current) => ({ ...current, loading: true, error: null }));
      try {
        const [leaderboard, winners, insights] = await Promise.all([
          leaderboardService.getLeaderboard({ month, metric }),
          leaderboardService.getMonthlyWinners(),
          leaderboardService.getInsights(),
        ]);
        if (mounted) {
          setState({
            leaderboard: leaderboard.items || [],
            metricBreakdown: leaderboard.metricBreakdown || [],
            winners: winners || [],
            insights,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (mounted) {
          setState((current) => ({ ...current, loading: false, error: error.response?.data?.message || error.message }));
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [month, metric]);

  return state;
};
