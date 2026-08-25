import React, { useState } from 'react';
import { authService } from '../../services/authService';
import {
  GraduationCap,
  Bus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  KeyRound,
  User,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface StudentLoginViewProps {
  onLoginSuccess: () => void;
  onNavigate: (path: string) => void;
}

export const StudentLoginView: React.FC<StudentLoginViewProps> = ({
  onLoginSuccess,
  onNavigate,
}) => {
  const [usn, setUsn] = useState('3BR21CS007');
  const [fullName, setFullName] = useState('Rahul Sharma');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.loginStudent(usn, fullName);
      if (res.success) {
        onLoginSuccess();
        onNavigate('/student/dashboard');
      } else {
        setError(res.error || 'Invalid USN or Student Name. Contact College Administrator.');
      }
    } catch (err) {
      setError('Connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoUsn: string, demoName: string) => {
    setUsn(demoUsn);
    setFullName(demoName);
    setError(null);
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Student Transit Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your college USN and registered name to access live bus tracking
            </p>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div
              id="student-login-error"
              className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-bold flex items-start gap-2.5 mb-6 animate-in fade-in"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">{error}</p>
                <p className="text-[11px] font-normal text-red-700 dark:text-red-300 mt-0.5">
                  Check with the Ballari Campus transport desk if your USN is newly registered.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>College USN / Roll Number:</span>
                <span className="text-[10px] text-slate-400 font-mono">e.g. 3BR21CS007</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="3BR21CS007"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Student Full Name:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
            >
              {loading ? (
                <span>Validating with Supabase...</span>
              ) : (
                <>
                  <span>Sign In to Student Commute</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Chips */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-2 text-center">
              Quick Verified Demo Students:
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickFill('3BR21CS007', 'Rahul Sharma')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 text-left text-xs flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Rahul Sharma (Route A)
                  </span>
                </div>
                <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                  3BR21CS007
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('3BR21EC019', 'Priya Kulkarni')}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 text-left text-xs flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Priya Kulkarni (Route B)
                  </span>
                </div>
                <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                  3BR21EC019
                </span>
              </button>
            </div>
          </div>

          {/* Security badge footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ballari Campus Transit Network · Real-Time Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
