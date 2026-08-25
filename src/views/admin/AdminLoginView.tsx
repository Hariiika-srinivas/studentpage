import React, { useState } from 'react';
import { authService } from '../../services/authService';
import {
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  User,
  ArrowLeft,
  Settings,
  Lock,
} from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
  onNavigate: (path: string) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onNavigate,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.loginAdmin(username, password);
      if (res.success) {
        onLoginSuccess();
        onNavigate('/admin/dashboard');
      } else {
        setError(res.error || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setError('Connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to CampusGo Home</span>
        </button>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Accent glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
              <Settings className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Transit Operations Admin
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Master control hub for fleet monitoring, database management, and emergency broadcast
            </p>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div
              id="admin-login-error"
              className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-bold flex items-start gap-2.5 mb-6 animate-in fade-in"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Admin Username / Email:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="admin or transit.ops@campusgo.edu"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Master Access Key:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
            >
              {loading ? (
                <span>Authorizing Master Session...</span>
              ) : (
                <>
                  <span>Open Operations Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('admin123');
                setError(null);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 text-left text-xs flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Master Officer: Prof. S. N. Patil
                </span>
              </div>
              <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                Auto-fill
              </span>
            </button>
          </div>

          {/* Alternate Portals */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
            <button
              onClick={() => onNavigate('/student/login')}
              className="hover:text-blue-600 transition-all"
            >
              Student Portal →
            </button>
            <button
              onClick={() => onNavigate('/driver/login')}
              className="hover:text-blue-600 transition-all"
            >
              Driver Login →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
