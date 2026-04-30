import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Loader2, Trash2, UserPlus, X, Check } from 'lucide-react';

interface Trainer {
  id: string;
  name: string;
  session_count?: number;
}

export default function AddSessionForm({ onSuccess }: { onSuccess: () => void }) {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(getNextSaturday());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [newTrainerName, setNewTrainerName] = useState('');
  const [addingTrainer, setAddingTrainer] = useState(false);
  const [deletingTrainerId, setDeletingTrainerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'session' | 'trainers'>('session');

  useEffect(() => {
    loadTrainers();
  }, []);

  function getNextSaturday(): string {
    const now = new Date();
    const day = now.getDay();
    const daysUntilSat = (6 - day + 7) % 7 || 7;
    const nextSat = new Date(now);
    nextSat.setDate(now.getDate() + daysUntilSat);
    return nextSat.toISOString().split('T')[0];
  }

  const loadTrainers = async () => {
    try {
      const { data, error } = await supabase.from('trainers').select('*').order('name');
      if (error) throw error;

      const trainersWithCounts = await Promise.all(
        (data || []).map(async (t) => {
          const { count } = await supabase
            .from('sessions')
            .select('*', { head: true, count: 'exact' })
            .eq('trainer_id', t.id);
          return { ...t, session_count: count || 0 };
        })
      );

      setTrainers(trainersWithCounts);
    } catch (err) {
      console.error('Failed to load trainers:', err);
    }
  };

  const handleAddTrainer = async () => {
    if (!newTrainerName.trim()) return;
    setAddingTrainer(true);
    setError('');

    try {
      const { data, error: createError } = await supabase
        .from('trainers')
        .insert([{ name: newTrainerName.trim() }])
        .select()
        .single();

      if (createError) throw createError;

      setTrainers((prev) => [...prev, { ...data, session_count: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTrainerName('');
      setShowAddTrainer(false);
      setSelectedTrainer(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add trainer');
    } finally {
      setAddingTrainer(false);
    }
  };

  const handleDeleteTrainer = async (trainerId: string) => {
    const trainer = trainers.find((t) => t.id === trainerId);
    if (!trainer) return;

    if (trainer.session_count && trainer.session_count > 0) {
      setError(`Cannot delete "${trainer.name}" - they have ${trainer.session_count} session(s). Remove their sessions first.`);
      setDeletingTrainerId(null);
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('trainers')
        .delete()
        .eq('id', trainerId);

      if (deleteError) throw deleteError;

      setTrainers((prev) => prev.filter((t) => t.id !== trainerId));
      if (selectedTrainer === trainerId) setSelectedTrainer('');
      setDeletingTrainerId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trainer');
      setDeletingTrainerId(null);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedTrainer) {
        setError('Please select a trainer');
        setLoading(false);
        return;
      }

      const sessionDate = new Date(date);
      const monthStart = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), 1);

      const { error: insertError } = await supabase.from('sessions').insert([
        {
          trainer_id: selectedTrainer,
          date,
          month: monthStart.toISOString().split('T')[0],
          topic,
        },
      ]);

      if (insertError) throw insertError;

      setTopic('');
      setDate(getNextSaturday());
      setSelectedTrainer('');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('session')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
              activeTab === 'session'
                ? 'text-slate-700 border-b-2 border-slate-600 bg-slate-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Session
          </button>
          <button
            onClick={() => setActiveTab('trainers')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
              activeTab === 'trainers'
                ? 'text-slate-700 border-b-2 border-slate-600 bg-slate-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Manage Trainers
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add Session Tab */}
        {activeTab === 'session' && (
          <form onSubmit={handleCreateSession} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Trainer</label>
              <select
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-white"
              >
                <option value="">-- Select Trainer --</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddTrainer(!showAddTrainer)}
                className="mt-2 text-sm text-slate-600 hover:text-slate-700 font-medium"
              >
                {showAddTrainer ? 'Cancel' : '+ Add new trainer'}
              </button>

              {showAddTrainer && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newTrainerName}
                    onChange={(e) => setNewTrainerName(e.target.value)}
                    placeholder="Trainer name"
                    className="flex-1 px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTrainer())}
                  />
                  <button
                    type="button"
                    onClick={handleAddTrainer}
                    disabled={addingTrainer || !newTrainerName.trim()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-500 text-stone-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {addingTrainer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Add
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Session topic"
                required
                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-500 text-stone-100 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </form>
        )}

        {/* Manage Trainers Tab */}
        {activeTab === 'trainers' && (
          <div className="p-6 space-y-4">
            {/* Add Trainer Inline */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTrainerName}
                onChange={(e) => setNewTrainerName(e.target.value)}
                placeholder="New trainer name..."
                className="flex-1 px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTrainer()}
              />
              <button
                onClick={handleAddTrainer}
                disabled={addingTrainer || !newTrainerName.trim()}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-500 text-stone-100 font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {addingTrainer ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Add
              </button>
            </div>

            {/* Trainer List */}
            <div className="space-y-2">
              {trainers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>No trainers yet. Add one above.</p>
                </div>
              ) : (
                trainers.map((trainer) => (
                  <div
                    key={trainer.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-sm">
                        {trainer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{trainer.name}</p>
                        <p className="text-xs text-gray-500">
                          {trainer.session_count || 0} session{(trainer.session_count || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {deletingTrainerId === trainer.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600 font-medium">Delete?</span>
                        <button
                          onClick={() => handleDeleteTrainer(trainer.id)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeletingTrainerId(null)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingTrainerId(trainer.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove trainer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
