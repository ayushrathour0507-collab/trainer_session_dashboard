/**
 * Purpose: Admin post-session evaluation entry with mandatory organiser insights, live scoring, and trainer-portal publishing.
 */
import confetti from "canvas-confetti";
import { Copy, Save, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
import LiveScorePreview from "../../components/evaluation/LiveScorePreview.jsx";
import MetricSlider from "../../components/evaluation/MetricSlider.jsx";
import OrganiserChecklist from "../../components/evaluation/OrganiserChecklist.jsx";
import TranscriptAnalyzer from "../../components/evaluation/TranscriptAnalyzer.jsx";
import { useEvaluationStore } from "../../store/evaluationStore.js";
import { useSessionStore } from "../../store/sessionStore.js";
import { calculateEvaluationScore, METRICS, normaliseScores } from "../../utils/scoring.js";
import { analyzeTranscript } from "../../utils/transcriptAnalyzer.js";

const defaultScores = Object.fromEntries(METRICS.map((metric) => [metric.key, 3]));

const defaultChecks = {
  startedOnTime: false,
  completedOnTime: false,
  icebreakerDone: false,
  qaDone: false,
};

const defaultInsights = {
  strengths: "Clear explanation\nPractical examples were useful",
  improvements: "Add more audience checkpoints\nKeep debugging time boxed",
  audienceEngagement: "Q&A and trainer participation were observed during the session.",
  deliveryNotes: "The trainer covered the KT topic with enough structure for peer learning.",
  recommendedActions: "Share recap notes\nAdd one hands-on checkpoint in the next session",
};

const splitLines = (value) => String(value || "").split("\n").map((item) => item.trim()).filter(Boolean);

const readableError = (error, fallback) => {
  const detail = error.response?.data?.error;
  if (Array.isArray(detail) && detail.length) return detail.join("; ");
  return error.response?.data?.message || fallback;
};

const EvaluationEntry = () => {
  const { sessionId } = useParams();
  const { selectedSession, fetchSession } = useSessionStore();
  const { evaluation, loading, fetchEvaluation, saveEvaluation, publishEvaluation } = useEvaluationStore();
  const [scores, setScores] = useState(defaultScores);
  const [checks, setChecks] = useState(defaultChecks);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [adminInsights, setAdminInsights] = useState(defaultInsights);
  const [publishOpen, setPublishOpen] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [transcriptFileName, setTranscriptFileName] = useState("");
  const [transcriptAnalysis, setTranscriptAnalysis] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchSession(sessionId), fetchEvaluation(sessionId)]);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load evaluation");
      }
    };
    load();
  }, [fetchEvaluation, fetchSession, sessionId]);

  useEffect(() => {
    if (!evaluation) return;
    setScores({ ...defaultScores, ...normaliseScores(evaluation.scores || {}) });
    setChecks({ ...defaultChecks, ...(evaluation.organiserChecks || {}) });
    setAttendanceCount(Number(evaluation.attendanceCount || selectedSession?.attendees || 0));
    setFeedbackCount(Number(evaluation.feedbackCount || selectedSession?.feedbackCount || 0));
    setRemarks(evaluation.remarks || "");
    setAdminInsights({
      strengths: (evaluation.adminInsights?.strengths || []).join("\n") || defaultInsights.strengths,
      improvements: (evaluation.adminInsights?.improvements || []).join("\n") || defaultInsights.improvements,
      audienceEngagement: evaluation.adminInsights?.audienceEngagement || defaultInsights.audienceEngagement,
      deliveryNotes: evaluation.adminInsights?.deliveryNotes || evaluation.remarks || defaultInsights.deliveryNotes,
      recommendedActions: (evaluation.adminInsights?.recommendedActions || []).join("\n") || defaultInsights.recommendedActions,
    });
  }, [evaluation, selectedSession?.attendees, selectedSession?.feedbackCount]);

  useEffect(() => {
    if (!evaluation && selectedSession) {
      setAttendanceCount(Number(selectedSession.attendees || 0));
      setFeedbackCount(Number(selectedSession.feedbackCount || 0));
      setScores({ ...defaultScores, ...normaliseScores(selectedSession.scores || {}) });
    }
  }, [evaluation, selectedSession]);

  const preview = useMemo(() => calculateEvaluationScore(scores, checks), [checks, scores]);
  const insightPayload = useMemo(() => ({
    strengths: splitLines(adminInsights.strengths),
    improvements: splitLines(adminInsights.improvements),
    audienceEngagement: adminInsights.audienceEngagement,
    deliveryNotes: adminInsights.deliveryNotes,
    recommendedActions: splitLines(adminInsights.recommendedActions),
  }), [adminInsights]);

  const overallFeedbackPost = useMemo(() => [
    `BytesAndBeyond overall feedback - ${selectedSession?.topic || "Session"}`,
    `Trainer: ${selectedSession?.presenterName || "TBD"}`,
    `Overall rating: ${preview.overallScore.toFixed(2)}/5 (${preview.verdict.label}, Grade ${preview.verdict.grade})`,
    `Rating basis: attendee feedback metrics carry 60% impact and mandatory admin insights carry 40% impact.`,
    `Attendance: ${attendanceCount}; feedback responses collected: ${feedbackCount}.`,
    `Strengths: ${insightPayload.strengths.join("; ") || "To be updated"}.`,
    `Improvements: ${insightPayload.improvements.join("; ") || "To be updated"}.`,
    `Admin note: ${adminInsights.deliveryNotes}`,
    `Recommended actions: ${insightPayload.recommendedActions.join("; ") || "Continue the same cadence"}.`,
  ].join("\n\n"), [adminInsights.deliveryNotes, attendanceCount, feedbackCount, insightPayload, preview, selectedSession?.presenterName, selectedSession?.topic]);

  const payload = () => ({
    scores: {
      ...scores,
      clickupDiscipline: scores.clickup,
    },
    organiserChecks: checks,
    attendanceCount: Number.isFinite(Number(attendanceCount)) ? Number(attendanceCount) : 0,
    feedbackCount: Number.isFinite(Number(feedbackCount)) ? Number(feedbackCount) : 0,
    remarks,
    adminInsights: insightPayload,
  });

  const save = async () => {
    try {
      await saveEvaluation(sessionId, payload());
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.35 } });
      toast.success("Evaluation saved");
    } catch (error) {
      toast.error(readableError(error, "Evaluation save failed"));
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(evaluation?.overallFeedbackPost || overallFeedbackPost);
    toast.success("Overall feedback copied");
  };

  const publish = async () => {
    try {
      await saveEvaluation(sessionId, payload());
      await publishEvaluation(sessionId);
      setPublishOpen(false);
      toast.success("Published. Trainer can now see anonymous responses and overall rating.");
    } catch (error) {
      toast.error(readableError(error, "Publish failed"));
    }
  };

  const applyTranscript = () => {
    const clean = transcriptText.trim();
    if (clean.length < 80) {
      toast.error("Transcript text is too short to analyse");
      return;
    }

    const analysis = analyzeTranscript(clean, selectedSession || {});
    setTranscriptAnalysis(analysis);
    setScores((current) => ({ ...current, ...analysis.scores }));
    setChecks((current) => ({ ...current, ...analysis.checks }));
    if (analysis.speakerCount > attendanceCount) setAttendanceCount(analysis.speakerCount);
    setAdminInsights({
      strengths: analysis.insights.strengths.join("\n"),
      improvements: analysis.insights.improvements.join("\n"),
      audienceEngagement: analysis.insights.audienceEngagement,
      deliveryNotes: analysis.insights.deliveryNotes,
      recommendedActions: analysis.insights.recommendedActions.join("\n"),
    });
    setRemarks((current) => current || `Transcript analysed with ${analysis.confidence}% confidence.`);
    toast.success("Transcript analysis applied");
  };

  if (loading && !selectedSession) return <LoadingSpinner label="Loading evaluation" />;

  return (
    <div className="space-y-4">
      <div className="nexus-card p-4">
        <p className="label-tag text-accent">Post-session insight</p>
        <h1 className="text-2xl font-black text-textPrimary">{selectedSession?.topic || "Session evaluation"}</h1>
        <p className="mt-1 text-sm font-bold text-textSecondary">{selectedSession?.presenterName || "TBD"} - {selectedSession?.day || ""} {selectedSession?.date ? new Date(selectedSession.date).toLocaleDateString() : ""}</p>
      </div>

      <section className="grid gap-4 xl:grid-cols-[0.4fr_0.6fr]">
        <aside className="space-y-4">
          <TranscriptAnalyzer
            value={transcriptText}
            onChange={setTranscriptText}
            onAnalyze={applyTranscript}
            analysis={transcriptAnalysis}
            fileName={transcriptFileName}
            onFileName={setTranscriptFileName}
          />

          <div className="nexus-card p-4">
            <p className="label-tag text-accent">Session Controls</p>
            <h2 className="mb-3 text-xl font-semibold">Admin Checklist</h2>
            <OrganiserChecklist value={checks} onChange={setChecks} />
            <button
              type="button"
              className={`mt-3 flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${checks.completedOnTime ? "border-accent bg-accent/10" : "border-border bg-surface/40 hover:bg-surface/70"}`}
              onClick={() => setChecks({ ...checks, completedOnTime: !checks.completedOnTime })}
            >
              <span className="font-semibold">Completed Within 60 Minutes</span>
              <span className={`rounded-pill px-3 py-1 text-xs font-bold ${checks.completedOnTime ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{checks.completedOnTime ? "Yes" : "No"}</span>
            </button>
          </div>

          <div className="nexus-card grid gap-3 p-4">
            <label>
              <span className="label-tag mb-1 block">Attendance</span>
              <input className="field" type="number" min="0" value={attendanceCount} onChange={(event) => setAttendanceCount(Number(event.target.value))} />
            </label>
            <label>
              <span className="label-tag mb-1 block">Feedback Responses</span>
              <input className="field" type="number" min="0" value={feedbackCount} onChange={(event) => setFeedbackCount(Number(event.target.value))} />
            </label>
            <label>
              <span className="label-tag mb-1 block">Remarks</span>
              <textarea className="field min-h-28" value={remarks} onChange={(event) => setRemarks(event.target.value)} />
            </label>
          </div>

          <div className="nexus-card grid gap-3 p-4">
            <p className="label-tag text-accent">Mandatory Admin Insights</p>
            {[
              ["strengths", "Strengths"],
              ["improvements", "Improvements"],
              ["audienceEngagement", "Audience Engagement"],
              ["deliveryNotes", "Delivery Notes"],
              ["recommendedActions", "Recommended Actions"],
            ].map(([key, label]) => (
              <label key={key}>
                <span className="label-tag mb-1 block">{label}</span>
                <textarea className="field min-h-24" value={adminInsights[key]} onChange={(event) => setAdminInsights({ ...adminInsights, [key]: event.target.value })} />
              </label>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-2">
            {METRICS.map((metric) => (
              <MetricSlider key={metric.key} metric={metric} value={Number(scores[metric.key] || 1)} onChange={(value) => setScores({ ...scores, [metric.key]: value })} />
            ))}
          </div>
          <LiveScorePreview scores={scores} checks={checks} />
          <div className="nexus-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="label-tag text-accent">Publish Preview</p>
                <h2 className="text-xl font-semibold">Overall Feedback Post</h2>
              </div>
              <button type="button" className="secondary-button px-3" onClick={copy}><Copy className="h-4 w-4" /> Copy</button>
            </div>
            <textarea className="field min-h-64 font-mono text-sm" readOnly value={evaluation?.overallFeedbackPost || overallFeedbackPost} />
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 z-20 flex flex-wrap justify-end gap-2">
        <button type="button" className="secondary-button px-5" onClick={() => setPublishOpen(true)}><Send className="h-4 w-4" /> Publish To Trainer</button>
        <button type="button" className="primary-button px-5" onClick={save}><Save className="h-4 w-4" /> Save Evaluation</button>
      </div>

      {publishOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="nexus-card max-h-[92vh] w-full max-w-2xl overflow-auto p-4">
            <p className="label-tag text-accent">Publish Feedback</p>
            <h2 className="text-xl font-black text-textPrimary">Publish collective response?</h2>
            <p className="mt-2 text-sm font-bold text-textSecondary">The trainer will see the overall rating and one-by-one anonymous responses only after you publish this summary.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface/50 p-3">
                <p className="label-tag">Session completed on time?</p>
                <p className="mt-2 text-xl font-black text-textPrimary">{checks.completedOnTime ? "Yes" : "No"}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface/50 p-3">
                <p className="label-tag">Started on time?</p>
                <p className="mt-2 text-xl font-black text-textPrimary">{checks.startedOnTime ? "Yes" : "No"}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface/50 p-3">
                <p className="label-tag">Feedback collected</p>
                <p className="mt-2 text-xl font-black text-textPrimary">{feedbackCount}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface/50 p-3">
                <p className="label-tag">Final rating</p>
                <p className="mt-2 text-xl font-black text-accent">{preview.overallScore.toFixed(2)}/5</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="secondary-button px-4" onClick={() => setPublishOpen(false)}>Cancel</button>
              <button type="button" className="primary-button px-4" onClick={publish}>Publish Summary</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default EvaluationEntry;
