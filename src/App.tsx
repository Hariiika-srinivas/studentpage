import React, { useState, useEffect, useCallback } from 'react';
import { store } from './services/store';
import { authService } from './services/authService';
import { AppState, UserRole } from './types';
import { Navbar } from './components/layout/Navbar';
import { StudentDashboard } from './views/student/StudentDashboard';
import { StudentRoutesView } from './views/student/StudentRoutesView';
import { StudentPassView } from './views/student/StudentPassView';
import { StudentFeedbackView } from './views/student/StudentFeedbackView';
import { StudentLoginView } from './views/student/StudentLoginView';
import { Bus, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(store.getState());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const session = authService.getSession();
    return !!session && session.role === 'student';
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    const session = authService.getSession();
    const isAuth = !!session && session.role === 'student';
    if (typeof window !== 'undefined' && window.location.pathname) {
      if (window.location.pathname === '/student/login') return '/student/login';
      if (window.location.pathname === '/student/routes' && isAuth) return '/student/routes';
      if (window.location.pathname === '/student/pass' && isAuth) return '/student/pass';
      if (window.location.pathname === '/student/feedback' && isAuth) return '/student/feedback';
    }
    return isAuth ? '/student/dashboard' : '/student/login';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('campusgo_theme') === 'dark';
  });

  // Subscribe to central reactive store
  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setAppState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  // Listen to popstate for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const session = authService.getSession();
      const isAuth = !!session && session.role === 'student';
      if (window.location.pathname) {
        if (window.location.pathname === '/student/login') {
          setCurrentPath('/student/login');
        } else if (window.location.pathname === '/student/routes' && isAuth) {
          setCurrentPath('/student/routes');
        } else if (window.location.pathname === '/student/pass' && isAuth) {
          setCurrentPath('/student/pass');
        } else if (window.location.pathname === '/student/feedback' && isAuth) {
          setCurrentPath('/student/feedback');
        } else if (isAuth) {
          setCurrentPath('/student/dashboard');
        } else {
          setCurrentPath('/student/login');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync Dark Mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('campusgo_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('campusgo_theme', 'light');
    }
  }, [isDarkMode]);

  // Handle internal navigation
  const handleNavigate = useCallback((path: string) => {
    let target = path;
    const session = authService.getSession();
    const isAuth = !!session && session.role === 'student';

    if (!isAuth && target !== '/student/login') {
      target = '/student/login';
    } else if (target === '/' || target === '/student') {
      target = isAuth ? '/student/dashboard' : '/student/login';
    }

    setCurrentPath(target);
    try {
      if (window.location.pathname !== target) {
        window.history.pushState({}, '', target);
      }
    } catch (e) {
      // Safe fallback in restrictive iframe contexts
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    handleNavigate('/student/dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    handleNavigate('/student/login');
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleMarkAllNotificationsRead = () => {
    store.markAllNotificationsRead();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Student Top Navigation */}
      <Navbar
        currentRole="student"
        currentUserName={appState.currentUser.name}
        currentUserUSN={appState.currentUser.studentId}
        onRoleChange={() => {}}
        currentPath={currentPath}
        onNavigate={handleNavigate}
        notifications={appState.notifications}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isSimulating={appState.isSimulationRunning}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      {/* Main Student Router */}
      <main className="flex-1">
        {!isAuthenticated || currentPath === '/student/login' ? (
          <StudentLoginView
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
          />
        ) : currentPath === '/student/routes' ? (
          <StudentRoutesView
            routes={appState.routes}
            stops={appState.stops}
            buses={appState.buses}
            onSelectBus={(busId) => {
              store.setSelectedBus(busId);
              handleNavigate('/student/dashboard');
            }}
            onNavigate={handleNavigate}
          />
        ) : currentPath === '/student/pass' ? (
          <StudentPassView
            currentUser={appState.currentUser}
            stops={appState.stops}
            routes={appState.routes}
            passes={appState.passes}
            onNavigate={handleNavigate}
          />
        ) : currentPath === '/student/feedback' ? (
          <StudentFeedbackView
            currentUser={appState.currentUser}
            buses={appState.buses}
          />
        ) : (
          <StudentDashboard
            currentUser={appState.currentUser}
            buses={appState.buses}
            stops={appState.stops}
            routes={appState.routes}
            selectedStopId={appState.selectedStopId}
            selectedBusId={appState.selectedBusId}
            onSelectStop={(stopId) => store.setSelectedStop(stopId)}
            onSelectBus={(busId) => store.setSelectedBus(busId)}
            onNavigate={handleNavigate}
            isDarkMode={isDarkMode}
          />
        )}
      </main>

      {/* Student App Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
              <Bus className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white">
              CampusGo Ballari
            </span>
            <span>· Smart Student Transit & Real-Time Commute Assistant</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavigate('/student/dashboard')}
                  className="hover:text-blue-600 transition-all text-blue-600 dark:text-blue-400"
                >
                  Live Commute
                </button>
                <button
                  onClick={() => handleNavigate('/student/routes')}
                  className="hover:text-blue-600 transition-all"
                >
                  Routes
                </button>
                <button
                  onClick={() => handleNavigate('/student/pass')}
                  className="hover:text-blue-600 transition-all"
                >
                  Digital Pass
                </button>
                <button
                  onClick={() => handleNavigate('/student/feedback')}
                  className="hover:text-blue-600 transition-all"
                >
                  Feedback
                </button>
                <button
                  onClick={handleLogout}
                  className="hover:text-red-500 transition-all"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavigate('/student/login')}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Student Login
              </button>
            )}
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live Fleet Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
