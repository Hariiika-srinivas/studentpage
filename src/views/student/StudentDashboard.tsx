import React, { useState, useMemo } from 'react';
import {
  Bus,
  BusStop,
  CampusRoute,
  UserProfile,
  SmartCommuteAdvice,
  NotificationItem,
} from '../../types';
import { computeSmartCommuteAdvice } from '../../services/smartCommute';
import { LiveBusMap } from '../../components/map/LiveBusMap';
import { SmartCommuteCard } from '../../components/commute/SmartCommuteCard';
import { RouteTimeline } from '../../components/route/RouteTimeline';
import {
  MapPin,
  Bus as BusIcon,
  Clock,
  Gauge,
  Users,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  QrCode,
  ArrowRight,
  Star,
  CheckCircle2,
  RefreshCw,
  Bell,
  Navigation,
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: UserProfile;
  buses: Bus[];
  stops: BusStop[];
  routes: CampusRoute[];
  selectedStopId: string;
  selectedBusId: string;
  onSelectStop: (stopId: string) => void;
  onSelectBus: (busId: string) => void;
  onNavigate: (path: string) => void;
  isDarkMode: boolean;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  buses,
  stops,
  routes,
  selectedStopId,
  selectedBusId,
  onSelectStop,
  onSelectBus,
  onNavigate,
  isDarkMode,
}) => {
  // Target Stop
  const targetStop = stops.find((s) => s.id === selectedStopId) || stops[3]; // Default Gandhi Nagar

  // Selected or best-matched Bus for this stop
  const primaryBus =
    buses.find((b) => b.id === selectedBusId) ||
    buses.find((b) => b.routeId === 'route-a') ||
    buses[0];

  const primaryRoute =
    routes.find((r) => r.id === primaryBus.routeId) || routes[0];

  // Calculate Smart Commute Advice
  const advice: SmartCommuteAdvice = useMemo(() => {
    return computeSmartCommuteAdvice(
      primaryBus,
      targetStop,
      buses,
      stops,
      primaryRoute.stops
    );
  }, [primaryBus, targetStop, buses, stops, primaryRoute]);

  const [isFavoriteStop, setIsFavoriteStop] = useState(
    currentUser.favoriteStopId === selectedStopId
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Greeting & Commute Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Good morning, {currentUser.name.split(' ')[0]} 👋
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's your live campus commute intelligence for today.
          </p>
        </div>

        {/* Quick Stop Selector & Favorite Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Boarding Stop:
            </span>
            <select
              value={selectedStopId}
              onChange={(e) => onSelectStop(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-2"
            >
              {stops.map((s) => (
                <option key={s.id} value={s.id} className="dark:bg-slate-900">
                  {s.name} ({s.averageWalkingTimeMinutes}m walk)
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsFavoriteStop(!isFavoriteStop)}
              title="Save as default favorite stop"
              className={`p-1 rounded-lg transition-all ${
                isFavoriteStop ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
          </div>

          <button
            onClick={() => onNavigate('/student/pass')}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Digital Pass</span>
          </button>
        </div>
      </div>

      {/* Primary Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Primary Live Map & Quick Bus Switcher */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Bus Metric Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <BusIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Active Bus</span>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                {primaryBus.busNumber}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                {primaryRoute.code}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Stop ETA</span>
              </div>
              <div className="text-base font-black text-blue-600 dark:text-blue-400">
                {advice.etaMinutes} min
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {advice.busDistanceKm} km away
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Speed</span>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                {primaryBus.speed} km/h
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                {primaryBus.status}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>Occupancy</span>
              </div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                {primaryBus.occupancyPercentage}%
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {primaryBus.currentOccupancy}/{primaryBus.capacity} seats
              </span>
            </div>
          </div>

          {/* Interactive Live Bus Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>Ballari Interactive Transit Map</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Updated {primaryBus.lastUpdated}
              </span>
            </div>

            <LiveBusMap
              buses={buses}
              stops={stops}
              routes={routes}
              selectedStopId={selectedStopId}
              selectedBusId={selectedBusId}
              onSelectBus={onSelectBus}
              onSelectStop={onSelectStop}
              isDarkMode={isDarkMode}
              className="h-[440px] w-full"
            />
          </div>

          {/* Route Timeline Component */}
          <RouteTimeline
            route={primaryRoute}
            stops={stops}
            activeBus={primaryBus}
            selectedStopId={selectedStopId}
            onSelectStop={onSelectStop}
          />
        </div>

        {/* Right 5 Cols: SMART COMMUTE DECISION CARD & Quick Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* THE SMART COMMUTE CARD (Main Differentiating Feature) */}
          <SmartCommuteCard
            advice={advice}
            onSelectAlternativeBus={(altBusNum) => {
              const matched = buses.find((b) => b.busNumber === altBusNum);
              if (matched) onSelectBus(matched.id);
            }}
            onOpenPass={() => onNavigate('/student/pass')}
          />

          {/* Alternative Bus Quick Selectors */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
              <span>All Active Ballari Buses</span>
              <span className="text-xs font-normal text-slate-400">Click to switch</span>
            </h3>

            <div className="space-y-2.5">
              {buses.map((bus) => {
                const route = routes.find((r) => r.id === bus.routeId);
                const isSelected = bus.id === primaryBus.id;
                return (
                  <div
                    key={bus.id}
                    onClick={() => onSelectBus(bus.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm"
                        style={{ backgroundColor: route?.color || '#2563EB' }}
                      >
                        {bus.busNumber.replace('BUS-', 'B')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                            {bus.busNumber}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                            {route?.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                          {route?.originName} ➔ Campus
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 block">
                        {bus.speed} km/h
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {bus.occupancyPercentage}% load
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
