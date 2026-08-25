import React, { useState, useEffect, useRef } from 'react';
import {
  Bus,
  BusStop,
  CampusRoute,
  UserProfile,
  Trip,
} from '../../types';
import { store } from '../../services/store';
import {
  Navigation,
  Play,
  CheckCircle2,
  Square,
  AlertOctagon,
  Users,
  Plus,
  Minus,
  Radio,
  Clock,
  MapPin,
  QrCode,
  Gauge,
  Compass,
  Wifi,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface DriverDashboardProps {
  currentUser: UserProfile;
  buses: Bus[];
  stops: BusStop[];
  routes: CampusRoute[];
  onNavigate: (path: string) => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  currentUser,
  buses,
  stops,
  routes,
  onNavigate,
}) => {
  const [selectedBusId, setSelectedBusId] = useState<string>(
    currentUser.assignedBusId || 'bus-03'
  );

  // Assigned bus
  const driverBus =
    buses.find((b) => b.id === selectedBusId) ||
    buses.find((b) => b.id === currentUser.assignedBusId) ||
    buses[0];

  const assignedRoute =
    routes.find((r) => r.id === driverBus.routeId) || routes[0];

  const currentStop = stops.find((s) => s.id === assignedRoute.stops[driverBus.currentStopIndex]?.stopId) || stops[0];
  const nextStop = stops.find((s) => s.id === driverBus.nextStopId) || stops[1];

  const [gpsActive, setGpsActive] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(4);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('Engine Malfunction / Breakdown');

  const watchIdRef = useRef<number | null>(null);

  // Verification logs for this bus
  const verificationLogs = store.getState().verificationLogs.filter(
    (log) => log.busId === driverBus.id || !log.busId
  );

  // Start GPS Geolocation Watcher
  const startGpsTracking = () => {
    setGpsError(null);
    if ('geolocation' in navigator) {
      try {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed, heading, accuracy } = position.coords;
            setGpsActive(true);
            setGpsAccuracy(Math.round(accuracy));

            store.updateBusLocation(
              driverBus.id,
              latitude,
              longitude,
              speed ? speed * 3.6 : driverBus.speed || 30, // convert m/s to km/h
              heading || driverBus.location.heading || 120,
              Math.round(accuracy)
            );
          },
          (err) => {
            console.warn('Geolocation access note:', err.message);
            setGpsError('Browser GPS permission not granted or device offline. Using automated route GPS telemetry.');
            setGpsActive(true); // Still enable driver simulation telemetry
          },
          {
            enableHighAccuracy: true,
            maximumAge: 2000,
            timeout: 10000,
          }
        );
        watchIdRef.current = id;
      } catch {
        setGpsError('Geolocation initialization error. Switched to high-precision route telemetry.');
        setGpsActive(true);
      }
    } else {
      setGpsError('Geolocation API not supported on this browser. Route telemetry is active.');
      setGpsActive(true);
    }
  };

  const stopGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsActive(false);
  };

  useEffect(() => {
    return () => {
      stopGpsTracking();
    };
  }, []);

  const handleStartTrip = () => {
    store.startTrip(driverBus.id, currentUser.id, assignedRoute.id);
    startGpsTracking();
  };

  const handleArrived = () => {
    if (nextStop) {
      store.arrivedAtStop(driverBus.id, nextStop.id);
    }
  };

  const handleDeparted = () => {
    // Advance to next stop
    const nextIdx = driverBus.currentStopIndex + 1;
    if (nextIdx < assignedRoute.stops.length) {
      const upcoming = assignedRoute.stops[nextIdx];
      driverBus.nextStopId = upcoming.stopId;
      store.updateBusLocation(
        driverBus.id,
        driverBus.location.latitude,
        driverBus.location.longitude,
        34,
        140
      );
    }
  };

  const handleOccupancyDelta = (delta: number) => {
    store.updateBusOccupancy(driverBus.id, driverBus.currentOccupancy + delta);
  };

  const handleEmergencyConfirm = () => {
    store.triggerEmergency(driverBus.id, emergencyReason);
    setShowEmergencyModal(false);
  };

  const isTripActive = driverBus.tripStatus === 'IN_TRANSIT';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Driver Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-xl shadow-lg border-2 border-blue-400">
            {driverBus.busNumber.replace('BUS-', 'B')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {driverBus.busNumber} Cockpit
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold">
                {driverBus.plateNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Assigned: {currentUser.name} · {assignedRoute.code} ({assignedRoute.name})
            </p>
          </div>
        </div>

        {/* Bus Selector & Telemetry Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Bus Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400">Bus:</span>
            <select
              value={driverBus.id}
              onChange={(e) => setSelectedBusId(e.target.value)}
              className="bg-transparent text-xs font-bold text-blue-400 focus:outline-none cursor-pointer"
            >
              {buses.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.busNumber} ({b.plateNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
            <Radio
              className={`w-3.5 h-3.5 ${
                gpsActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
              }`}
            />
            <span className="font-semibold text-slate-300">
              GPS: {gpsActive ? 'ACTIVE' : 'STANDBY'}
            </span>
            {gpsAccuracy && (
              <span className="text-[10px] text-slate-400">±{gpsAccuracy}m</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-emerald-400">
            <Wifi className="w-3.5 h-3.5" />
            <span className="font-semibold">CONNECTED</span>
          </div>

          <button
            onClick={() => onNavigate('/driver/scanner')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Pass</span>
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Primary Trip Action Console */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left 8 Cols: Navigation & Action Controls */}
        <div className="md:col-span-8 space-y-6">
          {/* Trip Controls Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Trip Operations Control
              </h2>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  isTripActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {isTripActive ? 'TRIP IN TRANSIT' : 'STANDBY'}
              </span>
            </div>

            {/* Current & Next Stop Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Last / Current Stop
                </span>
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  {currentStop.name}
                </div>
                <span className="text-xs text-slate-500">{currentStop.landmark}</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block mb-1">
                  Next Approaching Stop
                </span>
                <div className="text-base font-extrabold text-blue-900 dark:text-blue-200">
                  {nextStop.name}
                </div>
                <span className="text-xs text-blue-700/70 dark:text-blue-300/70">
                  ETA: ~{driverBus.etaMinutesToNextStop} min · {nextStop.landmark}
                </span>
              </div>
            </div>

            {/* Major Operations Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {!isTripActive ? (
                <button
                  onClick={handleStartTrip}
                  className="col-span-2 sm:col-span-4 p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>START TRIP & BROADCAST GPS</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleArrived}
                    className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>ARRIVED AT STOP</span>
                  </button>

                  <button
                    onClick={handleDeparted}
                    className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <ArrowRight className="w-5 h-5" />
                    <span>DEPARTED</span>
                  </button>

                  <button
                    onClick={() => store.endTrip(driverBus.id)}
                    className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Square className="w-5 h-5" />
                    <span>END TRIP</span>
                  </button>

                  <button
                    onClick={() => setShowEmergencyModal(true)}
                    className="p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <AlertOctagon className="w-5 h-5" />
                    <span>EMERGENCY SOS</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Realtime Telemetry Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                <Gauge className="w-4 h-4 text-blue-600" />
                <span>Speed</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {driverBus.speed} km/h
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>Heading</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {driverBus.location.heading}° (SE)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Delay Status</span>
              </div>
              <div
                className={`text-xl font-black ${
                  driverBus.delayMinutes > 0 ? 'text-amber-500' : 'text-emerald-500'
                }`}
              >
                +{driverBus.delayMinutes}m
              </div>
            </div>
          </div>

          {/* Quick Delay Broadcaster Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Traffic & Delay Status Broadcaster</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-400">
                Current: {driverBus.delayMinutes === 0 ? 'On Time' : `+${driverBus.delayMinutes}m`}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Select current traffic conditions to update student ETAs and broadcast realtime alerts:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => store.updateBusDelay(driverBus.id, 0)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                  driverBus.delayMinutes === 0
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                🟢 On Time (0m)
              </button>

              <button
                onClick={() => store.updateBusDelay(driverBus.id, 2)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                  driverBus.delayMinutes === 2
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                🟡 +2m Traffic
              </button>

              <button
                onClick={() => store.updateBusDelay(driverBus.id, 5)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                  driverBus.delayMinutes === 5
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                🟠 +5m Heavy Jam
              </button>

              <button
                onClick={() => store.updateBusDelay(driverBus.id, 10)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                  driverBus.delayMinutes === 10
                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                🔴 +10m Gate Block
              </button>
            </div>
          </div>

          {/* Route Sequence & Stops Checklist */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{assignedRoute.name} · Stop Waypoints</span>
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                {assignedRoute.stops.length} Total Stops
              </span>
            </div>

            <div className="space-y-3">
              {assignedRoute.stops.map((routeStop, idx) => {
                const stopDetails = stops.find((s) => s.id === routeStop.stopId);
                const isPassed = idx < driverBus.currentStopIndex;
                const isCurrent = idx === driverBus.currentStopIndex;
                const isNext = idx === driverBus.currentStopIndex + 1;

                return (
                  <div
                    key={routeStop.stopId}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm'
                        : isPassed
                        ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          isCurrent
                            ? 'bg-blue-600 text-white animate-pulse'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{stopDetails?.name || routeStop.stopId}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                              CURRENT STOP
                            </span>
                          )}
                          {isNext && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                              NEXT (~{driverBus.etaMinutesToNextStop}m)
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {stopDetails?.landmark} · Sched: {routeStop.scheduledTime}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        store.advanceToNextStop(driverBus.id);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 transition-all shrink-0"
                    >
                      {isCurrent ? 'Depart ➔' : 'Reach'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Passenger Boarding Manifest / Verified QR Passes */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>Recent Scanned Passenger Manifest ({verificationLogs.length})</span>
              </h3>
              <button
                onClick={() => onNavigate('/driver/scanner')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Open Camera Scanner ➔
              </button>
            </div>

            {verificationLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No passenger passes scanned for this run yet. Use the QR Pass Scanner to validate boarding students.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {verificationLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                          log.result === 'VALID'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {log.result === 'VALID' ? '✓' : '✕'}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {log.studentName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {log.studentCode} · Stop: {log.locationName || 'Ballari Stop'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          log.result === 'VALID'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {log.result}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(log.verifiedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Live Occupancy Counter Control */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Live Passenger Occupancy</span>
              </h3>
            </div>

            {/* Large Occupancy Dial */}
            <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Current On-Board
              </span>
              <div className="text-5xl font-black text-slate-900 dark:text-white">
                {driverBus.currentOccupancy}
                <span className="text-lg font-normal text-slate-400">/{driverBus.capacity}</span>
              </div>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-extrabold ${
                  driverBus.occupancyPercentage >= 85
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : driverBus.occupancyPercentage >= 60
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {driverBus.occupancyPercentage}% · {driverBus.occupancyPercentage >= 85 ? 'Almost Full' : 'Seats Available'}
              </span>
            </div>

            {/* Quick Increment / Decrement Stepper */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOccupancyDelta(-1)}
                disabled={driverBus.currentOccupancy <= 0}
                className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
                <span>Passenger Left (-1)</span>
              </button>

              <button
                onClick={() => handleOccupancyDelta(1)}
                disabled={driverBus.currentOccupancy >= driverBus.capacity}
                className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-sm text-white flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Boarded (+1)</span>
              </button>
            </div>

            {/* Group Presets */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => handleOccupancyDelta(5)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                +5 Boarded
              </button>
              <button
                onClick={() => handleOccupancyDelta(10)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                +10 Boarded
              </button>
              <button
                onClick={() => store.updateBusOccupancy(driverBus.id, 45)}
                className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-xs font-bold text-amber-800 dark:text-amber-300"
              >
                Set Full (45)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 shadow-2xl border-2 border-red-500 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <ShieldAlert className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Confirm Emergency SOS
                </h3>
                <p className="text-xs text-slate-500">
                  This will broadcast instant distress to Ballari transit command.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Reason for Emergency:
              </label>
              <select
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Engine Malfunction / Breakdown">Engine Malfunction / Breakdown</option>
                <option value="Medical Emergency on Board">Medical Emergency on Board</option>
                <option value="Road Accident / Collision">Road Accident / Collision</option>
                <option value="Severe Traffic Block / Road Protest">Severe Traffic Block / Road Protest</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
              Location: {driverBus.location.latitude.toFixed(4)}° N, {driverBus.location.longitude.toFixed(4)}° E (GPS locked)
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="p-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencyConfirm}
                className="p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg"
              >
                BROADCAST SOS NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
