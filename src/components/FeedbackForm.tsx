import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle2, Star } from 'lucide-react';

interface Session {
  id: string;
  topic: string;
  date: string;
  trainer_name: string;
}

export default function FeedbackForm({ onSuccess }: { onSuccess: () => void }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [attendeeName, setAttendeeName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [whatLiked, setWhatLiked] = useState('');
  const [whatImprove, setWhatImprove] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) {
      setError('Please select a session');
      return;
    }
    if (rating === 0) {
      setError('Please give a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase.from('attendee_feedback').insert([{
        session_id: selectedSession,
        attendee_name: attendeeName.trim() || 'Anonymous',
        rating,
        what_liked: whatLiked.trim(),
        what_improve: whatImprove.trim(),
        key_takeaway: keyTakeaway.trim(),
        would_recommend: wouldRecommend,
      }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedSession('');
        setAttendeeName('');
        setRating(0);
        setWhatLiked('');
        setWhatImprove('');
        setKeyTakeaway('');
        setWouldRecommend(true);
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card p-8 text-center bg-emerald-50 border-emerald-200">
        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-emerald-700 mb-2">Thank You!</h2>
        <p className="text-emerald-600">Your feedback has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Share Your Feedback</h2>
        <p className="text-slate-600 mb-8">Help us improve our training sessions</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Session *</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-semibold"
              required
            >
              <option value="">Choose a session...</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.topic} - {session.trainer_name} ({new Date(session.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Your Name (optional)</label>
            <input
              type="text"
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              placeholder="Leave blank for anonymous feedback"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-4">Rate This Session *</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && <p className="text-sm font-semibold text-slate-600 mt-2">{rating} out of 5 stars</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">What did you like most?</label>
            <textarea
              value={whatLiked}
              onChange={(e) => setWhatLiked(e.target.value)}
              placeholder="Share what went well..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">What could be improved?</label>
            <textarea
              value={whatImprove}
              onChange={(e) => setWhatImprove(e.target.value)}
              placeholder="Constructive suggestions..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Key Takeaway</label>
            <textarea
              value={keyTakeaway}
              onChange={(e) => setKeyTakeaway(e.target.value)}
              placeholder="What's the main thing you'll remember?"
              rows={2}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
            />
          </div>

          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={wouldRecommend}
              onChange={(e) => setWouldRecommend(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="font-bold text-slate-700">I would recommend this session to others</span>
          </label>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4"
          >
            {loading ? (
              <>
                <div className="spinner w-4 h-4 border-white border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
