import React, { useState } from 'react';
import { UserRole, NotificationItem } from '../../types';
import {
  Bus,
  MapPin,
  QrCode,
  Bell,
  Sun,
  Moon,
  Radio,
  User,
  CheckCheck,
  Route,
  MessageSquare,
  Sparkles,
  LogOut,
  Navigation,
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  currentUserName: string;
  currentUserUSN?: string;
  onRoleChange?: (role: UserRole) => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isSimulating: boolean;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUserName,
  currentUserUSN,
  currentPath,
  onNavigate,
  notifications,
  onMarkAllNotificationsRead,
  isDarkMode,
  onToggleDarkMode,
  isAuthenticated = true,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isCurrent = (path: string) => {
    if (path === '/student/dashboard') {
      return (
        currentPath === '/' ||
        currentPath === '/student' ||
        currentPath === '/student/dashboard'
      );
    }
    return currentPath === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/student/dashboard')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 transition-all">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    CampusGo
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider">
                    Ballari
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Smart Student Commute & Live Transit
                </p>
              </div>
            </button>
          </div>

          {/* Center Navigation Links for Student */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('/student/dashboard')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isCurrent('/student/dashboard')
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Live Commute</span>
              </button>
              <button
                onClick={() => onNavigate('/student/routes')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isCurrent('/student/routes')
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                <span>Campus Routes</span>
              </button>
              <button
                onClick={() => onNavigate('/student/pass')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isCurrent('/student/pass')
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Digital Pass</span>
              </button>
              <button
                onClick={() => onNavigate('/student/feedback')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isCurrent('/student/feedback')
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Feedback</span>
              </button>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span>Student Transit Portal</span>
            </div>
          )}

          {/* Right Action Icons & Student Status */}
          <div className="flex items-center gap-2.5">
            {/* Live GPS Broadcast Indicator */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>BALLARI FLEET LIVE</span>
              </div>
            )}

            {/* Student Profile Chip or Sign In */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-black">
                    {currentUserName ? currentUserName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block leading-none text-xs">{currentUserName}</span>
                    {currentUserUSN && (
                      <span className="text-[10px] text-slate-400 font-mono leading-none">
                        {currentUserUSN}
                      </span>
                    )}
                  </div>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 hover:text-red-600 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all flex items-center gap-1.5"
                    title="Sign Out / Switch Student"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('/student/login')}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-all"
              >
                Student Sign In
              </button>
            )}

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 max-h-[420px] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Live Commute Alerts ({unreadCount} new)
                      </h4>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark Read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-xl border text-xs transition-all ${
                            notif.read
                              ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                              : notif.type === 'EMERGENCY'
                              ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 font-semibold'
                              : notif.type === 'APPROACHING'
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-semibold'
                              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(notif.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row for Student */}
        {isAuthenticated && (
          <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={() => onNavigate('/student/dashboard')}
              className={`flex flex-col items-center py-1 px-2 rounded-lg ${
                isCurrent('/student/dashboard')
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Navigation className="w-4 h-4 mb-0.5" />
              <span>Commute</span>
            </button>
            <button
              onClick={() => onNavigate('/student/routes')}
              className={`flex flex-col items-center py-1 px-2 rounded-lg ${
                isCurrent('/student/routes')
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Route className="w-4 h-4 mb-0.5" />
              <span>Routes</span>
            </button>
            <button
              onClick={() => onNavigate('/student/pass')}
              className={`flex flex-col items-center py-1 px-2 rounded-lg ${
                isCurrent('/student/pass')
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4 mb-0.5" />
              <span>Pass</span>
            </button>
            <button
              onClick={() => onNavigate('/student/feedback')}
              className={`flex flex-col items-center py-1 px-2 rounded-lg ${
                isCurrent('/student/feedback')
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 mb-0.5" />
              <span>Feedback</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
