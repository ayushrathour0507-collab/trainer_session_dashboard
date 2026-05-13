// Purpose: Builds ranked trainer leaderboards, monthly winners, and metric breakdowns from sessions and evaluations.
import { PROGRAMME_MONTHS, SCORE_KEYS, SCORE_LABELS } from "../config/constants.js";
import { getGrade, getVerdict, normaliseScores } from "./scoring.service.js";

const round = (value) => Math.round(Number(value || 0) * 100) / 100;

const average = (values) => {
  const clean = values.filter((value) => Number.isFinite(Number(value)));
  return clean.length ? round(clean.reduce((sum, value) => sum + Number(value), 0) / clean.length) : 0;
};

const metricFocusKey = (metric = "Overall") => {
  const normalised = String(metric || "Overall").toLowerCase().replace(/[^a-z]/g, "");
  const lookup = {
    overall: "overall",
    startontime: "startOnTime",
    structure: "structure",
    interaction: "interaction",
    clarity: "clarity",
    handson: "practical",
    handsonpractical: "practical",
    practical: "practical",
    clickup: "clickup",
    clickupdiscipline: "clickup",
    timeefficiency: "timeEfficiency",
  };
  return lookup[normalised] || "overall";
};

export const buildLeaderboard = (evaluations = [], month = "All", metric = "Overall") => {
  const focusKey = metricFocusKey(metric);
  const filtered = month === "All" || month === "All Time"
    ? evaluations
    : evaluations.filter((evaluation) => evaluation.session?.month === month);

  const grouped = new Map();

  filtered.forEach((evaluation) => {
    const session = evaluation.session;
    if (!session) return;
    const key = session.presenter?._id?.toString() || session.presenterName;
    const existing = grouped.get(key) || {
      trainerId: session.presenter?._id || null,
      trainer: session.presenterName,
      avatar: session.presenter?.avatar || "",
      sessions: 0,
      scores: [],
      focusScores: [],
      bestScore: 0,
      worstScore: 5,
      trend: [],
    };

    const overallScore = Number(evaluation.overallScore || 0);
    const metricScore = focusKey === "overall" ? overallScore : Number(normaliseScores(evaluation.scores)[focusKey] || 0);
    existing.sessions += 1;
    existing.scores.push(overallScore);
    existing.focusScores.push(metricScore);
    existing.trend.push(overallScore);
    existing.bestScore = Math.max(existing.bestScore, overallScore);
    existing.worstScore = Math.min(existing.worstScore, overallScore);
    grouped.set(key, existing);
  });

  return [...grouped.values()]
    .map((trainer) => ({
      ...trainer,
      avgScore: average(trainer.scores),
      focusScore: average(trainer.focusScores),
      bestScore: round(trainer.bestScore),
      worstScore: trainer.worstScore === 5 && !trainer.scores.length ? 0 : round(trainer.worstScore),
      grade: getGrade(focusKey === "overall" ? average(trainer.scores) : average(trainer.focusScores)),
      verdict: getVerdict(focusKey === "overall" ? average(trainer.scores) : average(trainer.focusScores)),
    }))
    .sort((a, b) => b.focusScore - a.focusScore || b.sessions - a.sessions || b.bestScore - a.bestScore)
    .map((trainer, index) => ({ ...trainer, rank: index + 1 }));
};

export const buildMonthlyWinners = (evaluations = []) => {
  return PROGRAMME_MONTHS.map((month) => {
    const leaderboard = buildLeaderboard(evaluations, month);
    const winner = leaderboard[0] || null;
    return {
      month,
      winner: winner?.trainer || "TBD",
      trainerId: winner?.trainerId || null,
      score: winner?.avgScore || 0,
      badge: winner ? `${month} Champion` : "Awaiting sessions",
    };
  });
};

export const buildMetricBreakdown = (evaluations = [], month = "All") => {
  const filtered = month === "All" || month === "All Time"
    ? evaluations
    : evaluations.filter((evaluation) => evaluation.session?.month === month);

  return SCORE_KEYS.map((key) => ({
    metric: SCORE_LABELS[key],
    score: average(filtered.map((evaluation) => normaliseScores(evaluation.scores)[key] || 0)),
  }));
};
