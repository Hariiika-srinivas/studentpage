import React from 'react';
import { Bus, BusStop, CampusRoute } from '../../types';
import { Route, MapPin, Bus as BusIcon, Clock, Users, ArrowRight } from 'lucide-react';

interface StudentRoutesViewProps {
  routes: CampusRoute[];
  stops: BusStop[];
  buses: Bus[];
  onSelectBus: (busId: string) => void;
  onNavigate: (path: string) => void;
}

export const StudentRoutesView: React.FC<StudentRoutesViewProps> = ({
  routes,
  stops,
  buses,
  onSelectBus,
  onNavigate,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Campus Routes & Ballari Fleet Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Explore all 4 scheduled morning corridors connecting Ballari city to Campus.
            </p>
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="space-y-6">
        {routes.map((route) => {
          const assignedBuses = buses.filter((b) => b.routeId === route.id);
          return (
            <div
              key={route.id}
              className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base shadow"
                    style={{ backgroundColor: route.color }}
                  >
                    {route.code}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {route.name}
                    </h3>
                    <p className="text-xs text-slate-500">{route.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {route.totalDistanceKm} km · {route.stops.length} Stops
                  </span>
                </div>
              </div>

              {/* Stop Sequence */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Stop Sequence:
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  {route.stops.map((rs, idx) => {
                    const stop = stops.find((s) => s.id === rs.stopId);
                    return (
                      <React.Fragment key={rs.stopId}>
                        <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {idx + 1}. {stop?.name}
                        </span>
                        {idx < route.stops.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Vehicles */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Live Assigned Fleet:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {assignedBuses.map((bus) => (
                    <div
                      key={bus.id}
                      onClick={() => {
                        onSelectBus(bus.id);
                        onNavigate('/student/dashboard');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-blue-500 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <BusIcon className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">
                            {bus.busNumber}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {bus.plateNumber}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                          {bus.speed} km/h
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {bus.occupancyPercentage}% load
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
