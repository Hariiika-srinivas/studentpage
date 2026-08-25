import React, { useState } from 'react';
import { authService } from '../../services/authService';
import {
  Bus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Phone,
  CheckCircle2,
  Radio,
  Sparkles,
  Lock,
} from 'lucide-react';

interface DriverLoginViewProps {
  onLoginSuccess: () => void;
  onNavigate: (path: string) => void;
}

export const DriverLoginView: React.FC<DriverLoginViewProps> = ({
  onLoginSuccess,
  onNavigate,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('9844098765');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.loginDriver(phoneNumber);
      if (res.success) {
        onLoginSuccess();
        onNavigate('/driver/dashboard');
      } else {
        setError(res.error || 'Please enter a valid 10-digit registered phone number.');
      }
    } catch (err) {
      setError('Database connection error occurred. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (phone: string) => {
    setPhoneNumber(phone);
    setError(null);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Accent glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
              <Bus className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Campus Driver Login
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your registered 10-digit mobile number to access your Cockpit, live GPS broadcaster, and pass validator.
            </p>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div
              id="driver-login-error"
              className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-bold flex items-start gap-2.5 mb-6 animate-in fade-in"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold">{error}</p>
                <p className="text-[11px] font-normal text-red-700 dark:text-red-300 mt-0.5">
                  Enter a 10-digit phone number or select a registered driver profile below.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Driver Mobile Number</span>
                <span className="text-[10px] text-slate-400 font-mono">10 Digits</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-bold border-r border-slate-300 dark:border-slate-700 pr-2.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9844098765"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full pl-20 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 tracking-wider"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !phoneNumber}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <span>Verifying Driver Credentials...</span>
              ) : (
                <>
                  <span>Sign In & Open Cockpit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Drivers */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-2.5 text-center">
              Tap to Autofill Registered Driver:
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickFill('9844098765')}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 text-left text-xs flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[10px]">
                    03
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block">
                      Ramesh Kumar
                    </span>
                    <span className="text-[10px] text-slate-400">BUS-03 · Route A (Main Campus)</span>
                  </div>
                </div>
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold group-hover:underline">
                  98440 98765
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('9449011223')}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 text-left text-xs flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                    05
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block">
                      Mallikarjun G.
                    </span>
                    <span className="text-[10px] text-slate-400">BUS-05 · Route B (Ring Road Express)</span>
                  </div>
                </div>
                <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline">
                  94490 11223
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('9845011224')}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-800 text-left text-xs flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-[10px]">
                    01
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block">
                      Suresh Gowda
                    </span>
                    <span className="text-[10px] text-slate-400">BUS-01 · Route C (Kappagal Shuttle)</span>
                  </div>
                </div>
                <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold group-hover:underline">
                  98450 11224
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Supabase Database Verified · Campus Transit Authority</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
