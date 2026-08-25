import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { authService } from '../../services/authService';
import { PassVerificationLog } from '../../types';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Scan,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Check,
  AlertTriangle,
  QrCode,
} from 'lucide-react';

interface QRScannerComponentProps {
  driverId?: string;
  busId?: string;
  activeBusId?: string;
  onVerificationComplete?: (log: PassVerificationLog) => void;
  onScanSuccess?: (passData: any) => void;
}

export const QRScannerComponent: React.FC<QRScannerComponentProps> = ({
  driverId = 'driver-03',
  busId = 'bus-03',
  activeBusId,
  onVerificationComplete,
  onScanSuccess,
}) => {
  const effectiveBusId = activeBusId || busId;
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastVerification, setLastVerification] = useState<{
    isValid: boolean;
    status: 'VALID' | 'INVALID' | 'EXPIRED';
    studentName: string;
    studentCode: string;
    routeCode: string;
    message: string;
    timestamp: string;
    log: PassVerificationLog;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedRaw, setLastScannedRaw] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const scanCooldownRef = useRef<boolean>(false);

  const handleVerifyPayload = useCallback(
    async (rawCode: string) => {
      if (!rawCode.trim() || isScanning) return;

      setIsScanning(true);
      setLastScannedRaw(rawCode);

      try {
        const result = await authService.verifyScannedPass(
          rawCode,
          driverId,
          effectiveBusId
        );
        setLastVerification(result);

        if (onVerificationComplete) {
          onVerificationComplete(result.log);
        }
        if (onScanSuccess) {
          onScanSuccess(result);
        }
      } catch (err) {
        console.error('Verification error:', err);
      } finally {
        setIsScanning(false);
      }
    },
    [driverId, effectiveBusId, isScanning, onVerificationComplete, onScanSuccess]
  );

  // Scan loop for camera frame decoding via jsQR
  const scanCameraFrame = useCallback(() => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data && !scanCooldownRef.current) {
          scanCooldownRef.current = true;
          handleVerifyPayload(code.data);

          // Cooldown before scanning another QR
          setTimeout(() => {
            scanCooldownRef.current = false;
          }, 2500);
        }
      } catch (e) {
        // Frame analysis skip
      }
    }

    if (cameraActive) {
      animationFrameRef.current = requestAnimationFrame(scanCameraFrame);
    }
  }, [cameraActive, handleVerifyPayload]);

  // Start Camera Feed
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera access not supported on this browser device. Please use quick scan or manual ID entry.');
      }
    } catch (err: any) {
      console.warn('Camera stream notice:', err);
      setCameraError('Camera permission not granted or camera busy. Please use the 1-click test buttons or manual USN entry.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (cameraActive) {
      animationFrameRef.current = requestAnimationFrame(scanCameraFrame);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraActive, scanCameraFrame]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg mx-auto">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Driver Conductor QR Terminal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time Supabase pass verification
            </p>
          </div>
        </div>

        <button
          onClick={cameraActive ? stopCamera : startCamera}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            cameraActive
              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
          }`}
        >
          {cameraActive ? (
            <>
              <CameraOff className="w-3.5 h-3.5" />
              <span>Stop Camera</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5" />
              <span>Open Camera</span>
            </>
          )}
        </button>
      </div>

      {/* Video Viewport */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex flex-col items-center justify-center mb-5 text-white">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          playsInline
          muted
        />

        {!cameraActive && (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shadow-inner">
              <Scan className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Camera Scanner Ready
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Scan student pass QR code or use 1-click test simulation presets below
              </p>
            </div>
          </div>
        )}

        {/* Scanner Target Reticle */}
        <div className="absolute inset-6 border-2 border-dashed border-blue-400/70 rounded-2xl pointer-events-none flex items-center justify-center">
          <div className="w-8 h-8 border-t-2 border-l-2 border-blue-400 absolute top-0 left-0"></div>
          <div className="w-8 h-8 border-t-2 border-r-2 border-blue-400 absolute top-0 right-0"></div>
          <div className="w-8 h-8 border-b-2 border-l-2 border-blue-400 absolute bottom-0 left-0"></div>
          <div className="w-8 h-8 border-b-2 border-r-2 border-blue-400 absolute bottom-0 right-0"></div>
          {cameraActive && (
            <div className="w-full h-0.5 bg-blue-500/80 absolute animate-pulse shadow-lg shadow-blue-500" />
          )}
        </div>

        {cameraError && (
          <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-slate-900/90 text-amber-300 text-[11px] text-center border border-amber-500/30">
            {cameraError}
          </div>
        )}
      </div>

      {/* VISUAL STATUS FEEDBACK (GREEN / RED) */}
      {lastVerification && (
        <div
          id="verification-result-card"
          className={`p-5 rounded-2xl mb-5 border-2 transition-all shadow-lg animate-in fade-in duration-300 ${
            lastVerification.status === 'VALID'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-100'
              : 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-950 dark:text-red-100'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-2xl shadow-md ${
                lastVerification.status === 'VALID' ? 'bg-emerald-600 ring-4 ring-emerald-400/30' : 'bg-red-600 ring-4 ring-red-400/30'
              }`}
            >
              {lastVerification.status === 'VALID' ? '✓' : '✕'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black tracking-tight">
                  {lastVerification.status === 'VALID'
                    ? 'VALID BUS PASS — BOARDING APPROVED'
                    : 'INVALID / EXPIRED BUS PASS'}
                </h4>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                    lastVerification.status === 'VALID'
                      ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100'
                      : 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100'
                  }`}
                >
                  {lastVerification.status}
                </span>
              </div>

              <div className="mt-1 space-y-0.5">
                <p className="text-sm font-bold">
                  {lastVerification.studentName}
                </p>
                <div className="flex items-center gap-3 text-xs opacity-90 font-mono">
                  <span>USN: {lastVerification.studentCode}</span>
                  <span>Route: {lastVerification.routeCode}</span>
                </div>
                <p className="text-[11px] font-medium pt-1">
                  {lastVerification.message}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-current/10 flex items-center justify-between text-[10px] opacity-75">
                <span>Logged to Supabase System Notifications</span>
                <span>{new Date(lastVerification.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual USN / Code Input */}
      <div className="space-y-3 mb-5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>Manual USN / Barcode Entry:</span>
          <span className="text-[10px] text-slate-400">e.g. 3BR21CS007</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Student USN (e.g. 3BR21CS007)"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerifyPayload(manualCode)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-white font-mono uppercase"
          />
          <button
            onClick={() => handleVerifyPayload(manualCode)}
            disabled={isScanning || !manualCode.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1.5"
          >
            {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Verify DB</span>
          </button>
        </div>
      </div>

      {/* Standard JSON QR Simulator Presets */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-bold text-slate-400">
            Instant Test QR Payloads:
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            Live Supabase Synced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() =>
              handleVerifyPayload(
                JSON.stringify({
                  usn: '3BR21CS007',
                  name: 'Rahul Sharma',
                  validUntil: '2026-12-31',
                  signature: 'CAMPUSGO-VERIFIED-HASH',
                  routeCode: 'ROUTE A',
                  passStatus: 'ACTIVE',
                })
              )
            }
            className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between transition-all text-left"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <div>Rahul Sharma (Valid)</div>
                <div className="text-[10px] font-mono text-emerald-600">3BR21CS007 · Active</div>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 px-1.5 py-0.5 rounded font-black">
              GREEN
            </span>
          </button>

          <button
            onClick={() =>
              handleVerifyPayload(
                JSON.stringify({
                  usn: '3BR20CS099',
                  name: 'Kiran Kumar',
                  validUntil: '2025-12-31',
                  signature: 'CAMPUSGO-VERIFIED-HASH',
                  routeCode: 'ROUTE C',
                  passStatus: 'EXPIRED',
                })
              )
            }
            className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-bold flex items-center justify-between transition-all text-left"
          >
            <div className="flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <div>
                <div>Kiran Kumar (Expired)</div>
                <div className="text-[10px] font-mono text-red-600">3BR20CS099 · Expired</div>
              </div>
            </div>
            <span className="text-[10px] bg-red-200 dark:bg-red-800 px-1.5 py-0.5 rounded font-black">
              RED
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() =>
              handleVerifyPayload(
                JSON.stringify({
                  usn: '3BR21EC019',
                  name: 'Priya Kulkarni',
                  validUntil: '2026-12-31',
                  signature: 'CAMPUSGO-VERIFIED-HASH',
                  routeCode: 'ROUTE B',
                  passStatus: 'ACTIVE',
                })
              )
            }
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold text-center"
          >
            Priya Kulkarni (3BR21EC019)
          </button>

          <button
            onClick={() =>
              handleVerifyPayload(
                JSON.stringify({
                  usn: '3BR99FAKE01',
                  name: 'Fake Pass User',
                  validUntil: '2026-12-31',
                  signature: 'INVALID-HASH',
                })
              )
            }
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-red-600 dark:text-red-400 text-[11px] font-semibold text-center"
          >
            Unregistered USN Test
          </button>
        </div>
      </div>
    </div>
  );
};
