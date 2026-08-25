import React, { useState } from 'react';
import { Bus, BusStop, CampusRoute } from '../../types';
import { store } from '../../services/store';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  AlertTriangle,
  BellRing,
  Users,
  ShieldAlert,
  Send,
  CheckCircle2,
  Sparkles,
  Navigation,
  ArrowRight,
  Compass,
  Layers,
  MapPin,
  Clock,
} from 'lucide-react';

interface DemoSimulatorProps {
  buses: Bus[];
  stops: BusStop[];
  routes: CampusRoute[];
  isSimulationRunning: boolean;
  simulationSpeed: number;
  onNavigate: (path: string) => void;
}

export const DemoSimulator: React.FC<DemoSimulatorProps> = ({
  buses,
  stops,
  routes,
  isSimulationRunning,
  simulationSpeed,
  onNavigate,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const primaryBus = buses.find((b) => b.id === 'bus-03') || buses[0];
  const gandhiNagarStop = stops.find((s) => s.id === 'stop-gandhi-nagar') || stops[3];

  // 1. Trigger Delay
  const handleTriggerDelay = () => {
    store.triggerBusDelay('bus-03', 7, 'Heavy congestion near Cowl Bazaar Junction');
    triggerToast('✓ Triggered +7 Min Traffic Delay on BUS-03');
    setActiveStep(3);
  };

  // 2. Trigger Approaching
  const handleTriggerApproaching = () => {
    // Move BUS-03 coordinates to ~400m from Gandhi Nagar
    store.updateBusLocation(
      'bus-03',
      gandhiNagarStop.latitude + 0.003,
      gandhiNagarStop.longitude - 0.002,
      28,
      135,
      3
    );
    store.addNotification({
      title: 'BUS-03 is approaching Gandhi Nagar',
      message: 'Distance ~450m. ETA under 2 minutes. Boarding point ready.',
      type: 'APPROACHING',
      busId: 'bus-03',
    });
    triggerToast('✓ Triggered Approaching Notification (~450m)');
    setActiveStep(4);
  };

  // 3. Trigger Missed Stop
  const handleTriggerMissed = () => {
    // Move BUS-03 past Gandhi Nagar toward Infantry Road
    const infantryStop = stops.find((s) => s.id === 'stop-infantry-road') || stops[4];
    store.updateBusLocation(
      'bus-03',
      infantryStop.latitude + 0.001,
      infantryStop.longitude + 0.001,
      35,
      160,
      3
    );
    primaryBus.currentStopIndex = 4; // past Gandhi Nagar
    store.addNotification({
      title: '⚠️ Missed Bus Alert: BUS-03',
      message: 'BUS-03 has already departed Gandhi Nagar stop. Alternative BUS-05 recommended.',
      type: 'RECOMMENDATION',
      busId: 'bus-03',
    });
    triggerToast('✓ Triggered Missed Stop Scenario (Rerouted to BUS-05)');
    setActiveStep(6);
  };

  // 4. Trigger High Occupancy
  const handleTriggerOccupancy = () => {
    store.updateBusOccupancy('bus-03', 46); // 92%
    triggerToast('✓ Surge BUS-03 Occupancy to 92% (Triggered BUS-05 Alternative)');
    setActiveStep(5);
  };

  // 5. Trigger Emergency SOS
  const handleTriggerEmergency = () => {
    store.triggerEmergency('bus-03', 'Mechanical Axle Warning on Ballari Highway');
    triggerToast('🚨 Triggered Emergency SOS Alert on BUS-03');
    setActiveStep(7);
  };

  // 6. Broadcast Announcement
  const handleBroadcastAnnouncement = () => {
    store.broadcastAnnouncement(
      'Route A Traffic Advisory (+10 min)',
      'Route A buses delayed due to road resurfacing near Cowl Bazaar. Please check Smart Commute times.',
      'DELAY',
      'all'
    );
    triggerToast('📢 Broadcasted Live Announcement to All Students');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-blue-500/50 shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hackathon Demonstration Master Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Ballari Transit Live Simulator
          </h1>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Control fleet movement along Ballari routes, trigger delays, surges, approaching geofences, and watch real-time state sync instantly across student, driver, and admin views!
          </p>
        </div>

        {/* Global Playback Controller */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-3 rounded-2xl border border-slate-700 shadow-inner">
          <button
            onClick={() => store.toggleSimulation()}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md ${
              isSimulationRunning
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {isSimulationRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>PAUSE SIM</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>START SIMULATION</span>
              </>
            )}
          </button>

          <button
            onClick={() => store.resetSimulation()}
            title="Reset Simulation to Initial State"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selectors */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 text-xs font-bold text-slate-300">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => store.setSimulationSpeed(spd)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  simulationSpeed === spd
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1-Click Hackathon Scenarios Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            1-Click Live Hackathon Scenario Triggers
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any trigger below to observe immediate reactive updates on Student & Driver tabs:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Trigger 1: Delay */}
          <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
                  Scenario A
                </span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Trigger +7 Min Traffic Delay
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Updates BUS-03 status to DELAYED. Smart Commute adjusts departure time from "8:10 AM" to "8:17 AM".
              </p>
            </div>
            <button
              onClick={handleTriggerDelay}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-sm transition-all"
            >
              Trigger 7m Delay
            </button>
          </div>

          {/* Trigger 2: Approaching */}
          <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">
                  Scenario B
                </span>
                <BellRing className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Simulate Approaching Alert (450m)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Teleports BUS-03 within 450m of Gandhi Nagar. Fires live approaching banner: "LEAVE NOW!"
              </p>
            </div>
            <button
              onClick={handleTriggerApproaching}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm transition-all"
            >
              Trigger Approaching Alert
            </button>
          </div>

          {/* Trigger 3: Occupancy Surge */}
          <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">
                  Scenario C
                </span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Surge Occupancy to 92%
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Sets BUS-03 to 46/50 (Almost Full). Smart Commute advises: "Consider BUS-05 (42% Load)".
              </p>
            </div>
            <button
              onClick={handleTriggerOccupancy}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm transition-all"
            >
              Surge Occupancy to 92%
            </button>
          </div>

          {/* Trigger 4: Missed Stop */}
          <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">
                  Scenario D
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Simulate Missed Bus
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Moves bus past Gandhi Nagar. Shows "You Missed Your Bus" and provides 1-click tracking for BUS-05.
              </p>
            </div>
            <button
              onClick={handleTriggerMissed}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all"
            >
              Trigger Missed Bus
            </button>
          </div>

          {/* Trigger 5: Driver Emergency SOS */}
          <div className="p-5 rounded-2xl border border-red-300 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">
                  Scenario E
                </span>
                <ShieldAlert className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Trigger Driver Emergency SOS
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Broadcasts emergency distress from BUS-03 to Transit Ops. Flashes Priority 1 dispatch banner.
              </p>
            </div>
            <button
              onClick={handleTriggerEmergency}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-sm transition-all"
            >
              Trigger SOS Emergency
            </button>
          </div>

          {/* Trigger 6: Broadcast Announcement */}
          <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  Scenario F
                </span>
                <Send className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Broadcast Route A Alert
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Broadcasts: "Route A is delayed by 10 minutes due to traffic" directly to the student notification center.
              </p>
            </div>
            <button
              onClick={handleBroadcastAnnouncement}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-all"
            >
              Broadcast Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Complete 22-Step Hackathon Presentation Checklist */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Official 22-Step Hackathon Demo Walkthrough Guide
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">100% Tested Flow</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { id: 1, title: 'Student logs in as Rahul Sharma' },
            { id: 2, title: 'Student selects Gandhi Nagar boarding stop' },
            { id: 3, title: 'Dashboard shows BUS-03 with 7m ETA' },
            { id: 4, title: 'Smart Commute outputs "Leave in 2 minutes"' },
            { id: 5, title: 'Open driver dashboard on BUS-03' },
            { id: 6, title: 'Driver starts trip & GPS initiates' },
            { id: 7, title: 'Bus begins moving smoothly along Route A' },
            { id: 8, title: 'Student live map & timeline update synchronously' },
            { id: 9, title: 'Live ETA recalculates dynamically' },
            { id: 10, title: 'Bus approaches Gandhi Nagar within 500m' },
            { id: 11, title: 'Student receives "BUS-03 approaching" alert' },
            { id: 12, title: 'Driver increments passenger occupancy' },
            { id: 13, title: 'Student sees "BUS-03 is almost full" advisory' },
            { id: 14, title: 'Trigger +7m traffic delay on Route A' },
            { id: 15, title: 'Student sees updated departure advisory' },
            { id: 16, title: 'Admin operations center triages delay' },
            { id: 17, title: 'Admin sends live broadcast announcement' },
            { id: 18, title: 'Student notification center chimes instantly' },
            { id: 19, title: 'Student opens verified Digital Bus Pass' },
            { id: 20, title: 'Driver terminal scans student QR pass' },
            { id: 21, title: 'Shows "Pass Verified ✓" with student photo' },
            { id: 22, title: 'Open Fleet Analytics and review KPIs' },
          ].map((step) => (
            <div
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`p-3 rounded-2xl flex items-center justify-between border cursor-pointer transition-all ${
                activeStep === step.id
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 font-bold text-blue-900 dark:text-blue-200'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                  {step.id}
                </span>
                <span>{step.title}</span>
              </div>
              <CheckCircle2
                className={`w-4 h-4 ${
                  activeStep >= step.id ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
