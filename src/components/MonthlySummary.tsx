import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import {
  calculateScoreFromFeedback,
  calculateOrganizerScore,
  calculateOverallScore,
  getGrade,
} from '../lib/scoring';
import { Trophy, Zap, Star, Flame } from 'lucide-react';

interface SessionWithScore {
  id: string;
  topic: string;
  date: string;
  month: string;
  trainer_name: string;
  overallScore: number;
  feedbackScore: number;
  orgChecksPassed: number;
  grade: string;
  evaluationCount: number;
  attendeeCount: number;
  feedback: string;
  attendeeFeedbackCount: number;
  avgAttendeeRating: number;
}

const getAvgEvalScore = (evals: any[]) => {
  if (evals.length === 0) return 0;
  return evals.reduce((sum, e) => sum + (e.score || 0), 0) / evals.length;
};

const formatMonth = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export default function MonthlySummary() {
  const [months, setMonths] = useState<Map<string, SessionWithScore[]>>(new Map());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncNotification, setSyncNotification] = useState(false);

  const loadMonthlyData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id, topic, date, month, trainer_id, trainers(name)')
        .order('month', { ascending: false });

      if (sessionsError) throw sessionsError;

      const monthMap = new Map<string, SessionWithScore[]>();

      for (const session of sessions || []) {
        const { data: evaluations } = await supabase
          .from('evaluations')
          .select('*')
          .eq('session_id', session.id);

        const { data: checks } = await supabase
          .from('organiser_checks')
          .select('*')
          .eq('session_id', session.id)
          .maybeSingle();

        const { data: attendeeFeedback } = await supabase
          .from('attendee_feedback')
          .select('rating, would_recommend')
          .eq('session_id', session.id);

        const evals = evaluations || [];
        const feedback = attendeeFeedback || [];
        let overallScore = 0;
        let feedbackScore = 0;
        let orgChecksPassed = 0;
        let totalAttendees = 0;
        let feedbackText = '';

        if (evals.length > 0 && checks) {
          feedbackScore = getAvgEvalScore(evals);
          orgChecksPassed = calculateOrganizerScore(checks);
          overallScore = calculateOverallScore(feedbackScore, orgChecksPassed);
          totalAttendees = evals.reduce((sum, e) => sum + (e.attendee_count || 0), 0);
          feedbackText = evals.map((e: any) => e.overall_feedback).filter(Boolean).join(' | ');
        }

        const avgAttendeeRating = feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : 0;

        const monthKey = session.month;
        if (!monthMap.has(monthKey)) {
          monthMap.set(monthKey, []);
        }

        monthMap.get(monthKey)!.push({
          id: session.id,
          topic: session.topic,
          date: session.date,
          month: session.month,
          trainer_name: (session.trainers as any)?.name || 'Unknown',
          overallScore,
          feedbackScore,
          orgChecksPassed,
          grade: getGrade(overallScore),
          evaluationCount: evals.length,
          attendeeCount: totalAttendees,
          feedback: feedbackText,
          attendeeFeedbackCount: feedback.length,
          avgAttendeeRating,
        });
      }

      setMonths(monthMap);
      if (monthMap.size > 0) {
        const firstMonth = Array.from(monthMap.keys())[0];
        setSelectedMonth(firstMonth);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load monthly data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonthlyData();
  }, [loadMonthlyData]);

  useRealtimeSync('sessions', () => {
    setSyncNotification(true);
    loadMonthlyData();
    setTimeout(() => setSyncNotification(false), 3000);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner text-cyan-500"></div>
          <p className="text-slate-600 font-semibold">Loading rankings...</p>
        </div>
      </div>
    );
  }

  const currentMonthSessions = selectedMonth ? months.get(selectedMonth) || [] : [];
  const scoredSessions = currentMonthSessions.filter((s) => s.overallScore > 0);
  const sortedSessions = [...scoredSessions].sort((a, b) => b.overallScore - a.overallScore);
  const winner = sortedSessions[0];

  return (
    <div className="space-y-12 animate-fadeInUp">
      {syncNotification && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center gap-3">
          <Zap className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-emerald-700">ClickUp synced!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-red-700 font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-headline gradient-text mb-2">Monthly Rankings</h1>
        <p className="text-slate-600 text-lg">See who's leading this month</p>
      </div>

      {months.size === 0 ? (
        <div className="card p-12 text-center">
          <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-semibold">No rankings yet</p>
          <p className="text-slate-500 mt-2">Complete evaluations to see monthly rankings</p>
        </div>
      ) : (
        <>
          {/* Month Selector */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Select Month</h3>
            <div className="flex gap-2 flex-wrap">
              {Array.from(months.keys()).map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-5 py-3 font-bold rounded-lg transition-all text-sm border-2 ${
                    selectedMonth === month
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-300'
                  }`}
                >
                  {formatMonth(month)}
                </button>
              ))}
            </div>
          </div>

          {/* Winner Section */}
          {winner && (
            <div className="card-gradient p-8 space-y-6 glow-cyan">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-amber-500 animate-bounce" />
                <h2 className="text-subtitle text-slate-900">Monthly Champion</h2>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border-2 border-cyan-200">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-1">
                  {winner.trainer_name}
                </h3>
                <p className="text-slate-600 font-semibold mb-4">{winner.topic}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center border border-cyan-100">
                    <p className="text-lg font-black text-cyan-600">{winner.overallScore.toFixed(1)}</p>
                    <p className="text-xs text-slate-600 font-bold mt-1">Score</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-cyan-100">
                    <p className="text-lg font-black text-cyan-600">{winner.grade}</p>
                    <p className="text-xs text-slate-600 font-bold mt-1">Grade</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-cyan-100">
                    <p className="text-lg font-black text-pink-600">{winner.avgAttendeeRating.toFixed(1)}</p>
                    <p className="text-xs text-slate-600 font-bold mt-1">Rating</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-cyan-100">
                    <p className="text-lg font-black text-purple-600">{winner.attendeeCount}</p>
                    <p className="text-xs text-slate-600 font-bold mt-1">Attendees</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rankings */}
          {scoredSessions.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-subtitle text-slate-900">Leaderboard</h3>
              <div className="space-y-3">
                {sortedSessions.map((session, index) => {
                  const isTop3 = index < 3;
                  return (
                    <div
                      key={session.id}
                      className={`card p-5 border-2 transition-all ${
                        isTop3 ? 'border-amber-200 bg-amber-50' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-10 h-10 rounded-lg font-bold text-white flex items-center justify-center ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-lg shadow-lg shadow-amber-400/30' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-slate-400' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-500' :
                            'bg-slate-300'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900">{session.trainer_name}</h4>
                            <p className="text-sm text-slate-600">{session.topic}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            {session.grade}
                          </p>
                          <p className="text-xs text-slate-600 font-bold">{session.overallScore.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-slate-600 font-semibold">No evaluated sessions this month</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
