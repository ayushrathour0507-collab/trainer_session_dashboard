export interface EvaluationData {
  overall_feedback: string;
  attendee_count: number;
  started_on_time: boolean;
  finished_on_time: boolean;
  had_demos: boolean;
  had_qa: boolean;
  was_engaging: boolean;
  was_relevant: boolean;
  was_clear: boolean;
  content_depth: number;
  presenter_knowledge: number;
  practical_value: number;
}

export interface OrganizerChecks {
  check_1: boolean;
  check_2: boolean;
  check_3: boolean;
  organiser_feedback: string;
}

export const DEPTH_OPTIONS = [
  { value: 1, label: 'Surface Level', desc: 'Barely scratched the topic' },
  { value: 2, label: 'Basic', desc: 'Covered fundamentals only' },
  { value: 3, label: 'Moderate', desc: 'Good depth with some detail' },
  { value: 4, label: 'Deep', desc: 'Thorough coverage with examples' },
  { value: 5, label: 'Expert', desc: 'Comprehensive with advanced insights' },
] as const;

export const KNOWLEDGE_OPTIONS = [
  { value: 1, label: 'Unprepared', desc: 'Clearly not prepared' },
  { value: 2, label: 'Shaky', desc: 'Some gaps in knowledge' },
  { value: 3, label: 'Competent', desc: 'Solid understanding of topic' },
  { value: 4, label: 'Strong', desc: 'Deep expertise, handled questions well' },
  { value: 5, label: 'Expert', desc: 'Authoritative, could teach a course' },
] as const;

export const PRACTICAL_OPTIONS = [
  { value: 1, label: 'None', desc: 'No practical takeaways' },
  { value: 2, label: 'Minimal', desc: 'Very few actionable items' },
  { value: 3, label: 'Some', desc: 'A few useful takeaways' },
  { value: 4, label: 'High', desc: 'Many things to apply immediately' },
  { value: 5, label: 'Exceptional', desc: 'Transformative, game-changing insights' },
] as const;

export const BOOLEAN_CRITERIA = [
  { key: 'started_on_time', label: 'Started on Time', desc: 'Session kicked off at the scheduled time' },
  { key: 'finished_on_time', label: 'Finished on Time', desc: 'Session wrapped up within the allotted time' },
  { key: 'had_demos', label: 'Had Live Demos', desc: 'Included hands-on demos or live coding' },
  { key: 'had_qa', label: 'Had Q&A', desc: 'Dedicated time for questions and answers' },
  { key: 'was_engaging', label: 'Was Engaging', desc: 'Session was interactive and kept attention' },
  { key: 'was_relevant', label: 'Was Relevant', desc: 'Topic was relevant to the team\'s work' },
  { key: 'was_clear', label: 'Was Clear', desc: 'Presenter was clear, confident, and easy to follow' },
] as const;

export function calculateScoreFromFeedback(data: EvaluationData): number {
  let score = 0;
  let maxScore = 0;

  // Boolean criteria: 7 checks, each worth up to 1 point (7 points max)
  const booleanChecks = [
    data.started_on_time,
    data.finished_on_time,
    data.had_demos,
    data.had_qa,
    data.was_engaging,
    data.was_relevant,
    data.was_clear,
  ];
  const booleanScore = booleanChecks.filter(Boolean).length;
  score += booleanScore;
  maxScore += 7;

  // Depth scales: 3 scales at 1-5, each worth up to 3 points (9 points max)
  score += (data.content_depth / 5) * 3;
  maxScore += 3;

  score += (data.presenter_knowledge / 5) * 3;
  maxScore += 3;

  score += (data.practical_value / 5) * 3;
  maxScore += 3;

  // Normalize to 5-point scale
  const normalized = (score / maxScore) * 5;
  return Math.round(normalized * 100) / 100;
}

export function calculateOrganizerScore(checks: OrganizerChecks): number {
  const passed = [checks.check_1, checks.check_2, checks.check_3].filter(Boolean).length;
  return passed;
}

export function calculateOverallScore(
  feedbackScore: number,
  organizerChecksPassed: number
): number {
  const feedbackComponent = (feedbackScore / 5) * 5 * 0.7;
  const organizerComponent = (organizerChecksPassed / 3) * 5 * 0.3;
  return Math.round((feedbackComponent + organizerComponent) * 100) / 100;
}

export function getGrade(score: number): string {
  if (score >= 4.5) return 'A+';
  if (score >= 4.0) return 'A';
  if (score >= 3.5) return 'B+';
  if (score >= 3.0) return 'B';
  if (score >= 2.5) return 'C+';
  return 'C';
}

export function getGradeLabel(score: number): string {
  if (score >= 4.5) return 'Outstanding';
  if (score >= 4.0) return 'Excellent';
  if (score >= 3.5) return 'Good';
  if (score >= 3.0) return 'Average';
  if (score >= 2.5) return 'Below Average';
  return 'Poor';
}

export function getGradeColor(score: number): string {
  if (score >= 4.5) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
  if (score >= 4.0) return 'bg-blue-100 text-blue-900 border-blue-300';
  if (score >= 3.5) return 'bg-cyan-100 text-cyan-900 border-cyan-300';
  if (score >= 3.0) return 'bg-yellow-100 text-yellow-900 border-yellow-300';
  if (score >= 2.5) return 'bg-orange-100 text-orange-900 border-orange-300';
  return 'bg-red-100 text-red-900 border-red-300';
}
