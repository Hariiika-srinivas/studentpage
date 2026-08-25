import React from 'react';
import { UserProfile, BusStop, CampusRoute, DigitalBusPass } from '../../types';
import { DigitalBusPassCard } from '../../components/pass/DigitalBusPassCard';
import { ShieldCheck, PhoneCall, ArrowLeft } from 'lucide-react';

interface StudentPassViewProps {
  currentUser: UserProfile;
  stops: BusStop[];
  routes: CampusRoute[];
  passes?: DigitalBusPass[];
  onNavigate: (path: string) => void;
}

export const StudentPassView: React.FC<StudentPassViewProps> = ({
  currentUser,
  stops,
  routes,
  passes = [],
  onNavigate,
}) => {
  const favoriteStop = stops.find((s) => s.id === currentUser?.favoriteStopId) || stops[3] || stops[0];
  const assignedRoute = routes.find((r) => r.id === currentUser?.favoriteRouteId) || routes[0];
  const matchedPass = passes.find(
    (p) => p.studentId === currentUser?.id || p.studentCode === currentUser?.studentId
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/student/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Live Commute</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: The Bus Pass Card */}
        <div className="md:col-span-7 flex justify-center">
          <DigitalBusPassCard
            pass={matchedPass}
            user={currentUser}
            stopName={favoriteStop?.name || 'Gandhi Nagar'}
            routeName={assignedRoute ? `${assignedRoute.code} - ${assignedRoute.name}` : 'ROUTE A'}
          />
        </div>

        {/* Right 5 Cols: Pass Guidelines & Emergency Helpline */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Pass Verification Notice</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This digital pass is cryptographically bound to Student ID{' '}
              <strong className="text-slate-900 dark:text-white font-mono">
                {currentUser?.studentId || 'BLR-2024-CS042'}
              </strong>
              . Hold your screen up to the driver’s terminal scanner when boarding.
            </p>
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs">
              <strong>Authorized Corridor:</strong> {assignedRoute?.code || 'ROUTE A'} ({assignedRoute?.originName || 'Ballari Central'} ➔ Campus)
            </div>
          </div>

          {/* Campus Helpline Numbers */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-blue-600" />
              <span>Ballari Campus Transit Helpline</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Transport Desk</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  +91 8392 245601
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Campus Security SOS</span>
                <span className="font-mono font-bold text-red-600 dark:text-red-400">
                  +91 8392 245999
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
