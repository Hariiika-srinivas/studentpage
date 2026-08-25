import React, { useState } from 'react';
import { Bus, BusStop, CampusRoute, UserProfile } from '../../types';
import { store } from '../../services/store';
import {
  Bus as BusIcon,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Route,
  UserCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface FleetManagementProps {
  buses: Bus[];
  stops: BusStop[];
  routes: CampusRoute[];
  users: UserProfile[];
}

export const FleetManagement: React.FC<FleetManagementProps> = ({
  buses,
  stops,
  routes,
  users,
}) => {
  const [activeTab, setActiveTab] = useState<'buses' | 'routes' | 'stops' | 'drivers'>('buses');
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [newBusNumber, setNewBusNumber] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newRouteId, setNewRouteId] = useState('route-a');
  const [newCapacity, setNewCapacity] = useState(50);

  const handleCreateBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusNumber.trim() || !newPlate.trim()) return;

    const newBus: Bus = {
      id: `bus-${Date.now()}`,
      busNumber: newBusNumber.toUpperCase(),
      plateNumber: newPlate.toUpperCase(),
      routeId: newRouteId,
      driverId: 'driver-03',
      capacity: Number(newCapacity),
      currentOccupancy: 0,
      occupancyPercentage: 0,
      status: 'ON_TIME',
      delayMinutes: 0,
      isEmergency: false,
      speed: 0,
      location: {
        latitude: 15.1394,
        longitude: 76.9214,
        speedKmH: 0,
        heading: 0,
        accuracyMeters: 5,
        timestamp: new Date().toISOString(),
      },
      currentStopIndex: 0,
      nextStopId: stops[0]?.id || 'stop-central',
      etaMinutesToNextStop: 10,
      tripStatus: 'IDLE',
      lastUpdated: 'Just added',
    };

    store.getState().buses.push(newBus);
    setNewBusNumber('');
    setNewPlate('');
    setShowAddBusModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Campus Fleet & Infrastructure Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create, update, and manage college buses, routes, stops, and assigned drivers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'buses' && (
            <button
              onClick={() => setShowAddBusModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('buses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'buses'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BusIcon className="w-4 h-4" />
          <span>Buses ({buses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'routes'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Route className="w-4 h-4" />
          <span>Routes ({routes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stops')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'stops'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Stops ({stops.length})</span>
        </button>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'buses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buses.map((bus) => {
            const route = routes.find((r) => r.id === bus.routeId);
            return (
              <div
                key={bus.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {bus.busNumber.replace('BUS-', 'B')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {bus.busNumber}
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">
                        {bus.plateNumber}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      bus.status === 'ON_TIME'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {bus.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Assigned Route</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {route?.code || 'Route A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Capacity</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {bus.capacity} seats
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'routes' && (
        <div className="space-y-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: route.color }}
                  />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {route.code} — {route.name}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {route.totalDistanceKm} km · {route.stops.length} Stops
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">{route.description}</p>
              <div className="flex flex-wrap gap-2">
                {route.stops.map((rs, i) => {
                  const stop = stops.find((s) => s.id === rs.stopId);
                  return (
                    <span
                      key={rs.stopId}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {i + 1}. {stop?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'stops' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stops.map((stop) => (
            <div
              key={stop.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {stop.name}
                </h3>
              </div>
              <p className="text-xs text-slate-500">{stop.landmark}</p>
              <div className="text-[11px] text-slate-400 font-mono pt-1">
                Lat: {stop.latitude.toFixed(4)} | Lng: {stop.longitude.toFixed(4)} | Walk: {stop.averageWalkingTimeMinutes}m
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Bus Modal */}
      {showAddBusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add New Campus Fleet Vehicle
            </h3>

            <form onSubmit={handleCreateBus} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Bus ID:
                </label>
                <input
                  type="text"
                  placeholder="e.g. BUS-06"
                  value={newBusNumber}
                  onChange={(e) => setNewBusNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Plate Number:
                </label>
                <input
                  type="text"
                  placeholder="e.g. KA-34-F-7890"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Assign Route:
                </label>
                <select
                  value={newRouteId}
                  onChange={(e) => setNewRouteId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} — {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBusModal(false)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow"
                >
                  Create Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
