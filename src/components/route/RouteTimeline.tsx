import React from 'react';
import { Bus, BusStop, CampusRoute } from '../../types';
import { Check, Clock, MapPin, Navigation2 } from 'lucide-react';

interface RouteTimelineProps {
  route: CampusRoute;
  stops: BusStop[];
  activeBus: Bus;
  selectedStopId: string;
  onSelectStop: (stopId: string) => void;
}

export const RouteTimeline: React.FC<RouteTimelineProps> = ({
  route,
  stops,
  activeBus,
  selectedStopId,
  onSelectStop,
}) => {
  const currentBusStopIndex = activeBus.currentStopIndex;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: route.color }}
            />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              {route.code} Transit Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {route.originName} ➔ {route.destinationName} ({route.totalDistanceKm} km)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-500 dark:text-slate-400">Passed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-slate-500 dark:text-slate-400">Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span className="text-slate-500 dark:text-slate-400">Upcoming</span>
          </div>
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="relative pl-6 space-y-6">
        {/* Connecting Vertical Line */}
        <div className="absolute left-[35px] top-4 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800" />

        {route.stops.map((rs, index) => {
          const stop = stops.find((s) => s.id === rs.stopId);
          if (!stop) return null;

          const isPassed = index < currentBusStopIndex;
          const isCurrentBusPosition = index === currentBusStopIndex;
          const isSelected = stop.id === selectedStopId;

          // Estimated arrival relative to current bus ETA
          const minutesFromCurrent = Math.max(
            0,
            rs.estimatedMinutesFromOrigin - (route.stops[currentBusStopIndex]?.estimatedMinutesFromOrigin || 0) + activeBus.delayMinutes
          );

          return (
            <div
              key={stop.id}
              onClick={() => onSelectStop(stop.id)}
              className={`relative flex items-start gap-4 p-2.5 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {/* Stepper Node Icon */}
              <div
                className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-all ${
                  isPassed
                    ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-200 dark:ring-emerald-950'
                    : isSelected
                    ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-200 dark:ring-blue-900 animate-pulse'
                    : isCurrentBusPosition
                    ? 'bg-amber-500 text-white shadow ring-2 ring-amber-200'
                    : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                }`}
              >
                {isPassed ? (
                  <Check className="w-3.5 h-3.5" />
                ) : isCurrentBusPosition ? (
                  <Navigation2 className="w-3 h-3 rotate-45" />
                ) : isSelected ? (
                  <MapPin className="w-3.5 h-3.5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Stop Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold truncate ${
                        isSelected
                          ? 'text-blue-700 dark:text-blue-400'
                          : isPassed
                          ? 'text-slate-500 dark:text-slate-400 line-through'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {stop.name}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">
                        Your Stop
                      </span>
                    )}
                    {isCurrentBusPosition && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold">
                        Bus Position
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-semibold ${
                        isPassed
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isSelected
                          ? 'text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {isPassed
                        ? 'Passed'
                        : isCurrentBusPosition
                        ? 'Arriving'
                        : `~${minutesFromCurrent} min`}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {stop.landmark} · Walk: {stop.averageWalkingTimeMinutes}m
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
