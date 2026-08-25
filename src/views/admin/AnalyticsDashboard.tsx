import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  ShieldCheck,
  Award,
  AlertTriangle,
  Bus as BusIcon,
} from 'lucide-react';

const ON_TIME_DATA = [
  { name: 'On Time', value: 82, color: '#10B981' },
  { name: 'Minor Delay (<5m)', value: 14, color: '#F59E0B' },
  { name: 'Delayed (>5m)', value: 4, color: '#EF4444' },
];

const ROUTE_POPULARITY = [
  { route: 'Route A (Central)', students: 342, avgOccupancy: 76 },
  { route: 'Route B (Vidyanagar)', students: 268, avgOccupancy: 68 },
  { route: 'Route C (Market Loop)', students: 148, avgOccupancy: 48 },
  { route: 'Route D (Outer Feeder)', students: 88, avgOccupancy: 38 },
];

const HOURLY_OCCUPANCY = [
  { time: '07:00 AM', occupancy: 28 },
  { time: '07:30 AM', occupancy: 58 },
  { time: '08:00 AM', occupancy: 92 },
  { time: '08:30 AM', occupancy: 88 },
  { time: '09:00 AM', occupancy: 64 },
  { time: '09:30 AM', occupancy: 35 },
  { time: '04:30 PM', occupancy: 78 },
  { time: '05:00 PM', occupancy: 94 },
  { time: '05:30 PM', occupancy: 82 },
];

const STOP_BOARDINGS = [
  { stop: 'Gandhi Nagar', boardings: 214 },
  { stop: 'Cowl Bazaar', boardings: 182 },
  { stop: 'Parvathi Nagar', boardings: 145 },
  { stop: 'Cantonment Area', boardings: 110 },
  { stop: 'Vidyanagar', boardings: 98 },
  { stop: 'Ballari Central', boardings: 84 },
];

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              CampusGo Fleet & Mobility Analytics
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Aggregated transit intelligence, punctuality index, and corridor demand metrics for Ballari campus.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">On-Time Performance</span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            92.4%
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">▲ +3.2% vs last month</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Average Fleet Delay</span>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
            2.4 min
          </div>
          <span className="text-[10px] text-slate-500">Across 4 corridors</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Peak Morning Load</span>
          <div className="text-3xl font-black text-amber-500">
            86%
          </div>
          <span className="text-[10px] text-slate-500">08:00 AM - 08:30 AM window</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Daily Student Commutes</span>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            1,480
          </div>
          <span className="text-[10px] text-slate-500">Boardings verified</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Hourly Passenger Load (Line Chart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-between">
            <span>Peak Hourly Passenger Load</span>
            <span className="text-xs text-blue-600 font-mono font-bold">Max 94% at 5:00 PM</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Average fleet occupancy percentage across daytime hours</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HOURLY_OCCUPANCY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#2563EB' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Punctuality Breakdown (Pie Chart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Fleet Punctuality & Delay Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-4">Based on 30-day trip log telemetry</p>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ON_TIME_DATA}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ON_TIME_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Route Popularity & Capacity (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Registered Student Commuters by Route
          </h3>
          <p className="text-xs text-slate-400 mb-4">Route A (Central) serves the largest student volume in Ballari</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ROUTE_POPULARITY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="route" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="students" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Top Boarding Stops in Ballari */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Top Boarding Stops in Ballari
          </h3>
          <p className="text-xs text-slate-400 mb-4">Gandhi Nagar and Cowl Bazaar represent 48% of all morning boardings</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STOP_BOARDINGS} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis type="number" stroke="#64748B" fontSize={10} />
                <YAxis dataKey="stop" type="category" stroke="#64748B" fontSize={10} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="boardings" fill="#10B981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
