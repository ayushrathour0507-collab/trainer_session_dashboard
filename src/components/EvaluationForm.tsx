import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  BOOLEAN_CRITERIA,
  DEPTH_OPTIONS,
  KNOWLEDGE_OPTIONS,
  PRACTICAL_OPTIONS,
  calculateScoreFromFeedback,
  calculateOrganizerScore,
  calculateOverallScore,
  getGrade,
  getGradeLabel,
  getGradeColor,
} from '../lib/scoring';
import { CheckCircle2, Loader2, Sparkles, Trophy } from 'lucide-react';

interface Session {
  id: string;
  topic: string;
  date: string;
  trainer_name: string;
}

export default function EvaluationForm({ onSuccess }: { onSuccess: () => void }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [overallFeedback, setOverallFeedback] = useState('');
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [booleanChecks, setBooleanChecks] = useState<Record<string, boolean>>({});
  const [contentDepth, setContentDepth] = useState(3);
  const [presenterKnowledge, setPresenterKnowledge] = useState(3);
  const [practicalValue, setPracticalValue] = useState(3);
  const [organiserChecks, setOrganiserChecks] = useState({
    check_1: false,
    check_2: false,
    check_3: false,
  });
  const [organiserFeedback, setOrganiserFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [previewScore, setPreviewScore] = useState<number | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, topic, date, trainer_id, trainers(name)')
        .order('date', { ascending: false });

      if (error) throw error;

      const enriched = (data || []).map((session) => ({
        id: session.id,
        topic: session.topic,
        date: session.date,
        trainer_name: (session.trainers as any)?.name || 'Unknown',
      }));

      setSessions(enriched);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const handlePreview = () => {
    const feedbackScore = calculateScoreFromFeedback({
      overall_feedback: overallFeedback,
      attendee_count: attendeeCount,
      started_on_time: booleanChecks.started_on_time || false,
      finished_on_time: booleanChecks.finished_on_time || false,
      had_demos: booleanChecks.had_demos || false,
      had_qa: booleanChecks.had_qa || false,
      was_engaging: booleanChecks.was_engaging || false,
      was_relevant: booleanChecks.was_relevant || false,
      was_clear: booleanChecks.was_clear || false,
      content_depth: contentDepth,
      presenter_knowledge: presenterKnowledge,
      practical_value: practicalValue,
    });

    const orgScore = calculateOrganizerScore({
      ...organiserChecks,
      organiser_feedback: organiserFeedback,
    });

    const overall = calculateOverallScore(feedbackScore, orgScore);
    setPreviewScore(overall);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) {
      setError('Please select a session');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const feedbackScore = calculateScoreFromFeedback({
        overall_feedback: overallFeedback,
        attendee_count: attendeeCount,
        started_on_time: booleanChecks.started_on_time || false,
        finished_on_time: booleanChecks.finished_on_time || false,
        had_demos: booleanChecks.had_demos || false,
        had_qa: booleanChecks.had_qa || false,
        was_engaging: booleanChecks.was_engaging || false,
        was_relevant: booleanChecks.was_relevant || false,
        was_clear: booleanChecks.was_clear || false,
        content_depth: contentDepth,
        presenter_knowledge: presenterKnowledge,
        practical_value: practicalValue,
      });

      const evaluationData = {
        session_id: selectedSession,
        overall_feedback: overallFeedback,
        attendee_count: attendeeCount,
        started_on_time: booleanChecks.started_on_time || false,
        finished_on_time: booleanChecks.finished_on_time || false,
        had_demos: booleanChecks.had_demos || false,
        had_qa: booleanChecks.had_qa || false,
        was_engaging: booleanChecks.was_engaging || false,
        was_relevant: booleanChecks.was_relevant || false,
        was_clear: booleanChecks.was_clear || false,
        content_depth: contentDepth,
        presenter_knowledge: presenterKnowledge,
        practical_value: practicalValue,
        calculated_score: feedbackScore,
        content_quality: Math.round((contentDepth / 5) * 5),
        session_flow: booleanChecks.started_on_time && booleanChecks.finished_on_time ? 5 : booleanChecks.started_on_time || booleanChecks.finished_on_time ? 3 : 1,
        presenter_clarity: booleanChecks.was_clear ? 5 : 3,
        interactivity: booleanChecks.was_engaging ? 5 : 3,
        hands_on_value: booleanChecks.had_demos ? 5 : 3,
        time_management: booleanChecks.started_on_time && booleanChecks.finished_on_time ? 5 : 3,
        relevance: booleanChecks.was_relevant ? 5 : 3,
      };

      const { error: evalError } = await supabase.from('evaluations').insert([evaluationData]);
      if (evalError) throw evalError;

      const { data: existingChecks } = await supabase
        .from('organiser_checks')
        .select('id')
        .eq('session_id', selectedSession)
        .maybeSingle();

      if (existingChecks) {
        const { error: updateError } = await supabase
          .from('organiser_checks')
          .update({ ...organiserChecks, organiser_feedback: organiserFeedback })
          .eq('session_id', selectedSession);
        if (updateError) throw updateError;
      } else {
        const { error: checksError } = await supabase
          .from('organiser_checks')
          .insert([{ session_id: selectedSession, ...organiserChecks, organiser_feedback: organiserFeedback }]);
        if (checksError) throw checksError;
      }

      setSuccess(true);
      setTimeout(() => {
        setOverallFeedback('');
        setAttendeeCount(0);
        setBooleanChecks({});
        setContentDepth(3);
        setPresenterKnowledge(3);
        setPracticalValue(3);
        setOrganiserChecks({ check_1: false, check_2: false, check_3: false });
        setOrganiserFeedback('');
        setPreviewScore(null);
        setSuccess(false);
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit evaluation');
    } finally {
      setLoading(false);
    }
  };

  const toggleBoolean = (key: string) => {
    setBooleanChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    setPreviewScore(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden card-3d">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6">
          <h2 className="text-2xl font-bold text-stone-100">Submit Evaluation</h2>
          <p className="text-slate-300 mt-1 text-sm">Provide your feedback and the system will calculate the score</p>
        </div>

        {success && (
          <div className="mx-8 mt-6 bg-green-50 border border-green-300 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span className="text-green-900 font-medium">Evaluation submitted successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Session Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-white"
            >
              <option value="">-- Select Session --</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.topic} - {session.trainer_name} ({formatDate(session.date)})
                </option>
              ))}
            </select>
          </div>

          {/* Overall Feedback */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Overall Feedback</label>
            <textarea
              value={overallFeedback}
              onChange={(e) => { setOverallFeedback(e.target.value); setPreviewScore(null); }}
              rows={4}
              placeholder="Share your thoughts about the session - what went well, what could improve, key takeaways..."
              className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent resize-none"
            />
          </div>

          {/* Attendee Count */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Number of Attendees</label>
            <input
              type="number"
              min={0}
              max={100}
              value={attendeeCount}
              onChange={(e) => { setAttendeeCount(parseInt(e.target.value) || 0); setPreviewScore(null); }}
              className="w-32 px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            />
          </div>

          {/* Boolean Criteria */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Session Criteria</h3>
            <p className="text-sm text-slate-500 mb-4">Check all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BOOLEAN_CRITERIA.map(({ key, label, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleBoolean(key)}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                    booleanChecks[key]
                      ? 'border-slate-500 bg-slate-50'
                      : 'border-stone-200 bg-white hover:border-stone-200'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    booleanChecks[key] ? 'border-slate-500 bg-slate-500' : 'border-stone-200'
                  }`}>
                    {booleanChecks[key] && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 text-sm">{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rating Scales */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Rating Scales</h3>

            <ScaleInput
              label="Content Depth"
              description="How deeply was the topic covered?"
              value={contentDepth}
              onChange={(v) => { setContentDepth(v); setPreviewScore(null); }}
              options={DEPTH_OPTIONS}
            />

            <ScaleInput
              label="Presenter Knowledge"
              description="How well did the presenter know the topic?"
              value={presenterKnowledge}
              onChange={(v) => { setPresenterKnowledge(v); setPreviewScore(null); }}
              options={KNOWLEDGE_OPTIONS}
            />

            <ScaleInput
              label="Practical Value"
              description="How much can the team apply from this session?"
              value={practicalValue}
              onChange={(v) => { setPracticalValue(v); setPreviewScore(null); }}
              options={PRACTICAL_OPTIONS}
            />
          </div>

          {/* Organiser Checks */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Organiser Checks</h3>
            <p className="text-sm text-slate-500 mb-4">Verified by the organiser</p>
            <div className="space-y-3">
              {[
                { key: 'check_1', label: 'Session started on time and followed schedule' },
                { key: 'check_2', label: 'All required materials and setup were ready' },
                { key: 'check_3', label: 'Session wrapped up properly with Q&A and summary' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-4 border-2 border-stone-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-slate-500 has-[:checked]:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={organiserChecks[key as keyof typeof organiserChecks]}
                    onChange={(e) =>
                      setOrganiserChecks({
                        ...organiserChecks,
                        [key]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-slate-600 rounded focus:ring-2 focus:ring-slate-400"
                  />
                  <span className="text-sm font-medium text-slate-800">{label}</span>
                </label>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-800 mb-2">Organiser Feedback</label>
              <textarea
                value={organiserFeedback}
                onChange={(e) => { setOrganiserFeedback(e.target.value); setPreviewScore(null); }}
                rows={2}
                placeholder="Any additional notes from the organiser..."
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Preview Score */}
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Score Preview</h3>
              <button
                type="button"
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Calculate Score
              </button>
            </div>

            {previewScore !== null ? (
              <div className="flex items-center gap-6">
                <div className={`px-6 py-4 rounded-xl border-2 ${getGradeColor(previewScore)}`}>
                  <div className="text-4xl font-bold">{getGrade(previewScore)}</div>
                  <div className="text-sm font-medium mt-1">{getGradeLabel(previewScore)}</div>
                </div>
                <div className="flex-1">
                  <div className="text-5xl font-bold text-slate-800">{previewScore.toFixed(2)}</div>
                  <div className="text-sm text-slate-500 mt-1">out of 5.00</div>
                </div>
                {previewScore >= 4.0 && (
                  <Trophy className="w-12 h-12 text-yellow-500" />
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Fill in the evaluation above, then click "Calculate Score" to see the result.</p>
            )}
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-500 text-stone-100 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? 'Submitting...' : 'Submit Evaluation'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ScaleInput({
  label,
  description,
  value,
  onChange,
  options,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  options: readonly { value: number; label: string; desc: string }[];
}) {
  return (
    <div className="border border-stone-200 rounded-lg p-4">
      <div className="mb-3">
        <div className="font-medium text-slate-800">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
              value === opt.value
                ? 'border-slate-500 bg-slate-50'
                : 'border-stone-100 hover:border-stone-200'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
              value === opt.value
                ? 'bg-slate-700 text-white'
                : 'bg-gray-100 text-slate-600'
            }`}>
              {opt.value}
            </div>
            <div>
              <div className={`text-sm font-medium ${value === opt.value ? 'text-slate-900' : 'text-slate-800'}`}>
                {opt.label}
              </div>
              <div className="text-xs text-slate-500">{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
