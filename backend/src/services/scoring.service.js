/**
 * Purpose: Implements the BytesAndBeyond evaluation formulas, leaderboard insights, verdicts, and feedback post generation.
 */

export const METRICS = [
  { key: "startOnTime", label: "Start On Time", icon: "⏱️", color: "#378ADD" },
  { key: "structure", label: "Structure", icon: "📐", color: "#1D9E75" },
  { key: "interaction", label: "Interaction", icon: "💬", color: "#7B4FFF" },
  { key: "clarity", label: "Clarity", icon: "🎯", color: "#00C896" },
  { key: "practical", label: "Hands-on Practical", icon: "🛠️", color: "#FF6B35" },
  { key: "clickup", label: "Attendee Feedback", icon: "📋", color: "#C9A84C" },
  { key: "timeEfficiency", label: "Time Efficiency", icon: "⏰", color: "#FFA726" },
];

const round = (value) => Math.round(Number(value || 0) * 100) / 100;

export const normaliseScores = (scores = {}) => {
  return {
    startOnTime: Number(scores.startOnTime || 0),
    structure: Number(scores.structure || 0),
    interaction: Number(scores.interaction || 0),
    clarity: Number(scores.clarity || 0),
    practical: Number(scores.practical || 0),
    clickup: Number(scores.clickup ?? scores.clickupDiscipline ?? 0),
    clickupDiscipline: Number(scores.clickup ?? scores.clickupDiscipline ?? 0),
    timeEfficiency: Number(scores.timeEfficiency || 0),
  };
};

export const average = (values = []) => {
  const clean = values.filter((value) => Number.isFinite(Number(value)));
  return clean.length ? round(clean.reduce((sum, value) => sum + Number(value), 0) / clean.length) : 0;
};

export const calculateTotalScore = (scores = {}) => {
  const normalised = normaliseScores(scores);
  return average(METRICS.map((metric) => normalised[metric.key]).filter((value) => Number(value) > 0));
};

export const calculateOrganiserScore = (checks = {}) => {
  const required = ["startedOnTime", "icebreakerDone", "qaDone"];
  const passed = required.filter((key) => Boolean(checks[key])).length;
  return round((passed / 3) * 5);
};

export const calculateOverallScore = (totalScore, organiserScore) => {
  return round((Number(totalScore || 0) * 0.6) + (Number(organiserScore || 0) * 0.4));
};

export const calculateAdminInsightScore = calculateOrganiserScore;

export const getVerdict = (score) => {
  const value = Number(score || 0);
  if (value >= 4.5) return "Excellent";
  if (value >= 3.5) return "Good";
  if (value >= 2.5) return "Average";
  return "Needs Improvement";
};

export const getVerdictMeta = (score) => {
  const value = Number(score || 0);
  if (value >= 4.5) return { label: "Excellent", color: "#1D9E75", icon: "⭐", grade: "A+" };
  if (value >= 3.5) return { label: "Good", color: "#378ADD", icon: "✅", grade: "A" };
  if (value >= 2.5) return { label: "Average", color: "#FFA726", icon: "⚠️", grade: "B" };
  return { label: "Needs Improvement", color: "#E57373", icon: "❌", grade: "C" };
};

export const getGrade = (overallScore) => getVerdictMeta(overallScore).grade;

const standardDeviation = (values = []) => {
  const clean = values.filter((value) => Number.isFinite(Number(value)));
  if (!clean.length) return Number.POSITIVE_INFINITY;
  const mean = average(clean);
  const variance = clean.reduce((sum, value) => sum + ((Number(value) - mean) ** 2), 0) / clean.length;
  return round(Math.sqrt(variance));
};

export const getMostConsistentTrainer = (trainerScores = []) => {
  return trainerScores
    .filter((trainer) => trainer.scores?.length)
    .map((trainer) => ({ ...trainer, stddev: standardDeviation(trainer.scores), avgScore: average(trainer.scores) }))
    .sort((a, b) => a.stddev - b.stddev || b.avgScore - a.avgScore)[0] || null;
};

export const getInsights = (allEvaluations = []) => {
  const byTrainer = new Map();
  const metricAverages = Object.fromEntries(METRICS.map((metric) => [
    metric.key,
    average(allEvaluations.map((evaluation) => normaliseScores(evaluation.scores)[metric.key] || 0)),
  ]));

  allEvaluations.forEach((evaluation) => {
    const trainerName = evaluation.session?.presenterName || "Unknown";
    const record = byTrainer.get(trainerName) || { trainerName, scores: [], sessions: 0 };
    record.scores.push(Number(evaluation.overallScore || 0));
    record.sessions += 1;
    byTrainer.set(trainerName, record);
  });

  const trainers = [...byTrainer.values()].map((trainer) => ({
    ...trainer,
    avgScore: average(trainer.scores),
    bestScore: Math.max(...trainer.scores, 0),
  }));
  const sorted = [...trainers].sort((a, b) => b.avgScore - a.avgScore || b.sessions - a.sessions);
  const improvingTrainer = [...trainers]
    .map((trainer) => ({ ...trainer, improvement: Number(trainer.scores.at(-1) || 0) - Number(trainer.scores[0] || 0) }))
    .sort((a, b) => b.improvement - a.improvement)[0] || null;

  return {
    bestPerformer: sorted[0] || null,
    lowestPerformer: sorted.at(-1) || null,
    mostConsistent: getMostConsistentTrainer(trainers),
    programmeAverage: average(allEvaluations.map((evaluation) => evaluation.overallScore || 0)),
    metricAverages,
    improvingTrainer,
  };
};

export const generateOverallFeedbackPost = (session, evaluation, feedbackSummary = {}) => {
  const strengths = evaluation.adminInsights?.strengths?.filter(Boolean) || [];
  const improvements = evaluation.adminInsights?.improvements?.filter(Boolean) || [];
  const nextActions = evaluation.adminInsights?.recommendedActions?.filter(Boolean) || [];
  const rating = Number(evaluation.overallScore || 0).toFixed(2);
  const totalScore = Number(evaluation.totalScore || 0).toFixed(2);
  const organiserScore = Number(evaluation.adminInsightScore || evaluation.organiserScore || 0).toFixed(2);

  return [
    `BytesAndBeyond overall feedback - ${session.topic}`,
    `Trainer: ${session.presenterName}`,
    `Trainer rating: ${rating}/5 (${evaluation.verdict})`,
    `Rating basis: metric average ${totalScore}/5 at 60% weight + organiser checks ${organiserScore}/5 at 40% weight.`,
    `Attendance: ${evaluation.attendanceCount || session.attendees || 0}; feedback responses: ${evaluation.feedbackCount || feedbackSummary.count || 0}.`,
    strengths.length ? `Strengths: ${strengths.join("; ")}.` : "Strengths: Admin strengths to be confirmed.",
    improvements.length ? `Improvements: ${improvements.join("; ")}.` : "Improvements: Admin improvement notes to be confirmed.",
    evaluation.adminInsights?.deliveryNotes ? `Admin notes: ${evaluation.adminInsights.deliveryNotes}` : "",
    nextActions.length ? `Next actions: ${nextActions.join("; ")}.` : "Next actions: Continue tracking delivery quality in the next KT.",
  ].filter(Boolean).join("\n\n");
};

export default {
  METRICS,
  normaliseScores,
  calculateTotalScore,
  calculateOrganiserScore,
  calculateAdminInsightScore,
  calculateOverallScore,
  getVerdict,
  getVerdictMeta,
  getGrade,
  getMostConsistentTrainer,
  getInsights,
  generateOverallFeedbackPost,
};
