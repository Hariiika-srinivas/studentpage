import React from 'react';
import { SmartCommuteAdvice } from '../../types';
import {
  Clock,
  Footprints,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle2,
  BellRing,
  Bus as BusIcon,
  HelpCircle,
} from 'lucide-react';

interface SmartCommuteCardProps {
  advice: SmartCommuteAdvice;
  onSelectAlternativeBus?: (busNumber: string) => void;
  onOpenPass?: () => void;
}

export const SmartCommuteCard: React.FC<SmartCommuteCardProps> = ({
  advice,
  onSelectAlternativeBus,
  onOpenPass,
}) => {
  const isUrgent = advice.urgencyLevel === 'urgent';
  const isWarning = advice.urgencyLevel === 'warning';
  const isMissed = advice.urgencyLevel === 'missed';

  // Occupancy color
  const occupancyColor =
    advice.occupancyStatus === 'ALMOST_FULL'
      ? 'bg-red-500 text-red-50'
      : advice.occupancyStatus === 'FILLING_UP'
      ? 'bg-amber-500 text-amber-50'
      : 'bg-emerald-500 text-emerald-50';

  const occupancyLabel =
    advice.occupancyStatus === 'ALMOST_FULL'
      ? 'Almost Full'
      : advice.occupancyStatus === 'FILLING_UP'
      ? 'Filling Up'
      : 'Seats Available';

  return (
    <div
      id="smart-commute-card"
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-lg ${
        isMissed
          ? 'border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20'
          : isUrgent
          ? 'border-red-400 dark:border-red-800 bg-gradient-to-br from-red-50/60 to-amber-50/40 dark:from-red-950/30 dark:to-slate-900'
          : isWarning
          ? 'border-amber-400 dark:border-amber-700 bg-gradient-to-br from-amber-50/70 to-blue-50/30 dark:from-amber-950/30 dark:to-slate-900'
          : 'border-blue-200 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-slate-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900'
      }`}
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-600 text-white shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Smart Commute Engine
          </span>
        </div>

        {/* Confidence Badge */}
        <div
          title="Calculated from real-time GPS telemetry, average urban speed & route history"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
        >
          <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          <span>ETA Confidence:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {advice.confidenceScore}% ({advice.confidenceLevel})
          </span>
        </div>
      </div>

      {/* Approaching Notification Banner */}
      {advice.approachingAlertMessage && (
        <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs font-semibold animate-pulse">
          <BellRing className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{advice.approachingAlertMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-6">
        {/* Destination & Selected Bus Context */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Boarding Stop:
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{advice.targetStopName}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold">
                {advice.busNumber} · {advice.routeCode}
              </span>
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Bus Distance:
            </span>
            <div className="text-base font-bold text-slate-800 dark:text-slate-200">
              {advice.busDistanceKm} km away
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION HEADLINE CALLOUT */}
        <div
          className={`p-5 rounded-2xl text-center mb-6 shadow-sm border ${
            isMissed
              ? 'bg-red-600 text-white border-red-700'
              : isUrgent
              ? 'bg-red-600 text-white border-red-700 animate-pulse'
              : isWarning
              ? 'bg-amber-500 text-slate-950 border-amber-600'
              : 'bg-blue-600 text-white border-blue-700'
          }`}
        >
          <span className="text-xs uppercase font-bold tracking-widest opacity-80 block mb-1">
            Recommended Action
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
            {advice.actionHeadline}
          </h2>
          {!isMissed && (
            <p className="text-xs font-medium opacity-90">
              Target Departure: <span className="font-bold underline">{advice.recommendedDepartureTime}</span> (includes {advice.walkingTimeMinutes}m walk + {advice.safetyBufferMinutes}m buffer)
            </p>
          )}
        </div>

        {/* Input Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {/* Bus ETA */}
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Bus ETA</span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {advice.etaMinutes} min
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">At Gandhi Nagar</span>
          </div>

          {/* Walking Time */}
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Footprints className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Walking Time</span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {advice.walkingTimeMinutes} min
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Average pace</span>
          </div>

          {/* Safety Buffer */}
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Safety Buffer</span>
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              +{advice.safetyBufferMinutes} min
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Pre-arrival cushion</span>
          </div>

          {/* Recommended Departure */}
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Leave Home At</span>
            </div>
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">
              {advice.recommendedDepartureTime}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Optimal window</span>
          </div>
        </div>

        {/* Occupancy Indicator Bar */}
        <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 mb-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Bus Occupancy ({advice.occupancyPercent}%)</span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                advice.occupancyStatus === 'ALMOST_FULL'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  : advice.occupancyStatus === 'FILLING_UP'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {occupancyLabel}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                advice.occupancyPercent >= 85
                  ? 'bg-red-500'
                  : advice.occupancyPercent >= 60
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, advice.occupancyPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
            <span>0 (Empty)</span>
            <span>25 (Comfortable)</span>
            <span>50 (Max Capacity)</span>
          </div>
        </div>

        {/* Alternative Bus Recommendation Card */}
        {advice.alternativeBus && (
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <BusIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wide">
                    Alternative Recommendation: {advice.alternativeBus.busNumber}
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-200/80 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold">
                    ETA: {advice.alternativeBus.etaMinutes}m · {advice.alternativeBus.occupancyPercent}% Load
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {advice.alternativeBus.reason}
                </p>
              </div>
            </div>

            {onSelectAlternativeBus && (
              <button
                onClick={() => onSelectAlternativeBus(advice.alternativeBus!.busNumber)}
                className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              >
                <span>Track {advice.alternativeBus.busNumber}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
