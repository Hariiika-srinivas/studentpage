import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { DigitalBusPass, UserProfile } from '../../types';
import {
  ShieldCheck,
  QrCode,
  Calendar,
  Bus as BusIcon,
  Phone,
  GraduationCap,
  Sparkles,
  Download,
  Share2,
} from 'lucide-react';

interface DigitalBusPassCardProps {
  pass?: DigitalBusPass;
  user?: UserProfile;
  stopName?: string;
  routeName?: string;
}

export const DigitalBusPassCard: React.FC<DigitalBusPassCardProps> = ({
  pass,
  user,
  stopName,
  routeName,
}) => {
  // Construct safe pass object if pass prop is not provided directly
  const activePass: DigitalBusPass = pass || {
    id: `pass-${user?.id || 'default'}`,
    passNumber: `BLR-PASS-${(user?.studentId || '2026').replace(/[^0-9]/g, '').slice(-5) || '88492'}-2026`,
    studentId: user?.id || 'student-01',
    studentName: user?.name || 'Rahul Sharma',
    studentCode: user?.studentId || 'BLR-2024-CS042',
    department: user?.department || 'Computer Science & Engineering',
    academicYear: '2025 - 2026 (Semester 6)',
    routeCode: routeName ? routeName.split(' - ')[0] : 'ROUTE A',
    routeName: routeName || 'Ballari Central - Gandhi Nagar - Campus',
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    status: 'ACTIVE',
    qrVerificationCode: JSON.stringify({
      usn: user?.studentId || '3BR21CS007',
      name: user?.name || 'Rahul Sharma',
      validUntil: '2026-12-31',
      signature: 'CAMPUSGO-VERIFIED-HASH',
      routeCode: routeName ? routeName.split(' - ')[0] : 'ROUTE A',
      passStatus: 'ACTIVE',
    }),
    photoUrl:
      user?.avatarUrl ||
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80',
    emergencyContact: user?.phone
      ? `+91 ${user.phone} (Guardian)`
      : '+91 98450 99887 (Emergency Contact)',
  };

  const photo =
    activePass.photoUrl ||
    user?.avatarUrl ||
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80';

  return (
    <div className="max-w-md mx-auto">
      {/* Pass Card with Holographic Gradient Border */}
      <div
        id="digital-campus-pass"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border-2 border-indigo-500/40 p-6"
      >
        {/* Shimmer / Hologram Overlay */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-indigo-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-lg ring-2 ring-blue-400/50">
              CG
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-wider uppercase text-blue-400">
                  CampusGo
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                  VERIFIED PASS
                </span>
              </div>
              <h2 className="text-xs font-semibold text-slate-300">
                BALLARI ENGINEERING CAMPUS
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>VALID ✓</span>
          </div>
        </div>

        {/* Student Profile Row */}
        <div className="flex items-center gap-4 mb-5 bg-white/5 p-3 rounded-2xl border border-white/10">
          <img
            src={photo}
            alt={activePass.studentName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-400 shadow-md shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-white truncate">
              {activePass.studentName}
            </h3>
            <p className="text-xs font-mono text-blue-300 font-bold tracking-wider">
              {activePass.studentCode}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-300 mt-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{activePass.department}</span>
            </div>
          </div>
        </div>

        {/* Route & Pass Details */}
        <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
          <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-800/40">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Assigned Route
            </span>
            <div className="font-extrabold text-blue-300 flex items-center gap-1.5">
              <BusIcon className="w-3.5 h-3.5" />
              <span>{activePass.routeCode}</span>
            </div>
            <span className="text-[10px] text-slate-400 truncate block mt-0.5">
              {activePass.routeName}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-800/40">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Validity Period
            </span>
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Academic 2026</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Until Dec 31, 2026
            </span>
          </div>
        </div>

        {/* Dynamic QR Code Card */}
        <div className="p-4 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-center shadow-inner mb-4">
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
            <QRCodeSVG
              value={activePass.qrVerificationCode}
              size={160}
              level="H"
              includeMargin={false}
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 font-bold mt-2">
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span>{activePass.passNumber}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Scan using driver conductor terminal
          </span>
        </div>

        {/* Emergency Contact */}
        <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-500" />
            <span>Emergency: {activePass.emergencyContact}</span>
          </div>
          <span className="font-mono text-[10px] text-indigo-400">#BLR-SECURE-RFID</span>
        </div>
      </div>
    </div>
  );
};
