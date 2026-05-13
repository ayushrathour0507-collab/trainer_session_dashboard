/**
 * Purpose: Shared client-side scoring engine for evaluations, verdicts, leaderboards, insights, and live previews.
 */

export const METRICS = [
  { key: "startOnTime", label: "Start On Time", icon: "\u23F1\uFE0F", color: "var(--info)" },
  { key: "structure", label: "Structure", icon: "\u{1F4D0}", color: "var(--success)" },
  { key: "interaction", label: "Interaction", icon: "\u{1F4AC}", color: "var(--purple)" },
  { key: "clarity", label: "Clarity", icon: "\u{1F3AF}", color: "var(--teal)" },
  { key: "practical", label: "Hands-on Practical", icon: "\u{1F6E0}\uFE0F", color: "var(--orange)" },
  { key: "clickup", label: "Attendee Feedback", icon: "\u{1F4CB}", color: "var(--accent)" },
  { key: "timeEfficiency", label: "Time Efficiency", icon: "\u23F0", color: "var(--warning)" },
];

export const metricLabels = Object.fromEntries(METRICS.map((metric) => [metric.key, metric.label]));

export const legacyMetricMap = {
  clickupDiscipline: "clickup",
};

export const normaliseScores = (scores = {}) => {
  const normalised = {};
  METRICS.forEach((metric) => {
    normalised[metric.key] = Number(metric.key === "clickup" ? (scores.clickup ?? scores.clickupDiscipline ?? 0) : (scores[metric.key] ?? 0));
  });
  return normalised;
};

const round = (value) => Math.round(Number(value || 0) * 100) / 100;

export const average = (values = []) => {
  const clean = values.filter((value) => Number.isFinite(Number(value)));
  return clean.length ? round(clean.reduce((sum, value) => sum + Number(value), 0) / clean.length) : 0;
};

export const calculateTotalScore = (scores = {}) => {
  const normalised = normaliseScores(scores);
  return average(METRICS.map((metric) => normalised[metric.key]).filter((value) => value > 0));
};

export const calculateOrganiserScore = (checks = {}) => {
  const required = ["startedOnTime", "icebreakerDone", "qaDone"];
  const passed = required.filter((key) => Boolean(checks[key])).length;
  return round((passed / 3) * 5);
};

export const calculateOverallScore = (totalScore, organiserScore) => {
  return round((Number(totalScore || 0) * 0.6) + (Number(organiserScore || 0) * 0.4));
};

export const getVerdict = (score) => {
  const value = Number(score || 0);
  if (value >= 4.5) return { label: "Excellent", color: "var(--success)", icon: "\u2B50", grade: "A+" };
  if (value >= 3.5) return { label: "Good", color: "var(--info)", icon: "\u2705", grade: "A" };
  if (value >= 2.5) return { label: "Average", color: "var(--warning)", icon: "\u26A0\uFE0F", grade: "B" };
  return { label: "Needs Improvement", color: "var(--danger)", icon: "\u274C", grade: "C" };
};

export const calculateEvaluationScore = (scores = {}, checks = {}) => {
  const totalScore = calculateTotalScore(scores);
  const organiserScore = calculateOrganiserScore(checks);
  const overallScore = calculateOverallScore(totalScore, organiserScore);
  return { totalScore, organiserScore, overallScore, verdict: getVerdict(overallScore) };
};

export const getVerdictLabel = (score) => getVerdict(score).label;

export const getGrade = (overallScore) => getVerdict(overallScore).grade;

export const scoreClassName = (score) => {
  const value = Number(score || 0);
  if (value >= 4.5) return "score-excellent";
  if (value >= 3.5) return "score-good";
  if (value >= 2.5) return "score-average";
  return "score-low";
};

export const standardDeviation = (values = []) => {
  const clean = values.filter((value) => Number.isFinite(Number(value)));
  if (!clean.length) return Number.POSITIVE_INFINITY;
  const mean = average(clean);
  const variance = clean.reduce((sum, value) => sum + ((Number(value) - mean) ** 2), 0) / clean.length;
  return round(Math.sqrt(variance));
};

export const buildTrainerStats = (sessions = [], evaluations = []) => {
  const byTrainer = new Map();
  sessions.filter((session) => session.status === "Completed").forEach((session) => {
    const trainer = session.presenterName || session.presenter?.name || "TBD";
    const evaluation = evaluations.find((item) => String(item.session?._id || item.session) === String(session._id));
    const score = Number(evaluation?.overallScore || session.overallScore || session.rating || 0);
    const scores = normaliseScores(evaluation?.scores || session.scores || {});
    const record = byTrainer.get(trainer) || {
      trainer,
      initials: session.presenterInitials || trainer.split(" ").map((part) => part[0]).join("").slice(0, 3),
      sessions: [],
      scores: [],
      metricScores: {},
    };
    record.sessions.push(session);
    record.scores.push(score);
    METRICS.forEach((metric) => {
      record.metricScores[metric.key] = [...(record.metricScores[metric.key] || []), scores[metric.key] || 0];
    });
    byTrainer.set(trainer, record);
  });

  return [...byTrainer.values()].map((record) => {
    const avgScore = average(record.scores);
    return {
      ...record,
      sessionsDelivered: record.sessions.length,
      avgScore,
      bestScore: Math.max(...record.scores, 0),
      worstScore: Math.min(...record.scores.filter((value) => value > 0), avgScore || 0),
      metricAverages: Object.fromEntries(METRICS.map((metric) => [metric.key, average(record.metricScores[metric.key] || [])])),
      verdict: getVerdict(avgScore),
    };
  });
};

export const rankTrainers = (trainers = [], metric = "Overall", minSessions = "Any") => {
  const metricKey = METRICS.find((item) => item.label === metric || item.label.includes(metric))?.key;
  const min = minSessions === "Any" ? 0 : Number.parseInt(minSessions, 10) || 0;
  return trainers
    .filter((trainer) => trainer.sessionsDelivered >= min)
    .map((trainer) => ({
      ...trainer,
      focusScore: metricKey ? Number(trainer.metricAverages?.[metricKey] || 0) : Number(trainer.avgScore || 0),
    }))
    .sort((a, b) => b.focusScore - a.focusScore || b.sessionsDelivered - a.sessionsDelivered)
    .map((trainer, index) => ({ ...trainer, rank: index + 1 }));
};

export const getInsights = (trainers = []) => {
  const ranked = rankTrainers(trainers);
  const consistent = [...trainers]
    .filter((trainer) => trainer.scores?.length)
    .sort((a, b) => standardDeviation(a.scores) - standardDeviation(b.scores) || b.avgScore - a.avgScore)[0];
  const improving = [...trainers]
    .map((trainer) => ({ ...trainer, improvement: Number(trainer.scores?.at(-1) || 0) - Number(trainer.scores?.[0] || 0) }))
    .sort((a, b) => b.improvement - a.improvement)[0];

  return {
    bestPerformer: ranked[0] || null,
    lowestPerformer: ranked.at(-1) || null,
    mostConsistent: consistent || null,
    improvingTrainer: improving || null,
    programmeAverage: average(trainers.flatMap((trainer) => trainer.scores || [])),
    metricAverages: Object.fromEntries(METRICS.map((metric) => [
      metric.key,
      average(trainers.map((trainer) => trainer.metricAverages?.[metric.key] || 0)),
    ])),
  };
};

export const calculateAdminInsightScore = calculateOrganiserScore;
