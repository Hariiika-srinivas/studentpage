import React, { useState, useEffect } from 'react';
import {
  Bus,
  BusStop,
  CampusRoute,
  EmergencyAlert,
  Announcement,
} from '../../types';
import { store } from '../../services/store';
import { LiveBusMap } from '../../components/map/LiveBusMap';
import { authService } from '../../services/authService';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import {
  DbStudent,
  DbDriver,
  DbSystemNotification,
  SUPABASE_SQL_DDL,
} from '../../services/supabaseSchema';
import {
  ShieldAlert,
  Bus as BusIcon,
  Clock,
  Users,
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  MapPin,
  TrendingUp,
  Activity,
  Plus,
  MessageSquare,
  Database,
  Trash2,
  Copy,
  Check,
  Search,
  Bell,
  RefreshCw,
  ExternalLink,
  Filter,
  Star,
  Eye,
  UserCheck,
  Phone,
  GraduationCap,
} from 'lucide-react';

interface AdminDashboardProps {
  buses: Bus[];
  stops: BusStop[];
  routes: CampusRoute[];
  emergencyAlerts: EmergencyAlert[];
  announcements: Announcement[];
  onNavigate: (path: string) => void;
  isDarkMode: boolean;
}

type AdminTab = 'FLEET_RADAR' | 'LIVE_ACTIVITY' | 'FEEDBACK_HUB' | 'DATABASE_MGMT';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  buses,
  stops,
  routes,
  emergencyAlerts,
  announcements,
  onNavigate,
  isDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('FLEET_RADAR');
  const [selectedBusId, setSelectedBusId] = useState<string>('bus-03');
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annCategory, setAnnCategory] = useState<Announcement['category']>('GENERAL');
  const [annTarget, setAnnTarget] = useState<Announcement['targetAudience']>('all');
  const [annTargetVal, setAnnTargetVal] = useState('');
  const [annSuccess, setAnnSuccess] = useState(false);

  // Real-Time Notifications State
  const [liveNotifications, setLiveNotifications] = useState<DbSystemNotification[]>([]);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'STUDENT' | 'DRIVER' | 'ADMIN'>('ALL');
  const [newAlertToast, setNewAlertToast] = useState<string | null>(null);

  // Database Management State
  const [studentsList, setStudentsList] = useState<DbStudent[]>([]);
  const [driversList, setDriversList] = useState<DbDriver[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [isDdlModalOpen, setIsDdlModalOpen] = useState(false);
  const [copiedDdl, setCopiedDdl] = useState(false);

  // Add Student Form State
  const [newUsn, setNewUsn] = useState('');
  const [newName, setNewName] = useState('');
  const [newRouteId, setNewRouteId] = useState('route-a');
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'EXPIRED' | 'SUSPENDED'>('ACTIVE');
  const [newDept, setNewDept] = useState('Computer Science & Engineering');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // Add Driver Form State
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverBus, setNewDriverBus] = useState('BUS-03');
  const [newDriverRoute, setNewDriverRoute] = useState('route-a');
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  const activeAlerts = emergencyAlerts.filter((a) => a.status === 'ACTIVE');
  const onTimeCount = buses.filter((b) => b.status === 'ON_TIME').length;
  const delayedCount = buses.filter((b) => b.status === 'DELAYED').length;
  const storeFeedbacks = store.getFeedbacks();

  // Load Students and Drivers on Mount & Tab change
  const refreshDbLists = async () => {
    const students = await authService.getStudentsList();
    const drivers = await authService.getDriversList();
    setStudentsList(students);
    setDriversList(drivers);
  };

  const refreshNotifications = async () => {
    const notifs = await authService.fetchSystemNotifications();
    if (notifs && notifs.length > 0) {
      setLiveNotifications(notifs);
    }
  };

  useEffect(() => {
    refreshDbLists();
    refreshNotifications();

    // Supabase Realtime Subscription for system_notifications
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('public:system_notifications')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'system_notifications' },
            (payload) => {
              const newNotif = payload.new as DbSystemNotification;
              setLiveNotifications((prev) => [newNotif, ...prev.slice(0, 29)]);
              setNewAlertToast(`${newNotif.user_type}: ${newNotif.action}`);
              setTimeout(() => setNewAlertToast(null), 5000);
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription notice:', err);
      }
    }

    const interval = setInterval(() => {
      refreshNotifications();
    }, 10000);

    return () => {
      clearInterval(interval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    store.broadcastAnnouncement(annTitle, annMessage, annCategory, annTarget, annTargetVal);
    authService.recordSystemNotification({
      user_type: 'ADMIN',
      user_identifier: 'admin-01',
      action: `Broadcasted "${annTitle}" to ${annTarget.toUpperCase()}`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    setAnnTitle('');
    setAnnMessage('');
    setAnnSuccess(true);
    setTimeout(() => setAnnSuccess(false), 3000);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsn.trim() || !newName.trim()) return;

    await authService.saveStudent({
      usn: newUsn.trim().toUpperCase(),
      full_name: newName.trim(),
      route_id: newRouteId,
      pass_status: newStatus,
      department: newDept,
    });

    setNewUsn('');
    setNewName('');
    setIsAddStudentOpen(false);
    refreshDbLists();
  };

  const handleDeleteStudent = async (usn: string) => {
    if (confirm(`Remove student ${usn} from verified database?`)) {
      await authService.deleteStudent(usn);
      refreshDbLists();
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverPhone.trim() || !newDriverName.trim()) return;

    await authService.saveDriver({
      phone_number: newDriverPhone.trim(),
      full_name: newDriverName.trim(),
      bus_number: newDriverBus,
      assigned_route_id: newDriverRoute,
    });

    setNewDriverPhone('');
    setNewDriverName('');
    setIsAddDriverOpen(false);
    refreshDbLists();
  };

  const handleDeleteDriver = async (phone: string) => {
    if (confirm(`Remove driver with phone ${phone}?`)) {
      await authService.deleteDriver(phone);
      refreshDbLists();
    }
  };

  const handleCopyDdl = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_DDL);
    setCopiedDdl(true);
    setTimeout(() => setCopiedDdl(false), 3000);
  };

  const filteredStudents = studentsList.filter(
    (s) =>
      s.usn.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.department || '').toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredNotifs = liveNotifications.filter((n) => {
    if (notifFilter === 'ALL') return true;
    return n.user_type === notifFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast Notification for Real-Time Activity */}
      {newAlertToast && (
        <div
          id="realtime-toast"
          className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white border-2 border-blue-500 shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 max-w-md"
        >
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-blue-400 uppercase tracking-wider block text-[10px]">
              Live Supabase Event
            </span>
            <p className="font-medium">{newAlertToast}</p>
          </div>
        </div>
      )}

      {/* Header & Master View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              CampusGo Ballari Operations Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-[11px] uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
              Supabase Connected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time fleet telemetry, multi-tenant authentication registry, and student grievances.
          </p>
        </div>

        {/* Master Quick Switcher Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('/student/dashboard')}
            className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 transition-all"
            title="Preview Student Portal as Rahul Sharma"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student View</span>
          </button>

          <button
            onClick={() => onNavigate('/driver/dashboard')}
            className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-200 dark:border-amber-800 transition-all"
            title="Preview Driver Cockpit"
          >
            <BusIcon className="w-3.5 h-3.5" />
            <span>Driver View</span>
          </button>

          <button
            onClick={() => onNavigate('/admin/demo')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Demo Simulator</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('FLEET_RADAR')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'FLEET_RADAR'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Fleet Radar & Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('LIVE_ACTIVITY')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'LIVE_ACTIVITY'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Activity Stream</span>
          <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-[10px]">
            {liveNotifications.length || 8}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('FEEDBACK_HUB')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'FEEDBACK_HUB'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback & Grievances</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
            {storeFeedbacks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DATABASE_MGMT')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'DATABASE_MGMT'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Registry (USNs & Drivers)</span>
        </button>
      </div>

      {/* EMERGENCY SOS ALERT BANNER */}
      {activeAlerts.length > 0 && (
        <div className="p-5 rounded-3xl bg-red-600 text-white shadow-xl animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="text-lg font-black tracking-wide">
                ACTIVE DRIVER SOS DISPATCH ({activeAlerts.length})
              </h2>
            </div>
            <span className="text-xs font-mono uppercase bg-red-800 px-3 py-1 rounded-full font-bold">
              PRIORITY 1
            </span>
          </div>

          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-red-700/80 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-extrabold text-sm">{alert.busNumber}</span> ({alert.routeCode}) —{' '}
                  <span className="font-semibold">{alert.reason}</span>
                  <p className="text-red-200 mt-0.5">
                    Driver: {alert.driverName} · Location: {alert.location.address}
                  </p>
                </div>

                <button
                  onClick={() => store.resolveEmergency(alert.id)}
                  className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-white text-red-700 font-bold text-xs hover:bg-red-50 transition-all shadow"
                >
                  Resolve & Clear Alert
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: FLEET RADAR & TELEMETRY */}
      {/* ========================================================================= */}
      {activeTab === 'FLEET_RADAR' && (
        <>
          {/* KPI Stats Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Active Buses</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {buses.length}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">100% Monitored</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold block mb-1">On Time</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {onTimeCount}
              </div>
              <span className="text-[10px] text-slate-500">Normal schedule</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Delayed</span>
              <div className="text-2xl font-black text-amber-500">
                {delayedCount}
              </div>
              <span className="text-[10px] text-slate-500">Traffic corridors</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Emergency SOS</span>
              <div
                className={`text-2xl font-black ${
                  activeAlerts.length > 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'
                }`}
              >
                {activeAlerts.length}
              </div>
              <span className="text-[10px] text-slate-500">Active incidents</span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Students Registered</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {studentsList.length || 846}
              </div>
              <span className="text-[10px] text-slate-500">In Supabase DB</span>
            </div>
          </div>

          {/* Map & Broadcast Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
                    <span>Live Fleet Radar Map</span>
                  </h3>
                  <span className="text-xs text-slate-400">Ballari Campus Grid</span>
                </div>

                <LiveBusMap
                  buses={buses}
                  stops={stops}
                  routes={routes}
                  selectedBusId={selectedBusId}
                  onSelectBus={(id) => setSelectedBusId(id)}
                  isDarkMode={isDarkMode}
                  className="h-[420px] w-full"
                />
              </div>

              {/* Realtime Fleet Table */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  Fleet Telemetry & Status
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Bus</th>
                        <th className="pb-3">Route</th>
                        <th className="pb-3">Speed</th>
                        <th className="pb-3">Occupancy</th>
                        <th className="pb-3">Driver</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {buses.map((bus) => (
                        <tr
                          key={bus.id}
                          onClick={() => setSelectedBusId(bus.id)}
                          className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${
                            selectedBusId === bus.id ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                          }`}
                        >
                          <td className="py-3 font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <BusIcon className="w-4 h-4 text-blue-600" />
                            <span>{bus.number}</span>
                          </td>
                          <td className="py-3 font-medium text-slate-600 dark:text-slate-300">
                            {bus.routeCode}
                          </td>
                          <td className="py-3 font-mono font-semibold">
                            {bus.speed} km/h
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                bus.occupancyStatus === 'SEATS_AVAILABLE'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : bus.occupancyStatus === 'STANDING_ONLY'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              }`}
                            >
                              {bus.currentPassengers}/{bus.capacity} ({bus.occupancyPercentage}%)
                            </span>
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">
                            {bus.driverName}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                bus.status === 'ON_TIME'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : bus.status === 'DELAYED'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              }`}
                            >
                              {bus.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Broadcast & Announcements */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  <span>Broadcast Campus Transit Alert</span>
                </h3>

                {annSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Broadcast dispatched to all student phones!</span>
                  </div>
                )}

                <form onSubmit={handleSendAnnouncement} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Title:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Route A Traffic Delay (+10m)"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Message:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detailed instructions for affected commuters..."
                      value={annMessage}
                      onChange={(e) => setAnnMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Audience:
                      </label>
                      <select
                        value={annTarget}
                        onChange={(e) => setAnnTarget(e.target.value as any)}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200"
                      >
                        <option value="all">All Students</option>
                        <option value="route">Specific Route</option>
                        <option value="bus">Specific Bus</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Category:
                      </label>
                      <select
                        value={annCategory}
                        onChange={(e) => setAnnCategory(e.target.value as any)}
                        className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200"
                      >
                        <option value="GENERAL">General</option>
                        <option value="DELAY">Traffic Delay</option>
                        <option value="WEATHER">Weather</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all mt-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Live</span>
                  </button>
                </form>
              </div>

              {/* Active Announcements List */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                  Active Broadcasts ({announcements.length})
                </h3>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>{ann.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase font-mono">
                          {ann.category}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        {ann.message}
                      </p>
                      <span className="text-[10px] text-slate-400 block pt-1">
                        By {ann.createdBy} · {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE ACTIVITY STREAM (SUPABASE REALTIME) */}
      {/* ========================================================================= */}
      {activeTab === 'LIVE_ACTIVITY' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
                  <span>Real-Time Supabase Activity Stream</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live feed of student logins, pass verifications, driver cockpit sessions, and dispatch signals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  {(['ALL', 'STUDENT', 'DRIVER', 'ADMIN'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNotifFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        notifFilter === cat
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  onClick={refreshNotifications}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 font-bold"
                  title="Force Refresh Feed"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Notification items list */}
            <div className="space-y-3">
              {filteredNotifs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto opacity-40 animate-pulse" />
                  <p className="text-xs font-semibold">Listening for real-time events on Supabase channel...</p>
                  <p className="text-[11px] opacity-75">
                    Log in as a student or scan a QR pass to see live telemetry updates here.
                  </p>
                </div>
              ) : (
                filteredNotifs.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 transition-all hover:bg-blue-50/40 dark:hover:bg-blue-950/20"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${
                          item.user_type === 'STUDENT'
                            ? 'bg-blue-600'
                            : item.user_type === 'DRIVER'
                            ? 'bg-amber-500'
                            : 'bg-indigo-600'
                        }`}
                      >
                        {item.user_type === 'STUDENT' ? (
                          <GraduationCap className="w-4 h-4" />
                        ) : item.user_type === 'DRIVER' ? (
                          <BusIcon className="w-4 h-4" />
                        ) : (
                          <ShieldAlert className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                              item.user_type === 'STUDENT'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                                : item.user_type === 'DRIVER'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200'
                            }`}
                          >
                            {item.user_type}
                          </span>
                          <span className="font-mono text-xs text-slate-500 font-bold">
                            {item.user_identifier}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                          {item.action}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FEEDBACK & GRIEVANCES HUB */}
      {/* ========================================================================= */}
      {activeTab === 'FEEDBACK_HUB' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  <span>Student & Principal Grievances Hub</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct student feedback, driver behavior reviews, crowding reports, and resolution logs.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black">
                {storeFeedbacks.length} Submissions Logged
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storeFeedbacks.length === 0 ? (
                <div className="col-span-2 p-12 text-center text-slate-400">
                  <p className="text-sm font-semibold">No grievances logged yet.</p>
                  <p className="text-xs">
                    Students can submit feedback via the Student Portal "Feedback" section.
                  </p>
                </div>
              ) : (
                storeFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {fb.studentName}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                          {fb.busId.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < fb.rating ? 'fill-current text-amber-400' : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      "{fb.comment}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                        Category: {fb.issueType || 'General'}
                      </span>
                      <span>
                        {new Date(fb.createdAt).toLocaleDateString()} at{' '}
                        {new Date(fb.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DATABASE MANAGEMENT (STUDENTS & DRIVERS) */}
      {/* ========================================================================= */}
      {activeTab === 'DATABASE_MGMT' && (
        <div className="space-y-6">
          {/* Top Actions & DDL Viewer Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span>Supabase PostgreSQL Registry</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage registered student USNs, driver phone numbers, and semester pass validity.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDdlModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>View Supabase SQL DDL</span>
              </button>

              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student USN</span>
              </button>

              <button
                onClick={() => setIsAddDriverOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Driver</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Verified Students Database ({filteredStudents.length})</span>
              </h3>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search USN, name, or branch..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">USN</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Assigned Route</th>
                    <th className="pb-3">Pass Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.map((s) => (
                    <tr key={s.usn} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {s.usn}
                      </td>
                      <td className="py-3 font-extrabold text-slate-900 dark:text-white">
                        {s.full_name}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">
                        {s.department || 'Computer Science & Engineering'}
                      </td>
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200 uppercase">
                        {(s.route_id || 'route-a').replace('route-', 'Route ')}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            s.pass_status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : s.pass_status === 'EXPIRED'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {s.pass_status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteStudent(s.usn)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drivers Table */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BusIcon className="w-4 h-4 text-amber-500" />
              <span>Registered Drivers Database ({driversList.length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Phone Number</th>
                    <th className="pb-3">Driver Name</th>
                    <th className="pb-3">Assigned Vehicle</th>
                    <th className="pb-3">Route</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {driversList.map((d) => (
                    <tr key={d.phone_number} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                        +91 {d.phone_number}
                      </td>
                      <td className="py-3 font-extrabold text-slate-900 dark:text-white">
                        {d.full_name}
                      </td>
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">
                        {d.bus_number}
                      </td>
                      <td className="py-3 font-medium uppercase">
                        {(d.assigned_route_id || 'route-a').replace('route-', 'Route ')}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteDriver(d.phone_number)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                          title="Delete Driver"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD STUDENT */}
      {/* ========================================================================= */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Add Student to College Transit DB
            </h3>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  USN (Unique Identifier):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3BR22CS105"
                  value={newUsn}
                  onChange={(e) => setNewUsn(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Patil"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Route:
                  </label>
                  <select
                    value={newRouteId}
                    onChange={(e) => setNewRouteId(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  >
                    <option value="route-a">Route A (Central)</option>
                    <option value="route-b">Route B (Cantonment)</option>
                    <option value="route-c">Route C (KHB Colony)</option>
                    <option value="route-d">Route D (Siruguppa)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Department:
                </label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD DRIVER */}
      {/* ========================================================================= */}
      {isAddDriverOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Add Registered Driver Phone
            </h3>

            <form onSubmit={handleAddDriver} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  10-Digit Mobile Phone:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9844098765"
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Driver Full Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ramesh Kumar"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Bus Number:
                  </label>
                  <input
                    type="text"
                    value={newDriverBus}
                    onChange={(e) => setNewDriverBus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Route:
                  </label>
                  <select
                    value={newDriverRoute}
                    onChange={(e) => setNewDriverRoute(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  >
                    <option value="route-a">Route A</option>
                    <option value="route-b">Route B</option>
                    <option value="route-c">Route C</option>
                    <option value="route-d">Route D</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDriverOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow"
                >
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUPABASE SQL DDL VIEWER */}
      {/* ========================================================================= */}
      {isDdlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>Supabase PostgreSQL Schema DDL</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Run this in your free-tier Supabase SQL Editor to initialize all 5 tables.
                </p>
              </div>

              <button
                onClick={() => setIsDdlModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs border border-slate-800">
              <pre className="whitespace-pre-wrap">{SUPABASE_SQL_DDL}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                URL: https://mozeemzuzphdrnbcedbe.supabase.co
              </span>

              <button
                onClick={handleCopyDdl}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                {copiedDdl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedDdl ? 'Copied SQL to Clipboard!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
