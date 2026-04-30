import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AddSessionForm from './components/AddSessionForm';
import EvaluationForm from './components/EvaluationForm';
import MonthlySummary from './components/MonthlySummary';
import FeedbackForm from './components/FeedbackForm';
import { Activity, Calendar, BarChart3, MessageCircle, Trophy, LogOut, Menu, X } from 'lucide-react';
import { supabase } from './lib/supabase';

type View = 'dashboard' | 'add-session' | 'evaluate' | 'feedback' | 'summary';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkAuth();
  }, []);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setView('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) {
    return <AuthPage onSuccess={() => setUser(true)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 blur-bg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Bytes & Beyond
                </h1>
                <p className="text-xs text-slate-500 font-semibold">Evaluation Platform</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavButton
                label="Dashboard"
                active={view === 'dashboard'}
                onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
                icon={<BarChart3 className="w-4 h-4" />}
              />
              <NavButton
                label="Sessions"
                active={view === 'add-session'}
                onClick={() => { setView('add-session'); setMobileMenuOpen(false); }}
                icon={<Calendar className="w-4 h-4" />}
              />
              <NavButton
                label="Evaluate"
                active={view === 'evaluate'}
                onClick={() => { setView('evaluate'); setMobileMenuOpen(false); }}
                icon={<BarChart3 className="w-4 h-4" />}
              />
              <NavButton
                label="Feedback"
                active={view === 'feedback'}
                onClick={() => { setView('feedback'); setMobileMenuOpen(false); }}
                icon={<MessageCircle className="w-4 h-4" />}
              />
              <NavButton
                label="Rankings"
                active={view === 'summary'}
                onClick={() => { setView('summary'); setMobileMenuOpen(false); }}
                icon={<Trophy className="w-4 h-4" />}
              />
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-900" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-900" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-2 pb-4">
              <MobileNavButton
                label="Dashboard"
                active={view === 'dashboard'}
                onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
                icon={<BarChart3 className="w-4 h-4" />}
              />
              <MobileNavButton
                label="Sessions"
                active={view === 'add-session'}
                onClick={() => { setView('add-session'); setMobileMenuOpen(false); }}
                icon={<Calendar className="w-4 h-4" />}
              />
              <MobileNavButton
                label="Evaluate"
                active={view === 'evaluate'}
                onClick={() => { setView('evaluate'); setMobileMenuOpen(false); }}
                icon={<BarChart3 className="w-4 h-4" />}
              />
              <MobileNavButton
                label="Feedback"
                active={view === 'feedback'}
                onClick={() => { setView('feedback'); setMobileMenuOpen(false); }}
                icon={<MessageCircle className="w-4 h-4" />}
              />
              <MobileNavButton
                label="Rankings"
                active={view === 'summary'}
                onClick={() => { setView('summary'); setMobileMenuOpen(false); }}
                icon={<Trophy className="w-4 h-4" />}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {view === 'dashboard' && <Dashboard key={refreshKey} />}
        {view === 'add-session' && <AddSessionForm onSuccess={handleRefresh} />}
        {view === 'evaluate' && <EvaluationForm onSuccess={handleRefresh} />}
        {view === 'feedback' && <FeedbackForm key={refreshKey} onSuccess={handleRefresh} />}
        {view === 'summary' && <MonthlySummary key={refreshKey} />}
      </main>
    </div>
  );
}

function NavButton({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-lg transition-all ${
        active
          ? 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNavButton({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-lg transition-all ${
        active
          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function AuthPage({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background shapes */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-200 to-blue-300 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-pink-200 to-purple-300 opacity-20 blur-3xl"></div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl w-full items-center">
          {/* Left side - Branding */}
          <div className="hidden md:block space-y-8 animate-slideInLeft">
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-2xl">
                <Activity className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-title gradient-text-blue">Bytes & Beyond</h1>
                <p className="text-slate-600 mt-3 text-lg">Premium trainer evaluation platform</p>
              </div>
            </div>

            <div className="space-y-5">
              <FeatureItem icon="✨" text="Real-time evaluations and feedback" />
              <FeatureItem icon="🏆" text="Monthly trainer rankings" />
              <FeatureItem icon="📊" text="Comprehensive analytics" />
              <FeatureItem icon="🔄" text="ClickUp integration" />
            </div>
          </div>

          {/* Right side - Form */}
          <div className="card p-8 space-y-6 animate-fadeInUp">
            <div>
              <h2 className="text-title text-slate-900">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="text-slate-600 mt-2">{isSignUp ? 'Get started today' : 'Sign in to continue'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-700 font-semibold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-lg py-4"
              >
                {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="section-divider"></div>

            <div className="text-center">
              <p className="text-slate-600 font-semibold">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-cyan-600 font-bold hover:text-blue-600 transition-colors"
                >
                  {isSignUp ? 'Sign in' : 'Create one'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-2xl">{icon}</span>
      <span className="text-slate-700 font-semibold">{text}</span>
    </div>
  );
}

export default App;
