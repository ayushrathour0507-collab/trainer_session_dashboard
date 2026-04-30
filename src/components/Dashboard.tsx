import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import {
  calculateScoreFromFeedback,
  calculateOrganizerScore,
  calculateOverallScore,
  getGrade,
} from '../lib/scoring';
import { Zap, TrendingUp, Users, MessageCircle, Star, Copy, Trash2, ArrowRight } from 'lucide-react';

interface AttendeeFeedback {
  id: string;
  attendee_name: string;
  rating: number;
  what_liked: string;
  what_improve: string;
  key_takeaway: string;
  would_recommend: boolean;
  created_at: string;
}

interface Session {
  id: string;
  date: string;
  topic: string;
  trainer_name: string;
  summarized_feedback: string;
  evaluations: any[];
  organiser_checks: any | null;
  attendee_feedback: AttendeeFeedback[];
}

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [syncNotification, setSyncNotification] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('id, date, topic, summarized_feedback, trainer_id, trainers(name)')
        .order('date', { ascending: false });

      if (sessionError) throw sessionError;

      const enriched: Session[] = await Promise.all(
        (sessionData || []).map(async (session) => {
          const { data: evals } = await supabase
            .from('evaluations')
            .select('*')
            .eq('session_id', session.id);

          const { data: checks } = await supabase
            .from('organiser_checks')
            .select('*')
            .eq('session_id', session.id)
            .maybeSingle();

          const { data: feedback } = await supabase
            .from('attendee_feedback')
            .select('*')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false });

          return {
            id: session.id,
            date: session.date,
            topic: session.topic,
            trainer_name: (session.trainers as any)?.name || 'Unknown',
            summarized_feedback: session.summarized_feedback || '',
            evaluations: evals || [],
            organiser_checks: checks,
            attendee_feedback: (feedback || []) as AttendeeFeedback[],
          };
        })
      );

      setSessions(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useRealtimeSync('sessions', () => {
    setSyncNotification(true);
    loadSessions();
    setTimeout(() => setSyncNotification(false), 3000);
  });

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await supabase.from('sessions').delete().eq('id', sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner text-cyan-500"></div>
          <p className="text-slate-600 font-semibold">Loading sessions...</p>
        </div>
      </div>
    );
  }

  // Stats
  const totalSessions = sessions.length;
  const totalFeedback = sessions.reduce((sum, s) => sum + s.attendee_feedback.length, 0);
  const avgRating = totalFeedback > 0
    ? (sessions.reduce((sum, s) => sum + s.attendee_feedback.reduce((fs, f) => fs + f.rating, 0), 0) / totalFeedback).toFixed(1)
    : 0;
  const totalTrainers = new Set(sessions.map(s => s.trainer_name)).size;

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
        <h1 className="text-headline gradient-text mb-2">Dashboard</h1>
        <p className="text-slate-600 text-lg">Overview of all training sessions and evaluations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-auto">
        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="stat-label">Total Sessions</p>
              <p className="stat-number">{totalSessions}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-cyan-500" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="stat-label">Feedback Submitted</p>
              <p className="stat-number">{totalFeedback}</p>
            </div>
            <MessageCircle className="w-6 h-6 text-pink-500" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="stat-label">Avg Rating</p>
              <p className="stat-number">{avgRating}</p>
            </div>
            <Star className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="stat-label">Active Trainers</p>
              <p className="stat-number">{totalTrainers}</p>
            </div>
            <Users className="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="section-divider"></div>

      {/* Sessions */}
      {sessions.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-semibold">No sessions yet</p>
          <p className="text-slate-500 mt-2">Create your first session to get started</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-subtitle text-slate-900">All Sessions</h2>
          <div className="grid-auto">
            {sessions.map((session) => {
              const evals = session.evaluations || [];
              const feedback = session.attendee_feedback || [];
              let score = 0;
              let grade = '-';

              if (evals.length > 0 && session.organiser_checks) {
                const feedScore = calculateScoreFromFeedback(evals);
                const orgScore = calculateOrganizerScore(session.organiser_checks);
                score = calculateOverallScore(feedScore, orgScore);
                grade = getGrade(score);
              }

              const avgRating = feedback.length > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) : 0;

              return (
                <div key={session.id} className="card p-6 hover:shadow-xl group">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2">{session.topic}</h3>
                      <p className="text-slate-600 font-semibold">{session.trainer_name}</p>
                      <p className="text-xs text-slate-500 mt-2">{new Date(session.date).toLocaleDateString()}</p>
                    </div>
                    {score > 0 && (
                      <div className="bg-gradient-to-br from-cyan-100 to-blue-100 px-4 py-3 rounded-lg text-center">
                        <p className="text-2xl font-black text-cyan-700">{grade}</p>
                        <p className="text-xs text-cyan-600 font-semibold">{score.toFixed(1)}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg mb-4">
                    <div className="text-center">
                      <p className="text-lg font-black text-cyan-600">{evals.length}</p>
                      <p className="text-xs text-slate-600 font-semibold">Evals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-pink-600">{feedback.length}</p>
                      <p className="text-xs text-slate-600 font-semibold">Feedback</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-amber-600">{avgRating}</p>
                      <p className="text-xs text-slate-600 font-semibold">Rating</p>
                    </div>
                  </div>

                  {feedback.length > 0 && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-600 font-semibold mb-1">Latest Feedback</p>
                      <p className="text-sm text-slate-700 line-clamp-2">{feedback[0].what_liked || 'Feedback submitted'}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => copyToClipboard(session.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedId === session.id ? 'Copied!' : 'Copy ID'}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(session.id)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {deleteConfirm === session.id && (
                    <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg space-y-2">
                      <p className="text-sm font-bold text-red-700">Delete this session?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="flex-1 btn-secondary text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="flex-1 btn-accent text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
