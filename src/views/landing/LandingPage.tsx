import React from 'react';
import { UserRole } from '../../types';
import {
  Bus,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Smartphone,
  BarChart3,
  ArrowRight,
  Navigation,
  CheckCircle2,
  Users,
  BellRing,
  Activity,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onSelectRole: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSelectRole,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 dark:bg-blue-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Campus Transit · Ballari, Karnataka</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Never Miss Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  Campus Bus
                </span>{' '}
                Again.
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Track your bus in real-time, predict precise arrival times, and know exactly when to leave your door with proactive commute intelligence.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => {
                    onSelectRole('student');
                    onNavigate('/student/dashboard');
                  }}
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Track My Bus</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    onSelectRole('admin');
                    onNavigate('/admin/demo');
                  }}
                  className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-sm flex items-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Launch Live Simulator</span>
                </button>
              </div>

              {/* Quick Role Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold">Explore interface as:</span>
                <button
                  onClick={() => {
                    onSelectRole('student');
                    onNavigate('/student/dashboard');
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-200 transition-all"
                >
                  🧑‍🎓 Student
                </button>
                <button
                  onClick={() => {
                    onSelectRole('driver');
                    onNavigate('/driver/dashboard');
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-200 transition-all"
                >
                  🚍 Driver
                </button>
                <button
                  onClick={() => {
                    onSelectRole('admin');
                    onNavigate('/admin/dashboard');
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-200 transition-all"
                >
                  🛠️ Admin Ops
                </button>
              </div>
            </div>

            {/* Right Realistic Ballari Tracking Mock Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 shadow-2xl border border-slate-800">
                {/* Top Bus Pill */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-lg">
                      B3
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">BUS-03</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          ON TIME
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Route A · Ballari Central Express</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Distance</span>
                    <p className="text-sm font-bold text-slate-200">1.8 km away</p>
                  </div>
                </div>

                {/* Smart Decision Callout Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-4 shadow-md">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block mb-0.5">
                    Smart Commute Recommendation
                  </span>
                  <div className="text-2xl font-black tracking-tight mb-1">
                    LEAVE IN 2 MINUTES
                  </div>
                  <p className="text-xs text-blue-100">
                    Bus ETA is 7 min · Walking time is 3 min · Safety buffer: +2 min
                  </p>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Target Stop</span>
                    <span className="font-bold text-white truncate block">Gandhi Nagar</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Speed</span>
                    <span className="font-bold text-white">32 km/h</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Occupancy</span>
                    <span className="font-bold text-emerald-400">72% (Seats OK)</span>
                  </div>
                </div>

                {/* Approaching Notification Sample */}
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-2.5 text-amber-300 text-xs">
                  <BellRing className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                  <span>BUS-03 is approaching Gandhi Nagar in ~4 minutes.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
              Engineered For Modern Higher-Ed Campuses
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              A Complete Intelligence Layer Over Campus Transportation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-md">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Live Realtime Tracking
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                View live bus coordinates on interactive Ballari street maps with real vehicle speed, heading, and delay telemetry.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Smart Commute Departure Advisory
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Tells students exactly when to step out the door by synthesizing live bus distance, walking time, safety buffers, and traffic conditions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-md">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Live Occupancy & Alternate Buses
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Know passenger load in advance. If a bus is nearing 85% capacity, CampusGo recommends comfortable alternative buses automatically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-md">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Approaching & Missed Bus Alerts
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Receive proactive alerts when your bus is 1 km, 500 m, and 200 m away. If you miss a bus, get instant rerouting advice.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4 shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Digital Pass & QR Verification
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Student bus passes with tamper-proof QR codes scanned directly through the driver's browser camera without expensive hardware.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-4 shadow-md">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Campus Operations & Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Comprehensive fleet operations dashboard for college administration with on-time performance charts, delay heatmaps, and emergency SOS response.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Make Your Campus Transportation Smarter.
          </h2>
          <p className="text-base text-slate-300 max-w-2xl mx-auto">
            Ready to experience reliable college transit? Switch between Student, Driver, and Admin roles to explore the live system.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                onSelectRole('student');
                onNavigate('/student/dashboard');
              }}
              className="px-8 py-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm shadow-xl transition-all"
            >
              Open Student Portal
            </button>
            <button
              onClick={() => {
                onSelectRole('admin');
                onNavigate('/admin/demo');
              }}
              className="px-8 py-4 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shadow-xl transition-all"
            >
              Run Interactive Demo Simulator
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
