import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Bus, BusStop, CampusRoute } from '../../types';
import { BALLARI_CENTER, CAMPUS_COORDINATES } from '../../data/ballariData';
import {
  Bus as BusIcon,
  Navigation,
  MapPin,
  Compass,
  Layers,
  Sparkles,
  AlertTriangle,
  Users,
  Gauge,
  Clock,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface LiveBusMapProps {
  buses: Bus[];
  stops: BusStop[];
  routes: CampusRoute[];
  selectedStopId?: string;
  selectedBusId?: string;
  onSelectBus?: (busId: string) => void;
  onSelectStop?: (stopId: string) => void;
  isDarkMode?: boolean;
  className?: string;
  showAllRoutes?: boolean;
}

export const LiveBusMap: React.FC<LiveBusMapProps> = ({
  buses,
  stops,
  routes,
  selectedStopId,
  selectedBusId,
  onSelectBus,
  onSelectStop,
  isDarkMode = false,
  className = 'h-[460px] w-full',
  showAllRoutes = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const polylinesGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapMode, setMapMode] = useState<'street' | 'schematic'>('street');
  const [selectedBusData, setSelectedBusData] = useState<Bus | null>(null);
  const [hasMapInitError, setHasMapInitError] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [BALLARI_CENTER.lat, BALLARI_CENTER.lng],
          zoom: BALLARI_CENTER.zoom,
          zoomControl: false,
          attributionControl: false,
        });

        // Add CartoDB or OSM tiles (very clean, modern styling)
        const tileUrl = isDarkMode
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        L.tileLayer(tileUrl, {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        markersGroupRef.current = L.layerGroup().addTo(map);
        polylinesGroupRef.current = L.layerGroup().addTo(map);

        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.warn('Map initialization notice, switching to vector mode:', err);
      setHasMapInitError(true);
      setMapMode('schematic');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isDarkMode]);

  // Update Markers & Polylines when buses or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mapMode === 'schematic') return;

    const markersGroup = markersGroupRef.current;
    const polylinesGroup = polylinesGroupRef.current;

    if (!markersGroup || !polylinesGroup) return;

    markersGroup.clearLayers();
    polylinesGroup.clearLayers();

    // 1. Draw Route Lines
    routes.forEach((route) => {
      const routeStopCoords: [number, number][] = route.stops
        .map((rs) => {
          const stop = stops.find((s) => s.id === rs.stopId);
          return stop ? [stop.latitude, stop.longitude] as [number, number] : null;
        })
        .filter((c): c is [number, number] => c !== null);

      if (routeStopCoords.length >= 2) {
        const polyline = L.polyline(routeStopCoords, {
          color: route.color,
          weight: 4,
          opacity: 0.75,
          dashArray: route.id === 'route-d' ? '6, 8' : undefined,
        });
        polyline.bindTooltip(
          `<b>${route.code}</b><br/>${route.name}<br/>${route.totalDistanceKm} km`,
          { sticky: true }
        );
        polylinesGroup.addLayer(polyline);
      }
    });

    // 2. Add Campus Gate Marker
    const campusHtml = `
      <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-lg border-2 border-white ring-4 ring-indigo-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
      </div>
    `;
    const campusIcon = L.divIcon({
      html: campusHtml,
      className: 'campus-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
    const campusMarker = L.marker([CAMPUS_COORDINATES.lat, CAMPUS_COORDINATES.lng], {
      icon: campusIcon,
      zIndexOffset: 500,
    });
    campusMarker.bindTooltip(
      `<b>🎓 ${CAMPUS_COORDINATES.name}</b><br/>Campus Main Entrance`,
      { direction: 'top', offset: [0, -20] }
    );
    markersGroup.addLayer(campusMarker);

    // 3. Add Stop Markers
    stops.forEach((stop) => {
      const isSelectedStop = stop.id === selectedStopId;
      const stopHtml = `
        <div class="group relative flex items-center justify-center ${
          isSelectedStop
            ? 'w-8 h-8 bg-amber-500 text-white ring-4 ring-amber-200'
            : 'w-6 h-6 bg-slate-800 text-white ring-2 ring-white/80'
        } rounded-full shadow-md transition-all cursor-pointer">
          <div class="w-2 h-2 rounded-full ${isSelectedStop ? 'bg-white animate-ping' : 'bg-slate-300'}"></div>
        </div>
      `;

      const stopIcon = L.divIcon({
        html: stopHtml,
        className: 'stop-marker',
        iconSize: isSelectedStop ? [32, 32] : [24, 24],
        iconAnchor: isSelectedStop ? [16, 16] : [12, 12],
      });

      const marker = L.marker([stop.latitude, stop.longitude], {
        icon: stopIcon,
        zIndexOffset: isSelectedStop ? 800 : 200,
      });

      marker.bindTooltip(
        `<b>📍 ${stop.name}</b><br/>${stop.landmark}<br/><span class="text-xs text-blue-600 font-semibold">Walk: ~${stop.averageWalkingTimeMinutes} mins</span>`,
        { direction: 'top', offset: [0, -14] }
      );

      marker.on('click', () => {
        if (onSelectStop) onSelectStop(stop.id);
      });

      markersGroup.addLayer(marker);
    });

    // 4. Add Bus Markers
    buses.forEach((bus) => {
      const route = routes.find((r) => r.id === bus.routeId);
      const isSelectedBus = bus.id === selectedBusId;
      const routeColor = route?.color || '#2563EB';

      const isEmergency = bus.isEmergency;
      const isDelayed = bus.status === 'DELAYED';

      const statusBg = isEmergency
        ? '#DC2626'
        : isDelayed
        ? '#D97706'
        : routeColor;

      const busHtml = `
        <div class="relative flex items-center justify-center custom-bus-marker ${
          isSelectedBus ? 'ring-4 ring-blue-400 scale-110' : ''
        }" style="width: 44px; height: 44px; border: 2.5px solid white;">
          ${
            isSelectedBus || isEmergency
              ? `<div class="bus-pulse-ring" style="background-color: ${statusBg};"></div>`
              : ''
          }
          <div class="flex flex-col items-center justify-center w-full h-full rounded-full text-white font-bold text-[11px] leading-tight" style="background-color: ${statusBg};">
            <span class="tracking-tighter">${bus.busNumber.replace('BUS-', 'B')}</span>
            <span class="text-[8px] font-mono opacity-90">${bus.speed}k</span>
          </div>
          ${
            isEmergency
              ? `<div class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold animate-bounce shadow">!</div>`
              : isDelayed
              ? `<div class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow">+</div>`
              : ''
          }
        </div>
      `;

      const busIcon = L.divIcon({
        html: busHtml,
        className: 'bus-marker-container',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const busMarker = L.marker([bus.location.latitude, bus.location.longitude], {
        icon: busIcon,
        zIndexOffset: isSelectedBus ? 1000 : 600,
      });

      busMarker.on('click', () => {
        setSelectedBusData(bus);
        if (onSelectBus) onSelectBus(bus.id);
      });

      busMarker.bindTooltip(
        `<b>🚍 ${bus.busNumber}</b> (${route?.code || 'Route'})<br/>
         Status: <span style="color: ${statusBg}; font-weight:bold">${bus.status}</span><br/>
         Speed: ${bus.speed} km/h | Load: ${bus.occupancyPercentage}%<br/>
         Next: ${stops.find((s) => s.id === bus.nextStopId)?.name || 'Campus Gate'}`,
        { direction: 'top', offset: [0, -22] }
      );

      markersGroup.addLayer(busMarker);
    });
  }, [buses, stops, routes, selectedStopId, selectedBusId, mapMode]);

  const centerOnBallari = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([BALLARI_CENTER.lat, BALLARI_CENTER.lng], 13, {
        duration: 1.2,
      });
    }
  };

  const centerOnSelectedStop = () => {
    const target = stops.find((s) => s.id === selectedStopId);
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.latitude, target.longitude], 15, {
        duration: 1,
      });
    }
  };

  const centerOnSelectedBus = () => {
    const bus = buses.find((b) => b.id === selectedBusId);
    if (bus && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [bus.location.latitude, bus.location.longitude],
        15,
        { duration: 1 }
      );
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900 ${className}`}>
      {/* Map Mode Switcher & Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setMapMode('street')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapMode === 'street'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Street Map
          </button>
          <button
            onClick={() => setMapMode('schematic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapMode === 'schematic'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Schematic Grid
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Ballari Transit Hub · 15.1394° N, 76.9214° E</span>
        </div>
      </div>

      {/* Map Control Buttons */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={centerOnBallari}
          title="Reset to Ballari City View"
          className="p-2.5 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-800 transition-all active:scale-95"
        >
          <Navigation className="w-4 h-4 text-blue-600" />
        </button>

        {selectedStopId && (
          <button
            onClick={centerOnSelectedStop}
            title="Focus Selected Stop"
            className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md transition-all active:scale-95"
          >
            <MapPin className="w-4 h-4" />
          </button>
        )}

        {selectedBusId && (
          <button
            onClick={centerOnSelectedBus}
            title="Focus Selected Bus"
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all active:scale-95"
          >
            <BusIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Map Canvas */}
      {mapMode === 'street' ? (
        <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />
      ) : (
        /* Interactive Schematic Vector Map Fallback */
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-400" />
                <h4 className="text-base font-bold text-white">Ballari Smart Transit Schematic Grid</h4>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-900/60 text-blue-300 font-mono">
                {buses.length} Active Fleet Vehicles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map((route) => {
                const routeBuses = buses.filter((b) => b.routeId === route.id);
                return (
                  <div
                    key={route.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: route.color }}
                        />
                        <span className="font-bold text-sm text-white">{route.code}</span>
                      </div>
                      <span className="text-xs text-slate-400">{route.totalDistanceKm} km</span>
                    </div>

                    <div className="space-y-2 mb-3">
                      {route.stops.map((rs, idx) => {
                        const stop = stops.find((s) => s.id === rs.stopId);
                        const isSelected = stop?.id === selectedStopId;
                        return (
                          <div
                            key={rs.stopId}
                            onClick={() => stop && onSelectStop && onSelectStop(stop.id)}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-4 text-slate-500 font-mono text-[10px]">{idx + 1}</span>
                              <span>{stop?.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">+{rs.estimatedMinutesFromOrigin}m</span>
                          </div>
                        );
                      })}
                    </div>

                    {routeBuses.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                        {routeBuses.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => onSelectBus && onSelectBus(b.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              b.id === selectedBusId
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <BusIcon className="w-3 h-3" />
                            {b.busNumber} · {b.speed} km/h · {b.occupancyPercentage}%
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 italic">No bus currently active</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Live Selected Bus Quick Drawer / Inspector */}
      {selectedBusData && (
        <div className="absolute bottom-4 left-4 right-4 z-20 max-w-xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 transition-all">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {selectedBusData.busNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {selectedBusData.busNumber} ({selectedBusData.plateNumber})
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedBusData.status === 'ON_TIME'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : selectedBusData.status === 'DELAYED'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {selectedBusData.status}
                    {selectedBusData.delayMinutes > 0 && ` (+${selectedBusData.delayMinutes}m)`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {routes.find((r) => r.id === selectedBusData.routeId)?.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedBusData(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <Gauge className="w-3.5 h-3.5" />
                <span>Speed</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {selectedBusData.speed} km/h
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <Users className="w-3.5 h-3.5" />
                <span>Occupancy</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {selectedBusData.currentOccupancy}/{selectedBusData.capacity} ({selectedBusData.occupancyPercentage}%)
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Next Stop</span>
              </div>
              <span className="font-bold text-blue-600 dark:text-blue-400 truncate block">
                {stops.find((s) => s.id === selectedBusData.nextStopId)?.name || 'Campus Gate'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
