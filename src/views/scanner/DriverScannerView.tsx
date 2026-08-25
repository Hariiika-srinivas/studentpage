import React from 'react';
import { UserProfile, Bus } from '../../types';
import { QRScannerComponent } from '../../components/scanner/QRScannerComponent';
import { ArrowLeft, Bus as BusIcon, ShieldCheck } from 'lucide-react';

interface DriverScannerViewProps {
  currentUser: UserProfile;
  buses: Bus[];
  onNavigate: (path: string) => void;
}

export const DriverScannerView: React.FC<DriverScannerViewProps> = ({
  currentUser,
  buses,
  onNavigate,
}) => {
  const driverBus =
    buses.find((b) => b.id === currentUser.assignedBusId) ||
    buses.find((b) => b.id === 'bus-03') ||
    buses[0];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/driver/dashboard')}
        className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Driver Cockpit</span>
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow">
            {driverBus.busNumber.replace('BUS-', 'B')}
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white">
              {driverBus.busNumber} Pass Validator Terminal
            </h1>
            <p className="text-xs text-slate-500">
              Driver: {currentUser.name} · Instant Camera QR Reader
            </p>
          </div>
        </div>
      </div>

      {/* Camera QR Scanner Component */}
      <QRScannerComponent
        activeBusId={driverBus.id}
        onScanSuccess={(passData) => {
          console.log('Boarded pass verified:', passData);
        }}
      />
    </div>
  );
};
